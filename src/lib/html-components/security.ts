
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
            SET @identifier_from_url = QueryParameter("${urlParameter}")
            SET @identifier_from_post = RequestParameter("page_identifier")
            SET @submittedPassword = RequestParameter("page_password")

            IF NOT EMPTY(@identifier_from_post) THEN
                SET @identifier = @identifier_from_post
            ELSE
                SET @identifier = @identifier_from_url
            ENDIF
            
            IF Request.Method == "POST" AND NOT EMPTY(@submittedPassword) THEN
                IF NOT EMPTY(@identifier) THEN
                    SET @correctPassword = Lookup("${dataExtensionKey}", "${passwordColumn}", "${identifierColumn}", @identifier)
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
                 SET @isAuthenticated = false
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
        return `
            <div class="password-protection-container">
                <form method="post" action="%%=RequestParameter('PAGEURL')=%%" class="password-form">
                    <h2>Acesso Restrito</h2>
                    <p>Por favor, insira sua senha para continuar.</p>
                    <input type="text" name="page_identifier" placeholder="Seu Identificador" value="%%=v(@identifier)=%%" required>
                    <input type="password" name="page_password" placeholder="Senha" required>
                    <div class="error-message" style="display: %%=IIF(EMPTY(@loginError), 'none', 'block')=%%;">%%=v(@loginError)=%%</div>
                    <button type="submit">Acessar</button>
                </form>
            </div>
        `;
    }
    
    return '';
}
