

import type { CloudPage, CustomFormField, CustomFormFieldType, PageComponent } from '@/lib/types';

const renderField = (
    id: string, 
    fieldName: string, 
    type: string, 
    dataType: string, 
    placeholder: string,
    conditionalLogic: any,
    prefill: boolean,
    inputStyles: any, // New parameter
    required: boolean = true
  ): string => {
    const conditionalAttrs = conditionalLogic
      ? `data-conditional-on="${conditionalLogic.field}" data-conditional-value="${conditionalLogic.value}"`
      : '';
    
    const prefillValue = prefill ? ` value="%%=v(@${fieldName})=%%"` : '';
  
    return `
      <div class="input-wrapper" id="wrapper-${id}" style="display: ${conditionalLogic ? 'none' : 'block'};" ${conditionalAttrs}>
        <input 
          type="${type}" 
          id="${fieldName}" 
          name="${fieldName}" 
          placeholder="${placeholder}" 
          ${required ? 'required="required"' : ''}
          ${prefillValue}
          style="${getStyleString(inputStyles)}"
        >
        <div class="error-message" id="error-${fieldName.toLowerCase()}">Por favor, preencha este campo.</div>
      </div>
    `;
};

const renderCustomField = (field: CustomFormField, inputStyles: any): string => {
    const { id, name, label, type, required, placeholder = '' } = field;
    const inputId = `custom-field-${id}`;

    if (type === 'checkbox') {
        return `
            <div class="input-wrapper consent">
                <input type="checkbox" id="${inputId}" name="${name}" value="true" ${required ? 'required="required"' : ''}>
                <label for="${inputId}">${label}</label>
                <div class="error-message" id="error-${name.toLowerCase()}">É necessário aceitar para continuar.</div>
            </div>
        `;
    }

    return `
        <div class="input-wrapper">
            <label for="${inputId}">${label}</label>
            <input 
                type="${type}" 
                id="${inputId}" 
                name="${name}" 
                placeholder="${placeholder}" 
                ${required ? 'required="required"' : ''}
                style="${getStyleString(inputStyles)}"
            >
            <div class="error-message" id="error-${name.toLowerCase()}">Por favor, preencha este campo.</div>
        </div>
    `;
};
  
const renderCityDropdown = (citiesString: string = '', conditionalLogic: any, prefill: boolean, inputStyles: any, required: boolean = false): string => {
    const cities = citiesString.split('\n').filter(city => city.trim() !== '');
    const options = cities.map(city => `<option value="${city}">%%[ IF @CIDADE == "${city}" THEN]%%selected%%[ENDIF]%%${city}</option>`).join('');
    const conditionalAttrs = conditionalLogic
      ? `data-conditional-on="${conditionalLogic.field}" data-conditional-value="${conditionalLogic.value}"`
      : '';

    return `
        <div class="input-wrapper" id="wrapper-city" style="display: ${conditionalLogic ? 'none' : 'block'};" ${conditionalAttrs}>
            <select
                id="CIDADE"
                name="CIDADE"
                ${required ? 'required="required"' : ''}
                style="${getStyleString(inputStyles)}"
            >
                <option value="" disabled selected>Selecione sua cidade</option>
                ${options}
            </select>
            <div class="error-message" id="error-cidade">Por favor, seleciona uma cidade.</div>
        </div>
    `;
};

