

import type { CloudPage, PageComponent, ComponentType } from './types';


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
                return `<div class="columns-container" style="--column-count: ${columnCount}">${renderSingleComponent(component, pageState, isForPreview, columnsHtml)}</div>`;
            }
            return `<div class="component-wrapper">${renderComponent(component, pageState, isForPreview)}</div>`;
        })
        .join('\n');
}

const renderField = (
  id: string, 
  name: string, 
  type: string, 
  dataType: string, 
  placeholder: string,
  required: boolean = true
  ): string => {
  // Use the name for the id as well, as it's what we send to the DE
  return `
    <div class="input-wrapper">
      <input 
        type="${type}" 
        id="${name}" 
        name="${name}" 
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
                ${required ? 'required="required"' : ''}
            >
                <option value="" disabled selected>Selecione sua cidade</option>
                ${options}
            </select>
            <div class="error-message" id="error-cidade">Por favor, seleciona uma cidade.</div>
        </div>
    `;
};

const getStyleString = (styles: any = {}): string => {
    return Object.entries(styles)
      .map(([key, value]) => {
        if (!value) return '';
        const cssKey = key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
        return `${cssKey}: ${value};`;
      })
      .join(' ');
};


const renderComponent = (component: PageComponent, pageState: CloudPage, isForPreview: boolean): string => {
  if (component.abTestEnabled) {
    const variantB = (component.abTestVariants && component.abTestVariants[0]) || {};
    const propsA = component.props;
    const propsB = { ...propsA, ...variantB }; // Variant B props override Variant A

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
  const styles = component.props.styles || {};
  const styleString = getStyleString(styles);
  const editableAttrs = (propName: string) => isForPreview ? `contenteditable="true" data-component-id="${component.id}" data-prop-name="${propName}"` : '';


  switch (component.type) {
    case 'Header':
      return `
        <div class="logo" style="${styleString}">
          <img src="${component.props.logoUrl || 'https://i.postimg.cc/Z5TpsSsB/natura-logo-branco.png'}" alt="Logo">
        </div>`;
    case 'Banner':
        return `
        <div class="banner" style="${styleString}">
            <img src="${component.props.imageUrl || 'https://images.rede.natura.net/html/crm/campanha/20250819/44760-banner-topo.png'}" alt="Banner">
        </div>`;
    case 'Title':
        return `<h1 style="${styleString}" ${editableAttrs('text')}>${component.props.text || 'Título Principal'}</h1>`;
    case 'Subtitle':
        return `<h2 style="${styleString}" ${editableAttrs('text')}>${component.props.text || 'Subtítulo'}</h2>`;
    case 'Paragraph':
        return `<div style="white-space: pre-wrap; ${styleString}" ${editableAttrs('text')}>${component.props.text || 'Este é um parágrafo. Edite o texto no painel de configurações.'}</div>`;
    case 'Divider':
        return `<hr style="border-top: ${component.props.thickness || 1}px ${component.props.style || 'solid'} ${component.props.color || '#cccccc'}; margin: ${component.props.margin || 20}px 0; ${styleString}" />`;
    case 'Image':
        return `
            <div style="text-align: center; ${styleString}">
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
        return `<div style="height: ${component.props.height || 20}px; ${styleString}"></div>`;
    case 'Button':
         return `<div style="text-align: ${component.props.align || 'center'}; ${styleString}"><a href="${component.props.href || '#'}" target="_blank" class="custom-button">${component.props.text || 'Clique Aqui'}</a></div>`;
    case 'Accordion': {
        const items = component.props.items || [];
        const itemsHtml = items
          .map(
            (item: { id: string; title: string; content: string }) => `
          <div class="accordion-item">
            <button class="accordion-header" aria-expanded="false" aria-controls="content-${item.id}">
              ${item.title}
              <span class="accordion-icon"></span>
            </button>
            <div id="content-${item.id}" class="accordion-content">
              ${item.content}
            </div>
          </div>`
          )
          .join('');
        return `<div class="accordion-container" style="${styleString}">${itemsHtml}</div>`;
    }
    case 'Tabs': {
        const items = component.props.items || [];
        const tabsId = `tabs-${component.id}`;
        const triggersHtml = items
          .map(
            (item: { id: string; title: string }, index: number) => `
          <button class="tab-trigger" data-tab="${item.id}" role="tab" aria-controls="panel-${item.id}" aria-selected="${index === 0 ? 'true' : 'false'}">
            ${item.title}
          </button>`
          )
          .join('');
        const panelsHtml = items
          .map(
            (item: { id: string; content: string }, index: number) => `
          <div id="panel-${item.id}" class="tab-panel" role="tabpanel" ${index !== 0 ? 'hidden' : ''}>
            ${item.content}
          </div>`
          )
          .join('');
        return `
          <div class="tabs-container" id="${tabsId}" style="${styleString}">
            <div class="tab-list" role="tablist">${triggersHtml}</div>
            ${panelsHtml}
          </div>`;
    }
    case 'Voting': {
        const { question, options = [] } = component.props;
        const votingId = `voting-${component.id}`;

        const optionsHtml = options.map((opt: { id: string; text: string; }) => `
            <button class="voting-option" data-option-id="${opt.id}">${opt.text}</button>
        `).join('');

        const resultsHtml = options.map((opt: { id: string; text: string; }) => `
            <div class="voting-result">
                <div class="result-label">${opt.text}</div>
                <div class="result-bar-container">
                    <div class="result-bar" id="result-bar-${opt.id}" style="width: 0%;"></div>
                </div>
                <div class="result-percentage" id="result-percentage-${opt.id}">0%</div>
            </div>
        `).join('');

        return `
            <div id="${votingId}" class="voting-container" style="${styleString}">
                <h3 class="voting-question">${question || 'Sua pergunta aqui'}</h3>
                <div class="voting-options">${optionsHtml}</div>
                <div class="voting-results" style="display: none;">${resultsHtml}</div>
            </div>
            <script>
                (function() {
                    const votingContainer = document.getElementById('${votingId}');
                    if (!votingContainer) return;

                    const optionsContainer = votingContainer.querySelector('.voting-options');
                    const resultsContainer = votingContainer.querySelector('.voting-results');
                    const storageKey = 'voting_data_${votingId}';
                    const hasVotedKey = 'has_voted_${votingId}';

                    let votes = JSON.parse(localStorage.getItem(storageKey)) || {};
                    const hasVoted = localStorage.getItem(hasVotedKey) === 'true';

                    function updateResults() {
                        const totalVotes = Object.values(votes).reduce((sum, count) => sum + count, 0);
                        if (totalVotes === 0) return;

                        Object.keys(votes).forEach(optionId => {
                            const voteCount = votes[optionId] || 0;
                            const percentage = ((voteCount / totalVotes) * 100).toFixed(1);
                            const bar = resultsContainer.querySelector(\`#result-bar-\${optionId}\`);
                            const percentageEl = resultsContainer.querySelector(\`#result-percentage-\${optionId}\`);

                            if (bar) bar.style.width = \`\${percentage}%\`;
                            if (percentageEl) percentageEl.textContent = \`\${percentage}%\`;
                        });
                    }

                    function showResults() {
                        optionsContainer.style.display = 'none';
                        resultsContainer.style.display = 'block';
                        updateResults();
                    }

                    if (hasVoted) {
                        showResults();
                    }

                    optionsContainer.addEventListener('click', function(event) {
                        if (event.target.classList.contains('voting-option')) {
                            if (localStorage.getItem(hasVotedKey) === 'true') {
                                alert('Você já votou.');
                                return;
                            }
                            
                            const optionId = event.target.dataset.optionId;
                            votes[optionId] = (votes[optionId] || 0) + 1;
                            
                            localStorage.setItem(storageKey, JSON.stringify(votes));
                            localStorage.setItem(hasVotedKey, 'true');
                            
                            showResults();
                        }
                    });
                })();
            </script>
        `;
    }
    case 'Stripe': {
        const { text, isClosable, backgroundColor, textColor, linkUrl } = component.props;
        const stripeId = `stripe-${component.id}`;

        const closeButton = isClosable ? `<button id="close-${stripeId}" class="stripe-close-btn">&times;</button>` : '';
        const content = linkUrl ? `<a href="${linkUrl}" target="_blank" style="color: inherit; text-decoration: none;">${text}</a>` : text;

        return `
            <div id="${stripeId}" class="stripe-container" style="background-color: ${backgroundColor}; color: ${textColor};">
                <p>${content}</p>
                ${closeButton}
            </div>
            <script>
                (function() {
                    const stripe = document.getElementById('${stripeId}');
                    if (!stripe) return;
                    const closeBtn = document.getElementById('close-${stripeId}');
                    const storageKey = 'stripe_closed_${stripeId}';

                    if (localStorage.getItem(storageKey) === 'true') {
                        stripe.style.display = 'none';
                    } else {
                        stripe.style.display = 'flex';
                    }

                    if (closeBtn) {
                        closeBtn.addEventListener('click', function() {
                            stripe.style.display = 'none';
                            localStorage.setItem(storageKey, 'true');
                        });
                    }
                })();
            </script>
        `;
    }
    case 'NPS': {
        const { question, type = 'numeric', lowLabel, highLabel, thankYouMessage } = component.props;
        const npsId = `nps-${component.id}`;

        let optionsHtml = '';
        if (type === 'numeric') {
            for (let i = 0; i <= 10; i++) {
                optionsHtml += `<button class="nps-option nps-numeric" data-score="${i}">${i}</button>`;
            }
        } else { // faces
            const faces = ['😡', '😠', '😑', '😐', '🙂', '😄', '😁'];
            optionsHtml = faces.map((face, i) => `<button class="nps-option nps-face" data-score="${i}">${face}</button>`).join('');
        }

        return `
            <div id="${npsId}" class="nps-container" style="${styleString}">
                <div class="nps-content">
                    <p class="nps-question">${question}</p>
                    <div class="nps-options-wrapper">${optionsHtml}</div>
                    <div class="nps-labels">
                        <span>${lowLabel}</span>
                        <span>${highLabel}</span>
                    </div>
                </div>
                <div class="nps-thanks" style="display: none;">
                    <p>${thankYouMessage}</p>
                </div>
            </div>
            <script defer src="https://storage.googleapis.com/cloud-page-forge-scripts/nps-handler.js" 
                    data-nps-id="${npsId}"
                    data-de-key="${pageState.meta.dataExtensionKey || ''}">
            </script>
        `;
    }
    case 'Map': {
        const { embedUrl } = component.props;
        if (!embedUrl) {
            return '<p>URL de incorporação do mapa não fornecida.</p>';
        }
        return `
            <div class="map-container" style="${styleString}">
                <iframe
                    src="${embedUrl}"
                    width="100%"
                    height="450"
                    style="border:0;"
                    allowfullscreen=""
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe>
            </div>
        `;
    }
    case 'SocialIcons': {
        const { links = {}, styles: iconStyles = {} } = component.props;
        const { align = 'center', iconSize = '24px' } = iconStyles;
        
        const socialSvgs: Record<string, string> = {
            facebook: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>',
            instagram: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>',
            twitter: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 1.4 3.3 4.9 3.3 4.9-6.1 1.2-18 5-18 5s-2.7-7.1 2.5-11.2c-1.4 1.3-2.8 2.5-2.8 2.5s-2.8-7.4 9.1-3.8c.9 2.1 3.3 2.6 3.3 2.6Z"/></svg>',
            linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>',
            youtube: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10C2.5 4.24 4.24 2.5 7 2.5h10c2.76 0 4.5 1.74 4.5 4.5v10c0 2.76-1.74 4.5-4.5 4.5H7c-2.76 0-4.5-1.74-4.5-4.5Z"/><path d="m10 15 5-3-5-3z"/></svg>',
            tiktok: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tiktok"><path d="M12 12a4 4 0 1 0 4 4V4a5 5 0 1 0-5 5h4"/></svg>',
            pinterest: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pinterest"><path d="M12 12c-2.25 0-4.43.9-6.13 2.45-.5.4-.44 1.25.08 1.65l2.29 1.78c.45.35 1.1.2 1.45-.25.5-.63.85-1.4 1.03-2.2.14-.64.04-1.34-.3-1.96-.3-.54.21-1.2.78-1.22.63-.03 1.2.3 1.28.98.08.7-.3 1.4-.7 1.9-.44.55-.22 1.34.3 1.6l2.32 1.83c.53.41 1.28.2 1.68-.25 2.4-2.7 3.1-6.4 2.2-9.6-1-3.5-3.8-6.1-7.2-6.5-4.5-.4-8.4 2.1-9.4 6.2-.9 3.5.7 7.5 4.1 9.4 1.4.7 2.9 1 4.4 1.1"/></svg>',
            snapchat: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-snapchat"><path d="M15 17a8 8 0 1 0-8.5-8H12v10Z"/><path d="M12 12c-2-2-2-4-2-4-2 0-2 2-2 4s2 4 4 4 2-2 2-4-2-4-2-4Z"/></svg>',
        };

        const iconsHtml = Object.keys(links)
            .filter(key => links[key])
            .map(key => `
                <a href="${links[key]}" target="_blank" class="social-icon" aria-label="${key}">
                    ${socialSvgs[key as keyof typeof socialSvgs] || ''}
                </a>
            `).join('');

        return `<div class="social-icons-container" style="text-align: ${align}; ${styleString}" data-icon-size="${iconSize}">${iconsHtml}</div>`;
    }
    case 'Columns':
        return `<div class="columns-container" style="--column-count: ${component.props.columnCount || 2}; ${styleString}">${childrenHtml}</div>`;
    case 'Form': {
      const { fields = {}, placeholders = {}, consentText, buttonText, buttonAlign, cities, thankYouMessage } = component.props;
      const { meta } = pageState;
      const thankYouHtml = `<div id="thank-you-message-${component.id}" class="thank-you-message" style="display:none;">${thankYouMessage}</div>`;
      
      const formHtml = `
        <div id="form-wrapper-${component.id}" class="form-container" style="${styleString}">
            <form id="smartcapture-form-${component.id}" method="post" action="%%=RequestParameter('PAGEURL')=%%">
                 <input type="hidden" name="__de" value="${meta.dataExtensionKey}">
                 <input type="hidden" name="__de_method" value="${meta.dataExtensionTargetMethod || 'key'}">
                 <input type="hidden" name="__successUrl" value="${meta.redirectUrl}">

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
                    <input type="checkbox" id="OPTIN" name="OPTIN" value="on" required="required">
                    <label for="OPTIN">
                        ${consentText || 'Quero receber novidades e promoções...'}
                    </label>
                  <div class="error-message" id="error-consent">É necessário aceitar para continuar.</div>
                </div>
                ` : ''}
                <div style="text-align: ${buttonAlign || 'center'};">
                    <button type="submit">${buttonText || 'Finalizar'}</button>
                </div>
            </form>
            ${thankYouHtml}
        </div>
      `;
      return formHtml;
    }
    case 'Footer':
      return `
      <footer style="${styleString}">
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

const getAmpscriptProcessingBlock = (pageState: CloudPage): string => {
    const { meta, components } = pageState;
    const formComponent = components.find(c => c.type === 'Form');
    const npsComponent = components.find(c => c.type === 'NPS');

    if (!formComponent && !npsComponent) return '';

    const deIdentifier = meta.dataExtensionKey || '';
    const deMethod = meta.dataExtensionTargetMethod || 'key';
    
    // Dynamically build the list of fields to retrieve from the request
    let fieldRetrievalScript = '';
    let rowDataPopulation = '';

    if (formComponent) {
      const formFields = Object.keys(formComponent.props.fields || {}).filter(f => formComponent.props.fields[f]);
      formFields.forEach(fieldName => {
        const deColumnName = fieldName === 'birthdate' ? 'DATANASCIMENTO' : fieldName.toUpperCase();
        fieldRetrievalScript += `var ${fieldName} = Request.GetFormField("${deColumnName}");\n            `;
        rowDataPopulation += `if(typeof ${fieldName} !== 'undefined' && ${fieldName} !== null) rowData["${deColumnName}"] = ${fieldName};\n                        `;
      });
    }

    if (npsComponent) {
        fieldRetrievalScript += `var nps_score = Request.GetFormField("NPS_SCORE");\n            var nps_date = Now();\n            `;
        rowDataPopulation += 'if(typeof nps_score !== "undefined" && nps_score !== null) rowData["NPS_SCORE"] = nps_score;\n                    ';
        rowDataPopulation += 'if(typeof nps_date !== "undefined" && nps_date !== null) rowData["NPS_DATE"] = nps_date;\n                    ';
    }


    // This script block will be generated to handle form submission.
    return `
<script runat="server">
    Platform.Load("Core", "1.1.1");
    var debug = false;

    try {
        if (Request.Method == "POST") {
            var deTarget = "${deIdentifier}";
            var deMethod = "${deMethod}";
            var redirectUrl = Request.GetFormField("__successUrl");
            var showThanks = false;

            ${fieldRetrievalScript}
            
            if (deTarget) {
                var de;
                if (deMethod == "name") {
                    var deList = DataExtension.Retrieve({Property:"Name",SimpleOperator:"equals",Value:deTarget});
                    if (deList && deList.length > 0) {
                        de = DataExtension.Init(deList[0].CustomerKey);
                    }
                } else {
                    de = DataExtension.Init(deTarget);
                }

                if (de) {
                    var rowData = {};
                    var lookupColumn = "";
                    var lookupValue = "";

                    // Populate rowData object dynamically
                    ${rowDataPopulation}
                    
                    // Handle Optin specifically
                    if (rowData["OPTIN"] == "on") {
                       rowData["OPTIN"] = "True";
                    } else if (rowData["OPTIN"] == "" || rowData["OPTIN"] == null) {
                       rowData["OPTIN"] = "False";
                    }


                    if (rowData["EMAIL"]) {
                        lookupColumn = "EMAIL";
                        lookupValue = rowData["EMAIL"];
                    }
                    
                    if (lookupColumn && lookupValue) {
                       var existingRows = de.Rows.Lookup([lookupColumn], [lookupValue]);
                       if (existingRows && existingRows.length > 0) {
                           de.Rows.Update(rowData, [lookupColumn], [lookupValue]);
                       } else {
                           de.Rows.Add(rowData);
                       }
                    } else {
                        // If no email to lookup, just add the row
                        de.Rows.Add(rowData);
                    }

                    showThanks = true;
                }
            }

            if (showThanks && redirectUrl && !debug) {
                Platform.Response.Redirect(redirectUrl);
            } else if (showThanks) {
                Variable.SetValue("@showThanks", "true");
            }
        }
    } catch (e) {
        if (debug) {
            Write("<br><b>--- ERRO ---</b><br>" + Stringify(e));
        }
    }
</script>
`;
}

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
          /* You might want to set a cookie here for persistent login */
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

        return { ssjs: '', amscript, body };
    }

    return { ssjs: '', amscript: 'VAR @isAuthenticated\nSET @isAuthenticated = true', body: '' };
}

const getClientSideScripts = () => {
    return `
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
      const requiredInputs = form.querySelectorAll('input[required], select[required]');

      requiredInputs.forEach(input => {
          const errorId = 'error-' + (input.name || input.id).toLowerCase();
          const error = form.querySelector('#' + errorId);
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
      return valid;
    }

    function setupSubmitButton() {
        document.querySelectorAll('form[id^="smartcapture-form-"]').forEach(form => {
            const submitButton = form.querySelector('button[type="submit"]');
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
            
            form.addEventListener('submit', function(e) {
                if (!validateForm(form)) {
                    e.preventDefault();
                } else {
                   if (submitButton) {
                     submitButton.disabled = true;
                     submitButton.querySelector('.button-text').style.opacity = '0';
                     submitButton.querySelector('.button-loader').style.display = 'block';
                   }
                }
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        const loader = document.getElementById('loader');
        if (loader) {
            setTimeout(function () {
                loader.style.display = 'none';
            }, 2000);
        }

        if ("%%=v(@showThanks)=%%" == "true" && document.querySelector('.form-container')) {
            var formId = document.querySelector('.form-container').id.replace('form-wrapper-', '');
            var formWrapper = document.getElementById('form-wrapper-' + formId);
            var thanksMessage = document.getElementById('thank-you-message-' + formId);
            if(formWrapper) formWrapper.style.display = 'none';
            if(thanksMessage) thanksMessage.style.display = 'block';
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
        
        setupSubmitButton();
        setupAccordions();
        setupTabs();
        setSocialIconStyles();
    });
</script>
    `;
}

export const generateHtml = (pageState: CloudPage, isForPreview: boolean = false): string => {
  const { styles, components, meta, cookieBanner } = pageState;
  
  const fullWidthTypes: ComponentType[] = ['Header', 'Banner', 'Footer', 'Stripe'];
  
  const security = getSecurityScripts(pageState);
  
  // Only include the SSJS processing block if it's the final code, not for the preview.
  const ssjsBlock = isForPreview ? '' : getAmpscriptProcessingBlock(pageState);
  const clientSideScripts = getClientSideScripts();
  
  const stripeComponents = components.filter(c => c.type === 'Stripe' && c.parentId === null).map(c => renderComponent(c, pageState, isForPreview)).join('\n');
  const headerComponent = components.find(c => c.type === 'Header' && c.parentId === null);
  const bannerComponent = components.find(c => c.type === 'Banner' && c.parentId === null);
  const footerComponent = components.find(c => c.type === 'Footer' && c.parentId === null);
  const trackingScripts = getTrackingScripts(meta.tracking);
  const cookieBannerHtml = getCookieBanner(cookieBanner, styles.themeColor);
  const googleFont = styles.fontFamily || 'Roboto';
  
  const mainComponents = renderComponents(components.filter(c => !fullWidthTypes.includes(c.type) && c.parentId === null), components, pageState, isForPreview);
  
  return `%%[ 
    VAR @showThanks
    SET @showThanks = "false" 
    ${meta.customAmpscript || ''}
    ${security.amscript}
]%%${ssjsBlock}<!DOCTYPE html>
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
${trackingScripts}
<style>
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
        margin-top: 20px;
        margin-bottom: 20px;
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
    
    .content-wrapper .component-wrapper > * {
        text-align: left;
        margin-top: 1em;
        margin-bottom: 1em;
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
        padding-top: 56.25%; /* 16:9 Aspect Ratio */
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
      background-color: ${styles.themeColor};
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
      background-color: ${styles.themeColorHover};
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
    

    .form-container input,
    .form-container select,
    .form-container button {
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
    
    .thank-you-message {
      text-align: center;
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

    /* Accordion Styles */
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

    /* Tabs Styles */
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
        border-bottom-color: ${styles.themeColor};
        color: ${styles.themeColor};
        font-weight: bold;
    }
    .tab-panel {
        padding: 20px;
        text-align: left;
    }

    /* Voting Component Styles */
    .voting-container {
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        padding: 20px;
    }
    .voting-question {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 15px;
        text-align: center;
    }
    .voting-options {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    .voting-option {
        width: 100%;
        padding: 12px;
        border: 1px solid ${styles.themeColor};
        color: ${styles.themeColor};
        background-color: transparent;
        border-radius: 5px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 1em;
    }
    .voting-option:hover {
        background-color: ${styles.themeColor};
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
        background-color: ${styles.themeColor};
        width: 0%;
        border-radius: 5px;
        transition: width 0.5s ease;
    }
    .result-percentage {
        font-size: 0.9em;
        font-weight: bold;
        width: 50px;
    }
    /* Stripe Styles */
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
    /* NPS Component Styles */
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
    }
    .nps-option:hover {
        background-color: ${styles.themeColor};
        color: white;
        border-color: ${styles.themeColor};
    }
    .nps-option.selected {
        background-color: ${styles.themeColor};
        color: white;
        font-weight: bold;
        transform: scale(1.1);
    }
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
        color: ${styles.themeColor};
    }
    /* Map Component Styles */
    .map-container {
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #e0e0e0;
    }
    /* Social Icons Styles */
    .social-icons-container {
        display: flex;
        gap: 15px;
        justify-content: center; /* Default, can be overridden by inline style */
    }
    .social-icon {
        display: inline-block;
        color: #333;
        transition: transform 0.2s ease;
    }
    .social-icon:hover {
        transform: scale(1.1);
        color: ${styles.themeColor};
    }
    .social-icon svg {
        width: 24px; /* Default size */
        height: 24px;
    }

    /* Columns Styles */
    .columns-container {
        display: flex;
        gap: 20px;
        width: 100%;
    }
    .column {
        flex: 1;
        min-width: 0;
    }

    /* Password Protection Styles */
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
        background-color: ${styles.themeColor};
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


    /* Custom CSS */
    ${styles.customCss || ''}
</style>
${clientSideScripts}
</head>
<body>
  %%[ IF @isAuthenticated == true THEN ]%%
  <div id="loader">
    <img src="${meta.loaderImageUrl}" alt="Loader">
  </div>
  ${stripeComponents}
  <div class="container" style="display: block;">
    ${headerComponent ? renderComponent(headerComponent, pageState, isForPreview) : ''}
    ${bannerComponent ? renderComponent(bannerComponent, pageState, isForPreview) : ''}
    <div class="content-wrapper">
      ${mainComponents}
    </div>
    ${footerComponent ? renderComponent(footerComponent, pageState, isForPreview) : ''}
  </div>

  ${cookieBannerHtml}
  %%[ ELSE ]%%
  ${security.body}
  %%[ ENDIF ]%%
</body>
</html>
`
    

    