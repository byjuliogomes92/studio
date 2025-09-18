
import type { CloudPage, PageComponent, EditorMode, ResponsiveProps } from './types';
import { getPrefillAmpscript, getDEUploadSSJS } from './ssjs-templates';
import { getSSJSSecurityBlock, getSecurityFormHtml } from '@/lib/html-components/security';
import { renderHeader } from '@/lib/html-components/header';
import { renderBanner } from '@/lib/html-components/banner';
import { renderTitle } from '@/lib/html-components/title';
import { renderSubtitle } from '@/lib/html-components/subtitle';
import { renderParagraph } from '@/lib/html-components/paragraph';
import { renderDivider } from '@/lib/html-components/divider';
import { renderImage } from '@/lib/html-components/image';
import { renderVideo } from '@/lib/html-components/video';
import { renderCountdown } from '@/lib/html-components/countdown';
import { renderSpacer } from '@/lib/html-components/spacer';
import { renderButton } from '@/lib/html-components/button';
import { renderDownloadButton } from '@/lib/html-components/download-button';
import { renderAccordion } from '@/lib/html-components/accordion';
import { renderTabs } from '@/lib/html-components/tabs';
import { renderVoting } from '@/lib/html-components/voting';
import { renderStripe } from '@/lib/html-components/stripe';
import { renderNPS } from '@/lib/html-components/nps';
import { renderMap } from '@/lib/html-components/map';
import { renderSocialIcons } from '@/lib/html-components/social-icons';
import { renderColumns } from '@/lib/html-components/columns';
import { renderWhatsApp } from '@/lib/html-components/whatsapp';
import { renderCarousel } from '@/lib/html-components/carousel';
import { renderForm } from '@/lib/html-components/form';
import { renderFooter } from '@/lib/html-components/footer';
import { renderFTPUpload } from '@/lib/html-components/ftpupload';
import { renderDataExtensionUpload } from '@/lib/html-components/data-extension-upload';
import { renderFloatingImage } from '@/lib/html-components/floating-image';
import { renderFloatingButton } from '@/lib/html-components/floating-button';
import { renderCalendly } from '@/lib/html-components/calendly';
import { renderDiv } from '@/lib/html-components/div';
import { renderAddToCalendar } from '@/lib/html-components/add-to-calendar';
import { renderPopUp } from '@/lib/html-components/popup';

function getStyleString(styles: any = {}, forbiddenKeys: string[] = []): string {
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value || forbiddenKeys.includes(key)) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
}


