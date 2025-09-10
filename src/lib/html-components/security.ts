
import type { CloudPage } from '../types';

export const getAmpscriptSecurityBlock = (pageState: CloudPage): string => {
    // Retornar um bloco de teste ultra-simplificado para depuração.
    return `
%%[
    /* --- INÍCIO: TESTE DE DEPURAÇÃO FINAL LOOKUP() --- */
    VAR @senhaEncontrada

    /* 
     * Passo 1: Altere o valor "SEU_NOME_DE_TESTE" abaixo para um valor EXATO 
     * que exista na coluna "NOME" da sua Data Extension.
     * Exemplo: SET @senhaEncontrada = Lookup("D3D99DF5-EA8D-4729-8056-93633F476699", "SENHA", "NOME", "Julio")
     */

    SET @senhaEncontrada = Lookup("D3D99DF5-EA8D-4729-8056-93633F476699", "SENHA", "NOME", "SEU_NOME_DE_TESTE")

]%%
<!-- 
    ================================================================
    RESULTADO DO TESTE (Verifique o código-fonte da sua CloudPage):
    
    A senha encontrada foi: '%%=v(@senhaEncontrada)=%%'
    
    Se esta página AINDA retornar um erro 500, o problema está 100% relacionado
    à permissão de acesso à Data Extension 'D3D99DF5-EA8D-4729-8056-93633F476699'.
    Verifique se ela é pública ou se as permissões de leitura estão corretas
    para o contexto de CloudPage.

    Se a página carregar e a senha aparecer em branco, significa que o 
    'SEU_NOME_DE_TESTE' não foi encontrado na coluna 'NOME'.
    ================================================================
-->

%%[ 
    /* Lógica de autenticação desativada para o teste. */
    SET @isAuthenticated = true 
]%%
    `;
}


export const getSecurityFormHtml = (pageState: CloudPage): string => {
    const security = pageState.meta.security;
    
    if (security?.type === 'sso') {
        return `<div class="sso-redirect-container"><h1>Redirecionando para o login...</h1><script>window.location.href = "%%=v(@LoginURL)=%%";</script></div>`;
    }
    
    // O formulário de login está intencionalmente desativado durante o teste.
    return '<!-- Formulário de login desativado para o teste de Lookup(). -->';
}
