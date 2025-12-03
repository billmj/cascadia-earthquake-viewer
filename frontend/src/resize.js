// Draggable gutter for resizing left panel

export function initResizer() {
    const gutter = document.getElementById('split-gutter');
    const leftPanel = document.getElementById('left-panel');
    const main = document.querySelector('.app-main');
    
    console.log('Resizer elements:', { gutter, leftPanel, main });
    
    if (!gutter || !leftPanel || !main) {
        console.error('Resizer elements not found!');
        return;
    }

    let isResizing = false;
    let startX = 0;
    let startWidth = 0;

    gutter.addEventListener('mousedown', (e) => {
        console.log('MOUSEDOWN on gutter!');
        isResizing = true;
        startX = e.clientX;
        startWidth = leftPanel.offsetWidth;
        document.body.classList.add('is-resizing');
        e.preventDefault();
        e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        console.log('MOVING...');
        const delta = e.clientX - startX;
        let newWidth = startWidth + delta;
        
        const minWidth = 240;
        const maxWidth = window.innerWidth * 0.6;
        
        newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth));
        
        document.documentElement.style.setProperty('--lp-w', `${newWidth}px`);
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            console.log('MOUSEUP - stopping resize');
            isResizing = false;
            document.body.classList.remove('is-resizing');
        }
    });

    console.log('✅ Resizer initialized successfully');
}