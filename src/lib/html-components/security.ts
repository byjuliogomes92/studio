
import type { CloudPage } from '../types';

export const getAmpscriptSecurityBlock = (pageState: CloudPage): string => {
    const security = pageState.meta.security;
    
    if (!security || security.type !== 'password' || !security.passwordConfig) {
        return ''; 
    }
    
    const config = security.passwordConfig;
    if (!config.dataExtensionKey || !config.identifierColumn || !config.passwordColumn) {
        return '/* Invalid Password Config */'; 
    }
    
    // Retorna apenas a lógica, sem VAR ou IF/ELSE. Isso será tratado no gerador principal.
    return `
        SET @submittedPassword = RequestParameter("page_password")
        SET @identifier = RequestParameter("page_identifier")
        IF NOT EMPTY(@submittedPassword) AND NOT EMPTY(@identifier) THEN
            SET @correctPassword = Lookup("${config.dataExtensionKey}", "${config.passwordColumn}", "${config.identifierColumn}", @identifier)
            IF @submittedPassword == @correctPassword THEN
                SET @isAuthenticated = true
            ENDIF
        ENDIF
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

    // A lógica de erro agora está no bloco principal de AMPScript, então o IF aqui foi removido.
    return `
<div class="password-protection-container">
    <form method="post" action="%%=RequestParameter('PAGEURL')=%%" class="password-form">
        <h2>Acesso Restrito</h2>
        <p>Por favor, insira suas credenciais para continuar.</p>
        <input type="text" name="page_identifier" placeholder="Seu Identificador" required>
        <input type="password" name="page_password" placeholder="Sua senha" required>
        <button type="submit">Acessar</button>
        <p class="error-message">%%=v(@loginError)=%%</p>
    </form>
</div>
`;
}
