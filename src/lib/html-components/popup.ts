

import type { PageComponent } from '@/lib/types';

export function renderPopUp(component: PageComponent, childrenHtml: string): string {
    const { 
        trigger = 'delay',
        delay = 3,
        scrollPercentage = 50,
        styles = {},
        overlayStyles = {},
        closeOnOutsideClick = true,
        preventBodyScroll = true,
    } = component.props;
    const popupId = `popup-container-${component.id}`;

    const popupStyle = `
        width: ${styles.width || '500px'};
        background-color: ${styles.backgroundColor || '#FFFFFF'};
        padding: ${styles.padding || '1.5rem'};
        border-radius: ${styles.borderRadius || '0.75rem'};
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0.95);
        opacity: 0;
        visibility: hidden;
        z-index: 1001;
        transition: opacity 0.3s ease, transform 0.3s ease, visibility 0.3s ease;
        max-width: 90%;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
    `;

    const overlayStyle = `
        background-color: ${overlayStyles.backgroundColor || 'rgba(0, 0, 0, 0.6)'};
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
    `;

    const closeButtonStyle = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #888;
        line-height: 1;
    `;
    
    const contentStyle = `flex-grow: 1; overflow-y: auto;`;

    return `
        <div id="${popupId}-overlay" style="${overlayStyle}"></div>
        <div id="${popupId}" style="${popupStyle}">
            <button id="${popupId}-close" style="${closeButtonStyle}">&times;</button>
            <div class="popup-content-inner" style="${contentStyle}">
                ${childrenHtml}
            </div>
        </div>
        <script>
            (function() {
                const popup = document.getElementById('${popupId}');
                const overlay = document.getElementById('${popupId}-overlay');
                const closeBtn = document.getElementById('${popupId}-close');
                if (!popup || !overlay || !closeBtn) return;
                
                const storageKey = 'popup_shown_${component.id}';
                let isOpened = false;

                function openPopup() {
                    if (isOpened || sessionStorage.getItem(storageKey)) return;
                    popup.style.visibility = 'visible';
                    popup.style.opacity = '1';
                    popup.style.transform = 'translate(-50%, -50%) scale(1)';
                    overlay.style.visibility = 'visible';
                    overlay.style.opacity = '1';
                    if (${preventBodyScroll}) {
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
                        if (${preventBodyScroll}) {
                            document.body.style.overflow = '';
                        }
                    }, 300);
                }
                window.closePopup = closePopup;

                closeBtn.addEventListener('click', closePopup);
                if (${closeOnOutsideClick}) {
                    overlay.addEventListener('click', closePopup);
                }

                if ('${trigger}' === 'delay') {
                    setTimeout(openPopup, ${delay} * 1000);
                } else if ('${trigger}' === 'entry') {
                    openPopup();
                } else if ('${trigger}' === 'scroll') {
                    const handleScroll = () => {
                        const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
                        if (scrollPercent >= ${scrollPercentage}) {
                            openPopup();
                            window.removeEventListener('scroll', handleScroll);
                        }
                    };
                    window.addEventListener('scroll', handleScroll, { passive: true });
                } else if ('${trigger}' === 'exit_intent') {
                    document.addEventListener('mouseleave', function(e) {
                        if (e.clientY < 0) {
                            openPopup();
                        }
                    }, { once: true });
                }
            })();
        </script>
    `;
}
