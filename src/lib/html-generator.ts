
import type { CloudPage, PageComponent } from './types';

const renderField = (
  id: string, 
  name: string, 
  type: string, 
  dataType: string, 
  placeholder: string,
  required: boolean = true
  ): string => {
  return `
    <div class="input-wrapper">
      <input 
        type="${type}" 
        id="${name.toUpperCase()}" 
        name="${name.toUpperCase()}" 
        data-field-type="${dataType}" 
        placeholder="${placeholder}" 
        ${required ? 'required="required"' : ''}
      >
      <div class="error-message" id="error-${name.toLowerCase()}">Por favor, preencha este campo.</div>
    </div>
  `;
}

const renderCityDropdown = (citiesString: string = '', required: boolean = false): string => {
    const cities = citiesString.split('\n').filter(city => city.trim() !== '');
    const options = cities.map(city => `<option value="${city}">${city}</option>`).join('');
    return `
        <div class="input-wrapper">
            <select
                id="CIDADE"
                name="CIDADE"
                data-field-type="Text"
                ${required ? 'required="required"' : ''}
            >
                <option value="" disabled selected>Selecione sua cidade</option>
                ${options}
            </select>
            <div class="error-message" id="error-cidade">Por favor, selecione uma cidade.</div>
        </div>
    `;
};


const renderComponent = (component: PageComponent): string => {
  const styles = component.props.styles || {};
  const styleString = Object.entries(styles).map(([key, value]) => `${key.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`)}: ${value}`).join('; ');

  switch (component.type) {
    case 'Header':
      return `
        <div class="logo">
          <img src="${component.props.logoUrl || 'https://i.postimg.cc/Z5TpsSsB/natura-logo-branco.png'}" alt="Logo">
        </div>`;
    case 'Banner':
        return `
        <div class="banner">
            <img src="${component.props.imageUrl || 'https://images.rede.natura.net/html/crm/campanha/20250819/44760-banner-topo.png'}" alt="Banner">
        </div>`;
    case 'Title':
        return `<h1 style="${styleString}">${component.props.text || 'Título Principal'}</h1>`;
    case 'Subtitle':
        return `<h2 style="${styleString}">${component.props.text || 'Subtítulo'}</h2>`;
    case 'Paragraph':
        // Allow basic HTML tags by not escaping them
        return `<div style="white-space: pre-wrap; ${styleString}">${component.props.text || 'Este é um parágrafo. Edite o texto no painel de configurações.'}</div>`;
    case 'Divider':
        return `<hr style="border-top: ${component.props.thickness || 1}px ${component.props.style || 'solid'} ${component.props.color || '#cccccc'}; margin: ${component.props.margin || 20}px 0;" />`;
    case 'Image':
        return `
            <div style="padding: 20px 40px; text-align: center;">
                <img src="${component.props.src || 'https://placehold.co/800x200.png'}" alt="${component.props.alt || 'Placeholder image'}" style="max-width: 100%; height: auto; border-radius: 8px;" data-ai-hint="website abstract">
            </div>`;
    case 'Video':
        const videoUrl = component.props.url || '';
        let embedUrl = '';
        if (videoUrl.includes('youtube.com/watch?v=')) {
            const videoId = videoUrl.split('v=')[1].split('&')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (videoUrl.includes('youtu.be/')) {
            const videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${videoId}`;
        }
        return embedUrl ? `<div class="video-container" style="${styleString}"><iframe src="${embedUrl}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>` : '<p>URL do vídeo inválida.</p>';
    case 'Countdown':
        const targetDate = component.props.targetDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
        return `
            <div id="countdown-${component.id}" class="countdown" style="${styleString}"></div>
            <script>
              (function() {
                var target = new Date("${targetDate}").getTime();
                var el = document.getElementById("countdown-${component.id}");
                if (!el) return;
                var x = setInterval(function() {
                  var now = new Date().getTime();
                  var distance = target - now;
                  var days = Math.floor(distance / (1000 * 60 * 60 * 24));
                  var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                  var minutes = Math.floor((distance % (1000 * 60 * 60)) / 1000 / 60);
                  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
                  el.innerHTML = days + "d " + hours + "h " + minutes + "m " + seconds + "s ";
                  if (distance < 0) {
                    clearInterval(x);
                    el.innerHTML = "EXPIRADO";
                  }
                }, 1000);
              })();
            </script>`;
    case 'Spacer':
        return `<div style="height: ${component.props.height || 20}px;"></div>`;
    case 'Button':
         return `<div style="text-align: ${component.props.align || 'center'}; margin: 20px 0;"><a href="${component.props.href || '#'}" target="_blank" class="custom-button">${component.props.text || 'Clique Aqui'}</a></div>`;
    case 'Form':
      const { fields = {}, placeholders = {}, consentText, buttonText, buttonAlign, cities } = component.props;
      const formHtml = `
        <div class="form-container">
            <form id="smartcapture-block-uttuiggngg" novalidate="novalidate" onsubmit="return validateForm()">
                 <div class="row">
                  ${fields.name ? renderField('name', 'NOME', 'text', 'Text', placeholders.name || 'Nome') : ''}
                  ${fields.email ? renderField('email', 'EMAIL', 'email', 'EmailAddress', placeholders.email || 'Email') : ''}
                 </div>
                 <div class="row">
                  ${fields.phone ? renderField('phone', 'TELEFONE', 'text', 'Phone', placeholders.phone || 'Telefone') : ''}
                  ${fields.cpf ? renderField('cpf', 'CPF', 'text', 'Text', placeholders.cpf || 'CPF') : ''}
                 </div>
                 <div class="row">
                  ${fields.birthdate ? renderField('birthdate', 'DATANASCIMENTO', 'date', 'Date', placeholders.birthdate || 'Data de Nascimento', false) : ''}
                  ${fields.city ? renderCityDropdown(cities, false) : ''}
                 </div>
           
                ${fields.optin ? `
                <div class="consent">
                    <input type="checkbox" id="OPTIN" name="OPTIN" data-field-type="Boolean" required="required" data-validation-message="Por favor preencha este campo.">
                    <label for="OPTIN">
                        ${consentText || 'Quero receber novidades e promoções...'}
                    </label>
                  <div class="error-message" id="error-consent">É necessário aceitar para continuar.</div>
                </div>
                ` : ''}
                <div data-type="slot" data-key="qaiwdlu6h29"></div>
                <div style="text-align: ${buttonAlign || 'center'};">
                    <button type="submit">${buttonText || 'Finalizar'}</button>
                </div>
            </form>
        </div>
      `;
      return formHtml;
    case 'Footer':
      return `
      <footer>
        <div class="MuiGrid-root natds602 MuiGrid-container">
            <div class="MuiGrid-root MuiGrid-item"><span class="MuiTypography-root MuiTypography-caption MuiTypography-colorInherit MuiTypography-alignCenter">${component.props.footerText1 || `© ${new Date().getFullYear()} Natura. Todos os direitos reservados.`}</span></div>
            <div class="MuiGrid-root MuiGrid-item"><span class="MuiTypography-root MuiTypography-caption MuiTypography-colorInherit MuiTypography-alignCenter">${component.props.footerText2 || 'NATURA COSMÉTICOS S/A...'}</span></div>
            <div class="MuiGrid-root MuiGrid-item"><span class="MuiTypography-root MuiTypography-caption MuiTypography-colorInherit MuiTypography-alignCenter">${component.props.footerText3 || 'Todos os preços e condições...'}</span></div>
        </div>
      </footer>`;
    default:
      // This will cause a compile-time error if a new component type is added and not handled here.
      const exhaustiveCheck: never = component.type;
      return `<!-- Unknown component type: ${exhaustiveCheck} -->`;
  }
};

