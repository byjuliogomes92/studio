import type { CloudPage, PageComponent, ComponentType } from './types';
import { getFormSubmissionScript } from './ssjs-templates';
import { renderHeader } from './html-components/header';
import { renderBanner } from './html-components/banner';
import { renderTitle } from './html-components/title';
import { renderSubtitle } from './html-components/subtitle';
import { renderParagraph } from './html-components/paragraph';
import { renderDivider } from './html-components/divider';
import { renderImage } from './html-components/image';
import { renderVideo } from './html-components/video';
import { renderCountdown } from './html-components/countdown';
import { renderSpacer } from './html-components/spacer';
import { renderButton } from './html-components/button';
import { renderDownloadButton } from './html-components/download-button';
import { renderAccordion } from './html-components/accordion';
import { renderTabs } from './html-components/tabs';
import { renderVoting } from './html-components/voting';
import { renderStripe } from './html-components/stripe';
import { renderNPS } from './html-components/nps';
import { renderMap } from './html-components/map';
import { renderSocialIcons } from './html-components/social-icons';
import { renderColumns } from './html-components/columns';
import { renderWhatsApp } from './html-components/whatsapp';
import { renderForm } from './html-components/form';
import { renderFooter } from './html-components/footer';


function renderComponents(components: PageComponent[], allComponents: PageComponent[], pageState: CloudPage, isForPreview: boolean): string {
    return components
        .sort((a, b) => a.order - b.order)
        .map(component => {
            if (component.type === 'Columns') {
                const columnCount = component.props.columnCount || 2;
                let columnsHtml = '';
                for (let i = 0; i < columnCount; i++) {
                    const columnComponents = allComponents.filter(c => c.parentId === component.id && c.column === i);
                    columnsHtml += `<div class="column">${renderComponents(columnComponents, allComponents, pageState, isForPreview)}</div>`;
                }
                const renderedComponent = renderSingleComponent(component, pageState, isForPreview, columnsHtml);
                return `<div class="section-wrapper"><div class="section-container">${renderedComponent}</div></div>`;
            }
             return `<div class="section-wrapper"><div class="section-container">${renderComponent(component, pageState, isForPreview)}</div></div>`;
        })
        .join('\n');
}

const renderComponent = (component: PageComponent, pageState: CloudPage, isForPreview: boolean): string => {
  if (isForPreview) {
    return renderSingleComponent(component, pageState, isForPreview);
  }

  if (component.abTestEnabled) {
    const variantB = (component.abTestVariants && component.abTestVariants[0]) || {};
    const propsA = component.props;
    const propsB = { ...propsA, ...variantB };

    const componentA = renderSingleComponent({ ...component, props: propsA, abTestEnabled: false }, pageState, isForPreview);
    const componentB = renderSingleComponent({ ...component, props: propsB, abTestEnabled: false }, pageState, isForPreview);

    const randomVar = `v(@Random_${component.id.slice(-5)})`;
    const hiddenInput = `<input type="hidden" name="VARIANTE_${component.id.toUpperCase()}" value="%%=v(@VARIANTE_${component.id.toUpperCase()})=%%">`;
    
    return `%%[
      SET ${randomVar} = Mod(Random(1,100), 2)
      IF ${randomVar} == 0 THEN
        SET @VARIANTE_${component.id.toUpperCase()} = "A"
    ]%%
      <div class="ab-variant-a">${componentA}</div>
    %%[ ELSE
        SET @VARIANTE_${component.id.toUpperCase()} = "B"
    ]%%
      <div class="ab-variant-b">${componentB}</div>
    %%[ ENDIF ]%%
    ${hiddenInput}
    `;
  }
  return renderSingleComponent(component, pageState, isForPreview);
};

const renderSingleComponent = (component: PageComponent, pageState: CloudPage, isForPreview: boolean, childrenHtml: string = ''): string => {
  switch (component.type) {
    case 'Header': return renderHeader(component);
    case 'Banner': return renderBanner(component);
    case 'Title': return renderTitle(component, isForPreview);
    case 'Subtitle': return renderSubtitle(component, isForPreview);
    case 'Paragraph': return renderParagraph(component, isForPreview);
    case 'Divider': return renderDivider(component);
    case 'Image': return renderImage(component);
    case 'Video': return renderVideo(component);
    case 'Countdown': return renderCountdown(component);
    case 'Spacer': return renderSpacer(component);
    case 'Button': return renderButton(component);
    case 'DownloadButton': return renderDownloadButton(component);
    case 'Accordion': return renderAccordion(component);
    case 'Tabs': return renderTabs(component);
    case 'Voting': return renderVoting(component);
    case 'Stripe': return renderStripe(component);
    case 'NPS': return renderNPS(component);
    case 'Map': return renderMap(component);
    case 'SocialIcons': return renderSocialIcons(component);
    case 'Columns': return renderColumns(component, childrenHtml);
    case 'WhatsApp': return renderWhatsApp(component);
    case 'Form': return renderForm(component, pageState);
    case 'Footer': return renderFooter(component);
    default:
      const exhaustiveCheck: never = component.type;
      return `<!-- Unknown component type: ${exhaustiveCheck} -->`;
  }
};