export function renderForm(component: PageComponent, pageState: CloudPage, isForPreview: boolean = false): string {
    const { fields = {}, placeholders = {}, consentText, buttonText, buttonAlign, formAlign, thankYouAlign, submission = {}, thankYouAnimation, buttonProps = {}, customFields = [], inputStyles = {}, buttonStyles = {} } = component.props;
    const { meta, brand } = pageState;
    const styleString = getStyleString(component.props.styles);
    
    const finalInputStyles = {
        borderRadius: brand?.components?.input?.borderRadius,
        backgroundColor: brand?.components?.input?.backgroundColor,
        borderColor: brand?.components?.input?.borderColor,
        color: brand?.components?.input?.textColor,
        ...inputStyles
    };

    const finalButtonStyles = {
        borderRadius: brand?.components?.button?.borderRadius,
        ...buttonProps,
        ...buttonStyles
    };
    
    const animationUrls = {
        confetti: 'https://assets10.lottiefiles.com/packages/lf20_u4yrau.json',
    };
    const animationUrl = thankYouAnimation && animationUrls[thankYouAnimation as keyof typeof animationUrls];
    
    const lucideIconSvgs: Record<string, string> = {
        none: '',
        send: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>',
        'arrow-right': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>',
        'check-circle': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>',
        'plus': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
        'download': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>',
        'star': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
        'zap': '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2z"/></svg>',
    };
    
    const iconHtml = finalButtonStyles.icon && lucideIconSvgs[finalButtonStyles.icon] ? lucideIconSvgs[finalButtonStyles.icon] : '';

    const buttonContent = finalButtonStyles.iconPosition === 'right' 
        ? `<span>${buttonText || 'Finalizar'}</span>${iconHtml}`
        : `${iconHtml}<span>${buttonText || 'Finalizar'}</span>`;
    
    const action = submission?.action;
    let redirectUrl = "%%=RequestParameter('PAGEURL')=%%";
    if (action) {
      if (action.type === 'URL' && action.url) {
        redirectUrl = action.url;
      } else if (action.type === 'PAGE' && action.pageId) {
        redirectUrl = `%%=CloudPagesURL(${action.pageId})=%%`;
      }
    }

    const formHtml = `
        <div id="form-wrapper-${component.id}" class="form-container" style="text-align: ${formAlign || 'left'}; ${styleString}">
            <form id="smartcapture-form-${component.id}" method="post" action="%%=RequestParameter('PAGEURL')=%%">
                 <input type="hidden" name="__de" value="${meta.dataExtensionKey}">
                 <input type="hidden" name="__de_method" value="${meta.dataExtensionTargetMethod || 'key'}">
                 <input type="hidden" name="__successUrl" value="${redirectUrl}">
                 <input type="hidden" name="__isFormSubmission" value="true">

                 <div class="row">
                  ${fields.name?.enabled ? renderField('name', 'NOME', 'text', 'Text', placeholders.name || 'Nome', fields.name.conditional, !!fields.name.prefillFromUrl, finalInputStyles) : ''}
                  ${fields.email?.enabled ? renderField('email', 'EMAIL', 'email', 'EmailAddress', placeholders.email || 'Email', fields.email.conditional, !!fields.email.prefillFromUrl, finalInputStyles) : ''}
                 </div>
                 <div class="row">
                  ${fields.phone?.enabled ? renderField('phone', 'TELEFONE', 'text', 'Phone', placeholders.phone || 'Telefone - Ex:(11) 9 9999-9999', fields.phone.conditional, !!fields.phone.prefillFromUrl, finalInputStyles) : ''}
                  ${fields.cpf?.enabled ? renderField('cpf', 'CPF', 'text', 'Text', placeholders.cpf || 'CPF', fields.cpf.conditional, !!fields.cpf.prefillFromUrl, finalInputStyles) : ''}
                 </div>
                 <div class="row">
                  ${fields.birthdate?.enabled ? renderField('birthdate', 'DATANASCIMENTO', 'date', 'Date', placeholders.birthdate || 'Data de Nascimento', fields.birthdate.conditional, !!fields.birthdate.prefillFromUrl, finalInputStyles, false) : ''}
                  ${fields.city?.enabled ? renderCityDropdown(component.props.cities, fields.city.conditional, !!fields.city.prefillFromUrl, finalInputStyles, false) : ''}
                 </div>
                 
                 <div class="custom-fields-wrapper">
                  ${customFields.map((field: CustomFormField) => renderCustomField(field, finalInputStyles)).join('\n')}
                 </div>
           
                ${fields.optin?.enabled ? `
                <div class="consent" id="wrapper-optin" style="display: ${fields.optin.conditional ? 'none' : 'flex'}" ${fields.optin.conditional ? `data-conditional-on="${fields.optin.conditional.field}" data-conditional-value="${fields.optin.conditional.value}"` : ''}>
                    <input type="checkbox" id="OPTIN" name="OPTIN" value="on" required="required">
                    <label for="OPTIN">
                        ${consentText || 'Quero receber novidades e promoções...'}
                    </label>
                  <div class="error-message" id="error-consent">É necessário aceitar para continuar.</div>
                </div>
                ` : ''}
                <div class="form-submit-wrapper" style="text-align: ${buttonAlign || 'center'};">
                    <button type="submit"
                      class="form-submit-button"
                      style="
                          background-color: ${finalButtonStyles.bgColor || 'var(--theme-color)'};
                          color: ${finalButtonStyles.textColor || '#FFFFFF'};
                          border-radius: ${finalButtonStyles.borderRadius || '30px'};
                      "
                      onmouseover="this.style.backgroundColor='${finalButtonStyles.hoverBgColor || 'var(--theme-color-hover)'}'"
                      onmouseout="this.style.backgroundColor='${finalButtonStyles.bgColor || 'var(--theme-color)'}'"
                      ${finalButtonStyles.enableWhenValid ? 'disabled' : ''}
                    >
                        ${buttonContent}
                    </button>
                </div>
            </form>
        </div>
    `;

    if (isForPreview) {
        return formHtml;
    }

    return `
        %%[ Set @thankYouMessage = "${submission?.message || 'Obrigado!'}" ]%%
        %%[ IF @showThanks != "true" THEN ]%%
        ${formHtml}
        %%[ ELSE ]%%
            <div class="thank-you-message" style="text-align: ${thankYouAlign || 'center'};">
                ${animationUrl ? `<lottie-player id="lottie-animation-${component.id}" src="${animationUrl}" style="width: 250px; height: 250px; margin: 0 auto;"></lottie-player>` : ''}
                <div class="thank-you-text">%%=TreatAsContent(@thankYouMessage)=%%</div>
            </div>
        %%[ ENDIF ]%%
    `;
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