const getTrackingScripts = (trackingConfig: CloudPage['meta']['tracking']): string => {
    if (!trackingConfig) return '';

    let scripts = '';

    // Google Analytics 4
    if (trackingConfig.ga4?.enabled && trackingConfig.ga4.id) {
        const ga4Id = trackingConfig.ga4.id;
        scripts += `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${ga4Id}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${ga4Id}');
</script>`;
    }

    // Meta Pixel
    if (trackingConfig.meta?.enabled && trackingConfig.meta.id) {
        const metaId = trackingConfig.meta.id;
        scripts += `
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

    // LinkedIn Insight Tag
    if (trackingConfig.linkedin?.enabled && trackingConfig.linkedin.id) {
        const linkedinId = trackingConfig.linkedin.id;
        scripts += `
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

    return scripts;
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
            bottom: -100%;
            left: 0;
            width: 100%;
            background-color: rgba(0, 0, 0, 0.85);
            color: white;
            padding: 20px;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            align-items: center;
            z-index: 10000;
            transition: bottom 0.5s ease-in-out;
            flex-wrap: wrap;
            gap: 15px;
        }
        #cookie-banner p {
            margin: 0;
            flex-grow: 1;
            font-size: 14px;
        }
        #cookie-banner button {
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            flex-shrink: 0;
        }
    </style>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const cookieBanner = document.getElementById('cookie-banner');
            const acceptButton = document.getElementById('accept-cookies');

            if (!localStorage.getItem('cookiesAccepted')) {
                setTimeout(() => {
                  cookieBanner.style.bottom = '0';
                }, 500);
            }

            acceptButton.addEventListener('click', function() {
                localStorage.setItem('cookiesAccepted', 'true');
                cookieBanner.style.bottom = '-100%';
            });
        });
    </script>
    `;
}

export const generateHtml = (pageState: CloudPage): string => {
  const { styles, components, meta, cookieBanner } = pageState;
  
  const fullWidthTypes: ComponentType[] = ['Header', 'Banner', 'Footer'];

  const headerComponent = components.find(c => c.type === 'Header');
  const bannerComponent = components.find(c => c.type === 'Banner');
  const footerComponent = components.find(c => c.type === 'Footer');
  const trackingScripts = getTrackingScripts(meta.tracking);
  const cookieBannerHtml = getCookieBanner(cookieBanner, styles.themeColor);

  const mainComponents = components
    .filter(c => !fullWidthTypes.includes(c.type))
    .map(renderComponent)
    .join('\n');

  const smartCaptureScript = `
