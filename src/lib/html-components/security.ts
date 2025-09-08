
import type { CloudPage } from '../types';

export const getAmpscriptSecurityBlock = (pageState: CloudPage): string => {
    const security = pageState.meta.security;
    
    let script = 'VAR @isAuthenticated, @LoginURL SET @LoginURL = Concat("https://mc.login.exacttarget.com/hub/auth?returnUrl=", URLEncode(CloudPagesURL(PageID)))';
    
    if (!security || security.type === 'none') {
        script += ' SET @isAuthenticated = true';
    } else if (security.type === 'sso') {
        script += ' TRY SET @IsAuthenticated_Temp = Request.GetUserInfo() SET @isAuthenticated = true CATCH(e) SET @isAuthenticated = false ENDTRY';
    } else if (security.type === 'password' && security.passwordConfig) {
        const config = security.passwordConfig;
        script += ` VAR @submittedPassword, @identifier, @correctPassword SET @isAuthenticated = false SET @submittedPassword = RequestParameter("page_password") SET @identifier = RequestParameter("${config.urlParameter}") IF NOT EMPTY(@submittedPassword) AND NOT EMPTY(@identifier) THEN SET @correctPassword = Lookup("${config.dataExtensionKey}", "${config.passwordColumn}", "${config.identifierColumn}", @identifier) IF @submittedPassword == @correctPassword THEN SET @isAuthenticated = true ENDIF ENDIF`;
    } else {
        script += ' SET @isAuthenticated = true';
    }

    // Return only the logic, without %%[...]%%
    return script;
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
        <p>Por favor, insira a senha para continuar.</p>
        <input type="password" name="page_password" placeholder="Sua senha" required>
        <button type="submit">Acessar</button>
        %%[ IF RequestParameter("page_password") != "" THEN ]%%
            <p class="error-message">Senha incorreta. Tente novamente.</p>
        %%[ ENDIF ]%%
    </form>
</div>
`;
}
