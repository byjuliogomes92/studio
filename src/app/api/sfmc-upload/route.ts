import { NextRequest, NextResponse } from 'next/server';
import { getBrand } from '@/lib/firestore';
import { decryptPassword } from '@/lib/crypto';
import axios from 'axios';
import { parse } from 'csv-parse/sync';

export async function POST(request: NextRequest) {
    try {
        const { csvData, deKey, brandId } = await request.json();

        if (!csvData || !deKey || !brandId) {
            return NextResponse.json({ success: false, message: 'Parâmetros faltando (csvData, deKey, brandId).' }, { status: 400 });
        }

        // 1. Get brand credentials from Firestore
        const brand = await getBrand(brandId);
        if (!brand || !brand.integrations?.sfmcApi) {
            return NextResponse.json({ success: false, message: 'Configurações da API do SFMC não encontradas para esta marca.' }, { status: 400 });
        }
        const { clientId, encryptedClientSecret, authBaseUrl } = brand.integrations.sfmcApi;
        if (!clientId || !encryptedClientSecret || !authBaseUrl) {
            return NextResponse.json({ success: false, message: 'Credenciais da API do SFMC incompletas.' }, { status: 400 });
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

        // 3. Parse the CSV content
        const records = parse(csvData, { 
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        if (records.length === 0) {
            return NextResponse.json({ success: true, message: 'Arquivo CSV vazio ou sem dados. Nada foi adicionado.' }, { status: 200 });
        }

        // 4. Prepare data for SFMC API (assuming ContactKey is used)
        const sfmcPayload = records.map((record: any) => ({
            keys: { ContactKey: record.ContactKey || record.EmailAddress || record.CPF || record.ID },
            values: record,
        }));

        // 5. Send data in batches to SFMC REST API
        const sfmcApiUrl = `${restBaseUrl}hub/v1/dataevents/key:${deKey}/rowset`;
        await axios.post(sfmcApiUrl, sfmcPayload, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        return NextResponse.json({ 
            success: true, 
            message: `Sucesso! ${records.length} registros foram adicionados/atualizados na Data Extension.`,
            rowsProcessed: records.length,
        }, { status: 200 });

    } catch (error: any) {
        console.error("SFMC Process Error:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || 'Ocorreu um erro desconhecido.';
        return NextResponse.json({ success: false, message: `Falha no processamento para o SFMC: ${errorMessage}` }, { status: 500 });
    }
}
