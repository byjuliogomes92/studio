
import type { CloudPage, PageComponent, ComponentType, Action } from './types';
import { getFormSubmissionScript, getPrefillAmpscript } from './ssjs-templates';
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
import { renderCarousel } from './html-components/carousel';
import { renderForm } from './html-components/form';
import { renderFooter } from './html-components/footer';
import { renderFTPUpload } from './html-components/ftpupload';
import { renderDataExtensionUpload } from './html-components/data-extension-upload';
import { renderFloatingImage } from './html-components/floating-image';
import { renderFloatingButton } from './html-components/floating-button';
import { renderCalendly } from './html-components/calendly';
import { renderDiv } from './html-components/div';
import { renderAddToCalendar } from './html-components/add-to-calendar';
import { renderPopUp } from './html-components/popup';


function renderComponents(components: PageComponent[], allComponents: PageComponent[], pageState: CloudPage, isForPreview: boolean, hideAmpscript: boolean = false): string {
    return components
      .map((component) => {
        const childrenHtml = (() => {
            if (component.type === 'Columns' || component.type === 'Div') {
                const columnCount = component.props.columnCount || (component.type === 'Div' ? 1 : 0);
                let columnsContent = '';
                for (let i = 0; i < columnCount; i++) {
                    const columnComponents = allComponents
                      .filter(c => c.parentId === component.id && c.column === i)
                      .sort((a,b) => a.order - b.order);
                    columnsContent += `<div class="column" style="${getColumnStyle(component.props.columnStyles, i)}">${renderComponents(columnComponents, allComponents, pageState, isForPreview, hideAmpscript)}</div>`;
                }
                return columnsContent;
            }
             if (component.type === 'PopUp') {
                const popupComponents = allComponents
                    .filter(c => c.parentId === component.id)
                    .sort((a, b) => a.order - b.order);
                return renderComponents(popupComponents, allComponents, pageState, isForPreview, hideAmpscript);
            }
            return '';
        })();
        return renderComponent(component, pageState, isForPreview, childrenHtml, hideAmpscript);
      }).join('\n');
}

const getColumnStyle = (columnStyles: any[] = [], index: number): string => {
    const styles = columnStyles[index] || {};
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}


const renderComponent = (component: PageComponent, pageState: CloudPage, isForPreview: boolean, childrenHtml: string, hideAmpscript: boolean = false): string => {
  const styles = component.props.styles || {};
  const {
      animationType: entranceAnimation = 'none',
      animationDuration = 1,
      animationDelay = 0,
      loopAnimation = 'none',
      ...otherStyles
  } = styles;

  const layout = component.props.layout || {};

  let wrapperClass = 'component-wrapper';

  if (entranceAnimation !== 'none') {
    wrapperClass += ' animate-on-scroll';
  }
  
  if (loopAnimation !== 'none') {
      wrapperClass += ` animation-loop--${loopAnimation}`;
  }
  
  if (layout.alignSelf) {
      otherStyles['margin'] = 
        layout.alignSelf === 'center' ? 'auto' :
        layout.alignSelf === 'flex-start' ? '0 auto 0 0' :
        layout.alignSelf === 'flex-end' ? '0 0 0 auto' : '0';
  }

  const wrapperStyle = getStyleString(otherStyles);

  const animationAttrs = entranceAnimation !== 'none'
    ? `style="--animation-name: ${entranceAnimation}; --animation-duration: ${animationDuration}s; --animation-delay: ${animationDelay}s; ${wrapperStyle}"`
    : `style="${wrapperStyle}"`;
  
  // Add component ID for selection mode in preview
  const selectableAttrs = isForPreview ? `data-component-id="${component.id}"` : '';
  
  // Floating components and Stripe are handled specially as they don't sit inside the padded container
  if (['FloatingImage', 'FloatingButton', 'WhatsApp', 'Stripe', 'Footer', 'PopUp'].includes(component.type)) {
    return renderSingleComponent(component, pageState, isForPreview, childrenHtml, hideAmpscript);
  }

  // full-width Columns provide their own outer structure
  if ((component.type === 'Columns' || component.type === 'Div') && component.props.styles?.isFullWidth) {
      return renderSingleComponent(component, pageState, isForPreview, childrenHtml, hideAmpscript);
  }

  // Render the component's HTML
  const renderedComponent = renderSingleComponent(component, pageState, isForPreview, childrenHtml, hideAmpscript);
  
  const headerComponent = pageState.components.find(c => c.type === 'Header');
  const isHeaderOverlay = headerComponent?.props.overlay || false;
  
  // Check if this component is the very first one after an overlay header
  const isFirstAfterOverlay = isHeaderOverlay && 
      component.parentId === null && 
      pageState.components.filter(c => c.parentId === null && !['Header', 'Stripe'].includes(c.type))
                        .sort((a,b) => a.order - b.order)[0]?.id === component.id;

  let containerStyle = '';
  if (isFirstAfterOverlay) {
      containerStyle = 'padding-top: 0;';
  }

  const parentComponent = pageState.components.find(c => c.id === component.parentId);
  // Do NOT wrap children of horizontal Divs in a block-level wrapper
  if (parentComponent?.type === 'Div' && parentComponent?.props?.layout?.flexDirection === 'row') {
      return renderedComponent;
  }
  
  // Components inside another component (e.g., in a column) don't get the padded container
  if (component.parentId !== null) {
     return `<div class="${wrapperClass}" ${animationAttrs} ${selectableAttrs}>${renderedComponent}</div>`;
  }
  
  // Root-level components get the padded container
  return `<div class="${wrapperClass}" ${animationAttrs} ${selectableAttrs} style="${containerStyle}">
             <div class="section-container-padded">
               ${renderedComponent}
             </div>
          </div>`;
};

