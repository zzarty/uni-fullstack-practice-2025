function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    });
    const timeElement = document.getElementById('current-time');
    if (timeElement) {
        timeElement.textContent = timeString;
    }
}

function initPieMenu() {
    var menu = document.querySelector('.pie-menu');
    if (!menu) return;
    
    var btn = menu.querySelector('.pie-menu__button');
    
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        menu.classList.toggle('open');
        menu.setAttribute('aria-hidden', menu.classList.contains('open') ? 'false' : 'true');
    });
    
    document.addEventListener('click', function() {
        menu.classList.remove('open');
        menu.setAttribute('aria-hidden', 'true');
    });
    
    menu.addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    var items = menu.querySelectorAll('.pie-menu__item');
    items.forEach(function(it) {
        it.addEventListener('click', function() {
            menu.classList.remove('open');
        });
    });
}

function initAll() {
    updateTime();
    setInterval(updateTime, 1000);
    initPieMenu();
}

document.addEventListener('componentsLoaded', initAll);

if (document.readyState === 'complete' || document.readyState === 'interactive') {
    if (document.querySelector('.nav')) {
        initAll();
    }
}