function renderComponents(components: PageComponent[], allComponents: PageComponent[], pageState: CloudPage, isForPreview: boolean, baseUrl: string, hideAmpscript: boolean = false): string {
    return components
      .sort((a, b) => a.order - b.order) // Sort by order before rendering
      .map((component) => {
        // Pass the full pageState down to individual renderers
        const componentWithState = { 
            ...component, 
            brand: pageState.brand // Directly attach brand info to component for render functions
        };
        
        // Use component.children if it exists, otherwise find children via parentId
        const children = component.children || allComponents.filter(c => c.parentId === component.id);
        const sortedChildren = [...children].sort((a, b) => (a.column || 0) - (b.column || 0) || a.order - b.order);

        let childrenHtml = '';
        if (['Columns', 'Div', 'PopUp'].includes(component.type)) {
            if (component.type === 'Columns') {
                const columnCount = component.props.columnCount || 2;
                let columnsContent = '';
                for (let i = 0; i < columnCount; i++) {
                    const columnComponents = sortedChildren.filter(c => c.column === i);
                    columnsContent += `<div class="column" style="${getColumnStyle(component.props.columnStyles, i)}">${renderComponents(columnComponents, allComponents, pageState, isForPreview, baseUrl, hideAmpscript)}</div>`;
                }
                childrenHtml = columnsContent;
            } else {
                 childrenHtml = renderComponents(sortedChildren, allComponents, pageState, isForPreview, baseUrl, hideAmpscript);
            }
        }
        return renderComponent(componentWithState, pageState, isForPreview, childrenHtml, baseUrl, hideAmpscript);
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


const renderComponent = (component: PageComponent, pageState: CloudPage, isForPreview: boolean, childrenHtml: string, baseUrl: string, hideAmpscript: boolean = false): string => {
  const styles = component.props.styles || {};
  const responsive = component.props.responsive || {};
  const {
      animationType: entranceAnimation = 'none',
      animationDuration = 1,
      animationDelay = 0,
      loopAnimation = 'none',
  } = styles;

  let wrapperClass = 'component-wrapper';

  if (entranceAnimation !== 'none') {
    wrapperClass += ' animate-on-scroll';
  }
  
  if (loopAnimation !== 'none') {
      wrapperClass += ` animation-loop--${loopAnimation}`;
  }
  
  if (responsive.hiddenOnDesktop) {
    wrapperClass += ' hidden-on-desktop';
  }
  if (responsive.hiddenOnMobile) {
      wrapperClass += ' hidden-on-mobile';
  }

  const animationAttrs = entranceAnimation !== 'none'
    ? `data-animation="${entranceAnimation}" data-animation-duration="${animationDuration}s" data-animation-delay="${animationDelay}s"`
    : '';
  
  const componentId = component.props.idOverride || component.id;
  const selectableAttrs = isForPreview ? `data-component-id="${component.id}"` : `id="${componentId}"`;
  
  const parentComponent = pageState.components.find(c => c.id === component.parentId);
  const isInFlexRow = parentComponent?.type === 'Div' && parentComponent?.props?.layout?.flexDirection === 'row';

  // Extract only spacing styles for the wrapper
  const spacingKeys = ['marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight'];
  const wrapperStyles: Record<string, any> = {};
  spacingKeys.forEach(key => {
    if (styles[key]) {
      wrapperStyles[key] = styles[key];
    }
  });

  // Inherit text-align from the child component for the wrapper
  if (styles.textAlign && !isInFlexRow) {
      wrapperStyles['text-align'] = styles.textAlign;
  }
  
  const wrapperStyleString = getStyleString(wrapperStyles);
  
  // Render the component's HTML
  const renderedComponent = renderSingleComponent(component, pageState, isForPreview, childrenHtml, baseUrl, hideAmpscript);
  
  // These components render their own wrappers or are positioned absolutely
  if (['FloatingImage', 'FloatingButton', 'WhatsApp', 'Stripe', 'Footer', 'PopUp', 'Header', 'Columns', 'Div'].includes(component.type)) {
    return renderedComponent;
  }
  
  if (isInFlexRow) {
      // For items in a horizontal flex row, we don't want the individual alignment wrapper.
      // The parent Div controls alignment.
      return renderedComponent;
  }

  return `<div class="${wrapperClass}" style="${wrapperStyleString}" ${animationAttrs} ${selectableAttrs}>
             ${renderedComponent}
          </div>`;
};


export const renderSingleComponent = (component: PageComponent, pageState: CloudPage, isForPreview: boolean, childrenHtml: string = '', baseUrl: string, hideAmpscript: boolean = false): string => {
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
    case 'Form': return renderForm(component, pageState, isForPreview);
    case 'FTPUpload': return renderFTPUpload(component, pageState, baseUrl);
    case 'DataExtensionUpload': return renderDataExtensionUpload(component, pageState, baseUrl);
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
})(window,document,'script','dataLayer','${gtmId}');<\/script>
<!-- End Google Tag Manager -->`;
        
        bodyScripts += `
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}"
height="0" width="0" style="display:none;visibility:hidden"></iframe><\/noscript>
<!-- End Google Tag Manager (noscript) -->`;
    }

    if (trackingConfig.ga4?.enabled && trackingConfig.ga4.id) {
        const ga4Id = trackingConfig.ga4.id;
        headScripts += `
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${ga4Id}"><\/script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '${ga4Id}');
<\/script>`;
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
<\/script>
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
<\/script><script type="text/javascript">
(function(l) {
if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
window.lintrk.q=[]}
var s = document.getElementsByTagName("script")[0];
var b = document.createElement("script");
b.type = "text/javascript";b.async = true;
b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
s.parentNode.insertBefore(b, s);})(window.lintrk);
<\/script>
<noscript>
<img height="1" width="1" style="display:none;" alt="" src="https://px.ads.linkedin.com/collect/?pid=${linkedinId}&fmt=gif" />
<\/noscript>
<!-- End LinkedIn Insight Tag -->`;
    }

    return { head: headScripts, body: bodyScripts };
};

const getCookieBannerHtml = (config: CloudPage['cookieBanner']): string => {
    if (!config || !config.enabled) return '';
    const {
        position = 'bottom',
        layout = 'bar',
        title = 'Gerencie seu consentimento de cookies',
        description = 'Este site usa cookies para garantir que você obtenha a melhor experiência.',
        acceptButtonText = 'Aceitar Todos',
        declineButtonText = 'Recusar Todos',
        preferencesButtonText = 'Preferências',
        privacyPolicyLink,
        categories = [],
        styles = {}
    } = config;

    const bannerId = 'cookie-consent-banner';
    const prefsModalId = 'cookie-prefs-modal';

    const categoryToggles = categories.map(cat => `
        <div class="cookie-category">
            <div class="cookie-category-header">
                <label for="cookie-cat-${cat.id}">${cat.name}</label>
                <input type="checkbox" id="cookie-cat-${cat.id}" data-category-id="${cat.id}" ${cat.required ? 'checked disabled' : ''}>
            </div>
            <p>${cat.description}</p>
        </div>
    `).join('');

    return `
        <div id="${bannerId}" class="cookie-banner" data-position="${position}" data-layout="${layout}">
            <div class="cookie-banner-content">
                <h3 class="cookie-title">${title}</h3>
                <p>${description} ${privacyPolicyLink ? `<a href="${privacyPolicyLink}" target="_blank">Política de Privacidade</a>` : ''}</p>
            </div>
            <div class="cookie-banner-actions">
                <button id="cookie-prefs-btn">${preferencesButtonText}</button>
                <button id="cookie-decline-btn">${declineButtonText}</button>
                <button id="cookie-accept-btn">${acceptButtonText}</button>
            </div>
        </div>

        <div id="${prefsModalId}-overlay" class="cookie-modal-overlay"></div>
        <div id="${prefsModalId}" class="cookie-modal">
            <div class="cookie-modal-header">
                <h4>Preferências de Cookies</h4>
                <button id="cookie-modal-close">&times;</button>
            </div>
            <div class="cookie-modal-body">
                ${categoryToggles}
            </div>
            <div class="cookie-modal-footer">
                <button id="cookie-save-prefs-btn">Salvar Preferências</button>
            </div>
        </div>
    `;
};

