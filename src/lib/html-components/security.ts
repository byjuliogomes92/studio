
import type { CloudPage } from '../types';

export const getAmpscriptSecurityBlock = (pageState: CloudPage): string => {
    const security = pageState.meta.security;
    if (!security || security.type === 'none') {
        return '';
    }

    if (security.type === 'sso') {
        return `
            SET @Id = QueryParameter("id")
            SET @jobid = QueryParameter("jobid")
            SET @listid = QueryParameter("listid")
            SET @batchid = QueryAparameter("batchid")
            SET @EnterpriseID = 'ENT_ID' /* <-- Substitua pelo seu Enterprise ID */
            SET @RedirectURL = CloudPagesURL(PAGE_ID_HERE) /* <-- Substitua pelo ID da sua CloudPage */
            SET @LoginURL = CONCAT("https://", @EnterpriseID, ".login.exacttarget.com/hub-sso.aspx?sso_id=", @Id, "&sso_jobid=", @jobid, "&sso_listid=", @listid, "&sso_batchid=", @batchid, "&sso_redirect=", URLEncode(@RedirectURL))
            SET @IsAuthorized = IIF(IsEmailAddress(QueryParameter("sso_email")),true,false)
            IF NOT @IsAuthorized THEN
                Redirect(@LoginURL)
            ENDIF
            SET @isAuthenticated = @IsAuthorized
        `;
    }
    
    if (security.type === 'password' && security.passwordConfig) {
        const { dataExtensionKey, identifierColumn, passwordColumn, urlParameter } = security.passwordConfig;

        return `
            /* --- Logic for Password Protection --- */
            SET @loginError = ""
            SET @page_identifier_param = QueryParameter("${urlParameter}")
            SET @page_identifier = RequestParameter("page_identifier")
            SET @submittedPassword = RequestParameter("page_password")

            IF EMPTY(@page_identifier) THEN
                SET @page_identifier = @page_identifier_param
            ENDIF
            
            IF NOT EMPTY(@submittedPassword) THEN
                IF NOT EMPTY(@page_identifier) THEN
                    SET @correctPassword = Lookup("${dataExtensionKey}", "${passwordColumn}", "${identifierColumn}", @page_identifier)
                    IF @submittedPassword == @correctPassword THEN
                        SET @isAuthenticated = true
                    ELSE
                        SET @loginError = "Senha ou identificador inválido."
                        SET @isAuthenticated = false
                    ENDIF
                ELSE
                    SET @loginError = "Identificador não fornecido."
                    SET @isAuthenticated = false
                ENDIF
            ELSE
                 /* No password submitted yet, check if they can auto-login */
                 IF NOT EMPTY(@page_identifier) THEN
                     SET @correctPassword = Lookup("${dataExtensionKey}", "${passwordColumn}", "${identifierColumn}", @page_identifier)
                     /* This part can be extended for auto-login if needed */
                     SET @isAuthenticated = false
                 ELSE
                     SET @isAuthenticated = false
                 ENDIF
            ENDIF
        `;
    }
    
    return '';
}


export const getSecurityFormHtml = (pageState: CloudPage): string => {
    const security = pageState.meta.security;
    
    if (security?.type === 'sso') {
        return `<div class="sso-redirect-container"><h1>Redirecionando para o login...</h1><script>window.location.href = "%%=v(@LoginURL)=%%";</script></div>`;
    }
    
    if (security?.type === 'password') {
        const { urlParameter } = security.passwordConfig || { urlParameter: 'id' };
        return `
            <div class="password-protection-container">
                <form method="post" action="%%=RequestParameter('PAGEURL')=%%" class="password-form">
                    <h2>Acesso Restrito</h2>
                    <p>Por favor, insira sua senha para continuar.</p>
                    <input type="hidden" name="page_identifier_param" value="%%=v(@${urlParameter})=%%">
                    <input type="text" name="page_identifier" placeholder="Seu Identificador" value="%%=v(@page_identifier)=%%" required>
                    <input type="password" name="page_password" placeholder="Senha" required>
                    <div class="error-message" style="display: %%=IIF(EMPTY(@loginError), 'none', 'block')=%%;">%%=v(@loginError)=%%</div>
                    <button type="submit">Acessar</button>
                </form>
            </div>
        `;
    }
    
    return '';
}
