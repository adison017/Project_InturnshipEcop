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
        const content = document.getElementById('terminal-content');
        const body = document.getElementById('terminal-body');
        
        if (!content) return; // Terminal not ready

        const line = document.createElement('div');
        line.className = 'flex items-start animate-fade-in-fast';
        
        // Config based on type
        let colorClass = 'text-slate-300';

        if (type === 'success') { 
            colorClass = 'text-emerald-400'; 
        }
        else if (type === 'error') { 
            colorClass = 'text-red-400'; 
        }
        else if (type === 'warning') { 
            colorClass = 'text-amber-400'; 
        }
        else {
            colorClass = 'text-slate-300';
        }

        // Time
        const now = new Date();
        const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: "numeric", minute: "numeric", second: "numeric" });

        line.innerHTML = `
            <div class="break-words">
                <span class="text-slate-500 text-[9px] mr-2 select-none">[${timeStr}]</span>
                <span class="${colorClass} font-medium message-text"></span>
            </div>
        `;

        content.appendChild(line);
        
        // Typing Animation
        const target = line.querySelector('.message-text');
        let i = 0;
        const typeSpeed = 10; // ms per char

        const typeWriter = () => {
            if (i < msg.length) {
                target.textContent += msg.charAt(i);
                i++;
                if (body) body.scrollTop = body.scrollHeight;
                setTimeout(typeWriter, typeSpeed);
            }
        };
        
        typeWriter();

        // Initial scroll
        if (body) {
            body.scrollTop = body.scrollHeight;
        }
    }
};

// Expose setStatus to global scope for StepWizard to use
window.setStatus = UI.setStatus;

// ============================================
// Global Progress Controller
// ============================================
class GlobalProgress {
    constructor() {
        this.el = document.getElementById('global-progress');
        this.titleEl = document.getElementById('progress-title');
        this.descEl = document.getElementById('progress-desc');
        this.barEl = document.getElementById('progress-bar');
        this.percentEl = document.getElementById('progress-percent');
        this.interval = null;
    }

    show(title, description, durationMs = 5000) {
        if (!this.el) return;

        // Reset
        this.reset();
        
        // Content
        if (this.titleEl) this.titleEl.textContent = title;
        if (this.descEl) this.descEl.textContent = description;
        
        // Show
        this.el.classList.remove('opacity-0', 'pointer-events-none');
        
        // Start simulation
        const startTime = Date.now();
        const update = () => {
            const elapsed = Date.now() - startTime;
            let progress = (elapsed / durationMs) * 100;
            
            // Cap at 95% until finish() is called
            if (progress > 95) progress = 95;
            
            this.setPercent(progress);
        };
        
        this.interval = setInterval(update, 50);
    }

    setPercent(p) {
        const pct = Math.min(100, Math.max(0, p));
        if (this.barEl) this.barEl.style.width = `${pct}%`;
        if (this.percentEl) this.percentEl.innerText = `${Math.floor(pct)}%`;
    }

    finish() {
        if (this.interval) clearInterval(this.interval);
        this.setPercent(100);
        
        setTimeout(() => {
            this.hide();
        }, 800);
    }

    hide() {
        if (this.el) this.el.classList.add('opacity-0', 'pointer-events-none');
        if (this.interval) clearInterval(this.interval);
    }
    