<script id="smartcapture-script-uttuiggngg">
 var scFormLoaded = function () {
  window.ScForm.init({"gearID":"uttuiggngg","smartCaptureFormID":0,"sourceKey":"${meta.dataExtensionKey || ''}","source":"dataExtension","triggeredSend":"","confirmationMessage":"Obrigada por participar!","buttonText":"Submit","formStyling":{"background-color":"transparent","margin-top":"0px","margin-right":"0px","margin-bottom":"0px","margin-left":"0px","padding-top":"0px","padding-right":"0px","padding-bottom":"0px","padding-left":"0px","text-align":"left"},"fieldStyling":{"width":"200px"},"buttonStyling":{"background-color":"#009DDC","border-color":"#009DDC","border-radius":"3px","border-style":"solid","-webkit-border-radius":"3px","-moz-border-radius":"3px","color":"#FFFFFF","font-family":"Arial, Helvetica, sans-serif","font-size":"16px","line-height":"normal","padding":"10px"},onSubmitShouldGotoUrl: true,
        onSubmitGotoUrlType: 2,
        onSubmitGotoUrl:  "${meta.redirectUrl}",});
 };
 var scAppDomain = 'cloudpages.mc-content.com';
 var scAppBasePath = '/CloudPages';
 (function () {
  var appDomain = '<ctrl:eval>Platform.Variable.GetValue("@appDomain")</ctrl:eval>';
  if (appDomain.indexOf('qa') !== -1) {
   scAppDomain = 'cloudpages-qa.mc-content.com';
   scAppBasePath = '/CloudPages_V1';
  }
 }());
 window.appDomain = window.appDomain || scAppDomain;
 window.contentDetail = window.contentDetail || <ctrl:eval>Platform.Variable.GetValue('@contentDetail')||{}</ctrl:eval>;
 if (!window.ScForm || !window.ScForm.init) {
  var head = document.getElementsByTagName('head')[0];
  var id = 'smartcapture-formjs-script';
  var script = document.getElementById(id);
  var domain = window.appDomain;
  var el;
  if (!script) {
   if (domain) {
    domain = '//' + domain;
   }
   el = document.createElement('script');
   el.async = true;
   el.id = id;
   el.src = domain + scAppBasePath + '/lib/smartcapture-formjs.js';
   el.onload = scFormLoaded;
   head.appendChild(el);
  } else {
   if (script.addEventListener) {
    script.addEventListener('load', scFormLoaded);
   } else if (script.attachEvent) {
    script.attachEvent('onload', scFormLoaded);
   }
  }
 } else {
  scFormLoaded();
 }
</script>
  `;
  
  return `