export const renderSingleComponent = (component: PageComponent, pageState: CloudPage, isForPreview: boolean, childrenHtml: string = '', hideAmpscript: boolean = false): string => {
  switch (component.type) {
    case 'Header': return renderHeader(component);
    case 'Banner': return renderBanner(component);
    case 'Title': return renderTitle(component, isForPreview, hideAmpscript);
    case 'Subtitle': return renderSubtitle(component, isForPreview, hideAmpscript);
    case 'Paragraph': return renderParagraph(component, isForPreview, hideAmpscript);
    case 'Divider': return renderDivider(component);
    case 'Image': return renderImage(component);
    case 'Video': return renderVideo(component);
    case 'Countdown': return renderCountdown(component);
    case 'Spacer': return renderSpacer(component);
    case 'Button': return renderButton(component, pageState);
    case 'DownloadButton': return renderDownloadButton(component);
    case 'Accordion': return renderAccordion(component);
    case 'Tabs': return renderTabs(component);
    case 'Voting': return renderVoting(component);
    case 'Stripe': return renderStripe(component);
    case 'NPS': return renderNPS(component);
    case 'Map': return renderMap(component);
    case 'SocialIcons': return renderSocialIcons(component);
    case 'Columns': return renderColumns(component, childrenHtml);
    case 'Div': return renderDiv(component, childrenHtml);
    case 'WhatsApp': return renderWhatsApp(component);
    case 'Carousel': return renderCarousel(component);
    case 'Form': return renderForm(component, pageState);
    case 'FTPUpload': return renderFTPUpload(component, pageState);
    case 'DataExtensionUpload': return renderDataExtensionUpload(component);
    case 'FloatingImage': return renderFloatingImage(component);
    case 'FloatingButton': return renderFloatingButton(component);
    case 'Calendly': return renderCalendly(component);
    case 'AddToCalendar': return renderAddToCalendar(component);
    case 'Footer': return renderFooter(component);
    case 'PopUp': return renderPopUp(component, childrenHtml);
    case 'CustomHTML': return component.props.htmlContent || '';
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
    const baseVars = `VAR @isAuthenticated, @LoginURL\nSET @LoginURL = Concat("https://mc.login.exacttarget.com/hub/auth?returnUrl=", URLEncode(CloudPagesURL(PageID)))\n`;

    if (!security || security.type === 'none') {
        return { ssjs: '', amscript: 'SET @isAuthenticated = true', body: '' };
    }

    if (security.type === 'sso') {
        const amscript = `
  TRY 
    SET @IsAuthenticated_Temp = Request.GetUserInfo()
    SET @isAuthenticated = true
  CATCH(e) 
    SET @isAuthenticated = false
  ENDTRY`;
        return { ssjs: '', amscript, body: '' };
    }
    
    if (security.type === 'password' && security.passwordConfig) {
        const config = security.passwordConfig;
        const amscript = `
  VAR @submittedPassword, @identifier, @correctPassword
  SET @isAuthenticated = false
  SET @submittedPassword = RequestParameter("page_password")
  SET @identifier = RequestParameter("${config.urlParameter}")

  IF NOT EMPTY(@submittedPassword) && NOT EMPTY(@identifier) THEN
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

    return { ssjs: '', amscript: 'SET @isAuthenticated = true', body: '' };
}

const getClientSideScripts = (pageState: CloudPage): string => {
    const hasLottieAnimation = pageState.components.some(c => c.type === 'Form' && c.props.thankYouAnimation && c.props.thankYouAnimation !== 'none');
    const hasCarousel = pageState.components.some(c => c.type === 'Carousel');
    const hasAutoplayCarousel = hasCarousel && pageState.components.some(c => c.type === 'Carousel' && c.props.options?.autoplay);
    const hasCalendly = pageState.components.some(c => c.type === 'Calendly');
    const headerComponent = pageState.components.find(c => c.type === 'Header');
    const isHeaderOverlay = headerComponent?.props.overlay || false;

    const lottiePlayerScript = hasLottieAnimation ? '<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"></script>' : '';
    const carouselScript = hasCarousel ? '<script src="https://unpkg.com/embla-carousel@latest/embla-carousel.umd.js"></script>' : '';
    const autoplayPluginScript = hasAutoplayCarousel 
      ? '<script src="https://unpkg.com/embla-carousel-autoplay@latest/embla-carousel-autoplay.umd.js"></script>' 
      : '';
    const calendlyScript = hasCalendly ? '<script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async></script>' : '';


    const script = `
    <script>
    function setupAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        if (!animatedElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    el.classList.add('is-visible');
                    observer.unobserve(el);
                }
            });
        }, { threshold: 0.1 });

        animatedElements.forEach(el => {
            observer.observe(el);
        });
    }

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

    function setupStickyHeader() {
        const header = document.querySelector('.page-header[data-sticky="true"]');
        if (!header) return;
        
        const scrollBg = header.dataset.bgScroll;

        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
                header.style.backgroundColor = scrollBg;
            } else {
                header.classList.remove('scrolled');
                header.style.backgroundColor = ''; // Reverts to initial style
            }
        }, { passive: true });
    }

    function setupOverlayHeader() {
        const header = document.querySelector('.page-header[data-overlay="true"]');
        if (!header) return;

        const firstSection = document.querySelector('.component-wrapper');
        const columnsContainer = firstSection?.querySelector('.columns-container');

        if (columnsContainer) {
            const headerHeight = header.offsetHeight;
            columnsContainer.style.paddingTop = headerHeight + 'px';
        }
    }


    function setupMobileMenu() {
        const body = document.body;
        const pageHeader = document.querySelector('.page-header');
        if (!pageHeader) return;
        
        const behavior = pageHeader.dataset.mobileMenuBehavior || 'push';

        document.querySelectorAll('.mobile-menu-toggle').forEach(button => {
            button.addEventListener('click', function() {
                const header = this.closest('.page-header');
                if (header) {
                    const navContainer = header.querySelector('.header-nav-container');
                    
                    if (behavior === 'push') {
                        header.classList.toggle('mobile-menu-open');
                        if (header.classList.contains('mobile-menu-open')) {
                            navContainer.style.maxHeight = navContainer.scrollHeight + 'px';
                        } else {
                            navContainer.style.maxHeight = '0';
                        }
                    } else if (behavior === 'drawer') {
                         body.classList.toggle('menu-drawer-open');
                    } else if (behavior === 'overlay') {
                         body.classList.toggle('menu-overlay-open');
                    }
                }
            });
        });
        
        const overlay = document.getElementById('mobile-menu-overlay');
        if(overlay) {
            overlay.addEventListener('click', () => {
                body.classList.remove('menu-drawer-open');
            });
        }
    }

    function setupCarousels() {
        if (typeof EmblaCarousel === 'undefined') return;

        document.querySelectorAll('.carousel-container').forEach(container => {
            const viewport = container.querySelector('.carousel-viewport');
            if (!viewport) return;

            const options = JSON.parse(container.dataset.options || '{}');
            const plugins = [];
            if (options.autoplay && typeof EmblaCarouselAutoplay !== 'undefined') {
                plugins.push(EmblaCarouselAutoplay(options.autoplay));
            }

            const emblaApi = EmblaCarousel(viewport, options, plugins);

            const prevBtn = container.querySelector('.carousel-prev');
            const nextBtn = container.querySelector('.carousel-next');

            if (prevBtn) prevBtn.addEventListener('click', () => emblaApi.scrollPrev());
            if (nextBtn) nextBtn.addEventListener('click', () => emblaApi.scrollNext());
        });
    }

    function setupFloatingButtons() {
        document.querySelectorAll('.floating-button-wrapper[data-show-on-scroll="true"]').forEach(button => {
            const offset = parseInt(button.dataset.scrollOffset, 10) || 100;
            
            const checkPosition = () => {
                if (window.scrollY > offset) {
                    button.classList.add('visible');
                } else {
                    button.classList.remove('visible');
                }
            };
            
            window.addEventListener('scroll', checkPosition, { passive: true });
            checkPosition();
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
        
        setupMobileMenu();
        setupForms();
        setupAccordions();
        setupTabs();
        setupCarousels();
        setSocialIconStyles();
        handleConditionalFields();
        setupStickyHeader();
        setupFloatingButtons();
        setupAnimations();
        ${isHeaderOverlay ? 'setupOverlayHeader();' : ''}
    });
    </script>
    `;

    return `${lottiePlayerScript}${carouselScript}${autoplayPluginScript}${calendlyScript}${script}`;
};


const renderLoader = (meta: CloudPage['meta'], themeColor: string): string => {
    if (meta.loaderType === 'none') {
        return '';
    }

    if (meta.loaderType === 'image' && meta.loaderImageUrl) {
        return `
            <div id="loader" style="background-color: ${themeColor};">
                <img src="${meta.loaderImageUrl}" alt="Carregando...">
            </div>
        `;
    }
    
    // Default to animation
    const animationClass = meta.loaderAnimation === 'spin' ? 'loader-spin' : 'loader-pulse';
    return `
        <div id="loader" style="background-color: ${themeColor};">
            <div class="${animationClass}" style="--loader-color: #FFFFFF"></div>
        </div>
    `;
};

const getFontFaceStyles = (pageState: CloudPage): string => {
    if (!pageState.brand || !pageState.brand.typography) return '';

    const { typography } = pageState.brand;
    let fontFaceCss = '';

    if (typography.customFontUrlHeadings && typography.customFontNameHeadings) {
        fontFaceCss += `
        @font-face {
            font-family: '${typography.customFontNameHeadings}';
            src: url('${typography.customFontUrlHeadings}') format('woff2'),
                 url('${typography.customFontUrlHeadings}') format('woff');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }
        `;
    }
    if (typography.customFontUrlBody && typography.customFontNameBody) {
        fontFaceCss += `
        @font-face {
            font-family: '${typography.customFontNameBody}';
            src: url('${typography.customFontUrlBody}') format('woff2'),
                 url('${typography.customFontUrlBody}') format('woff');
            font-weight: normal;
            font-style: normal;
            font-display: swap;
        }
        `;
    }
    return fontFaceCss;
};

const getScrollbarStyles = (scrollbarConfig: CloudPage['styles']['scrollbar']): string => {
  if (!scrollbarConfig || !scrollbarConfig.enabled) {
    return '';
  }

  const { width, trackColor, thumbColor, thumbHoverColor, thumbBorderRadius } = scrollbarConfig;

  return `
    ::-webkit-scrollbar {
      width: ${width || '10px'};
    }
    ::-webkit-scrollbar-track {
      background: ${trackColor || '#f1f1f1'};
    }
    ::-webkit-scrollbar-thumb {
      background: ${thumbColor || '#888'};
      border-radius: ${thumbBorderRadius || '5px'};
    }
    ::-webkit-scrollbar-thumb:hover {
      background: ${thumbHoverColor || '#555'};
    }
  `;
};


export function generateHtml(pageState: CloudPage, isForPreview: boolean = false, baseUrl: string = '', hideAmpscript: boolean = false): string {
  const { id, slug, styles, components, meta, cookieBanner } = pageState;
  
  const shouldHideAmpscript = isForPreview && hideAmpscript;

  const ssjsScript = shouldHideAmpscript ? '' : getFormSubmissionScript(pageState);
  
  const prefillAmpscript = getPrefillAmpscript(pageState);
  const security = getSecurityScripts(pageState);
  
  const initialAmpscript = `%%[ 
    VAR @showThanks, @status, @thankYouMessage, @NOME, @EMAIL, @TELEFONE, @CPF, @CIDADE, @DATANASCIMENTO, @OPTIN, @isAuthenticated, @LoginURL
    SET @LoginURL = Concat("https://mc.login.exacttarget.com/hub/auth?returnUrl=", URLEncode(CloudPagesURL(PageID)))
    IF EMPTY(RequestParameter("__isPost")) THEN
      SET @showThanks = "false"
    ENDIF
    ${security.amscript}
    ${meta.customAmpscript || ''}
    ${prefillAmpscript || ''}
]%%`;


  const clientSideScripts = getClientSideScripts(pageState);
  
  const stripeComponents = components.filter(c => c.type === 'Stripe' && c.parentId === null).map(c => renderComponent(c, pageState, isForPreview, '', shouldHideAmpscript)).join('\n');
  const footerComponent = components.find(c => c.type === 'Footer');
  
  const trackingScripts = getTrackingScripts(meta.tracking);
  const cookieBannerHtml = getCookieBanner(cookieBanner, styles.themeColor);
  
  const { typography } = pageState.brand || { typography: {} };
  const fontFamilyHeadings = typography.customFontNameHeadings || typography.fontFamilyHeadings || 'Poppins';
  const fontFamilyBody = typography.customFontNameBody || typography.fontFamilyBody || 'Roboto';

  const fontFaceStyles = getFontFaceStyles(pageState);
  const scrollbarStyles = getScrollbarStyles(pageState.styles.scrollbar);
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontFamilyHeadings.replace(/ /g, '+')}:wght@400;700&family=${fontFamilyBody.replace(/ /g, '+')}:wght@400;700&display=swap`;

  
  const mainContentHtml = renderComponents(components.filter(c => c.parentId === null && !['Stripe', 'FloatingImage', 'FloatingButton', 'WhatsApp', 'Footer', 'PopUp'].includes(c.type)), components, pageState, isForPreview, shouldHideAmpscript);
  const floatingElementsHtml = components.filter(c => ['FloatingImage', 'FloatingButton', 'WhatsApp'].includes(c.type) && c.parentId === null).map(c => renderComponent(c, pageState, isForPreview, '', shouldHideAmpscript)).join('\n');
  const footerHtml = footerComponent ? renderComponent(footerComponent, pageState, isForPreview, '', shouldHideAmpscript) : '';
  const popupsHtml = components.filter(c => c.type === 'PopUp' && c.parentId === null).map(c => renderComponent(c, pageState, isForPreview, '', shouldHideAmpscript)).join('\n');


  const headerComponent = components.find(c => c.type === 'Header');
  
  const bodyStyles = `
    background-color: ${styles.backgroundColor};
    background-image: url(${styles.backgroundImage});
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
    font-family: "${fontFamilyBody}", sans-serif;
    font-weight: 400;
    margin: 0;
    width: 100%;
    overflow-x: hidden; /* Prevent horizontal scroll */
    position: relative; /* Needed for absolute positioned children */
  `;


  let finalHtml = `<!DOCTYPE html>
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
<link href="${googleFontUrl}" rel="stylesheet">
${shouldHideAmpscript ? '' : initialAmpscript}
${shouldHideAmpscript ? '' : ssjsScript}
${trackingScripts.head}
<style>
    ${fontFaceStyles}
    ${scrollbarStyles}
    :root {
      --theme-color: ${styles.themeColor || '#000000'};
      --theme-color-hover: ${styles.themeColorHover || '#333333'};
      --header-link-color: ${headerComponent?.props.linkColor || '#333333'};
      --header-link-hover-color: ${headerComponent?.props.linkHoverColor || '#000000'};
    }
    html {
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    *, *:before, *:after {
      box-sizing: inherit;
      word-wrap: break-word; /* Crucial for preventing overflow */
    }
    body {
        ${bodyStyles}
    }

    main {
      width: 100%;
      overflow-x: hidden;
    }
    
    .selection-mode {
        cursor: pointer !important;
    }
    .selection-mode * {
        pointer-events: none;
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
    }
    #loader img {
        width: 150px;
        height: 150px;
        object-fit: contain;
        border-radius: 0%;
        animation: pulse 2s infinite;
    }
    .loader-pulse {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background: var(--loader-color, #FFF);
        animation: pulse 1.5s infinite ease-in-out;
    }
    .loader-spin {
        width: 60px;
        height: 60px;
        border: 5px solid rgba(255, 255, 255, 0.3);
        border-top-color: var(--loader-color, #FFF);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }

    @keyframes pulse {
        0% { transform: scale(0.8); opacity: 0.7; }
        50% { transform: scale(1); opacity: 1; }
        100% { transform: scale(0.8); opacity: 0.7; }
    }
  
    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
    
    .component-wrapper {
      padding-top: 20px;
      width: 100%;
    }
    
    .component-layout-inline {
        display: inline-block;
        width: auto;
        vertical-align: top;
    }
    
    .section-container-padded {
      width: 100%;
      max-width: 1200px;
      margin-left: auto;
      margin-right: auto;
      padding-left: 1rem;
      padding-right: 1rem;
    }
    
    .page-header[data-overlay="true"] .header-inner-contained {
        padding-left: 1rem;
        padding-right: 1rem;
    }


    .section-wrapper {
        width: 100%;
        position: relative;
    }
    .section-wrapper > .columns-container,
    .section-wrapper > .div-container {
        position: relative;
        z-index: 1;
    }
    .animate-on-scroll {
        opacity: 0;
        transition: opacity 0.5s ease-out, transform 0.5s ease-out;
        animation-fill-mode: forwards;
    }
    .animate-on-scroll.is-visible {
        opacity: 1;
        animation-name: var(--animation-name);
        animation-duration: var(--animation-duration, 1s);
        animation-delay: var(--animation-delay, 0s);
    }

    .animation-loop--pulse { animation: pulse 2s infinite; }
    .animation-loop--bounce { animation: bounce 1s infinite; }
    .animation-loop--rotate { animation: rotate 4s linear infinite; }
    .animation-loop--floating { animation: floating 3s ease-in-out infinite; }
    .animation-loop--shake { animation: shake 0.5s infinite; }
    .animation-loop--wave { animation: wave 2.5s ease-in-out infinite; }
    .animation-loop--swing { animation: swing 2s ease-out infinite; }


    .section-wrapper[style*="background-color"] {
        /* This element will have the background color */
    }
    
    .page-header {
        width: 100%;
        transition: background 0.3s ease-in-out, color 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
        z-index: 50; 
    }
    .page-header .header-inner-contained,
    .page-header .header-inner-full {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }
    .page-header .header-inner-contained {
      margin: 0 auto;
    }
    .page-header[data-overlay="true"] {
        position: absolute;
        top: 0;
        left: 0;
        background: transparent !important; /* Start transparent, allow JS to change */
    }
    .page-header[data-sticky="true"] {
        position: sticky;
        top: 0;
    }
    .page-header.scrolled {
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
      background: var(--bg-scroll, #ffffff) !important;
    }
    .page-header .header-logo {
        flex-shrink: 0;
    }
    .page-header .header-logo img {
        width: auto;
    }
    .header-nav-container {
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }
    .page-header[data-layout="logo-left-menu-center-button-right"] .header-nav-container:nth-child(2) {
        flex-grow: 1;
        justify-content: center;
    }
    .page-header .header-nav ul {
        margin: 0;
        padding: 0;
        list-style: none;
        display: flex;
        align-items: center;
        gap: 1.5rem;
    }
    .page-header .header-nav a {
        text-decoration: none;
        color: var(--custom-link-color);
        font-weight: 500;
        transition: color 0.2s ease;
        display: inline-flex;
        align-items: center;
        padding: 0.5rem 0;
        font-size: var(--custom-link-font-size);
    }
    .page-header .header-nav a:not(.header-button):hover {
        color: var(--custom-link-hover-color);
    }
    .page-header .header-button, .page-header .header-nav a.header-button {
        padding: 0.5rem 1rem;
        border-radius: 0.375rem;
        text-decoration: none;
        white-space: nowrap;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        transition: background-color 0.2s ease;
    }
    .header-button .lucide-icon {
      width: 1.1em;
      height: 1.1em;
    }
    .page-header[data-layout="logo-center-menu-below"] .header-inner-contained,
    .page-header[data-layout="logo-center-menu-below"] .header-inner-full {
        flex-direction: column;
        gap: 1rem;
    }
    .page-header[data-layout="logo-only-left"] .header-logo { margin-right: auto; }
    .page-header[data-layout="logo-only-center"] .header-inner-contained,
    .page-header[data-layout="logo-only-center"] .header-inner-full {
        justify-content: center;
    }

    .mobile-menu-toggle { display: none; background: none; border: none; cursor: pointer; color: inherit; }

    @media (max-width: 768px) {
        .page-header .header-nav-container {
            display: none; /* Hide desktop nav container */
        }
        .mobile-menu-toggle { display: block; margin-left: auto; }
        
        /* Push Down Behavior */
        .page-header[data-mobile-menu-behavior="push"] .header-inner-contained,
        .page-header[data-mobile-menu-behavior="push"] .header-inner-full {
           flex-wrap: wrap;
        }
        .page-header[data-mobile-menu-behavior="push"] .header-nav-container {
            flex-direction: column;
            width: 100%;
            align-items: flex-start;
            max-height: 0;
            overflow: hidden;
            transition: max-height 0.3s ease-in-out;
            margin-top: 1rem;
        }
        .page-header[data-mobile-menu-behavior="push"].mobile-menu-open .header-nav-container {
            display: flex;
        }
        .page-header[data-mobile-menu-behavior="push"] .header-nav ul {
            flex-direction: column;
            width: 100%;
            align-items: flex-start;
            gap: 1rem !important;
        }
    }

    #mobile-menu-overlay {
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
        display: none;
    }
    body.menu-drawer-open #mobile-menu-overlay {
        display: block;
    }

    .banner-container {
        display: block;
        width: 100%;
    }
    .banner-media {
        width: 100%;
        height: 100%;
        display: block;
        object-fit: cover;
    }
    .banner-container:hover {
        filter: brightness(1.05);
        transition: filter 0.3s;
    }
    
    [contenteditable="true"]:focus {
      outline: 2px solid ${styles.themeColor};
      box-shadow: 0 0 5px ${styles.themeColor};
    }
    
    h1, h2 {
        font-family: "${fontFamilyHeadings}", sans-serif;
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

    .countdown-wrapper { display: flex; justify-content: center; }
    .countdown-item { display: flex; flex-direction: column; align-items: center; }
    .countdown-value { display: flex; align-items: center; justify-content: center; }
    .countdown-label { text-transform: uppercase; }
    .countdown-blocks .countdown-value { padding: 1rem; border-radius: 0.375rem; }
    .countdown-circles .countdown-value { width: 80px; height: 80px; border-radius: 50%; position: relative; }
    .countdown-circle-svg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform: rotateY(-180deg) rotateZ(-90deg); }
    .countdown-circle-svg circle { fill: none; stroke-width: 4; }
    .countdown-circle-svg .countdown-circle-progress { stroke: var(--theme-color); stroke-dasharray: 113; transition: stroke-dashoffset 1s linear; }

    .custom-button, .thank-you-message a.custom-button, .button-wrapper a {
      color: white !important;
      padding: 10px 20px;
      text-decoration: none;
      display: inline-block;
      transition: background-color 0.3s ease;
      border: none;
      cursor: pointer;
    }
    .custom-button--default { background-color: var(--theme-color); }
    .custom-button--default:hover { background-color: var(--theme-color-hover); }
    .custom-button--destructive { background-color: #ef4444; }
    .custom-button--destructive:hover { background-color: #dc2626; }
    .custom-button--outline { background-color: transparent; border: 1px solid var(--theme-color); color: var(--theme-color) !important; }
    .custom-button--outline:hover { background-color: var(--theme-color); color: white !important; }
    .custom-button--secondary { background-color: #64748b; }
    .custom-button--secondary:hover { background-color: #475569; }
    .custom-button--ghost { background-color: transparent; color: var(--theme-color) !important; }
    .custom-button--ghost:hover { background-color: #f1f5f9; }
    .custom-button--link {
        background-color: transparent !important;
        color: var(--theme-color) !important;
        padding: 0 !important;
        text-decoration: none !important;
        border-radius: 0 !important;
    }
    .custom-button--link:hover {
        text-decoration: underline !important;
    }
    
    .custom-button:hover, .thank-you-message a.custom-button:hover, .button-wrapper a:hover {
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
        font-family: "${fontFamilyBody}", sans-serif;
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
        font-family: "${fontFamilyBody}", sans-serif;
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

    .ftp-upload-container, .de-upload-container {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
        margin: 20px 0;
        background-color: #f9fafb;
    }
    .ftp-upload-header, .de-upload-header {
      text-align: center;
      margin-bottom: 20px;
    }
    .ftp-upload-header h4, .de-upload-header h4 {
      font-size: 1.25rem;
      font-weight: bold;
      margin: 0 0 5px 0;
    }
    .ftp-upload-header p, .de-upload-header p {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
    }
    .ftp-upload-form, .de-upload-form {
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    .ftp-upload-drop-area, .de-upload-drop-area {
        border: 2px dashed #ccc;
        border-radius: 8px;
        padding: 40px 20px;
        text-align: center;
        cursor: pointer;
        transition: background-color 0.2s ease;
    }
    .ftp-upload-drop-area.active, .de-upload-drop-area.active {
        background-color: #e9e9e9;
        border-color: var(--theme-color);
    }
    .ftp-upload-drop-area input[type="file"], .de-upload-drop-area input[type="file"] {
        display: none;
    }
    .ftp-upload-icon svg, .de-upload-icon svg {
        width: 48px;
        height: 48px;
        color: var(--theme-color);
        margin: 0 auto 10px auto;
    }
    .ftp-upload-instruction, .de-upload-instruction {
        font-weight: bold;
        color: #333;
    }
    .ftp-upload-filename, .de-upload-filename {
        display: block;
        margin-top: 10px;
        font-size: 0.9rem;
        color: #555;
    }
    .ftp-upload-progress-wrapper, .de-upload-progress-wrapper {
        display: none;
        width: 100%;
        height: 8px;
        background-color: #e0e0e0;
        border-radius: 4px;
        margin-top: 10px;
    }
    .ftp-upload-progress-bar, .de-upload-progress-bar {
        width: 0%;
        height: 100%;
        background-color: var(--theme-color);
        border-radius: 4px;
        transition: width 0.3s ease;
    }
    .ftp-upload-footer, .de-upload-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 15px;
    }
    .ftp-upload-status, .de-upload-status {
        font-size: 0.9rem;
    }
    .ftp-upload-form .custom-button, .de-upload-form .custom-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 5px;
    }
    .de-upload-auth-required {
        text-align: center;
        padding: 40px 20px;
        background-color: #fff8e1;
        border: 1px solid #ffecb3;
    }
    .de-upload-auth-required .de-upload-auth-icon {
        color: #f59e0b;
        margin-bottom: 10px;
    }
    .de-upload-auth-required .de-upload-auth-icon svg {
        width: 32px;
        height: 32px;
        margin: 0 auto;
    }
    .de-upload-auth-required h4 {
        font-size: 1.1rem;
        color: #333;
    }
    .de-upload-auth-required p {
        color: #666;
        margin-bottom: 20px;
    }


    footer {
        -webkit-font-smoothing: antialiased;
        color: rgba(0, 0, 0, 0.87);
        font-size: 0.875rem;
        font-family: "${fontFamilyBody}", "Helvetica", "Arial", sans-serif;
        font-weight: 400;
        line-height: 1.43;
        letter-spacing: 0.01071em;
        user-select: text !important;
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
    }

    .MuiGrid-container {
        width: 100%;
        display: flex;
        flex-wrap: wrap;
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
        position: relative;
        gap: 1rem;
    }
    .stripe-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex-grow: 1;
        justify-content: center;
    }
    .stripe-content p {
        margin: 0;
    }
    .stripe-icon svg {
        width: 1.25rem;
        height: 1.25rem;
    }
    .stripe-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .stripe-button {
        background-color: rgba(255, 255, 255, 0.2);
        color: inherit;
        text-decoration: none;
        padding: 0.25rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        transition: background-color 0.2s;
    }
    .stripe-button:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }
    .stripe-close-btn {
        background: none;
        border: none;
        color: inherit;
        font-size: 24px;
        line-height: 1;
        cursor: pointer;
        padding: 0 5px;
        opacity: 0.7;
    }
     .stripe-close-btn:hover {
        opacity: 1;
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

    .div-container,
    .columns-container {
        width: 100%;
        position: relative; /* For hero text overlay */
    }
    .div-container {
        display: flex;
        flex-direction: column; /* Default for Div */
    }
    .columns-container {
        display: grid;
        grid-template-columns: var(--grid-template-columns, repeat(var(--column-count, 2), 1fr));
        gap: var(--gap, 20px);
        align-items: var(--align-items, flex-start);
    }
    .div-container .column,
    .columns-container .column {
        min-width: 0;
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }

    .section-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        pointer-events: none;
    }

    .carousel-container { position: relative; }
    .carousel-viewport { overflow: hidden; }
    .carousel-inner { display: flex; }
    .carousel-slide { flex: 0 0 auto; min-width: 0; }
    .carousel-slide img { display: block; width: 100%; object-fit: contain; }
    .carousel-prev, .carousel-next {
        cursor: pointer; position: absolute; top: 50%; transform: translateY(-50%);
        background-color: rgba(255,255,255,0.7); border: none; border-radius: 50%;
        width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
    }
    .carousel-prev { left: 10px; }
    .carousel-next { right: 10px; }
    .carousel-dots { text-align: center; padding-top: 10px; }
    .carousel-dot {
        cursor: pointer; height: 12px; width: 12px; margin: 0 5px;
        background-color: #bbb; border-radius: 50%; display: inline-block;
        transition: background-color 0.6s ease;
    }
    .carousel-dot.is-selected { background-color: var(--theme-color); }

    .logo-carousel .carousel-slide {
        padding: 0 20px;
    }
    .logo-carousel img {
        max-height: 60px;
        width: auto;
        margin: 0 auto;
        filter: grayscale(100%);
        opacity: 0.6;
        transition: all 0.3s ease;
    }
    .logo-carousel img:hover {
        filter: grayscale(0%);
        opacity: 1;
        transform: scale(1.1);
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
    .floating-button-wrapper {
        position: fixed;
        z-index: 100;
    }
    .floating-button-wrapper[data-show-on-scroll="true"] {
        transform: translateY(200%);
        transition: transform 0.3s ease-in-out;
    }
    .floating-button-wrapper.visible {
        transform: translateY(0);
    }
    .floating-button-link {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        transition: transform 0.2s ease;
    }
    .floating-button-link:hover {
        transform: scale(1.1);
    }
    .floating-button-link img, .floating-button-link svg {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .password-protection-container {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-grow: 1;
        width: 100%;
        min-height: 100vh;
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
    .add-to-calendar-container {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .add-to-calendar-button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 15px;
      border-radius: 5px;
      border: 1px solid transparent;
      text-decoration: none;
      font-weight: 500;
      color: #FFF;
      transition: opacity 0.2s;
    }
    .add-to-calendar-button:hover {
        opacity: 0.9;
    }
    .add-to-calendar-button.google {
        background-color: #4285F4;
    }
    .add-to-calendar-button.outlook {
        background-color: #0072C6;
    }
    .add-to-calendar-button svg {
        width: 18px;
        height: 18px;
        fill: currentColor;
    }
    
    @keyframes fadeInUp { from { opacity: 0; transform: translate3d(0, 40px, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
    @keyframes fadeInLeft { from { opacity: 0; transform: translate3d(-50px, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
    @keyframes fadeInRight { from { opacity: 0; transform: translate3d(50px, 0, 0); } to { opacity: 1; transform: translate3d(0, 0, 0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

    @keyframes bounce { 0%, 20%, 50%, 80%, 100% {transform: translateY(0);} 40% {transform: translateY(-20px);} 60% {transform: translateY(-10px);} }
    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes floating { 0% { transform: translate(0, 0px); } 50% { transform: translate(0, 8px); } 100% { transform: translate(0, -0px); } }
    @keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }
    @keyframes wave { 2.5s ease-in-out infinite; }
    @keyframes swing { 2s ease-out infinite; transform-origin: top center; }


    .animation-loop--bounce { animation: bounce 2s infinite; }
    .animation-loop--rotate { animation: rotate 5s linear infinite; }
    .animation-loop--floating { animation: floating 3s ease-in-out infinite; }
    .animation-loop--shake { animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both infinite; }
    .animation-loop--wave { animation: wave 2.5s ease-in-out infinite; }
    .animation-loop--swing { animation: swing 2s ease-out infinite; transform-origin: top center; }


    .animate-on-scroll {
        opacity: 0;
    }
    .animate-on-scroll.is-visible {
        animation-fill-mode: both;
        animation-name: var(--animation-name);
        animation-duration: var(--animation-duration);
        animation-delay: var(--animation-delay);
    }


    @media (max-width: 768px) {
        .columns-container {
            grid-template-columns: 1fr !important;
        }
        .footer-section .columns-container {
            grid-template-columns: 1fr;
            text-align: center;
        }
        .footer-section .columns-container .column {
            display: flex;
            flex-direction: column;
            align-items: center;
        }
         .footer-section .social-icons-container {
            justify-content: center;
        }
    }


    ${styles.customCss || ''}
</style>
${clientSideScripts}
</head>
<body>
${!isForPreview ? trackingScripts.body : ''}
  ${shouldHideAmpscript ? `
    ${renderLoader(meta, styles.themeColor)}
    ${stripeComponents}
    <div id="mobile-menu-overlay"></div>
    <main>
      ${mainContentHtml}
    </main>
    ${floatingElementsHtml}
    ${footerHtml}
    ${cookieBannerHtml}
    ${popupsHtml}
  ` : `
    %%[ IF @isAuthenticated == true THEN ]%%
    ${renderLoader(meta, styles.themeColor)}
    ${stripeComponents}
    <div id="mobile-menu-overlay"></div>
    <main>
      ${mainContentHtml}
    </main>
    ${floatingElementsHtml}
    ${footerHtml}
    ${cookieBannerHtml}
    ${popupsHtml}
    %%[ ELSE ]%%
    ${security.body}
    %%[ ENDIF ]%%
    `}
</body>
</html>`;

  finalHtml = finalHtml.replace(/&lt;/g, '<').replace(/&gt;/g, '>');

  return finalHtml;
}

function getStyleString(styles: any = {}): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}
