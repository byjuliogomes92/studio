import { NextRequest, NextResponse } from 'next/server';
import { getBrand } from '@/lib/firestore';
import { decryptPassword } from '@/lib/crypto';
import axios from 'axios';

// The OPTIONS method is now handled by the middleware.ts file

export async function POST(request: NextRequest) {
    try {
        const { records, deKey, brandId, columnMapping } = await request.json();

        if (!records || !deKey || !brandId) {
            return NextResponse.json({ 
                success: false, 
                message: 'Parâmetros faltando (records, deKey, brandId).' 
            }, { status: 400 });
        }

        // 1. Get brand credentials from Firestore
        const brand = await getBrand(brandId);
        if (!brand || !brand.integrations?.sfmcApi) {
            return NextResponse.json({ 
                success: false, 
                message: 'Configurações da API do SFMC não encontradas para esta marca.' 
            }, { status: 400 });
        }
        
        const { clientId, encryptedClientSecret, authBaseUrl } = brand.integrations.sfmcApi;
        if (!clientId || !encryptedClientSecret || !authBaseUrl) {
            return NextResponse.json({ 
                success: false, 
                message: 'Credenciais da API do SFMC incompletas.' 
            }, { status: 400 });
        }
        
        const clientSecret = decryptPassword(encryptedClientSecret);

        // 2. Get an SFMC Auth Token
        const tokenResponse = await axios.post(`${authBaseUrl}v2/token`, {
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientSecret,
        }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 30000
        });
        
        const accessToken = tokenResponse.data.access_token;
        const restBaseUrl = tokenResponse.data.rest_instance_url;
        
        if (records.length === 0) {
            return NextResponse.json({ 
                success: true, 
                message: 'Nenhum registro no lote. Nada foi adicionado.' 
            }, { status: 200 });
        }
        
        // 4. Apply column mapping if provided
        const mappedRecords = (columnMapping && Object.keys(columnMapping).length > 0)
            ? records.map((record: any) => {
                const newRecord: { [key: string]: any } = {};
                for (const deColumn in columnMapping) {
                    const csvColumn = columnMapping[deColumn];
                    if (record[csvColumn] !== undefined) {
                        newRecord[deColumn] = record[csvColumn];
                    }
                }
                
                // Always carry over ContactKey if it exists and wasn't mapped
                const keyCandidates = ['ContactKey', 'contactkey', 'Contact Key', 'contact key', 'SubscriberKey', 'subscriberkey', 'ID', 'id'];
                let foundContactKey = false;
                for (const deCol in columnMapping) {
                    if (keyCandidates.includes(deCol)) {
                       foundContactKey = true;
                       break;
                    }
                }

                if (!foundContactKey) {
                    for (const key of keyCandidates) {
                        if(record[key] !== undefined) {
                            newRecord.ContactKey = record[key];
                            break;
                        }
                    }
                }
                
                return newRecord;
              })
            : records;

        // 5. Prepare data for SFMC API
        const sfmcPayload = mappedRecords.map((record: any) => ({
            keys: { 
                ContactKey: record.ContactKey || 
                           record.SubscriberKey || 
                           record.EMAIL || 
                           record.EmailAddress || 
                           record.CPF || 
                           record.ID ||
                           `temp_${Math.random().toString(36).substr(2, 9)}`
            },
            values: record,
        }));

        const sfmcApiUrl = `${restBaseUrl}hub/v1/dataevents/key:${deKey}/rowset`;
        
        await axios.post(sfmcApiUrl, sfmcPayload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            timeout: 120000, // 2 minutes timeout
        });

        return NextResponse.json({ 
            success: true, 
            message: `Lote de ${sfmcPayload.length} registros processado com sucesso.`,
            rowsProcessed: sfmcPayload.length,
        }, { status: 200 });

    } catch (error: any) {
        console.error("❌ SFMC Process Error:", {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            url: error.config?.url,
            stack: error.stack
        });
        
        let errorMessage = 'Ocorreu um erro desconhecido durante o processamento.';
        let statusCode = 500;
        
        if (error.response?.status === 401) {
            errorMessage = 'Credenciais SFMC inválidas ou token expirado.';
            statusCode = 401;
        } else if (error.response?.status === 404) {
            errorMessage = 'Data Extension não encontrada. Verifique a chave da DE.';
            statusCode = 404;
        } else if (error.response?.status === 400) {
            errorMessage = `Dados inválidos: ${error.response.data?.message || 'Verifique o formato dos dados.'}`;
            statusCode = 400;
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = 'Timeout na conexão com SFMC. Tente novamente.';
            statusCode = 408;
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        return NextResponse.json({ 
            success: false, 
            message: `Falha no processamento: ${errorMessage}`,
            error: process.env.NODE_ENV === 'development' ? {
                stack: error.stack,
                response: error.response?.data
            } : undefined,
        }, { status: statusCode });
    }
}
