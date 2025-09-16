
import type { CloudPage } from '../types';

export const getSSJSSecurityBlock = (pageState: CloudPage): string => {
    const security = pageState.meta.security;
    if (security?.type !== 'password' || !security.passwordConfig) {
        return '';
    }

    const {
        dataExtensionKey,
        identifierColumn,
        passwordColumn,
        urlParameter
    } = security.passwordConfig;

    const cookieName = `auth_token_${pageState.id.replace(/-/g, '')}`;

    return `
Platform.Load("core", "1");

try {
    var deKey = "${dataExtensionKey}";
    var identifierColumn = "${identifierColumn}";
    var passwordColumn = "${passwordColumn}";
    var urlParam = "${urlParameter}";
    var cookieName = "${cookieName}";

    var identifier = "";
    var password = "";
    var isAuthenticated = false;
    var errorMessage = "";
    var sessionCookie = Platform.Request.GetCookieValue(cookieName);

    // 1. Check for an existing session cookie
    if (sessionCookie == "true") {
        isAuthenticated = true;
    } else {
        // 2. If no cookie, check for form submission or URL parameter
        if (Request.GetFormField("page_identifier")) {
            identifier = Request.GetFormField("page_identifier");
        } else if (Request.GetQueryStringParameter(urlParam)) {
            identifier = Request.GetQueryStringParameter(urlParam);
        }

        if (Request.GetFormField("page_password")) {
            password = Request.GetFormField("page_password");
        }

        if (password && identifier) {
            try {
                var de = DataExtension.Init(deKey);
                var data = de.Rows.Lookup([identifierColumn], [identifier]);

                if (data && data.length > 0) {
                    var correctPassword = data[0][passwordColumn];
                    if (password == correctPassword) {
                        isAuthenticated = true;
                        // Set session cookie on successful login
                        Platform.Response.SetCookie(cookieName, "true", 0, "Session");
                    } else {
                        errorMessage = "Senha ou identificador incorreto.";
                    }
                } else {
                    errorMessage = "Usuário não encontrado.";
                }
            } catch(ex) {
                errorMessage = "Erro ao acessar dados: " + ex.message;
            }
        } else if (Request.Method == "POST" && !password) {
            errorMessage = "A senha é obrigatória.";
        }
    }

    Variable.SetValue("@identifier", identifier);
    Variable.SetValue("@isAuthenticated", isAuthenticated);
    Variable.SetValue("@errorMessage", errorMessage);

} catch(ex) {
    Variable.SetValue("@errorMessage", "Erro geral: " + ex.message);
    Variable.SetValue("@isAuthenticated", false);
}
`;
}


export const getSecurityFormHtml = (pageState: CloudPage): string => {
    const security = pageState.meta.security;
    
    if (security?.type === 'sso') {
        return `
            %%[
                SET @Id = QueryParameter("id")
                SET @jobid = QueryParameter("jobid")
                SET @listid = QueryParameter("listid")
                SET @batchid = QueryParameter("batchid")
                SET @EnterpriseID = 'ENT_ID' /* <-- Substitua pelo seu Enterprise ID */
                SET @RedirectURL = CloudPagesURL(PAGE_ID_HERE) /* <-- Substitua pelo ID da sua CloudPage */
                SET @LoginURL = CONCAT("https://", @EnterpriseID, ".login.exacttarget.com/hub-sso.aspx?sso_id=", @Id, "&sso_jobid=", @jobid, "&sso_listid=", @listid, "&sso_batchid=", @batchid, "&sso_redirect=", URLEncode(@RedirectURL))
                SET @IsAuthorized = IIF(IsEmailAddress(QueryParameter("sso_email")),true,false)
                IF NOT @IsAuthorized THEN
                    Redirect(@LoginURL)
                ENDIF
                SET @isAuthenticated = @IsAuthorized
            ]%%
        `;
    }
    
    if (security?.type === 'password' && security.passwordConfig) {
        const config = security.passwordConfig;
        const pageStyle = `
            background-color: ${config.backgroundColor || '#f0f2f5'};
            color: ${config.textColor || '#111827'};
            font-family: sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            margin: 0;
        `;
        const formContainerStyle = `
            background: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
            text-align: center;
            max-width: 420px;
            width: 90%;
        `;
        return `
            <style>
                .password-form input {
                    width: 100%;
                    padding: 12px;
                    margin-top: 15px;
                    border: 1px solid #d1d5db;
                    border-radius: 6px;
                    box-sizing: border-box;
                }
                .password-form button {
                    width: 100%;
                    padding: 12px;
                    margin-top: 20px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: bold;
                    background-color: ${config.buttonBackgroundColor || 'var(--theme-color)'};
                    color: ${config.buttonTextColor || '#ffffff'};
                }
            </style>
            <div class="password-protection-container" style="${pageStyle}">
                <form method="post" action="%%=RequestParameter('PAGEURL')=%%" class="password-form" style="${formContainerStyle}">
                    ${config.logoUrl ? `<img src="${config.logoUrl}" alt="Logo" style="max-width: 150px; margin: 0 auto 20px auto; display: block;">` : ''}
                    <h2 style="margin-top: 0; color: ${config.textColor || '#111827'};">${config.title || 'Acesso Restrito'}</h2>
                    <p style="color: ${config.textColor ? `rgba(${parseInt(config.textColor.slice(1, 3), 16)}, ${parseInt(config.textColor.slice(3, 5), 16)}, ${parseInt(config.textColor.slice(5, 7), 16)}, 0.7)` : '#6b7280'};">${config.subtitle || 'Por favor, insira suas credenciais para continuar.'}</p>
                    <input type="hidden" name="page_identifier" value="%%=v(@identifier)=%%">
                    <input type="password" name="page_password" placeholder="Senha" required autofocus>
                    <button type="submit">Acessar</button>
                    %%[ IF NOT Empty(@errorMessage) THEN ]%%
                        <div class="error-message" style="display:block; color: red; margin-top: 10px;">
                            %%=v(@errorMessage)=%%
                        </div>
                    %%[ ENDIF ]%%
                </form>
            </div>
        `;
    }
    
    return '';
}
