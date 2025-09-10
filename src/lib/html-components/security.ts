
import type { CloudPage } from '../types';

export const getAmpscriptSecurityBlock = (pageState: CloudPage): string => {
    const security = pageState.meta.security;
    
    if (!security || security.type !== 'password' || !security.passwordConfig) {
        return '%%[ /* Bloco de segurança desativado. */ ]%%'; 
    }
    
    const config = security.passwordConfig;

    // Bloco de teste isolado para a função Lookup()
    return `
%%[
    /* --- INÍCIO: TESTE ISOLADO DA FUNÇÃO LOOKUP() --- */
    VAR @lookupValue, @correctPassword, @identifier
    
    /* Passo 1: Edite o valor abaixo para um NOME que exista na sua DE de teste. */
    SET @identifier = "JULIO" 
    
    /* Passo 2: A função Lookup() é executada com os dados exatos da sua DE. */
    SET @correctPassword = Lookup("D3D99DF5-EA8D-4729-8056-93633F476699", "SENHA", "NOME", @identifier)

    /* Passo 3: O resultado é impresso em um comentário HTML visível no código-fonte. */
]%%

<!-- 
    ================================================================
    RESULTADO DO TESTE (Verifique o código-fonte da sua CloudPage):
    
    A senha encontrada para o identificador '%%=v(@identifier)=%%' foi: '%%=v(@correctPassword)=%%'
    
    - Se uma senha aparecer aqui, o Lookup() está funcionando e o problema está na lógica anterior.
    - Se a página ainda der erro 500, o problema está na própria função Lookup() (verifique permissões da DE, etc).
    - Se a senha ficar em branco, o identificador '%%=v(@identifier)=%%' não foi encontrado na DE.
    ================================================================
-->

%%[ 
    /* Lógica de autenticação desativada para o teste. A página sempre será exibida. */
    SET @isAuthenticated = true 
]%%
    `;
}

export const getSecurityFormHtml = (pageState: CloudPage): string => {
    const security = pageState.meta.security;
    
    if (security?.type === 'sso') {
        return `<div class="sso-redirect-container"><h1>Redirecionando para o login...</h1><script>window.location.href = "%%=v(@LoginURL)=%%";</script></div>`;
    }
    
    if (!security || security.type !== 'password' || !security.passwordConfig) {
        return '';
    }
    
    const urlParam = security.passwordConfig.urlParameter || 'id';

    return `
<div class="password-protection-container">
    <form method="post" action="%%=RequestParameter('PAGEURL')=%%" class="password-form">
        <h2>Acesso Restrito</h2>
        <p>Por favor, insira suas credenciais para continuar.</p>
        <input type="hidden" name="page_identifier_param" value="%%=v(@page_identifier_param)=%%">
        <input type="text" name="page_identifier" placeholder="Seu Identificador" value="%%=v(@identifier)=%%" required>
        <input type="password" name="page_password" placeholder="Sua senha" required>
        <button type="submit">Acessar</button>
        <p class="error-message">%%=v(@loginError)=%%</p>
    </form>
</div>
`;
}
