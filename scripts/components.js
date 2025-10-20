function getBasePath() {
    const path = window.location.pathname;
    return path.includes('/pages/') ? '../' : '';
}

function getComponentsPath() {
    return getBasePath() + 'components/';
}

async function loadComponent(componentName) {
    try {
        const basePath = getBasePath();
        const componentPath = getComponentsPath() + componentName + '.html';
        const response = await fetch(componentPath);
        if (!response.ok) {
            throw new Error(`Failed to load ${componentName}: ${response.status}`);
        }
        let html = await response.text();
        html = html.replace(/{basePath}/g, basePath);
        return html;
    } catch (error) {
        console.error(`Error loading component ${componentName}:`, error);
        return '';
    }
}

function setActiveNavLinks() {
    const currentPath = window.location.pathname.toLowerCase().replace(/\\/g, '/');
    const currentFile = currentPath.split('/').pop() || 'index.html';
    
    const navLinkSelectors = '.nav__link, .nav-bottom__link, .pie-menu__item';
    document.querySelectorAll(navLinkSelectors).forEach(function(link) {
        const href = link.getAttribute('href');
        if (!href) return;
        
        const linkPath = href.toLowerCase().replace(/\\/g, '/');
        const linkFile = linkPath.split('/').pop();
        
        let isActive = false;
        
        if (linkFile === currentFile) {
            isActive = true;
        }
        else if ((currentFile === '' || currentFile === 'index.html' || currentPath.endsWith('/')) && 
                 linkFile === 'index.html') {
            isActive = true;
        }
        else if (currentPath.endsWith(linkPath) || linkPath.endsWith(currentPath)) {
            isActive = true;
        }
        
        if (isActive) {
            if (link.classList.contains('nav__link')) {
                link.classList.add('nav__link--active');
            } else if (link.classList.contains('nav-bottom__link')) {
                link.classList.add('nav-bottom__link--active');
            } else if (link.classList.contains('pie-menu__item')) {
                link.classList.add('pie-menu__item--active');
            }
        } else {
            link.classList.remove('nav__link--active', 'nav-bottom__link--active', 'pie-menu__item--active');
        }
    });
}

async function initComponents() {
    if (document.querySelector('.nav')) {
        return;
    }

    try {
        const [navbarHTML, footerHTML, navBottomHTML, pieNavHTML] = await Promise.all([
            loadComponent('navbar'),
            loadComponent('footer'),
            loadComponent('nav-bottom'),
            loadComponent('pie-nav')
        ]);

        if (navbarHTML) {
            document.body.insertAdjacentHTML('afterbegin', navbarHTML);
        }

        if (footerHTML) {
            document.body.insertAdjacentHTML('beforeend', footerHTML);
        }
        if (navBottomHTML) {
            document.body.insertAdjacentHTML('beforeend', navBottomHTML);
        }
        if (pieNavHTML) {
            document.body.insertAdjacentHTML('beforeend', pieNavHTML);
        }

        setActiveNavLinks();

        document.dispatchEvent(new Event('componentsLoaded'));
        
    } catch (error) {
        console.error('Error initializing components:', error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
} else {
    initComponents();
}