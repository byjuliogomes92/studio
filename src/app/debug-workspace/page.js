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
  setDoc 
} from 'firebase/firestore';

export default function DebugWorkspace() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const addResult = (message, type = 'info') => {
    setResults(prev => [...prev, { message, type, timestamp: new Date() }]);
  };

  const createWorkspaceForUser = async (userId) => {
    try {
      const db = getFirestore();
      const workspaceId = `workspace_${userId}_${Date.now()}`;
      
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
      return null;
    }
  };

  const migrateOldDataToWorkspace = async (userId, targetWorkspaceId) => {
    addResult(`🔄 Iniciando migração de dados para workspace ${targetWorkspaceId}...`, 'info');
    
    try {
      const db = getFirestore();
      const collections = ['projects', 'brands', 'pages_drafts', 'templates'];
      
      for (const collectionName of collections) {
        addResult(`Migrando coleção: ${collectionName}`, 'info');
        
        // Buscar documentos com userId
        const oldDocsQuery = query(
          collection(db, collectionName),
          where('userId', '==', userId)
        );
        
        const oldDocsSnap = await getDocs(oldDocsQuery);
        
        if (!oldDocsSnap.empty) {
          addResult(`  Encontrados ${oldDocsSnap.size} documentos para migrar`, 'info');
          
          // Migrar cada documento
          for (const docSnap of oldDocsSnap.docs) {
            const data = docSnap.data();
            
            // Criar nova versão com workspaceId
            const newData = {
              ...data,
              workspaceId: targetWorkspaceId,
              updatedAt: new Date()
            };
            
            // Remover userId
            delete newData.userId;
            
            // Salvar documento atualizado
            await setDoc(doc(db, collectionName, docSnap.id), newData);
          }
          
          addResult(`  ✅ Migrados ${oldDocsSnap.size} documentos da coleção ${collectionName}`, 'success');
        } else {
          addResult(`  ℹ️ Nenhum documento encontrado em ${collectionName}`, 'info');
        }
      }
      
      addResult('🎉 Migração concluída com sucesso!', 'success');
      
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
      const db = getFirestore();

      // 1. Verificar workspaces
      addResult('1. Verificando workspaces do usuário...', 'info');
      const membershipQuery = query(
        collection(db, 'workspaceMembers'),
        where('userId', '==', currentUser.uid)
      );
      
      const membershipSnap = await getDocs(membershipQuery);
      
      if (membershipSnap.empty) {
        addResult('❌ PROBLEMA: Usuário não pertence a nenhum workspace!', 'error');
        
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
          
          addResult('🔧 SOLUÇÃO NECESSÁRIA: Migrar dados para workspace', 'warning');
          addResult('Clique no botão abaixo para criar workspace automaticamente', 'info');
        } else {
          addResult('ℹ️ Nenhum projeto antigo encontrado. Usuário novo?', 'info');
          addResult('Clique no botão abaixo para criar seu primeiro workspace', 'info');
        }
        
        return { needsWorkspace: true };
      }
      
      // Se chegou aqui, tem workspaces
      addResult(`✅ Encontrados ${membershipSnap.size} workspaces`, 'success');
      
      const workspaces = [];
      for (const doc of membershipSnap.docs) {
        const data = doc.data();
        addResult(`  - Workspace: ${data.workspaceId} (Papel: ${data.role})`, 'success');
        
        // Verificar se o workspace existe
        const workspaceDoc = await getDocs(query(
          collection(db, 'workspaces'),
          where('__name__', '==', data.workspaceId)
        ));
        
        if (workspaceDoc.empty) {
          addResult(`    ❌ PROBLEMA: Workspace ${data.workspaceId} não existe!`, 'error');
        } else {
          addResult(`    ✅ Workspace ${data.workspaceId} existe`, 'success');
        }
        
        workspaces.push(data.workspaceId);
      }
      
      // 3. Verificar projetos atuais
      if (workspaces.length > 0) {
        addResult('3. Verificando projetos atuais...', 'info');
        
        for (const workspaceId of workspaces) {
          const projectsQuery = query(
            collection(db, 'projects'),
            where('workspaceId', '==', workspaceId)
          );
          
          const projectsSnap = await getDocs(projectsQuery);
          addResult(`  - Workspace ${workspaceId}: ${projectsSnap.size} projetos`, 'info');
        }
      }
      
      addResult('✅ Diagnóstico concluído! Se há workspaces, o problema pode estar nas regras do Firebase.', 'success');
      
    } catch (error) {
      addResult(`❌ Erro durante diagnóstico: ${error.message}`, 'error');
      console.error('Erro completo:', error);
    }
  };

  useEffect(() => {
    const auth = getAuth();
    
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
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">🔧 Debug Workspace Firebase</h1>
      
      {user && (
        <div className="mb-4 p-4 bg-blue-50 rounded">
          <strong>Usuário logado:</strong> {user.email} ({user.uid})
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            🏗️ Criar Novo Workspace
          </button>
          
          <button
            onClick={() => {
              // Pegar primeiro workspace encontrado
              const firstWorkspace = results.find(r => r.message.includes('Workspace: workspace_'))?.message.match(/workspace_\w+/)?.[0];
              if (firstWorkspace) {
                migrateOldDataToWorkspace(user.uid, firstWorkspace);
              } else {
                addResult('❌ Nenhum workspace encontrado para migrar', 'error');
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            🔄 Migrar Dados Antigos
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
      
      <div className="mt-8 p-4 bg-yellow-50 rounded">
        <h3 className="font-bold mb-2">📝 Próximos Passos:</h3>
        <ol className="list-decimal list-inside space-y-1 text-sm">
          <li>Execute o diagnóstico para ver o problema</li>
          <li>Se não houver workspace, clique em "Criar Workspace"</li>
          <li>Se houver workspace mas ainda der erro, o problema está nas regras do Firebase</li>
          <li>Delete esta página depois de resolver o problema</li>
        </ol>
      </div>
    </div>
  );
}