    reset() {
        if (this.interval) clearInterval(this.interval);
        this.setPercent(0);
    }
}
window.GlobalProgress = new GlobalProgress();

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
        await this.checkVMStatus(true); // Initial check
        
        // Attach event listener
        if (this.btn) {
            this.btn.addEventListener('click', () => this.toggle());
        }

        // Start Polling for external state changes (e.g. user closed VBox window)
        setInterval(() => {
            if (!this.isLoading) {
                this.checkVMStatus(false);
            }
        }, 2000); // Check every 2 seconds
    }
    
    async checkVMStatus(firstRun = false) {
        try {
            // Only check existence on first run to save resources
            if (firstRun) {
                const vmCheck = await eel.check_vm_exists()();
                this.vmExists = vmCheck.exists;
                if (!this.vmExists) {
                    this.btn.disabled = true;
                    this.btn.title = 'ยังไม่ได้ติดตั้ง Virtual Machine';
                    this.updateText('ติดตั้งยังไม่สมบูรณ์', 'text-slate-400');
                    return;
                }
            }
            
            if (!this.vmExists) return;

            // Check actual running state
            const isRunningNow = await eel.check_vm_running()();

            // Detect State Change (External)
            if (this.isRunning !== isRunningNow) {
                 this.isRunning = isRunningNow;
                 this.updateIcon();
                 
                 // If stopped externally (and not handled by stopVM logic)
                 if (!this.isRunning) {
                     if (window.wizard) {
                         window.wizard.resetLoginState();
                         // Auto-navigate back to Step 3 if on Step 4
                         if (window.wizard.currentStep === 4) {
                             window.wizard.stopIpPolling();
                             window.wizard.goToStep(3);
                             UI.setStatus('ตรวจพบการปิด VM: กลับสู่หน้าจอ Login', 'warning');
                         }
                     }
                 }
            }

            if (firstRun) {
                 this.btn.disabled = false;
                 this.updateIcon(); // Ensure icon matches state
            }

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
            this.iconPowerOff.classList.add('hidden');
            this.iconPowerOn.classList.remove('hidden');
            
            this.iconPowerOn.setAttribute('class', 'w-7 h-7 text-white transition-colors duration-300');

            // Green BG, Red Hover BG
            this.btn.className = `${baseClasses} bg-emerald-500 border-emerald-400 hover:bg-red-500 hover:border-red-500 hover:shadow-red-500/30 shadow-emerald-500/30`;
            this.btn.title = 'ปิด Virtual Machine';
            this.updateText('ทำงานอยู่', 'text-slate-500');
        } else {
            // Stopped State:
            this.iconPowerOff.classList.remove('hidden');
            this.iconPowerOn.classList.add('hidden');
            
            // Light Theme: White BG, Gray Icon
            this.iconPowerOff.setAttribute('class', 'w-7 h-7 text-slate-400 group-hover:text-emerald-500 transition-colors duration-300');

            // Light BG
            this.btn.className = `${baseClasses} bg-white border-slate-200 hover:border-emerald-500/70 hover:shadow-emerald-500/20`;
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
        
        // Show Global Progress
        if (window.GlobalProgress) {
            window.GlobalProgress.show('Starting', 'กำลังเปิด Virtual Machine...', 15000); // 15s avg boot
        }
        
        UI.setStatus('กำลังเปิด Wazuh Server...', 'warning');
        
        try {
            const res = await eel.start_vm()();
            
            // Finish Progress
            if (window.GlobalProgress) window.GlobalProgress.finish();
            
            UI.setStatus(res.msg, res.status);
            
            if (res.status === 'success') {
                this.isRunning = true;
            }
        } catch (e) {
             if (window.GlobalProgress) window.GlobalProgress.hide();
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

                // Reset Login State
                if (window.wizard) {
                    window.wizard.resetLoginState();
                }

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
setTimeout(async () => {
    window.vmController = new VMToggleController();

    // Fetch and display versions in Terminal
    try {
        const versions = await eel.get_app_versions()();
        const termContent = document.getElementById('terminal-content');
        if (termContent && versions) {
             const addLine = (label, val, color='text-slate-400') => {
                const div = document.createElement('div');
                div.className = 'flex items-start ml-2 opacity-0 animate-[fade-in_0.5s_ease-out_forwards]';
                div.style.animationDelay = '0.3s'; // Stagger slightly
                div.innerHTML = `<span class="${color} w-20 font-semibold">${label}</span> <span class="text-slate-400 mr-2">::</span> <span class="text-slate-200">${val}</span>`;
                termContent.appendChild(div);
             };
             
             addLine('UBUNTU', versions.ubuntu, 'text-[#E95420]'); // Ubuntu Orange
             addLine('WAZUH', versions.wazuh, 'text-[#0078D4]');   // Wazuh Blue
             addLine('VBOX', versions.vbox, 'text-[#2D73B9]');    // VirtualBox Blue
        }
    } catch(e) {
        console.error("Failed to get versions", e);
    }
    
    
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

// OSSEC IP Update Handler
window.handleUpdateIP = async function() {
    try {
        UI.setStatus("กำลังดึงไอพีจาก Wazuh Server (VM)...", 'info');
        
        const ipRes = await eel.get_wazuh_ip()();
        let targetIP = '';
        let isAutoResult = false;

        if (ipRes && ipRes.status === 'success') {
            targetIP = ipRes.ip;
            isAutoResult = true;
            
            const confirmed = await Notification.confirm(
                `พบไอพีของ Wazuh Server อัตโนมัติ: <b class="text-emerald-600">${targetIP}</b><br><br>ต้องการอัปเดต Agent ให้เชื่อมต่อไปที่ไอพีนี้ใช่หรือไม่?`,
                "ตรวจพบ IP อัตโนมัติ",
                "success"
            );
            if (!confirmed) return;
        } else {
            // Fallback to manual prompt if auto-fetch fails or is pending
            const msg = (ipRes && ipRes.msg) ? ` (${ipRes.msg})` : '';
            // For now, keep prompt for input, but we could make a custom input modal if needed.
            // But since the primary flow is "Auto", let's focus on the alert/confirm.
            targetIP = prompt("ไม่สามารถดึงไอพีอัตโนมัติได้" + msg + "\n\nกรุณาระบุไอพีของ Wazuh Server ด้วยตนเอง:", "172.19.1.174");
        }
        
        if (targetIP) {
            UI.setStatus(`กำลังอัปเดต IP ไปที่: ${targetIP}...`, 'warning');
            
            const result = await eel.run_update_ossec_ip(targetIP)();
            
            if (result.status === 'success') {
                UI.setStatus(`อัปเดตสำเร็จ: ${result.msg}`, 'success');
                await Notification.show(result.msg, "success");
            } else {
                UI.setStatus(`อัปเดตล้มเหลว: ${result.msg}`, 'error');
                await Notification.show(result.msg, "error");
            }
        }
    } catch (e) {
        console.error("IP Update Error:", e);
        UI.setStatus("เกิดข้อผิดพลาดในการรันสคริปต์", 'error');
    }
};