const getCookieScripts = (config: CloudPage['cookieBanner']): string => {
     if (!config || !config.enabled) return `
        <script>
            function runCookieScripts() { /* No consent needed */ }
            document.addEventListener('DOMContentLoaded', runCookieScripts);
        <\/script>
     `;
     
    const categories = config.categories || [];
    const scriptsByCategory = categories.reduce((acc, cat) => {
        acc[cat.id] = cat.scripts || '';
        return acc;
    }, {} as Record<string, string>);

    return `
        <script>
        (function() {
            const COOKIE_CONSENT_KEY = 'cookie_consent';
            const banner = document.getElementById('cookie-consent-banner');
            const prefsBtn = document.getElementById('cookie-prefs-btn');
            const acceptBtn = document.getElementById('cookie-accept-btn');
            const declineBtn = document.getElementById('cookie-decline-btn');
            const modal = document.getElementById('cookie-prefs-modal');
            const overlay = document.getElementById('cookie-prefs-modal-overlay');
            const closeModalBtn = document.getElementById('cookie-modal-close');
            const savePrefsBtn = document.getElementById('cookie-save-prefs-btn');
            const scriptsByCategory = ${JSON.stringify(scriptsByCategory)};

            function runScriptsForConsent(consent) {
                Object.keys(consent).forEach(categoryId => {
                    if (consent[categoryId] && scriptsByCategory[categoryId]) {
                        const scriptElement = document.createElement('script');
                        scriptElement.innerHTML = scriptsByCategory[categoryId];
                        document.body.appendChild(scriptElement);
                    }
                });
            }

            function getConsent() {
                try {
                    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
                    return consent ? JSON.parse(consent) : null;
                } catch (e) {
                    return null;
                }
            }

            function setConsent(consent) {
                localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
                hideBanner();
                runScriptsForConsent(consent);
            }

            function hideBanner() {
                if (banner) banner.style.display = 'none';
            }
            
            function showModal() {
                if (modal && overlay) {
                    const currentConsent = getConsent() || {};
                    document.querySelectorAll('.cookie-category input[type="checkbox"]').forEach(checkbox => {
                        const catId = checkbox.dataset.categoryId;
                        if (catId) {
                           checkbox.checked = !!currentConsent[catId];
                        }
                    });
                    modal.classList.add('visible');
                    overlay.classList.add('visible');
                }
            }

            function hideModal() {
                 if (modal && overlay) {
                    modal.classList.remove('visible');
                    overlay.classList.remove('visible');
                 }
            }

            if (getConsent()) {
                hideBanner();
                runScriptsForConsent(getConsent());
            } else if (banner) {
                banner.classList.add('visible');
            }

            if (acceptBtn) acceptBtn.addEventListener('click', () => {
                const allConsent = Object.keys(scriptsByCategory).reduce((acc, catId) => {
                    acc[catId] = true;
                    return acc;
                }, {});
                setConsent(allConsent);
            });

            if (declineBtn) declineBtn.addEventListener('click', () => {
                 const necessaryOnlyConsent = Object.keys(scriptsByCategory).reduce((acc, catId) => {
                    const checkbox = document.querySelector(\`#cookie-cat-\${catId}\`);
                    acc[catId] = checkbox ? checkbox.disabled : false;
                    return acc;
                }, {});
                setConsent(necessaryOnlyConsent);
            });
            
            if(prefsBtn) prefsBtn.addEventListener('click', showModal);
            if(closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
            if(overlay) overlay.addEventListener('click', hideModal);
            
            if(savePrefsBtn) savePrefsBtn.addEventListener('click', () => {
                const newConsent = {};
                document.querySelectorAll('.cookie-category input[type="checkbox"]').forEach(checkbox => {
                    const catId = checkbox.dataset.categoryId;
                    if (catId) {
                        newConsent[catId] = checkbox.checked;
                    }
                });
                setConsent(newConsent);
                hideModal();
            });
        })();
        <\/script>
    `;
};


