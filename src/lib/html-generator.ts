import type { CloudPage, PageComponent } from './types';

const renderComponent = (component: PageComponent): string => {
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
    case 'Form':
      const formHtml = `
        <div class="form-container">
            <form id="smartcapture-block-uttuiggngg" novalidate="novalidate" onsubmit="return validateForm()">
                <div class="row">
                  <div class="input-wrapper">
                    <input type="text" id="NOME" name="NOME" data-field-type="Text" placeholder="${component.props.namePlaceholder || 'Nome'}" required="required">
                    <div class="error-message" id="error-nome">Por favor, preencha seu nome.</div>
                  </div>
                  <div class="input-wrapper">
                    <input type="email" id="EMAIL" name="EMAIL" data-field-type="EmailAddress" data-validation="email" placeholder="${component.props.emailPlaceholder || 'Email'}" required="required">
                    <div class="error-message" id="error-email">Por favor, insira um email válido.</div>
                  </div>
                </div>
                <div class="row">
                  <div class="input-wrapper">
                    <input type="text" id="TELEFONE" name="TELEFONE" data-field-type="Phone" placeholder="${component.props.phonePlaceholder || 'Telefone - Ex:(11) 9 9999-9999'}">
                    <div class="error-message" id="error-telefone">Por favor, insira um número de telefone válido.</div>
                  </div>
                  <div class="input-wrapper">
                    <input type="text" id="CPF" name="CPF" data-field-type="Text" placeholder="${component.props.cpfPlaceholder || 'CPF'}" required="">
                     <div class="error-message" id="error-cpf">Por favor, insira seu CPF.</div>
                  </div>
                </div>
           
              
                <div class="error-message" id="error-message">
                    Por favor, insira um número de telefone válido no formato (11) 9 9999-9999.
                </div>
    
                <div class="consent">
                    <input type="checkbox" id="OPTIN" name="OPTIN" data-field-type="Boolean" required="required" data-validation-message="Por favor preencha este campo.">
                    <label for="OPTIN">
                        ${component.props.consentText || 'Quero receber novidades e promoções da Natura...'}
                    </label>
                  <div class="error-message" id="error-consent">É necessário aceitar para continuar.</div>
                </div>
                <div data-type="slot" data-key="qaiwdlu6h29"></div>
                <button type="submit">${component.props.buttonText || 'Finalizar'}</button>
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
    case 'TextBlock':
        return `
          <div style="padding: 20px 40px; max-width: 800px; margin: 20px auto; color: #000;">
            <p style="line-height: 1.6; font-size: 16px;">${component.props.text?.replace(/\n/g, '<br>') || 'This is a text block. You can edit this content in the sidebar.'}</p>
          </div>`;
    case 'Image':
        return `
            <div style="padding: 20px 40px; text-align: center;">
                <img src="${component.props.src || 'https://placehold.co/800x200.png'}" alt="${component.props.alt || 'Placeholder image'}" style="max-width: 100%; height: auto; border-radius: 8px;" data-ai-hint="website abstract">
            </div>`;
    default:
      const exhaustiveCheck: never = component;
      return `<!-- Unknown component type -->`;
  }
};

export const generateHtml = (pageState: CloudPage): string => {
  const { styles, components, meta } = pageState;
  const componentsHtml = components.map(renderComponent).join('\n');
  const mainContainerComponents = componentsHtml;

  const smartCaptureScript = `
<script id="smartcapture-script-uttuiggngg">
 var scFormLoaded = function () {
  window.ScForm.init({"gearID":"uttuiggngg","smartCaptureFormID":0,"sourceKey":"2D6B0E7A-DE4A-4FD8-92B7-900EBF4B3A60","source":"dataExtension","triggeredSend":"","confirmationMessage":"Obrigada por participar!","buttonText":"Submit","formStyling":{"background-color":"transparent","margin-top":"0px","margin-right":"0px","margin-bottom":"0px","margin-left":"0px","padding-top":"0px","padding-right":"0px","padding-bottom":"0px","padding-left":"0px","text-align":"left"},"fieldStyling":{"width":"200px"},"buttonStyling":{"background-color":"#009DDC","border-color":"#009DDC","border-radius":"3px","border-style":"solid","-webkit-border-radius":"3px","-moz-border-radius":"3px","color":"#FFFFFF","font-family":"Arial, Helvetica, sans-serif","font-size":"16px","line-height":"normal","padding":"10px"},onSubmitShouldGotoUrl: true,
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
<link rel="icon" href="${meta.faviconUrl}" sizes="16x16" type="image/png">
<link rel="icon" href="${meta.faviconUrl}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="https://i.postimg.cc/FkRH2d9j/apple-touch-icon.png">
<link rel="icon" href="${meta.faviconUrl}" sizes="192x192" type="image/png">
<link rel="icon" href="${meta.faviconUrl}" sizes="512x512" type="image/png">
<meta name="theme-color" content="${styles.themeColor}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="">
<link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&amp;display=swap" rel="stylesheet">
<style>
    body {
        background-color: ${styles.backgroundColor};
        background-image: url(${styles.backgroundImage});
        font-family: "Roboto", sans-serif;
        font-weight: 500;
        font-style: normal;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
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
        height: auto;
    }

    .form-container {
        padding: 20px;
    }

    .form-container input,
    .form-container select,
    .form-container button {
        width: 100%;
        padding: 15px;
        margin: 0 0 10px 0;
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
    
    .email-wrapper, .input-wrapper {
        position: relative;
        width: 100%;
    }

    @media (min-width: 768px) {
        .form-container .row {
            display: flex;
            justify-content: space-between;
            gap: 4%;
        }

        .row .input-wrapper,
        .row .email-wrapper {
            width: 48%;
        }

        .form-container button {
            font-size: large;
            width: 200px;
            padding: 15px 20px;
            border-radius: 30px;
        }

        .input-wrapper input {
            width: 100%;
            padding: 15px;
            margin: 0 0 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            box-sizing: border-box;
            font-family: "Roboto", sans-serif;
            font-weight: 500;
            font-style: normal;
        }

        .input-helper-text {
            font-size: 10px;
            color: #666;
            margin-top: 5px;
            display: block;
        }
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
        const fields = ['NOME', 'EMAIL', 'TELEFONE', 'CPF'];
        fields.forEach(id => {
            const input = document.getElementById(id);
            const error = document.getElementById('error-' + id.toLowerCase());
            if (!input || !error) return;

            let isInvalid = false;
            if (id === 'EMAIL') {
                isInvalid = !input.value.includes('@');
            } else if (id === 'TELEFONE') {
                const phoneNumbers = input.value.replace(/\\D/g, '');
                const phonePattern = /^119\\d{8}$/;
                isInvalid = input.value.trim() === '' || !phonePattern.test(phoneNumbers)
            } else {
                isInvalid = input.value.trim() === '';
            }

            if (isInvalid) {
                error.style.display = 'block';
                valid = false;
            } else {
                error.style.display = 'none';
            }
        });

        const consent = document.getElementById("OPTIN");
        const consentError = document.getElementById("error-consent");
        if (consent && consentError) {
          if (!consent.checked) {
              consentError.style.display = "block";
              valid = false;
          } else {
              consentError.style.display = "none";
          }
        }

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

            if (!emailInput.parentElement.classList.contains('email-wrapper')) {
              const emailWrapper = document.createElement('div');
              emailWrapper.className = 'email-wrapper';
              emailInput.parentNode.insertBefore(emailWrapper, emailInput);
              emailWrapper.appendChild(emailInput);
            }
        }
        
        const inputsToWrap = ['NOME', 'TELEFONE', 'CPF'];
        inputsToWrap.forEach(id => {
            const input = document.getElementById(id);
            if (input && !input.parentElement.classList.contains('input-wrapper')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'input-wrapper';
                input.parentNode.insertBefore(wrapper, input);
                wrapper.appendChild(input);
            }
        });
            
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
    ${mainContainerComponents}
  </div>

  ${components.some(c => c.type === 'Form') ? smartCaptureScript : ''}
</body>
</html>`.trim();
};
