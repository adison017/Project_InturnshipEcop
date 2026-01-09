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
        // Added padding and rounded corners for background style
        p.className = 'mt-1.5 px-2 py-1 rounded-md break-words flex items-start animate-fade-in-fast';

        let colorClass = 'text-sky-300';
        let bgClass = 'bg-sky-500/5 hover:bg-sky-500/10';
        let prefix = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>`;

        if (type === 'success') { 
            colorClass = 'text-emerald-400'; 
            bgClass = 'bg-emerald-500/10 hover:bg-emerald-500/20'; 
            prefix = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg>`; 
        }
        else if (type === 'error') { 
            colorClass = 'text-red-400'; 
            bgClass = 'bg-red-500/10 hover:bg-red-500/20';
            prefix = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>`; 
        }
        else if (type === 'warning') { 
            colorClass = 'text-amber-400'; 
            bgClass = 'bg-amber-500/10 hover:bg-amber-500/20';
            prefix = `<svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`; 
        }

        p.classList.add(...bgClass.split(' '));
        p.innerHTML = `<span class="mr-2 opacity-70 select-none flex items-center h-full pt-0.5">${prefix}</span><span class="${colorClass}">${msg}</span>`;

        box.appendChild(p);
        box.scrollTop = box.scrollHeight;
    }
};

// Expose setStatus to global scope for StepWizard to use
window.setStatus = UI.setStatus;

// ============================================
// VM Toggle Controller
// ============================================
class VMToggleController {
    constructor() {
        this.isRunning = false;
        this.isLoading = false;
        this.vmExists = false;
        
        this.btn = document.getElementById('btn-vm-toggle');
        this.iconPowerOff = document.getElementById('icon-power-off');
        this.iconPowerOn = document.getElementById('icon-power-on');
        this.iconLoading = document.getElementById('icon-loading');
        this.statusText = document.getElementById('vm-status-text');
        
        this.init();
    }
    
    async init() {
        // Wait for Eel to be ready
        await this.checkVMStatus();
        
        // Attach event listener
        if (this.btn) {
            this.btn.addEventListener('click', () => this.toggle());
        }
    }
    
    async checkVMStatus() {
        try {
            const vmCheck = await eel.check_vm_exists()();
            this.vmExists = vmCheck.exists;
            
            // Check actual running state
            this.isRunning = await eel.check_vm_running()();

            if (this.vmExists) {
                this.btn.disabled = false;
                this.btn.title = 'เปิด Virtual Machine';
                // initial text update handled by updateIcon
            } else {
                this.btn.disabled = true;
                this.btn.title = 'ยังไม่ได้ติดตั้ง Virtual Machine';
                this.updateText('ไม่พบ Virtual Machine', 'text-slate-600');
            }
            
            this.updateIcon();
        } catch (e) {
            console.error('Error checking VM status:', e);
        }
    }
    
    setLoading(loading) {
        this.isLoading = loading;
        
        if (loading) {
            this.iconPowerOff.classList.add('hidden');
            this.iconPowerOn.classList.add('hidden');
            this.iconLoading.classList.remove('hidden');
            this.btn.disabled = true;
        } else {
            this.iconLoading.classList.add('hidden');
            this.updateIcon();
            this.btn.disabled = false;
        }
    }
    
    updateIcon() {
        // Base classes shared by both states
        const baseClasses = 'group relative w-14 h-14 rounded-full transition-all duration-300 flex items-center justify-center shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border-2';

        if (this.isRunning) {
            // Running State: 
            // - Show Power ON icon (ensure it's white to contrast with colored bg)
            // - BG: Green (Active) -> Red (Hover/Splimit)
            this.iconPowerOff.classList.add('hidden');
            this.iconPowerOn.classList.remove('hidden');
            
            // Adjust icon colors for filled button
            this.iconPowerOn.setAttribute('class', 'w-7 h-7 text-white transition-colors duration-300');

            // Green BG, Red Hover BG
            this.btn.className = `${baseClasses} bg-emerald-500 border-emerald-400 hover:bg-red-500 hover:border-red-500 hover:shadow-red-500/30 shadow-emerald-500/30`;
            this.btn.title = 'ปิด Virtual Machine';
            this.updateText('ทำงานอยู่', 'text-slate-400');
        } else {
            // Stopped State:
            // - Show Power OFF icon (Green to indicate "Start")
            // - BG: Gray (Default)
            this.iconPowerOff.classList.remove('hidden');
            this.iconPowerOn.classList.add('hidden');
            
            // Reset icon color
            this.iconPowerOff.setAttribute('class', 'w-7 h-7 text-slate-400 group-hover:text-slate-300 transition-colors duration-300');

            // Gray BG, Green Hover Border
            this.btn.className = `${baseClasses} bg-slate-800/60 border-slate-600/50 hover:border-emerald-500/70 hover:shadow-emerald-500/20`;
            this.btn.title = 'เปิด Virtual Machine';
            this.updateText('ปิดอยู่', 'text-slate-400');
        }
    }
    
    async toggle() {
        if (this.isLoading) return;
        
        if (this.isRunning) {
            await this.stopVM();
        } else {
            await this.startVM();
        }
    }
    
    async startVM() {
        this.setLoading(true);
        this.updateText('กำลังเปิด...', 'text-slate-400');
        UI.setStatus('กำลังเปิด Wazuh Server...', 'warning');
        
        try {
            const res = await eel.start_vm()();
            UI.setStatus(res.msg, res.status);
            
            if (res.status === 'success') {
                this.isRunning = true;
            }
        } catch (e) {
            UI.setStatus('เปิดเครื่องไม่สำเร็จ', 'error');
        }
        
        this.setLoading(false);
    }
    
    async stopVM() {
        const confirmed = await Notification.confirm(
            'ยืนยันที่จะปิดการทำงานของ Wazuh Server หรือไม่?',
            'ยืนยันการปิดเครื่อง',
            'warning'
        );
        
        if (!confirmed) return;
        
        this.setLoading(true);
        this.updateText('กำลังปิด...', 'text-amber-400');
        UI.setStatus('กำลังปิด Wazuh Server...', 'warning');
        
        try {
            const res = await eel.stop_vm()();
            UI.setStatus(res.msg, res.status);
            
            if (res.status === 'success') {
                this.isRunning = false;

                // If we are on the Dashboard step (4) and just stopped the VM, go back to Credentials (3)
                if (window.wizard && window.wizard.currentStep === 4) {
                    window.wizard.stopIpPolling();
                    window.wizard.goToStep(3);
                }
            }
        } catch (e) {
            UI.setStatus('ปิดเครื่องไม่สำเร็จ', 'error');
        }
        
        this.setLoading(false);
    }
    
    // Called by StepWizard when VM is installed
    enable() {
        this.vmExists = true;
        this.btn.disabled = false;
        this.updateText('ปิดอยู่', 'text-slate-400');
    }
    updateText(text, colorClass) {
        if (this.statusText) {
            this.statusText.textContent = text;
            this.statusText.className = `text-xs font-medium tracking-wide transition-colors duration-300 ${colorClass}`;
        }
    }
}

// Initialize VM Toggle Controller after Eel is ready
setTimeout(() => {
    window.vmController = new VMToggleController();
    
    // Hide Global Loader
    const loader = document.getElementById('global-loader');
    if (loader) {
        loader.classList.add('opacity-0', 'pointer-events-none');
        setTimeout(() => loader.remove(), 500);
    }
}, 800);

// Immediate call to fix window size on load/refresh (Don't wait for UI init)
if (typeof eel !== 'undefined') {
    // Retry a few times to ensure connection is established
    const tryReset = (count = 0) => {
        if (typeof eel.reset_window_size === 'function') {
            eel.reset_window_size();
        } else if (count < 10) {
            setTimeout(() => tryReset(count + 1), 50);
        }
    };
    tryReset();
}