const getClientSideScripts = (pageState: CloudPage, isForPreview: boolean, editorMode: EditorMode, baseUrl: string): string => {
    const hasLottieAnimation = pageState.components.some(c => c.type === 'Form' && c.props.thankYouAnimation && c.props.thankYouAnimation !== 'none');
    const hasCarousel = pageState.components.some(c => c.type === 'Carousel');
    const hasAutoplayCarousel = hasCarousel && pageState.components.some(c => c.type === 'Carousel' && c.props.options?.autoplay);
    const hasCalendly = pageState.components.some(c => c.type === 'Calendly');
    const headerComponent = pageState.components.find(c => c.type === 'Header');

    // Add Firebase SDK if needed for components like DataExtensionUpload
    const needsFirebase = pageState.components.some(c => c.type === 'DataExtensionUpload' || c.type === 'FTPUpload' || pageState.meta.security?.type === 'platform_users');
    const firebaseSdkScript = (needsFirebase)
        ? `
        <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"><\/script>
        <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-functions.js"><\/script>
        <script>
            var firebaseConfig = {
               apiKey: "${process.env.NEXT_PUBLIC_FIREBASE_API_KEY}",
               authDomain: "${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN}",
               projectId: "${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}",
               storageBucket: "${process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}",
               messagingSenderId: "${process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID}",
               appId: "${process.env.NEXT_PUBLIC_FIREBASE_APP_ID}"
            };
            if (typeof firebase !== 'undefined' && !firebase.apps.length) {
               firebase.initializeApp(firebaseConfig);
            }
        <\/script>
        `
        : '';


    const lottiePlayerScript = hasLottieAnimation ? '<script src="https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js"><\/script>' : '';
    const carouselScript = hasCarousel ? '<script src="https://unpkg.com/embla-carousel@latest/embla-carousel.umd.js"><\/script>' : '';
    const autoplayPluginScript = hasAutoplayCarousel 
      ? '<script src="https://unpkg.com/embla-carousel-autoplay@latest/embla-carousel-autoplay.umd.js"><\/script>' 
      : '';
    const calendlyScript = hasCalendly ? '<script type="text/javascript" src="https://assets.calendly.com/assets/external/widget.js" async><\/script>' : '';
    const cookieScript = getCookieScripts(pageState.cookieBanner);


    const editorInteractionScript = isForPreview ? `
        <script>
            document.body.addEventListener('click', function(e) {
                const mode = document.body.dataset.editorMode;
                if (mode === 'none' || !window.parent) return;

                let target = e.target;
                
                if (mode === 'selection') {
                    e.preventDefault();
                    e.stopPropagation();
                    let componentId = null;
                    while(target && target !== document.body) {
                        if (target.hasAttribute('data-component-id')) {
                            componentId = target.getAttribute('data-component-id');
                            break;
                        }
                        target = target.parentElement;
                    }
                    if (componentId && window.parent.handleComponentSelect) {
                        window.parent.handleComponentSelect(componentId);
                    }
                } else if (mode === 'comment') {
                    e.preventDefault();
                    e.stopPropagation();
                    if (window.parent.handleAddComment) {
                        const iframeRect = window.frameElement ? window.frameElement.getBoundingClientRect() : { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
                        window.parent.handleAddComment(e.clientX, e.clientY, iframeRect);
                    }
                }
            });
        <\/script>
    ` : '';
    
    const platformAuthScript = pageState.meta.security?.type === 'platform_users' ? `
        <script>
            (function() {
                const container = document.getElementById('platform-auth-container');
                const mainContent = document.getElementById('main-content');
                if (!container || !mainContent) return;

                const checkAuth = () => {
                    const token = sessionStorage.getItem('page_auth_token_${pageState.id}');
                    if (token) {
                        container.style.display = 'none';
                        mainContent.style.display = 'block';
                    } else {
                        container.style.display = 'flex';
                        mainContent.style.display = 'none';
                    }
                };

                const submitBtn = document.getElementById('platform-submit-btn');
                const identifierInput = document.getElementById('platform-identifier');
                const passwordInput = document.getElementById('platform-password');
                const errorMessageEl = document.getElementById('platform-error-message');

                submitBtn.addEventListener('click', async () => {
                    const identifier = identifierInput.value;
                    const password = passwordInput.value;
                    
                    submitBtn.disabled = true;
                    submitBtn.textContent = 'Verificando...';
                    errorMessageEl.style.display = 'none';

                    try {
                        const verifyPageAccess = firebase.functions().httpsCallable('verifyPageAccess');
                        const result = await verifyPageAccess({
                            pageId: '${pageState.id}',
                            identifier: identifier,
                            password: password
                        });

                        if (result.data.success) {
                            sessionStorage.setItem('page_auth_token_${pageState.id}', 'authenticated');
                            checkAuth();
                        } else {
                            throw new Error(result.data.message || 'Credenciais inválidas.');
                        }
                    } catch (error) {
                        errorMessageEl.textContent = error.message;
                        errorMessageEl.style.display = 'block';
                    } finally {
                        submitBtn.disabled = false;
                        submitBtn.textContent = 'Acessar';
                    }
                });
                
                checkAuth();
            })();
        <\/script>
    ` : '';


    const script = `
    <script>
    function setupAnimations() {
        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        if (!animatedElements.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const animationName = el.dataset.animation;
                    if (animationName) {
                        el.style.animationName = animationName;
                    }
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
                
                const contentWrapper = header.parentElement.nextElementSibling;
                if (!contentWrapper) return;

                const isExpanded = header.getAttribute('aria-expanded') === 'true';
                header.setAttribute('aria-expanded', !isExpanded);
                contentWrapper.classList.toggle('expanded', !isExpanded);
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
    
    function setupPopups() {
        document.querySelectorAll('[id^="popup-container-"]').forEach(popup => {
            const wrapperId = popup.id;
            const overlayId = wrapperId.replace('popup-container-', 'popup-container-overlay-');
            const closeBtnId = wrapperId.replace('popup-container-', 'popup-container-close-');

            const overlay = document.getElementById(overlayId);
            const closeBtn = document.getElementById(closeBtnId);
            if (!overlay || !closeBtn) return;
            
            const storageKey = 'popup_shown_' + wrapperId;
            let isOpened = false;

            function openPopup() {
                if (isOpened || sessionStorage.getItem(storageKey)) return;
                popup.style.visibility = 'visible';
                popup.style.opacity = '1';
                popup.style.transform = 'translate(-50%, -50%) scale(1)';
                overlay.style.visibility = 'visible';
                overlay.style.opacity = '1';
                if (popup.dataset.preventScroll === 'true') {
                    document.body.style.overflow = 'hidden';
                }
                sessionStorage.setItem(storageKey, 'true');
                isOpened = true;
            }

            function closePopup() {
                popup.style.opacity = '0';
                popup.style.transform = 'translate(-50%, -50%) scale(0.95)';
                overlay.style.opacity = '0';
                setTimeout(() => {
                    popup.style.visibility = 'hidden';
                    overlay.style.visibility = 'hidden';
                    if (popup.dataset.preventScroll === 'true') {
                        document.body.style.overflow = '';
                    }
                }, 300);
            }
            
            window.closePopup = closePopup;

            closeBtn.addEventListener('click', closePopup);
            if (popup.dataset.closeOnOutsideClick !== 'false') {
                overlay.addEventListener('click', closePopup);
            }

            const trigger = popup.dataset.trigger;
            if (trigger === 'delay') {
                const delay = parseInt(popup.dataset.delay, 10) || 3;
                setTimeout(openPopup, delay * 1000);
            } else if (trigger === 'entry') {
                openPopup();
            } else if (trigger === 'scroll') {
                const scrollPercentage = parseInt(popup.dataset.scrollPercentage, 10) || 50;
                const handleScroll = () => {
                    const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                    if (scrollPercent >= scrollPercentage) {
                        openPopup();
                        window.removeEventListener('scroll', handleScroll);
                    }
                };
                window.addEventListener('scroll', handleScroll, { passive: true });
            } else if (trigger === 'exit_intent') {
                document.addEventListener('mouseleave', function(e) {
                    if (e.clientY < 0) {
                        openPopup();
                    }
                }, { once: true });
            }
        });
    }

    function initializePage() {
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
        setupPopups();
    }
    
    window.addEventListener('load', function() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
        initializePage();
    });

    if (document.readyState === 'complete') {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.display = 'none';
        }
        initializePage();
    }

    <\/script>
    `;

    return `${firebaseSdkScript}${lottiePlayerScript}${carouselScript}${autoplayPluginScript}${calendlyScript}${script}${cookieScript}${editorInteractionScript}${platformAuthScript}`;
};