const getTrackingScripts = (trackingConfig: CloudPage['meta']['tracking']): { head: string, body: string } => {
    if (!trackingConfig) return { head: '', body: '' };

    let headScripts = '';
    let bodyScripts = '';

    if (trackingConfig.gtm?.enabled && trackingConfig.gtm.id) {
        const gtmId = trackingConfig.gtm.id;
        headScripts += `
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');</script>
<!-- End Google Tag Manager -->`;
        
        bodyScripts += `
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;
    }

    if (trackingConfig.ga4?.enabled && trackingConfig.ga4.id) {
        const ga4Id = trackingConfig.ga4.id;
        headScripts += `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${ga4Id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${ga4Id}');
</script>`;
    }

    if (trackingConfig.meta?.enabled && trackingConfig.meta.id) {
        const metaId = trackingConfig.meta.id;
        headScripts += `
<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${metaId}&ev=PageView&noscript=1"
/></noscript>
<!-- End Meta Pixel Code -->`;
    }

    if (trackingConfig.linkedin?.enabled && trackingConfig.linkedin.id) {
        const linkedinId = trackingConfig.linkedin.id;
        headScripts += `
<!-- LinkedIn Insight Tag -->
<script type="text/javascript">
_linkedin_partner_id = "${linkedinId}";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script><script type="text/javascript">
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);
</script>
<noscript>
<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=${linkedinId}&fmt=gif" />
</noscript>
<!-- End LinkedIn Insight Tag -->`;
    }

    return { head: headScripts, body: bodyScripts };
};

const getCookieBanner = (cookieBannerConfig: CloudPage['cookieBanner'], themeColor: string): string => {
    if (!cookieBannerConfig || !cookieBannerConfig.enabled) return '';

    return `
    <div id="cookie-banner">
        <p>${cookieBannerConfig.text}</p>
        <button id="accept-cookies" style="background-color: ${themeColor};">${cookieBannerConfig.buttonText}</button>
    </div>
    <style>
        #cookie-banner {
            position: fixed;
            bottom: -200px;
            left: 20px;
            max-width: 380px;
            background-color: rgba(255, 255, 255, 0.95);
            color: black;
            padding: 20px;
            border-radius: 12px;
            box-sizing: border-box;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 15px;
            z-index: 10000;
            transition: bottom 0.5s ease-in-out;
            border: 1px solid #e0e0e0;
        }
        #cookie-banner p {
            margin: 0;
            font-size: 14px;
            line-height: 1.5;
        }
        #cookie-banner button {
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            align-self: flex-end;
            font-weight: bold;
        }
         @media (max-width: 480px) {
            #cookie-banner {
                left: 10px;
                right: 10px;
                max-width: none;
                bottom: -200px;
            }
        }
    </style>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const cookieBanner = document.getElementById('cookie-banner');
            const acceptButton = document.getElementById('accept-cookies');

            if (cookieBanner && acceptButton && !localStorage.getItem('cookiesAccepted')) {
                setTimeout(() => {
                  cookieBanner.style.bottom = '20px';
                }, 500);
            }

            if(acceptButton) {
                acceptButton.addEventListener('click', function() {
                    localStorage.setItem('cookiesAccepted', 'true');
                    cookieBanner.style.bottom = '-200px';
                });
            }
        });
    </script>
    `;
};


const getSecurityScripts = (pageState: CloudPage): { ssjs: string, amscript: string, body: string } => {
    const security = pageState.meta.security;
    if (!security || security.type === 'none') {
        return { ssjs: '', amscript: 'VAR @isAuthenticated\nSET @isAuthenticated = true', body: '' };
    }

    if (security.type === 'sso') {
        const amscript = `
  VAR @IsAuthenticated, @RedirectURL
  SET @RedirectURL = CloudPagesURL(PageID)
  TRY 
    SET @IsAuthenticated = Request.GetUserInfo()
  CATCH(e) 
    Redirect("https://mc.login.exacttarget.com/hub/auth?returnUrl=" + URLEncode(@RedirectURL), false)
  ENDTRY`;
        return { ssjs: '', amscript, body: '' };
    }
    
    if (security.type === 'password' && security.passwordConfig) {
        const config = security.passwordConfig;
        const amscript = `
  VAR @isAuthenticated, @submittedPassword, @identifier, @correctPassword
  SET @isAuthenticated = false
  SET @submittedPassword = RequestParameter("page_password")
  SET @identifier = RequestParameter("${config.urlParameter}")

  IF NOT EMPTY(@submittedPassword) AND NOT EMPTY(@identifier) THEN
      SET @correctPassword = Lookup("${config.dataExtensionKey}", "${config.passwordColumn}", "${config.identifierColumn}", @identifier)
      IF @submittedPassword == @correctPassword THEN
          SET @isAuthenticated = true
      ENDIF
  ENDIF