<!DOCTYPE html>
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
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&amp;display=swap" rel="stylesheet">
${trackingScripts}
<style>
    body {
        background-color: ${styles.backgroundColor};
        background-image: url(${styles.backgroundImage});
        background-size: cover;
        background-repeat: no-repeat;
        background-attachment: fixed;
        font-family: "Roboto", sans-serif;
        font-weight: 500;
        font-style: normal;
        margin: 0;
        padding: 20px 0;
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

    .logo {
        margin-top: 10px;
        margin-bottom: 20px;
        text-align: center;
    }

    .logo img {
        width: 150px;
    }

    .container {
        background-color: #ffffff;
        border-radius: 10px;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        width: 90%;
        max-width: 800px;
        text-align: center;
    }

    .banner img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .content-wrapper {
        padding: 20px 40px;
        color: #333;
    }
    
    .content-wrapper h1, .content-wrapper h2, .content-wrapper p, .content-wrapper div {
        text-align: left;
        margin: 1em 0;
    }
    
    .content-wrapper h1, .content-wrapper h2 {
        font-weight: bold;
    }


    .video-container {
        position: relative;
        overflow: hidden;
        width: 100%;
        padding-top: 56.25%; /* 16:9 Aspect Ratio */
        margin: 20px 0;
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
        margin: 20px 0;
    }
    
    .custom-button {
      background-color: ${styles.themeColor};
      color: white;
      padding: 10px 20px;
      text-decoration: none;
      border-radius: 5px;
      display: inline-block;
      transition: background-color 0.3s ease;
    }
    
    .custom-button:hover {
      background-color: ${styles.themeColorHover};
    }

    .form-container {
        padding: 20px;
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
    

    .form-container input,
    .form-container select,
    .form-container button {
        width: 100%;
        padding: 15px;
        margin: 0;
        border: 1px solid #ccc;
        border-radius: 5px;
        box-sizing: border-box;
        font-family: "Roboto", sans-serif;
        font-weight: 700;
        font-style: normal;
    }

    .form-container button {
        background-color: ${styles.themeColor};
        color: #ffffff;
        border: none;
        cursor: pointer;
        position: relative;
        transition: all 0.3s ease;
        margin-top: 10px;
        font-size: large;
        width: 200px;
        padding: 15px 20px;
        border-radius: 30px;
    }

    .form-container button:hover {
        background-color: ${styles.themeColorHover};
    }

    .form-container button:disabled {
        background-color: #ccc;
        cursor: not-allowed;
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
        font-family: "Roboto", sans-serif;
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
</style>
<script>
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

    function toggleButtonLoader(show) {
        const button = document.querySelector('.form-container button');
        if (!button) return;
        const loader = button.querySelector('.button-loader');
        const buttonText = button.querySelector('.button-text');
        
        if (show) {
            button.disabled = true;
            if(loader) loader.style.display = 'block';
            if(buttonText) buttonText.style.opacity = '0';
        } else {
            button.disabled = false;
            if(loader) loader.style.display = 'none';
            if(buttonText) buttonText.style.opacity = '1';
        }
    }

    function validateForm() {
        let valid = true;
        const form = document.getElementById('smartcapture-block-uttuiggngg');
        const requiredInputs = form.querySelectorAll('input[required], select[required]');

        requiredInputs.forEach(input => {
            const error = document.getElementById('error-' + input.name.toLowerCase());
            let isInvalid = false;
            
            if(input.type === 'checkbox') {
                isInvalid = !input.checked;
            } else {
                isInvalid = input.value.trim() === '';
            }

            if (isInvalid && error) {
                error.style.display = 'block';
                valid = false;
            } else if (error) {
                error.style.display = 'none';
            }
        });

        if (!valid) return false;
        toggleButtonLoader(true);
        // setTimeout(() => toggleButtonLoader(false), 2000); // This is for testing, real submission handles this.
        return true;
    }

    window.onload = function () {
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
            emailInput.addEventListener('input', function() { validateEmail(this); });
            emailInput.addEventListener('blur', function() { validateEmail(this); });

            // Your fix is applied here!
            if (!emailInput.parentElement.classList.contains('input-wrapper')) {
              const emailWrapper = document.createElement('div');
              emailWrapper.className = 'input-wrapper';
              emailInput.parentNode.insertBefore(emailWrapper, emailInput);
              emailWrapper.appendChild(emailInput);
            }
        }
            
        const submitButton = document.querySelector('.form-container button');
        if (submitButton && !submitButton.querySelector('.button-loader')) {
            const buttonTextContent = submitButton.textContent;
            submitButton.innerHTML = '';
            
            const buttonText = document.createElement('span');
            buttonText.className = 'button-text';
            buttonText.textContent = buttonTextContent;
            
            const buttonLoader = document.createElement('div');
            buttonLoader.className = 'button-loader';

            submitButton.appendChild(buttonText);
            submitButton.appendChild(buttonLoader);
        }
    }
</script>
</head>
<body>
  <div id="loader">
    <img src="${meta.loaderImageUrl}" alt="Loader">
  </div>
  <div class="container" style="display: block;">
    ${headerComponent ? renderComponent(headerComponent) : ''}
    ${bannerComponent ? renderComponent(bannerComponent) : ''}
    <div class="content-wrapper">
      ${mainComponents}
    </div>
    ${footerComponent ? renderComponent(footerComponent) : ''}
  </div>

  ${cookieBannerHtml}
  ${components.some(c => c.type === 'Form') ? smartCaptureScript : ''}
</body>
</html>`.trim();
