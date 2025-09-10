
import type { CloudPage } from '../types';

export const getAmpscriptSecurityBlock = (pageState: CloudPage): string => {
    const security = pageState.meta.security;
    
    if (!security || security.type !== 'password' || !security.passwordConfig) {
        return ''; 
    }
    
    const config = security.passwordConfig;
    if (!config.dataExtensionKey || !config.identifierColumn || !config.passwordColumn || !config.urlParameter) {
        return '/* Invalid Password Config: Missing required fields. */'; 
    }
    
    // This block now handles both the initial load (from URL param) and the form submission.
    return `
        SET @page_identifier_param = AttributeValue("${config.urlParameter}") /* From URL */
        SET @page_identifier_form = RequestParameter("page_identifier") /* From Form */

        /* Determine the correct identifier to use */
        IF NOT EMPTY(@page_identifier_form) THEN
            SET @identifier = @page_identifier_form
        ELSE
            SET @identifier = @page_identifier_param
        ENDIF

        SET @submittedPassword = RequestParameter("page_password")

        IF NOT EMPTY(@submittedPassword) AND NOT EMPTY(@identifier) THEN
            SET @correctPassword = Lookup("${config.dataExtensionKey}", "${config.passwordColumn}", "${config.identifierColumn}", @identifier)
            IF @submittedPassword == @correctPassword THEN
                SET @isAuthenticated = true
            ELSE
                SET @loginError = "Credenciais incorretas. Por favor, tente novamente."
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
    

    return `
<div class="password-protection-container">
    <form method="post" action="%%=RequestParameter('PAGEURL')=%%" class="password-form">
        <h2>Acesso Restrito</h2>
        <p>Por favor, insira suas credenciais para continuar.</p>
        <input type="hidden" name="${urlParam}" value="%%=v(@identifier)=%%">
        <input type="text" name="page_identifier" placeholder="Seu Identificador" value="%%=v(@identifier)=%%" required>
        <input type="password" name="page_password" placeholder="Sua senha" required>
        <button type="submit">Acessar</button>
        <p class="error-message">%%=v(@loginError)=%%</p>
    </form>
</div>
`;
}
