import Notification from './components/Notification.js';

// Tailwind Configuration
tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Kanit', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                wazuh: {
                    blue: '#0078d4',
                    dark: '#1e293b',
                }
            }
        }
    }
};

// UI Helper Functions
const UI = {
    setStatus: (msg, type = 'info') => {
        const box = document.getElementById('status-box');
        if (!box) return;

        const p = document.createElement('div');
        p.className = 'mt-1.5 break-words flex items-start animate-fade-in-fast';

        let colorClass = 'text-sky-300';
        let prefix = '>';

        if (type === 'success') { colorClass = 'text-emerald-400'; prefix = '✔'; }
        else if (type === 'error') { colorClass = 'text-red-400'; prefix = '✖'; }
        else if (type === 'warning') { colorClass = 'text-amber-400'; prefix = '⚠'; }

        p.innerHTML = `<span class="mr-2 opacity-50 select-none">${prefix}</span><span class="${colorClass}">${msg}</span>`;

        box.appendChild(p);
        box.scrollTop = box.scrollHeight;
    }
};

// Expose setStatus to global scope for StepWizard to use
window.setStatus = UI.setStatus;
