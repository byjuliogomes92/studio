// app/debug-workspace/page.js - Debug page para workspace
"use client";

import { useState, useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  getDocs, 
  limit,
  doc,
  setDoc,
  writeBatch 
} from 'firebase/firestore';
import { app } from '@/lib/firebase'; // Importar a instância do app

export default function DebugWorkspace() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const addResult = (message, type = 'info') => {
    setResults(prev => [...prev, { message, type, timestamp: new Date() }]);
  };

  const createWorkspaceForUser = async (userId) => {
    try {
      const db = getFirestore(app);
      const workspaceId = `workspace_${userId}_${Date.now()}`;
      
      addResult(`Tentando criar workspace ${workspaceId}...`, 'info');
      
      // Criar workspace
      await setDoc(doc(db, 'workspaces', workspaceId), {
        name: 'Meu Workspace',
        ownerId: userId,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Criar membership
      await setDoc(doc(db, 'workspaceMembers', `${userId}_${workspaceId}`), {
        userId: userId,
        workspaceId: workspaceId,
        role: 'owner',
        joinedAt: new Date()
      });
      
      addResult(`✅ Workspace ${workspaceId} criado com sucesso!`, 'success');
      return workspaceId;
      
    } catch (error) {
      addResult(`❌ Erro ao criar workspace: ${error.message}`, 'error');
      console.error(error);
      return null;
    }
  };

  const migrateOldDataToWorkspace = async (userId, targetWorkspaceId) => {
    if (!userId || !targetWorkspaceId) {
        addResult('❌ Faltando userId ou workspaceId para migração.', 'error');
        return;
    }
    addResult(`🔄 Iniciando migração de dados para workspace ${targetWorkspaceId}...`, 'info');
    
    try {
      const db = getFirestore(app);
      // Coleções a serem migradas, incluindo rascunhos e publicadas
      const collectionsToMigrate = ['projects', 'brands', 'pages_drafts', 'pages_published', 'templates'];
      
      for (const collectionName of collectionsToMigrate) {
        addResult(`Migrando coleção: ${collectionName}`, 'info');
        
        const oldDocsQuery = query(
          collection(db, collectionName),
          where('userId', '==', userId)
        );
        
        const oldDocsSnap = await getDocs(oldDocsQuery);
        
        if (!oldDocsSnap.empty) {
          addResult(`  Encontrados ${oldDocsSnap.size} documentos para migrar`, 'info');
          
          const batch = writeBatch(db);
          
          oldDocsSnap.docs.forEach(docSnap => {
            const data = docSnap.data();
            
            const newData = {
              ...data,
              workspaceId: targetWorkspaceId,
              updatedAt: new Date()
            };
            delete newData.userId; // Remove o campo antigo
            
            batch.set(doc(db, collectionName, docSnap.id), newData);
          });

          await batch.commit();
          addResult(`  ✅ Migrados ${oldDocsSnap.size} documentos da coleção ${collectionName}`, 'success');
        } else {
          addResult(`  ℹ️ Nenhum documento antigo encontrado em ${collectionName}`, 'info');
        }
      }
      
      addResult('🎉 Migração concluída com sucesso!', 'success');
      addResult('Por favor, recarregue a página principal para ver seus dados.', 'info');
      
    } catch (error) {
      addResult(`❌ Erro durante migração: ${error.message}`, 'error');
      console.error('Erro completo:', error);
    }
  };

  const runDiagnostic = async (currentUser) => {
    if (!currentUser) {
      addResult('❌ Nenhum usuário logado', 'error');
      return;
    }

    addResult(`🔍 Iniciando diagnóstico para usuário: ${currentUser.uid}`, 'info');
    
    try {
      const db = getFirestore(app);

      // 1. Verificar workspaces
      addResult('1. Verificando workspaces do usuário...', 'info');
      const membershipQuery = query(
        collection(db, 'workspaceMembers'),
        where('userId', '==', currentUser.uid)
      );
      
      const membershipSnap = await getDocs(membershipQuery);
      
      if (membershipSnap.empty) {
        addResult('⚠️ PROBLEMA: Usuário não pertence a nenhum workspace!', 'warning');
        
        // Verificar se há projetos antigos
        addResult('2. Verificando projetos antigos...', 'info');
        const oldProjectsQuery = query(
          collection(db, 'projects'),
          where('userId', '==', currentUser.uid),
          limit(10)
        );
        
        const oldProjectsSnap = await getDocs(oldProjectsQuery);
        
        if (!oldProjectsSnap.empty) {
          addResult(`📋 Encontrados ${oldProjectsSnap.size} projetos antigos com userId`, 'warning');
          
          oldProjectsSnap.forEach(doc => {
            const data = doc.data();
            addResult(`  - Projeto: ${doc.id} (userId: ${data.userId})`, 'info');
          });
          
          addResult('🔧 SOLUÇÃO NECESSÁRIA: Criar workspace e depois migrar dados.', 'warning');
          addResult('Clique no botão "Criar Novo Workspace" abaixo.', 'info');
        } else {
          addResult('ℹ️ Nenhum projeto antigo encontrado. Usuário novo?', 'info');
          addResult('Clique no botão "Criar Novo Workspace" para começar.', 'info');
        }
        
      } else { // Se chegou aqui, tem workspaces
          addResult(`✅ Encontrado(s) ${membershipSnap.size} workspace(s)`, 'success');
          const workspaceId = membershipSnap.docs[0].data().workspaceId;
          addResult(`   Workspace ID: ${workspaceId}`, 'info');
          
           // Verificar se há projetos antigos
          addResult('2. Verificando projetos antigos para migrar...', 'info');
          const oldProjectsQuery = query(
            collection(db, 'projects'),
            where('userId', '==', currentUser.uid),
            limit(1)
          );
          
          const oldProjectsSnap = await getDocs(oldProjectsQuery);
          if(!oldProjectsSnap.empty) {
              addResult(`📋 Encontrados ${oldProjectsSnap.size} projeto(s) antigo(s).`, 'warning');
              addResult('🔧 SOLUÇÃO NECESSÁRIA: Migrar dados para o workspace existente.', 'warning');
              addResult('Clique no botão "Migrar Dados Antigos para Workspace".', 'info');
          } else {
              addResult('✅ Nenhum dado antigo para migrar.', 'success');
          }
      }
      
    } catch (error) {
      addResult(`❌ Erro durante diagnóstico: ${error.message}`, 'error');
      console.error('Erro completo:', error);
    }
  };

  useEffect(() => {
    const auth = getAuth(app);
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (user) {
        runDiagnostic(user);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="p-8">Carregando...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-8 font-sans">
      <h1 className="text-2xl font-bold mb-6">🔧 Diagnóstico e Migração de Workspace</h1>
      
      {user ? (
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <strong>Usuário logado:</strong> {user.email} ({user.uid})
        </div>
      ) : (
         <div className="mb-4 p-4 bg-red-50 rounded text-red-700">
          <strong>Nenhum usuário logado. Por favor, faça o login primeiro.</strong>
        </div>
      )}
      
      <div className="space-y-2 mb-6">
        {results.map((result, index) => (
          <div 
            key={index}
            className={`p-3 rounded ${
              result.type === 'error' ? 'bg-red-50 text-red-700' :
              result.type === 'warning' ? 'bg-yellow-50 text-yellow-700' :
              result.type === 'success' ? 'bg-green-50 text-green-700' :
              'bg-gray-50 text-gray-700'
            }`}
          >
            {result.message}
          </div>
        ))}
      </div>
      
      {user && (
        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => createWorkspaceForUser(user.uid)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            🏗️ Criar Novo Workspace
          </button>
          
          <button
            onClick={async () => {
              const db = getFirestore(app);
              const membershipQuery = query(collection(db, 'workspaceMembers'), where('userId', '==', user.uid), limit(1));
              const membershipSnap = await getDocs(membershipQuery);

              if (membershipSnap.empty) {
                  addResult('❌ Nenhum workspace encontrado para migrar. Crie um primeiro.', 'error');
              } else {
                  const workspaceId = membershipSnap.docs[0].data().workspaceId;
                  migrateOldDataToWorkspace(user.uid, workspaceId);
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-green-300"
          >
            🔄 Migrar Dados Antigos para Workspace
          </button>
          
          <button
            onClick={() => {
              setResults([]);
              runDiagnostic(user);
            }}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            🔄 Executar Diagnóstico Novamente
          </button>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-50 rounded border border-yellow-200">
        <h3 className="font-bold mb-2">📝 Instruções:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Aguarde o diagnóstico automático terminar.</li>
          <li>Se aparecer a mensagem "Usuário não pertence a nenhum workspace", clique em "Criar Novo Workspace".</li>
          <li>Após criar o workspace, clique em "Migrar Dados Antigos para Workspace".</li>
          <li>Se o diagnóstico já mostrar um workspace, clique diretamente em "Migrar Dados Antigos para Workspace".</li>
          <li>Após a migração, volte para a <a href="/" className="underline text-blue-600">página principal</a> e atualize a página. Seus dados devem aparecer.</li>
          <li>Depois de resolver, você pode pedir para eu remover esta página de diagnóstico.</li>
        </ol>
      </div>
    </div>
  );
}
