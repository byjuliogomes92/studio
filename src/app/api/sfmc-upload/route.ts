import { NextRequest, NextResponse } from 'next/server';
import { getBrand } from '@/lib/firestore';
import { decryptPassword } from '@/lib/crypto';
import axios from 'axios';
import { parse } from 'csv-parse/sync';

// Função para configurar headers CORS
function corsHeaders() {
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
    };
}

// Handle preflight OPTIONS request
export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: corsHeaders(),
    });
}

export async function POST(request: NextRequest) {
    try {
        const { csvData, deKey, brandId, columnMapping } = await request.json();

        if (!csvData || !deKey || !brandId) {
            return new NextResponse(JSON.stringify({ success: false, message: 'Parâmetros faltando (csvData, deKey, brandId).' }), { 
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders(),
                }
            });
        }

        // 1. Get brand credentials from Firestore
        const brand = await getBrand(brandId);
        if (!brand || !brand.integrations?.sfmcApi) {
            return new NextResponse(JSON.stringify({ success: false, message: 'Configurações da API do SFMC não encontradas para esta marca.' }), { 
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders(),
                }
            });
        }
        
        const { clientId, encryptedClientSecret, authBaseUrl } = brand.integrations.sfmcApi;
        if (!clientId || !encryptedClientSecret || !authBaseUrl) {
            return new NextResponse(JSON.stringify({ success: false, message: 'Credenciais da API do SFMC incompletas.' }), { 
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders(),
                }
            });
        }
        
        const clientSecret = decryptPassword(encryptedClientSecret);

        // 2. Get an SFMC Auth Token
        const tokenResponse = await axios.post(`${authBaseUrl}v2/token`, {
            grant_type: "client_credentials",
            client_id: clientId,
            client_secret: clientSecret,
        }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        const accessToken = tokenResponse.data.access_token;
        const restBaseUrl = tokenResponse.data.rest_instance_url;
        
        const detectDelimiter = (header: string) => {
            const commaCount = (header.match(/,/g) || []).length;
            const semicolonCount = (header.match(/;/g) || []).length;
            return semicolonCount > commaCount ? ';' : ',';
        };

        // 3. Parse the CSV content
        const records = parse(csvData, { 
            columns: true,
            skip_empty_lines: true,
            trim: true,
            delimiter: detectDelimiter(csvData.split('\n')[0]),
        });

        if (records.length === 0) {
            return new NextResponse(JSON.stringify({ success: true, message: 'Arquivo CSV vazio ou sem dados. Nada foi adicionado.' }), { 
                status: 200,
                headers: {
                    'Content-Type': 'application/json',
                    ...corsHeaders(),
                }
            });
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
                // Always carry over ContactKey if it exists and wasn't mapped, as it's crucial.
                const keyCandidates = ['ContactKey', 'contactkey', 'Contact Key', 'contact key', 'SubscriberKey', 'subscriberkey'];
                const contactKeyColumn = keyCandidates.find(k => Object.keys(columnMapping).find(deCol => columnMapping[deCol] === k));
                const contactKeyValue = keyCandidates.find(k => record[k] !== undefined);

                if (contactKeyValue && !contactKeyColumn) {
                    newRecord.ContactKey = record[contactKeyValue];
                }
                
                return newRecord;
              })
            : records;

        // 5. Prepare data for SFMC API (assuming ContactKey is used as primary key)
        const sfmcPayload = mappedRecords.map((record: any) => ({
            keys: { ContactKey: record.ContactKey || record.SubscriberKey || record.EMAIL || record.EmailAddress || record.CPF || record.ID },
            values: record,
        }));

        // 6. Process records in batches for large datasets
        const BATCH_SIZE = 1000; // SFMC API limit
        const batches = [];
        
        for (let i = 0; i < sfmcPayload.length; i += BATCH_SIZE) {
            batches.push(sfmcPayload.slice(i, i + BATCH_SIZE));
        }

        let totalProcessed = 0;
        const sfmcApiUrl = `${restBaseUrl}hub/v1/dataevents/key:${deKey}/rowset`;
        
        // Process each batch
        for (const batch of batches) {
            await axios.post(sfmcApiUrl, batch, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                timeout: 60000, // 60 seconds timeout
            });
            totalProcessed += batch.length;
        }

        return new NextResponse(JSON.stringify({ 
            success: true, 
            message: `Sucesso! ${totalProcessed} registros foram adicionados/atualizados na Data Extension.`,
            rowsProcessed: totalProcessed,
            batchesProcessed: batches.length,
        }), { 
            status: 200,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(),
            }
        });

    } catch (error: any) {
        // Enhanced error handling
        console.error("SFMC Process Error:", error.response?.data || error.message);
        
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
        } else if (error.response?.data?.message) {
            errorMessage = error.response.data.message;
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        return new NextResponse(JSON.stringify({ 
            success: false, 
            message: `Falha no processamento para o SFMC: ${errorMessage}`,
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        }), { 
            status: statusCode,
            headers: {
                'Content-Type': 'application/json',
                ...corsHeaders(),
            }
        });
    }
}