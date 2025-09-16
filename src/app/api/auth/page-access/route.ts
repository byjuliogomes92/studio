
import { NextRequest, NextResponse } from 'next/server';
import { getFirestore, doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { decryptPassword } from '@/lib/crypto';

export async function POST(request: NextRequest) {
  try {
    const { pageId, identifier, password } = await request.json();

    if (!pageId || !identifier || !password) {
      return NextResponse.json({ success: false, message: 'Dados insuficientes.' }, { status: 400 });
    }

    const db = getFirestore(app);
    
    // Find the user with the given identifier for the specific page
    const q = query(
        collection(db, 'pageAccess'), 
        where('pageId', '==', pageId),
        where('identifier', '==', identifier),
        limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        return NextResponse.json({ success: false, message: 'Identificador ou senha inválidos.' }, { status: 401 });
    }

    const accessDoc = querySnapshot.docs[0].data();
    
    const storedEncryptedPassword = accessDoc.encryptedPassword;
    if (!storedEncryptedPassword) {
        console.error(`No encryptedPassword found for user ${identifier} on page ${pageId}`);
        return NextResponse.json({ success: false, message: 'Erro de configuração de segurança.' }, { status: 500 });
    }
    
    const decryptedPassword = decryptPassword(storedEncryptedPassword);
    
    if (decryptedPassword === "DECRYPTION_ERROR") {
        console.error("Failed to decrypt password, check encryption key.");
        return NextResponse.json({ success: false, message: 'Erro interno do servidor.' }, { status: 500 });
    }
    
    if (password === decryptedPassword) {
        // Passwords match. For now, just return success.
        // In a real app, you would return a JWT or similar session token.
        return NextResponse.json({ success: true, message: 'Autenticado com sucesso.' });
    } else {
        return NextResponse.json({ success: false, message: 'Identificador ou senha inválidos.' }, { status: 401 });
    }

  } catch (error: any) {
    console.error('Page Access Auth Error:', error);
    return NextResponse.json({ success: false, message: `Erro no servidor: ${error.message}` }, { status: 500 });
  }
}
