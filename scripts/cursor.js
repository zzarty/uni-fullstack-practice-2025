document.addEventListener('DOMContentLoaded', () => {
    const isTouchDevice = (('ontouchstart' in window) || (navigator.maxTouchPoints > 0)) && 
                         window.matchMedia("(pointer: coarse)").matches;
    
    if (isTouchDevice) {
        return;
    }

    function wrapLinkText() {
        const links = document.querySelectorAll('a');
        links.forEach(link => {
            if (link.querySelector('.link__text')) return;
            
            const textNodes = Array.from(link.childNodes).filter(node => node.nodeType === Node.TEXT_NODE);
            
            if (textNodes.length > 0 && link.children.length === 0) {
                const wrapper = document.createElement('span');
                wrapper.className = 'link__text';
                wrapper.textContent = link.textContent;
                link.textContent = '';
                link.appendChild(wrapper);
            }
        });
    }

    wrapLinkText();

    const linkObserver = new MutationObserver(() => {
        wrapLinkText();
    });

    linkObserver.observe(document.body, {
        childList: true,
        subtree: true
    });

    const cursor = document.createElement('div');
    cursor.id = 'customCursor';
    cursor.className = 'cursor';
    cursor.style.opacity = '0';
    document.body.appendChild(cursor);

    let mouseX = 0;
    let mouseY = 0;
    let cursorX = 0;
    let cursorY = 0;
    let currentElement = null;
    let currentType = 'default';
    let lastMouseX = 0;
    let lastMouseY = 0;
    let mouseMovedRecently = false;
    let currentOffsetX = 10;
    let currentOffsetY = 10;
    let hasMovedOnce = false;

    function checkElementUnderCursor() {
        const element = document.elementFromPoint(mouseX, mouseY);
        
        const isInput = element?.matches('input[type="text"], input[type="email"], input[type="password"], textarea');
        if (isInput) {
            if (currentType !== 'input') {
                currentType = 'input';
                currentElement = null;
                cursor.className = 'cursor cursor--text';
            }
            return;
        }

        const navElement = element?.closest('.nav__link, .nav__logo-link, .nav-bottom__link, .pie-menu__item');
        if (navElement) {
            if (currentElement !== navElement || currentType !== 'nav') {
                currentElement = navElement;
                currentType = 'nav';
                cursor.className = 'cursor cursor--arrow';
            }
            return;
        }

        const button = element?.closest('button, .button, .button--primary, .button--submit, input[type="submit"]');
        if (button) {
            if (currentElement !== button || currentType !== 'button') {
                currentElement = button;
                currentType = 'button';
                cursor.className = 'cursor cursor--arrow';
            }
            return;
        }

        let targetElement = null;
        
        if (element?.classList?.contains('link__text')) {
            targetElement = element;
        } else if (element?.closest('.link__text')) {
            targetElement = element.closest('.link__text');
        } else if (currentType === 'link' && currentElement) {
            const rect = currentElement.getBoundingClientRect();
            const linkCenterX = rect.left + rect.width / 2;
            const linkCenterY = rect.top + rect.height / 2;
            const distX = linkCenterX - mouseX;
            const distY = linkCenterY - mouseY;
            const distance = Math.sqrt(distX * distX + distY * distY);
            
            if (distance < 80) {
                targetElement = currentElement;
            }
        }
        
        if (targetElement) {
            if (currentElement !== targetElement || currentType !== 'link') {
                currentElement = targetElement;
                currentType = 'link';
                cursor.className = 'cursor cursor--link';
            }
            return;
        }

        if (currentType !== 'default') {
            currentElement = null;
            currentType = 'default';
            cursor.className = 'cursor';
            cursor.style.width = '';
            cursor.style.height = '';
            cursor.style.borderRadius = '';
        }
    }

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        if (!hasMovedOnce) {
            hasMovedOnce = true;
            cursor.style.opacity = '1';
            cursorX = mouseX;
            cursorY = mouseY;
        }
        
        if (Math.abs(mouseX - lastMouseX) > 2 || Math.abs(mouseY - lastMouseY) > 2) {
            mouseMovedRecently = true;
            lastMouseX = mouseX;
            lastMouseY = mouseY;
        }
        
        checkElementUnderCursor();
    });

    document.addEventListener('scroll', () => {
        checkElementUnderCursor();
    }, true);

    function animateCursor() {
        let targetX = mouseX;
        let targetY = mouseY;
        let ease = 0.12;

        if (currentType === 'link' && currentElement) {
            const rect = currentElement.getBoundingClientRect();
            
            const linkCenterX = rect.left + rect.width / 2;
            const linkCenterY = rect.top + rect.height / 2;
            
            const distX = mouseX - linkCenterX;
            const distY = mouseY - linkCenterY;
            
            const maxDrift = 15;
            const driftX = Math.max(-maxDrift, Math.min(maxDrift, distX * 0.15));
            const driftY = Math.max(-maxDrift, Math.min(maxDrift, distY * 0.15));
            
            targetX = linkCenterX + driftX;
            targetY = linkCenterY + driftY;
            ease = 0.2;

            const padding = 6;
            const width = rect.width + padding;
            const height = rect.height + padding;
            
            if (cursor.style.width !== width + 'px') {
                cursor.style.width = width + 'px';
            }
            if (cursor.style.height !== height + 'px') {
                cursor.style.height = height + 'px';
            }
            
            cursor.style.borderRadius = '0px';
        } else {
            ease = 0.12;
            mouseMovedRecently = true;
            
            if (cursor.style.width && cursor.style.width !== '20px') {
                cursor.style.width = '';
                cursor.style.height = '';
                cursor.style.borderRadius = '';
            }
        }

        cursorX += (targetX - cursorX) * ease;
        cursorY += (targetY - cursorY) * ease;

        let targetOffsetX = 10;
        let targetOffsetY = 10;

        if (currentType === 'link' && currentElement) {
            const rect = currentElement.getBoundingClientRect();
            targetOffsetX = (rect.width + 6) / 2;
            targetOffsetY = (rect.height + 6) / 2;
        } else if (currentType === 'input') {
            targetOffsetX = 1;
            targetOffsetY = 12;
        }

        const offsetEase = 0.2;
        currentOffsetX += (targetOffsetX - currentOffsetX) * offsetEase;
        currentOffsetY += (targetOffsetY - currentOffsetY) * offsetEase;

        cursor.style.left = (cursorX - currentOffsetX) + 'px';
        cursor.style.top = (cursorY - currentOffsetY) + 'px';

        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    document.addEventListener('mousedown', () => {
        cursor.classList.add('cursor--click');
    });

    document.addEventListener('mouseup', () => {
        cursor.classList.remove('cursor--click');
    });

    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
        if (hasMovedOnce) {
            cursor.style.opacity = '1';
        }
    });
});