`;

        const body = `
%%[ IF @isAuthenticated != true THEN ]%%
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
%%[ ENDIF ]%%`;

        return { ssjs: '', amscript, body: '' };
    }

    return { ssjs: '', amscript: 'VAR @isAuthenticated\nSET @isAuthenticated = true', body: '' };
}

const getClientSideScripts = (pageState: CloudPage): string => {
    const hasLottieAnimation = pageState.components.some(c => c.type === 'Form' && c.props.thankYouAnimation && c.props.thankYouAnimation !== 'none');
    const lottiePlayerScript = hasLottieAnimation ? '<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>' : '';

    const script = `
    <script>
    function setupAccordions() {
        document.querySelectorAll('.accordion-container').forEach(container => {
            container.addEventListener('click', function(event) {
                const header = event.target.closest('.accordion-header');
                if (!header) return;
                
                const content = header.nextElementSibling;
                const isExpanded = header.getAttribute('aria-expanded') === 'true';

                header.setAttribute('aria-expanded', !isExpanded);
                if (!isExpanded) {
                    content.style.maxHeight = content.scrollHeight + 'px';
                    content.style.padding = '15px';
                } else {
                    content.style.maxHeight = '0';
                    content.style.padding = '0 15px';
                }
            });
        });
    }
    
    function setupTabs() {
        document.querySelectorAll('.tabs-container').forEach(tabsContainer => {
            const tabList = tabsContainer.querySelector('.tab-list');
            const triggers = tabList.querySelectorAll('.tab-trigger');
            const panels = tabsContainer.querySelectorAll('.tab-panel');

            tabList.addEventListener('click', e => {
                const trigger = e.target.closest('.tab-trigger');
                if (trigger) {
                    triggers.forEach(t => t.setAttribute('aria-selected', 'false'));
                    trigger.setAttribute('aria-selected', 'true');
                    const tabId = trigger.dataset.tab;
                    panels.forEach(p => {
                        if ('panel-' + tabId === p.id) {
                            p.hidden = false;
                        } else {
                            p.hidden = true;
                        }
                    });
                }
            });
        });
    }
    
    function setSocialIconStyles() {
        document.querySelectorAll('.social-icons-container').forEach(container => {
            const iconSize = container.dataset.iconSize || '24px';
            container.querySelectorAll('.social-icon svg').forEach(svg => {
                svg.style.width = iconSize;
                svg.style.height = iconSize;
            });
        });
    }

    function formatPhoneNumber(input) {
        let numbers = input.value.replace(/\\D/g, '');
        numbers = numbers.substring(0, 11);
        let formatted = '';
        if (numbers.length > 0) {
            formatted = '(' + numbers.substring(0, 2);
        }
        if (numbers.length > 2) {
            formatted += ') ' + numbers.substring(2, 3);
        }
        if (numbers.length > 3) {
            formatted += ' ' + numbers.substring(3, 7);
        }
        if (numbers.length > 7) {
            formatted += '-' + numbers.substring(7, 11);
        }
        input.value = formatted;
        if (formatted.length > 0) {
            input.classList.add('phone-formatted');
        } else {
            input.classList.remove('phone-formatted');
        }
    }
    
    function validateEmail(input) {
        const email = input.value;
        const emailWrapper = input.parentElement;
        const existingIcon = emailWrapper.querySelector('.validation-icon');
        if (existingIcon) {
            emailWrapper.removeChild(existingIcon);
        }
        
        if (email.includes('@') && email.length > 0) {
            input.classList.remove('email-invalid');
            input.classList.add('email-valid');
            const validIcon = document.createElement('span');
            validIcon.className = 'validation-icon';
            validIcon.innerHTML = '✓';
            validIcon.style.color = '#4CAF50';
            emailWrapper.appendChild(validIcon);
        } else if (email.length > 0) {
            input.classList.remove('email-valid');
            input.classList.add('email-invalid');
            const invalidIcon = document.createElement('span');
            invalidIcon.className = 'validation-icon';
            invalidIcon.innerHTML = '✗';
            invalidIcon.style.color = '#F44336';
            emailWrapper.appendChild(invalidIcon);
        } else {
            input.classList.remove('email-valid');
            input.classList.remove('email-invalid');
        }
    }
    
    function validateForm(form) {
      let valid = true;
      form.querySelectorAll('.error-message').forEach(el => el.style.display = 'none');
      const requiredInputs = form.querySelectorAll('input[required], select[required]');

      requiredInputs.forEach(input => {
          let isInvalid = false;
          
          if(input.type === 'checkbox') {
              isInvalid = !input.checked;
          } else {
              isInvalid = input.value.trim() === '';
          }

          if (isInvalid) {
              const errorId = 'error-' + (input.name || input.id).toLowerCase();
              const error = form.querySelector('#' + errorId);
              if (error) {
                error.style.display = 'block';
              }
              valid = false;
          }
      });
      return valid;
    }

    function setupForms() {
        document.querySelectorAll('form[id^="smartcapture-form-"]').forEach(form => {
            const submitButton = form.querySelector('button[type="submit"]');
            
            if (submitButton && !submitButton.querySelector('.button-loader')) {
                const buttonContent = submitButton.innerHTML;
                
                const buttonText = document.createElement('span');
                buttonText.className = 'button-text';
                buttonText.innerHTML = buttonContent;
                
                const buttonLoader = document.createElement('div');
                buttonLoader.className = 'button-loader';

                submitButton.innerHTML = '';
                submitButton.appendChild(buttonText);
                submitButton.appendChild(buttonLoader);
            }

            form.addEventListener('submit', function(e) {
                if (!validateForm(form)) {
                    e.preventDefault();
                    return;
                }
                if (submitButton) {
                    submitButton.disabled = true;
                    const textSpan = submitButton.querySelector('.button-text');
                    const loader = submitButton.querySelector('.button-loader');
                    if (textSpan) textSpan.style.opacity = '0';
                    if (loader) loader.style.display = 'block';
                }
            });
            
            if (submitButton?.hasAttribute('disabled')) {
                const requiredInputs = Array.from(form.querySelectorAll('[required]'));
                const checkFormValidity = () => {
                    const allValid = requiredInputs.every(input => {
                        if (input.type === 'checkbox') return input.checked;
                        return input.value.trim() !== '';
                    });
                    submitButton.disabled = !allValid;
                };
                requiredInputs.forEach(input => input.addEventListener('input', checkFormValidity));
                checkFormValidity();
            }
        });
    }

    function handleConditionalFields() {
        document.querySelectorAll('form[id^="smartcapture-form-"]').forEach(form => {
            const conditionalFields = form.querySelectorAll('[data-conditional-on]');
            
            const checkConditions = () => {
                conditionalFields.forEach(field => {
                    const dependsOnName = field.dataset.conditionalOn;
                    const dependsOnValue = field.dataset.conditionalValue;
                    const triggerField = form.querySelector(\`[id="\${dependsOnName.toUpperCase()}"]\`);
                    
                    if(triggerField) {
                        const shouldBeVisible = triggerField.value === dependsOnValue;
                        field.style.display = shouldBeVisible ? 'block' : 'none';
                        field.querySelectorAll('input, select').forEach(i => i.required = shouldBeVisible);
                    }
                });
            }

            form.addEventListener('input', checkConditions);
            checkConditions();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        const loader = document.getElementById('loader');
        if (loader) {
            setTimeout(function () {
                loader.style.display = 'none';
            }, 2000);
        }
        
        const phoneInput = document.getElementById('TELEFONE');
        if(phoneInput) phoneInput.addEventListener('input', function() { formatPhoneNumber(this); });
        
        const emailInput = document.getElementById('EMAIL');
        if(emailInput) {
            if (!emailInput.parentElement.classList.contains('input-wrapper')) {
              const emailWrapper = document.createElement('div');
              emailWrapper.className = 'input-wrapper';
              emailInput.parentNode.insertBefore(emailWrapper, emailInput);
              emailWrapper.appendChild(emailInput);
            }
            emailInput.addEventListener('input', function() { validateEmail(this); });
            emailInput.addEventListener('blur', function() { validateEmail(this); });
        }
        
        document.querySelectorAll('.mobile-menu-toggle').forEach(button => {
            button.addEventListener('click', function() {
                const header = this.closest('.page-header');
                if (header) {
                    header.classList.toggle('mobile-menu-open');
                }
            });
        });
        
        setupForms();
        setupAccordions();
        setupTabs();
        setSocialIconStyles();
        handleConditionalFields();
    });
</script>
    `;

    return `${lottiePlayerScript}${script}`;
};

const getPrefillAmpscript = (pageState: CloudPage): string => {
    const formComponent = pageState.components.find(c => c.type === 'Form');
    if (!formComponent) return '';

    const fieldsToPrefill: {name: string, param: string}[] = [];
    const fields = formComponent.props.fields;

    if (fields?.name?.prefillFromUrl) fieldsToPrefill.push({name: 'NOME', param: 'nome'});
    if (fields?.email?.prefillFromUrl) fieldsToPrefill.push({name: 'EMAIL', param: 'email'});
    if (fields?.phone?.prefillFromUrl) fieldsToPrefill.push({name: 'TELEFONE', param: 'telefone'});
    if (fields?.cpf?.prefillFromUrl) fieldsToPrefill.push({name: 'CPF', param: 'cpf'});
    if (fields?.birthdate?.prefillFromUrl) fieldsToPrefill.push({name: 'DATANASCIMENTO', param: 'datanascimento'});
    if (fields?.city?.prefillFromUrl) fieldsToPrefill.push({name: 'CIDADE', param: 'cidade'});

    if (fieldsToPrefill.length === 0) return '';

    const varDeclarations = fieldsToPrefill.map(f => `@${f.name}`).join(', ');
    const setStatements = fieldsToPrefill.map(f => `SET @${f.name} = RequestParameter("${f.param}")`).join('\n');

    return `
/* --- Prefill from URL Parameters --- */
VAR ${varDeclarations}
${setStatements}
`;
}

export function generateHtml(pageState: CloudPage, isForPreview: boolean = false, baseUrl: string = ''): string {
  const { id, styles, components, meta, cookieBanner } = pageState;
  
  const ssjsScript = getFormSubmissionScript(pageState);

  const security = getSecurityScripts(pageState);
  
  const clientSideScripts = getClientSideScripts(pageState);
  
  const stripeComponents = components.filter(c => c.type === 'Stripe' && c.parentId === null).map(c => renderSingleComponent(c, pageState, isForPreview)).join('\n');
  const whatsAppComponent = components.find(c => c.type === 'WhatsApp');
  
  const trackingScripts = getTrackingScripts(meta.tracking);
  const cookieBannerHtml = getCookieBanner(cookieBanner, styles.themeColor);
  const googleFont = styles.fontFamily || 'Roboto';
  
  const mainContentHtml = renderComponents(components.filter(c => c.parentId === null), components, pageState, isForPreview);

  const trackingPixel = isForPreview ? '' : `<img src="${baseUrl}/api/track/${id}" alt="" width="1" height="1" style="display:none" />`;

  const prefillAmpscript = getPrefillAmpscript(pageState);

  const initialAmpscript = `%%[ 
    VAR @showThanks, @status, @thankYouMessage, @NOME, @EMAIL, @TELEFONE, @CPF, @CIDADE, @DATANASCIMENTO, @OPTIN
    IF EMPTY(RequestParameter("__isPost")) THEN
      SET @showThanks = "false"
    ENDIF
    ${meta.customAmpscript || ''}
    ${security.amscript}
    ${prefillAmpscript || ''}
]%%`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${meta.title}</title>
<meta name="description" content="${meta.metaDescription}">
<meta name="keywords" content="${meta.metaKeywords}">
<link rel="icon" href="${meta.faviconUrl}" sizes="16x16" type="image/png">
<link rel="icon" href="${meta.faviconUrl}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="https://i.postimg.cc/FkRH2d9j/apple-touch-icon.png">
<link rel="icon" href="${meta.faviconUrl}" sizes="192x192" type="image/png">
<link rel="icon" href="${meta.faviconUrl}" sizes="512x512" type="image/png">
<meta name="theme-color" content="${styles.themeColor}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
<link href="https://fonts.googleapis.com/css2?family=${googleFont.replace(/ /g, '+')}:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap" rel="stylesheet">
${trackingScripts.head}
<style>
    :root {
      --theme-color: ${styles.themeColor || '#000000'};
      --theme-color-hover: ${styles.themeColorHover || '#333333'};
    }
    body {
        background-color: ${styles.backgroundColor};
        background-image: url(${styles.backgroundImage});
        background-size: cover;
        background-repeat: no-repeat;
        background-attachment: fixed;
        font-family: "${googleFont}", sans-serif;
        font-weight: 500;
        font-style: normal;
        margin: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 100vh;
        box-sizing: border-box;
    }

    #loader {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        background-color: ${styles.themeColor};
    }

    #loader img {
        width: 150px;
        height: 150px;
        object-fit: contain;
        border-radius: 0%;
        animation: pulse 2s infinite;
        filter: brightness(0) invert(1);
    }

    @keyframes pulse {
        0% {
            transform: scale(1);
            opacity: 1;
        }
        50% {
            transform: scale(1.1);
            opacity: 0.8;
        }
        100% {
            transform: scale(1);
            opacity: 1;
        }
    }
  
  
    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
    
    .section-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .section-container {
        width: 100%;
        max-width: 800px;
        padding: 10px 20px;
        box-sizing: border-box;
    }
    
    .page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
        padding: 1rem;
        box-sizing: border-box;
    }
    .page-header .header-logo img {
        height: 40px;
        max-height: 40px;
        width: auto;
    }
    .page-header .header-nav ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
        gap: 1.5rem;
    }
    .page-header .header-nav a {
        text-decoration: none;
        color: inherit;
        font-weight: 500;
    }
    .page-header .header-button {
        background-color: var(--theme-color);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        text-decoration: none;
        white-space: nowrap;
    }
    .page-header[data-layout="logo-center-menu-below"] {
        flex-direction: column;
        gap: 1rem;
    }
    .page-header[data-layout="logo-only-left"] .header-logo { margin-right: auto; }
    .page-header[data-layout="logo-only-center"] { justify-content: center; }

    .mobile-menu-toggle { display: none; }

    @media (max-width: 768px) {
        .page-header .header-nav, .page-header .header-button {
            display: none;
        }
        .mobile-menu-toggle {
            display: block;
            background: none;
            border: none;
            cursor: pointer;
        }
        .page-header.mobile-menu-open {
            flex-direction: column;
            align-items: flex-start;
        }
        .page-header.mobile-menu-open .header-nav {
            display: block;
            width: 100%;
            margin-top: 1rem;
        }
        .page-header.mobile-menu-open .header-nav ul {
            flex-direction: column;
            gap: 1rem;
        }
        .page-header.mobile-menu-open .header-button {
            display: block;
            margin-top: 1rem;
        }
    }


    .banner img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    [contenteditable="true"]:focus {
      outline: 2px solid ${styles.themeColor};
      box-shadow: 0 0 5px ${styles.themeColor};
    }
    
    h1, h2 {
        font-weight: bold;
    }


    .video-container {
        position: relative;
        overflow: hidden;
        width: 100%;
        padding-top: 56.25%;
    }

    .video-container iframe {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
    }

    .countdown {
        font-size: 2em;
        font-weight: bold;
        color: ${styles.themeColor};
        text-align: center;
    }
    
    .custom-button, .thank-you-message a.custom-button {
      background-color: var(--theme-color);
      color: white !important;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      display: inline-block;
      transition: background-color 0.3s ease;
      border: none;
      cursor: pointer;
    }
    
    .custom-button:hover, .thank-you-message a.custom-button:hover {
      background-color: var(--theme-color-hover);
    }

    .progress-container {
        width: 100%;
        background-color: #f3f3f3;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-top: 10px;
    }
    .progress-bar {
        width: 0%;
        height: 20px;
        background-color: ${styles.themeColor};
        text-align: center;
        line-height: 20px;
        color: white;
        border-radius: 5px;
        transition: width 0.1s linear;
    }

    .form-container {
        padding: 20px 0;
    }
    
    .form-container .row {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin-bottom: 10px;
    }

    .form-container .input-wrapper {
        flex: 1 1 calc(50% - 10px);
        min-width: 200px;
    }

    .form-container .custom-fields-wrapper, .form-container .input-wrapper {
        margin-bottom: 15px;
    }
    .form-container .input-wrapper label,
    .form-container .custom-fields-wrapper label {
        display: block;
        margin-bottom: 5px;
        font-size: 14px;
        color: #333;
        text-align: left;
    }
    
    .form-container input,
    .form-container select {
        width: 100%;
        padding: 15px;
        margin: 0;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-sizing: border-box;
        font-family: "${googleFont}", sans-serif;
        font-weight: 700;
        font-style: normal;
    }

    .form-submit-button {
        border: none;
        cursor: pointer;
        position: relative;
        transition: all 0.3s ease;
        margin-top: 10px;
        font-size: large;
        width: auto;
        min-width: 200px;
        padding: 15px 30px;
        border-radius: 30px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
    }
    
    .form-submit-button .lucide-icon {
        width: 1.2em;
        height: 1.2em;
    }

    .form-submit-button:disabled {
        background-color: #ccc !important;
        cursor: not-allowed;
    }
    
    .thank-you-message {
      padding: 20px;
    }


    .button-loader {
        display: none;
        width: 20px;
        height: 20px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top: 3px solid #fff;
        animation: spin 1s linear infinite;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
    }

    .button-text {
        transition: opacity 0.3s ease;
    }

    .consent {
        font-size: 14px;
        margin: 10px 0;
        text-align: left;
        color: #000;
        display: flex;
        align-items: center;
    }

    .consent input {
        width: auto;
        margin-right: 5px;
        transform: scale(1.5);
    }
    
    .consent label { color: #000; }
    .consent a { color: ${styles.themeColor}; }

    .error-message {
        color: rgb(196, 11, 11);
        display: none;
        margin-bottom: 10px;
        font-family: "${googleFont}", sans-serif;
        font-weight: 700;
        font-style: normal;
        font-size: small;
        text-align: left;
    }
    
    .phone-formatted {
        letter-spacing: 1px;
        font-family: monospace;
        font-size: 16px;
    }
    
    .email-valid {
        border-color: #4CAF50 !important;
    }
    
    .email-invalid {
        border-color: #F44336 !important;
    }
    
    .validation-icon {
        position: absolute;
        right: 10px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 18px;
    }
    
    .input-wrapper {
        position: relative;
        width: 100%;
    }

    footer {
        -webkit-font-smoothing: antialiased;
        color: rgba(0, 0, 0, 0.87);
        font-size: 0.875rem;
        font-family: "Roboto", "Helvetica", "Arial", sans-serif;
        font-weight: 400;
        line-height: 1.43;
        letter-spacing: 0.01071em;
        user-select: text !important;
        box-sizing: inherit;
        width: 100%;
        margin-top: auto;
    }

    .natds602 {
        margin-top: 25px;
        color: #737373;
        width: 100%;
        padding: 32px 80px;
        background-color: #FAFAFA;
        font-size: xx-small;
        box-sizing: border-box;
    }

    .MuiGrid-container {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
        box-sizing: border-box;
        flex-direction: column;
        align-items: center;
        gap: 10px;
    }

    .accordion-container {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        overflow: hidden;
    }
    .accordion-item {
        border-bottom: 1px solid #e0e0e0;
    }
    .accordion-item:last-child {
        border-bottom: none;
    }
    .accordion-header {
        background-color: #f9f9f9;
        color: #333;
        cursor: pointer;
        padding: 15px;
        width: 100%;
        border: none;
        text-align: left;
        outline: none;
        font-size: 16px;
        transition: background-color 0.3s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .accordion-header:hover, .accordion-header[aria-expanded="true"] {
        background-color: #f1f1f1;
    }
    .accordion-icon {
        width: 10px;
        height: 10px;
        border-right: 2px solid #333;
        border-bottom: 2px solid #333;
        transform: rotate(45deg);
        transition: transform 0.3s ease;
    }
    .accordion-header[aria-expanded="true"] .accordion-icon {
        transform: rotate(225deg);
    }
    .accordion-content {
        padding: 0 15px;
        background-color: white;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease, padding 0.3s ease;
        text-align: left;
    }
    .accordion-content.active {
        padding: 15px;
    }

    .tabs-container { }
    .tab-list {
        display: flex;
        border-bottom: 1px solid #e0e0e0;
    }
    .tab-trigger {
        padding: 10px 20px;
        cursor: pointer;
        border: none;
        background-color: transparent;
        border-bottom: 2px solid transparent;
        transition: all 0.3s ease;
        font-size: 16px;
    }
    .tab-trigger:hover {
        background-color: #f9f9f9;
    }
    .tab-trigger[aria-selected="true"] {
        border-bottom-color: var(--theme-color);
        color: var(--theme-color);
        font-weight: bold;
    }
    .tab-panel {
        padding: 20px;
        text-align: left;
    }

    .voting-container {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        text-align: center;
    }
    .voting-question {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 15px;
    }
    .voting-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .voting-option {
        width: 100%;
        padding: 12px;
        border: 1px solid var(--theme-color);
        color: var(--theme-color);
        background-color: transparent;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1em;
    }
    .voting-option:hover {
        background-color: var(--theme-color);
        color: white;
    }
    .voting-results {
        margin-top: 20px;
    }
    .voting-result {
        margin-bottom: 10px;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    .result-label {
        flex-shrink: 0;
        width: 100px;
        text-align: right;
        font-size: 0.9em;
    }
    .result-bar-container {
        flex-grow: 1;
        background-color: #f0f0f0;
        border-radius: 5px;
        overflow: hidden;
    }
    .result-bar {
        height: 20px;
        background-color: var(--theme-color);
        width: 0%;
        border-radius: 5px;
        transition: width 0.5s ease;
    }
    .result-percentage {
        font-size: 0.9em;
        font-weight: bold;
        width: 50px;
    }

    .stripe-container {
        width: 100%;
        padding: 10px 20px;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        justify-content: center;
        position: sticky;
        top: 0;
        z-index: 1000;
    }
    .stripe-container p {
        margin: 0;
        flex-grow: 1;
    }
    .stripe-close-btn {
        background: none;
        border: none;
        color: inherit;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        padding: 0 10px;
        position: absolute;
        right: 10px;
    }

    .nps-container {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 25px;
        text-align: center;
    }
    .nps-question {
        font-size: 1.1em;
        margin-bottom: 20px;
    }
    .nps-options-wrapper {
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-bottom: 15px;
    }
    .nps-option {
        border: 1px solid #ccc;
        border-radius: 50%;
        background-color: #f9f9f9;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #333;
    }
    .nps-option:hover {
        transform: scale(1.1);
    }
    .nps-option.selected {
        font-weight: bold;
        transform: scale(1.15);
        border-width: 2px;
        box-shadow: 0 0 10px rgba(0,0,0,0.2);
    }
    .nps-option[data-score="0"], .nps-option[data-score="1"], .nps-option[data-score="2"], .nps-option[data-score="3"], .nps-option[data-score="4"], .nps-option[data-score="5"], .nps-option[data-score="6"] { --nps-color: #d9534f; }
    .nps-option[data-score="7"], .nps-option[data-score="8"] { --nps-color: #f0ad4e; }
    .nps-option[data-score="9"], .nps-option[data-score="10"] { --nps-color: #5cb85c; }
    .nps-option:hover { background-color: var(--nps-color); color: white; border-color: var(--nps-color); }
    .nps-option.selected { background-color: var(--nps-color); color: white; border-color: var(--nps-color); }
    .nps-numeric {
        width: 40px;
        height: 40px;
        font-size: 1em;
    }
    .nps-face {
        width: 45px;
        height: 45px;
        font-size: 1.5em;
        line-height: 45px;
    }
    .nps-labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.85em;
        color: #666;
        padding: 0 5px;
    }
    .nps-thanks {
        font-size: 1.2em;
        font-weight: bold;
        color: var(--theme-color);
    }

    .map-container {
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #e0e0e0;
    }

    .social-icons-container {
        display: flex;
        gap: 15px;
        justify-content: center;
    }
    .social-icon {
        display: inline-block;
        color: #333;
        transition: transform 0.2s ease;
    }
    .social-icon:hover {
        transform: scale(1.1);
        color: var(--theme-color);
    }
    .social-icon svg {
        width: 24px;
        height: 24px;
    }

    .columns-container {
        display: flex;
        gap: 20px;
        width: 100%;
    }
    .column {
        flex: 1;
        min-width: 0;
    }

    .whatsapp-float-btn {
        position: fixed;
        width: 60px;
        height: 60px;
        background-color: #25D366;
        color: #FFF;
        border-radius: 50px;
        text-align: center;
        font-size: 30px;
        box-shadow: 2px 2px 3px #999;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .whatsapp-float-btn.bottom-right {
        bottom: 40px;
        right: 40px;
    }
    .whatsapp-float-btn.bottom-left {
        bottom: 40px;
        left: 40px;
    }
    .whatsapp-float-btn svg {
        width: 32px;
        height: 32px;
    }

    .password-protection-container {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
        width: 100%;
    }
    .password-form {
        background: white;
        padding: 40px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        text-align: center;
        max-width: 400px;
        width: 90%;
    }
    .password-form h2 {
        margin-top: 0;
    }
    .password-form input {
         width: 100%;
        padding: 12px;
        margin-top: 10px;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-sizing: border-box;
    }
    .password-form button {
        width: 100%;
        padding: 12px;
        margin-top: 20px;
        background-color: var(--theme-color);
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }
     .password-form .error-message {
        display: block;
        margin-top: 10px;
    }


    @media (max-width: 768px) {
        .columns-container {
            flex-direction: column;
        }
        .form-container .row {
            flex-direction: column;
            gap: 10px;
        }
    }


    ${styles.customCss || ''}
</style>
${clientSideScripts}
</head>
<body>
${trackingScripts.body}
${initialAmpscript}
${ssjsScript}
  %%[ IF @isAuthenticated == true THEN ]%%
  <div id="loader">
    <img src="${meta.loaderImageUrl || 'https://placehold.co/150x150.png'}" alt="Loader">
  </div>
  ${stripeComponents}
  <main>
    ${mainContentHtml}
  </main>
  ${whatsAppComponent ? renderSingleComponent(whatsAppComponent, pageState, isForPreview) : ''}
  ${cookieBannerHtml}
  ${trackingPixel}
  %%[ ELSE ]%%
  ${security.body}
  %%[ ENDIF ]%%
</body>
</html>
`;
}