const renderLoader = (meta: CloudPage['meta'], themeColor: string): string => {
    if (meta.loaderType === 'none') {
        return '';
    }

    if (meta.loaderType === 'image' && meta.loaderImageUrl) {
        return `
            <div id="loader" style="background-color: ${themeColor};">
                <img src="${meta.loaderImageUrl}" alt="Carregando..." class="loader-logo-pulse">
            </div>
        `;
    }
    
    // Default to animation (now star pulse)
    return `
        <div id="loader" style="background-color: ${themeColor};">
            <div class="loader-star-pulse"></div>
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

const getResponsiveStyles = (components: PageComponent[]): string => {
    let mobileStyles = '';
    components.forEach(component => {
        const responsive = component.props.responsive as ResponsiveProps | undefined;
        if (responsive?.mobileStyles) {
            const componentSelector = `[data-component-id="${component.id}"]`;
            let componentStyles = '';
            for (const [key, value] of Object.entries(responsive.mobileStyles)) {
                if (value) {
                    const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
                    componentStyles += `${cssKey}: ${value} !important; `;
                }
            }
            if (componentStyles) {
                mobileStyles += `${componentSelector} { ${componentStyles} }`;
            }
        }
    });

    let css = `
        @media (min-width: 769px) {
            .hidden-on-desktop {
                display: none !important;
            }
        }
        @media (max-width: 768px) {
            .columns-container, .div-container .columns-container {
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
            .hidden-on-mobile {
                display: none !important;
            }
            ${mobileStyles}
        }
    `;
    
    return css;
};

export function generateHtml(pageState: CloudPage, isForPreview: boolean = false, baseUrl: string = '', hideAmpscript: boolean = false, editorMode: EditorMode = 'none'): string {
    const { components, meta, styles } = pageState;

    const hasForm = components.some(c => c.type === 'Form');
    const hasDataExtensionUpload = components.some(c => c.type === 'DataExtensionUpload');
    const needsSecurity = meta.security && meta.security.type !== 'none';
    
    const needsAmpscript = !isForPreview && !hideAmpscript;

    const rootComponents = components.filter(c => c.parentId === null);
    const mainContentHtml = renderComponents(rootComponents, components, pageState, isForPreview, baseUrl, hideAmpscript);
    
    const amspcriptBlock = `%%[ ${getPrefillAmpscript(pageState)} ]%%`;

    const { typography } = pageState.brand || {};
    const fontFamilyHeadings = typography?.customFontNameHeadings || typography?.fontFamilyHeadings || 'Poppins';
    const fontFamilyBody = typography?.customFontNameBody || typography?.fontFamilyBody || 'Roboto';
    const fontFaceStyles = getFontFaceStyles(pageState);
    const scrollbarStyles = getScrollbarStyles(pageState.styles.scrollbar);
    const responsiveStyles = getResponsiveStyles(components);
    const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontFamilyHeadings.replace(/ /g, '+')}:wght@400;700;900&family=${fontFamilyBody.replace(/ /g, '+')}:wght@400;700&display=swap`;
    
    const bodyStyles = `
        background-color: ${styles.backgroundColor};
        background-image: ${styles.backgroundImage ? `url(${styles.backgroundImage})` : 'none'};
        background-size: cover;
        background-repeat: no-repeat;
        background-attachment: fixed;
        font-family: "${fontFamilyBody}", sans-serif;
        font-weight: 400;
        margin: 0;
        width: 100%;
        overflow-x: hidden;
        position: relative;
    `;
    
    const headerComponent = components.find(c => c.type === 'Header');
    const isHeaderSticky = headerComponent?.props?.isSticky;
    const mainStyle = isHeaderSticky ? `padding-top: ${headerComponent?.props?.logoHeight ? headerComponent.props.logoHeight + 32 : 72}px;` : '';
    
    const trackingScripts = getTrackingScripts(meta.tracking);
    const cookieBannerHtml = getCookieBannerHtml(pageState.cookieBanner);
    const clientSideScripts = getClientSideScripts(pageState, isForPreview, editorMode, baseUrl);

    let bodyContent = '';
    
    let ssjsBlock = '';
    if (needsAmpscript) {
        if (hasDataExtensionUpload) {
            ssjsBlock += getDEUploadSSJS(baseUrl);
        }
        if (needsSecurity && meta.security?.type === 'password') {
            ssjsBlock += getSSJSSecurityBlock(pageState);
        }
    }

    if (needsSecurity) {
        if (meta.security?.type === 'platform_users') {
             bodyContent = `
                ${getSecurityFormHtml(pageState)}
                <main id="main-content" style="display: none;">${mainContentHtml}</main>
            `;
        } else {
             bodyContent = `%%[ IF @isAuthenticated == true THEN ]%%
                <main id="main-content" style="${mainStyle}">${mainContentHtml}</main>
            %%[ ELSE ]%%
                ${getSecurityFormHtml(pageState)}
            %%[ ENDIF ]%%`;
        }
    } else {
        bodyContent = `<main id="main-content" style="${mainStyle}">${mainContentHtml}</main>`;
    }


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
<link href="${googleFontUrl}" rel="stylesheet">
${ssjsBlock ? `<script runat="server">${ssjsBlock}<\/script>` : ''}
${needsAmpscript ? amspcriptBlock : ''}
${trackingScripts.head}
<style>
    ${fontFaceStyles}
    ${scrollbarStyles}
    :root {
      --theme-color: ${styles.themeColor || '#000000'};
      --theme-color-hover: ${styles.themeColorHover || '#333333'};
      --header-link-color: ${pageState.components.find(c => c.type === 'Header')?.props.linkColor || '#333333'};
      --header-link-hover-color: ${pageState.components.find(c => c.type === 'Header')?.props.linkHoverColor || '#000000'};
    }
    html {
      box-sizing: border-box;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      scroll-behavior: smooth;
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
    
    body[data-editor-mode='selection'] * {
        cursor: pointer !important;
    }
    body[data-editor-mode='comment'] {
        cursor: crosshair;
    }
    body[data-editor-mode='comment'] * {
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
    .loader-logo-pulse {
        animation: star-pulse 2s infinite ease-in-out;
    }
    .loader-star-pulse {
        width: 60px;
        height: 60px;
        background-color: var(--loader-color, #FFF);
        clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
        animation: star-pulse 2s infinite ease-in-out;
    }

    @keyframes star-pulse {
        0% { transform: scale(0.95); opacity: 0.7; }
        50% { transform: scale(1.1); opacity: 1; }
        100% { transform: scale(0.95); opacity: 0.7; }
    }
    
    .component-wrapper {
      padding-top: var(--padding-top, 0);
      padding-bottom: var(--padding-bottom, 0);
      padding-left: var(--padding-left, 0);
      padding-right: var(--padding-right, 0);
      margin-top: var(--margin-top, 0);
      margin-bottom: var(--margin-bottom, 0);
      margin-left: var(--margin-left, auto);
      margin-right: var(--margin-right, auto);
      width: 100%;
      max-width: 1200px;
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

    pre {
      background-color: #282c34;
      color: #abb2bf;
      border-radius: 8px;
      padding: 16px;
      overflow-x: auto;
      font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
      font-size: 14px;
      line-height: 1.6;
      white-space: pre;
    }

    code {
      font-family: inherit;
    }

    .dark pre {
        background-color: #2d2d2d;
        border-color: #444;
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
        border-radius: 0 !important;
    }
    .custom-button--link:hover {
        text-decoration: underline !important;
    }
    
    .button-wrapper a {
        border-radius: ${pageState.brand?.components?.button?.borderRadius || '0.5rem'};
    }

    .button-wrapper a:hover {
      background-color: var(--theme-color-hover) !important;
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
        border: 1px solid ${pageState.brand?.components?.input?.borderColor || '#ccc'};
        border-radius: ${pageState.brand?.components?.input?.borderRadius || '0.5rem'};
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
        border-radius: ${pageState.brand?.components?.button?.borderRadius || '30px'};
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

    .de-upload-v2-container {
        background-color: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
        text-align: center;
        font-family: inherit;
    }
    .de-upload-v2-container h4 {
        font-size: 1.25rem;
        font-weight: 600;
        margin-bottom: 1.5rem;
    }
    .de-upload-v2-campaign-selector {
        margin-bottom: 1.5rem;
        text-align: left;
    }
    .de-upload-v2-campaign-selector label {
        display: block;
        font-weight: 500;
        margin-bottom: 0.5rem;
    }
    .de-upload-v2-campaign-selector select {
        width: 100%;
        padding: 0.75rem;
        border-radius: 0.375rem;
        border: 1px solid #d1d5db;
    }
    .de-upload-v2-drop-zone {
        border: 2px dashed #d1d5db;
        border-radius: 0.5rem;
        padding: 2rem;
        cursor: pointer;
        transition: background-color 0.2s ease, border-color 0.2s ease;
        background-color: hsla(var(--primary), 0.05);
    }
    .de-upload-v2-drop-zone.highlight {
        background-color: hsla(var(--primary), 0.15);
        border-color: hsl(var(--primary));
    }
    .de-upload-v2-drop-content .de-upload-v2-icon {
        color: #6b7280;
        margin: 0 auto 0.75rem auto;
    }
    .de-upload-v2-drop-content p {
        color: #6b7280;
        margin: 0;
    }
     .de-upload-v2-drop-content.selected p strong {
        color: #11182c;
    }
    .de-upload-v2-feedback {
        margin-bottom: 1rem;
    }
    .de-upload-v2-progress-container {
        background-color: #e5e7eb;
        border-radius: 9999px;
        height: 0.5rem;
        overflow: hidden;
        margin-bottom: 0.5rem;
    }
    .de-upload-v2-progress-bar {
        background-color: #3b82f6;
        height: 100%;
        width: 0%;
        transition: width 0.3s ease;
    }
    .de-upload-v2-status {
        font-size: 0.875rem;
        min-height: 1.25rem;
    }
    .de-upload-v2-status.info { color: #3b82f6; }
    .de-upload-v2-status.success { color: #16a34a; }
    .de-upload-v2-status.error { color: #dc2626; }

    .de-upload-v2-container .custom-button .button-loader {
       border-top: 3px solid var(--theme-color);
       border-left-color: var(--theme-color);
    }
    
    .ftp-upload-container {
        background-color: #fff;
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        padding: 1.5rem;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    }
    .ftp-upload-header {
        text-align: center;
        margin-bottom: 1.5rem;
    }
    .ftp-upload-header h4 { font-size: 1.25rem; font-weight: 600; }
    .ftp-upload-header p { font-size: 0.875rem; color: #6b7280; margin: 0.25rem 0; }
    .ftp-upload-drop-area {
        display: block;
        border: 2px dashed #d1d5db;
        border-radius: 0.5rem;
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: background-color 0.2s ease, border-color 0.2s ease;
        background-color: hsla(var(--primary), 0.05);
    }
    .ftp-upload-drop-area.active {
        background-color: hsla(var(--primary), 0.15);
        border-color: hsl(var(--primary));
    }
    .ftp-upload-drop-area input[type="file"] { display: none; }
    .ftp-upload-icon { color: #6b7280; margin-bottom: 0.75rem; }
    .ftp-upload-instruction, .ftp-upload-filename { color: #6b7280; }
    .ftp-upload-progress-wrapper {
        height: 8px; background-color: #e5e7eb; border-radius: 4px;
        margin-top: 1rem; display: none; overflow: hidden;
    }
    .ftp-upload-progress-bar {
        height: 100%; width: 0%; background-color: #3b82f6;
        transition: width 0.3s ease;
    }
    .ftp-upload-footer { margin-top: 1rem; display: flex; justify-content: space-between; align-items: center; }
    .ftp-upload-status { font-size: 0.875rem; }


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
        width: 100%;
        border-radius: 0.5rem;
        border: 1px solid #e5e7eb;
    }
    .accordion-item {
        border-bottom: 1px solid #e5e7eb;
    }
    .accordion-item:last-child {
        border-bottom: none;
    }
    .accordion-heading {
      margin: 0;
    }
    .accordion-header {
        background-color: transparent;
        color: inherit;
        cursor: pointer;
        padding: 1rem;
        width: 100%;
        border: none;
        text-align: left;
        outline: none;
        font-size: 1rem;
        font-weight: 500;
        transition: background-color 0.2s ease;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .accordion-header:hover {
        background-color: #f9fafb;
    }
    .accordion-icon {
        width: 1rem;
        height: 1rem;
        transition: transform 0.3s ease;
        background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    }
    .accordion-header[aria-expanded="true"] .accordion-icon {
        transform: rotate(180deg);
    }
    .accordion-content-wrapper {
        display: grid;
        grid-template-rows: 0fr;
        transition: grid-template-rows 0.3s ease-out;
    }
    .accordion-content-wrapper.expanded {
        grid-template-rows: 1fr;
    }
    .accordion-content {
        overflow: hidden;
    }
    .accordion-content > div {
       padding: 1rem;
       font-size: 0.95rem;
       color: #374151;
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
    
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-on-scroll[data-animation="fadeIn"].is-visible { animation-name: fadeIn; }

    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-on-scroll[data-animation="fadeInUp"].is-visible { animation-name: fadeInUp; }

    @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
    .animate-on-scroll[data-animation="fadeInLeft"].is-visible { animation-name: fadeInLeft; }
    
    @keyframes fadeInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
    .animate-on-scroll[data-animation="fadeInRight"].is-visible { animation-name: fadeInRight; }
    
    @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }
    .animation-loop--pulse { animation: pulse 2s infinite ease-in-out; }

    @keyframes bounce { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-15px); } 60% { transform: translateY(-7px); } }
    .animation-loop--bounce { animation: bounce 2s infinite; }

    @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    .animation-loop--rotate { animation: rotate 5s linear infinite; }
    
    @keyframes floating { 0% { transform: translateY(0px); } 50% { transform: translateY(-10px); } 100% { transform: translateY(0px); } }
    .animation-loop--floating { animation: floating 3s ease-in-out infinite; }

    @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-5px); } 50% { transform: translateX(5px); } 75% { transform: translateX(-5px); } 100% { transform: translateX(0); } }
    .animation-loop--shake { animation: shake 0.5s infinite; }

    @keyframes wave { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(10deg); } }
    .animation-loop--wave { animation: wave 2.5s ease-in-out infinite; transform-origin: bottom center; }

    @keyframes swing { 0% { transform: rotate(10deg); } 50% { transform: rotate(-10deg); } 100% { transform: rotate(10deg); } }
    .animation-loop--swing { animation: swing 2s ease-in-out infinite; transform-origin: top center; }


    /* Cookie Banner Styles */
    .cookie-banner {
        position: fixed;
        z-index: 10000;
        transition: all 0.5s ease-in-out;
        opacity: 0;
        visibility: hidden;
    }
    .cookie-banner.visible {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) !important;
    }
    .cookie-banner[data-position="bottom"] { bottom: 0; left: 0; right: 0; transform: translateY(100%); border-radius: 0; }
    .cookie-banner[data-position="bottom-left"] { bottom: 20px; left: 20px; transform: translateY(calc(100% + 20px)); }
    .cookie-banner[data-position="bottom-right"] { bottom: 20px; right: 20px; transform: translateY(calc(100% + 20px)); }

    .cookie-banner[data-layout="bar"] {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
    }
     .cookie-banner[data-layout="card"] {
        display: flex;
        flex-direction: column;
        width: 380px;
        max-width: 90vw;
        padding: 1.5rem;
        border-radius: 0.75rem;
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    }
    .cookie-banner .cookie-banner-content { flex-grow: 1; }
    .cookie-banner .cookie-title { font-size: 1.1em; font-weight: bold; }
    .cookie-banner p { font-size: 0.9em; margin: 0.5em 0 0 0; }
    .cookie-banner a { text-decoration: underline; }
    .cookie-banner .cookie-banner-actions { display: flex; gap: 0.5rem; margin-left: 1rem; }
    .cookie-banner[data-layout="card"] .cookie-banner-actions { margin-left: 0; margin-top: 1rem; }
    
    .cookie-modal-overlay, .cookie-modal {
        position: fixed;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
    }
    .cookie-modal-overlay {
        top: 0; left: 0; width: 100%; height: 100%;
        background-color: rgba(0,0,0,0.6);
        z-index: 10001;
    }
    .cookie-modal {
        top: 50%; left: 50%;
        transform: translate(-50%, -50%) scale(0.95);
        background-color: #fff;
        color: #000;
        border-radius: 8px;
        z-index: 10002;
        width: 500px;
        max-width: 90vw;
        max-height: 80vh;
        display: flex;
        flex-direction: column;
    }
    .cookie-modal.visible, .cookie-modal-overlay.visible {
        opacity: 1;
        visibility: visible;
    }
    .cookie-modal.visible { transform: translate(-50%, -50%) scale(1); }
    .cookie-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid #e5e5e5; }
    .cookie-modal-header h4 { margin: 0; font-size: 1.25rem; }
    .cookie-modal-header button { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
    .cookie-modal-body { padding: 1rem; overflow-y: auto; }
    .cookie-modal-footer { padding: 1rem; border-top: 1px solid #e5e5e5; text-align: right; }
    .cookie-category { margin-bottom: 1rem; }
    .cookie-category-header { display: flex; justify-content: space-between; align-items: center; }
    .cookie-category-header label { font-weight: bold; }
    .cookie-category p { font-size: 0.9em; color: #666; margin-top: 0.25rem; }
    .cookie-category input[type="checkbox"] { transform: scale(1.2); }
    ${styles.customCss || ''}
    ${responsiveStyles}
</style>
</head>
<body data-editor-mode='${isForPreview ? editorMode : 'none'}'>
${!isForPreview ? trackingScripts.body : ''}
${renderLoader(meta, styles.themeColor)}
${bodyContent}
${cookieBannerHtml}
${clientSideScripts}
</body>
</html>
`
}
