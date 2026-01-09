// StepWizard Component - Step-by-step UI for Wazuh Launcher
import Notification from './Notification.js';

export default class StepWizard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentStep = 1;
        this.totalSteps = 4; // Reduced: removed Start/Stop step
        this.vmExists = false;
        this.ovaExists = false;
        this.vmRunning = false;
        this.credentials = null;
        this.wazuhIp = null;
        this.ipInterval = null;
        this.ipFound = false;
        this.loginBypassed = false; // New flag

        // Bind methods
        this.render = this.render.bind(this);
        this.goNext = this.goNext.bind(this);
        this.goBack = this.goBack.bind(this);
    }

    async init() {
        this.render();
        await this.checkInitialState();
    }

    async checkInitialState() {
        this.setLoading(true, "กำลังตรวจสอบระบบ...");

        try {
            // Check VirtualBox first
            const sysCheck = await eel.check_system()();
            if (sysCheck.status !== 'success') {
                this.currentStep = 0; // Special step for VirtualBox install
                this.render();
                return;
            }

            // Check if VM exists
            const vmCheck = await eel.check_vm_exists()();
            this.vmExists = vmCheck.exists;

            // Check if OVA file exists
            const ovaCheck = await eel.check_ova_exists()();
            this.ovaExists = ovaCheck.exists;

            // Get credentials
            this.credentials = await eel.get_credentials()();

            // Determine starting step
            if (this.vmExists) {
                this.currentStep = 3; // Go to VM Credentials
            } else {
                this.currentStep = 2; // Go to Install (merged with download)
            }

            this.render();
            this.log(`ตรวจสอบเสร็จสิ้น: Virtual Machine ${this.vmExists ? 'พบ' : 'ไม่พบ'}`, this.vmExists ? 'success' : 'info');

        } catch (e) {
            this.log("เกิดข้อผิดพลาดในการตรวจสอบระบบ", "error");
            console.error(e);
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(isLoading, message = "") {
        const loader = this.container.querySelector('#wizard-loader');
        if (loader) {
            loader.style.display = isLoading ? 'flex' : 'none';
            if (message) {
                loader.querySelector('span').textContent = message;
            }
        }
    }

    log(message, type = 'info') {
        if (window.setStatus) {
            window.setStatus(message, type);
        }
    }

    async goNext() {
        if (this.currentStep === 3) {
            // Check if VM is running
            if (window.vmController && !window.vmController.isRunning) {
                if (typeof Notification !== 'undefined') {
                    Notification.show(
                        'กรุณากดปุ่มเปิด Virtual Machine ให้ทำงานก่อนดำเนินการต่อ', 
                        'warning'
                    );
                } else {
                    alert('กรุณาเปิด Virtual Machine ก่อน');
                }
                return;
            }

            // Enforce Login Check (Server side + Local Bypass)
            if (!this.loginBypassed) {
                const isLoggedIn = await eel.check_vm_logged_in()();
                if (!isLoggedIn) {
                    if (typeof Notification !== 'undefined') {
                        const confirmed = await Notification.confirm(
                            'กรุณาทำการล็อกอินใน VirtualBox ให้เรียบร้อยก่อนจะไปขั้นตอนถัดไป\nกด "ยืนยัน" หากท่านได้ทำการล็อกอินเรียบร้อยแล้ว',
                            'เข้าสู่ระบบ',
                            'warning'
                        );
                        if (confirmed) {
                            this.forceLoginSuccess();
                            this.goNext();
                            return;
                        }
                    } else {
                        alert('กรุณาล็อกอินใน VM ก่อน');
                    }
                    return;
                }
            }
        }

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.render();
        }
    }

    goBack() {
        // Prevent going back from Step 3 (Credentials) to Step 2 (Install) if VM exists
        if (this.currentStep === 3 && this.vmExists) {
            this.log("ไม่สามารถย้อนกลับหลังจากติดตั้ง Virtual Machine แล้ว", "warning");
            return;
        }

        if (this.currentStep > 1) {
            this.stopIpPolling();
            this.currentStep--;
            this.render();
        }
    }

    // IP Polling Methods
    startIpPolling() {
        if (this.ipInterval) return; // Already polling

        this.log("กำลังค้นหา IP Address จาก Virtual Machine...", "info");
        this.ipInterval = setInterval(() => this.pollIp(), 3000);
        this.pollIp(); // First poll immediately
    }

    stopIpPolling() {
        if (this.ipInterval) {
            clearInterval(this.ipInterval);
            this.ipInterval = null;
        }
    }

    async pollIp() {
        try {
            const res = await eel.get_wazuh_ip()();

            if (res.status === 'success' && res.ip) {
                this.wazuhIp = res.ip;
                this.ipFound = true;
                this.stopIpPolling();

                // Update the input field
                const ipInput = this.container.querySelector('#wazuh-ip-input');
                if (ipInput) {
                    ipInput.value = res.ip;
                    ipInput.classList.remove('border-slate-700/50');
                    ipInput.classList.add('border-emerald-500/50', 'bg-emerald-900/20');
                }

                // Update status indicator
                const statusEl = this.container.querySelector('#ip-status');
                if (statusEl) {
                    statusEl.innerHTML = `<span class="text-emerald-400 flex items-center gap-1.5"><svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg> พบ IP: ${res.ip}</span>`;
                }

                // Enable the button
                const btnOpen = this.container.querySelector('#btn-open-dashboard');
                if (btnOpen) {
                    btnOpen.disabled = false;
                    btnOpen.classList.remove('opacity-50', 'cursor-not-allowed');
                }

                this.log(`พบ IP Address: ${res.ip}`, 'success');
            }
        } catch (e) {
            console.log("Polling IP...", e);
        }
    }

    goToStep(step) {
        if (step >= 1 && step <= this.totalSteps) {
            this.currentStep = step;
            this.render();
        }
    }

    // Login Polling
    startLoginPolling() {
        if (this.loginInterval) return;
        
        // Reset timer state
        if (this.bypassTimer) {
            clearTimeout(this.bypassTimer);
            this.bypassTimer = null;
        }

        const updateStatus = async () => {
            if (this.currentStep !== 3) {
                this.stopLoginPolling();
                return;
            }
            
            // Check VM status
            const isVmRunning = window.vmController && window.vmController.isRunning;

            // Start Bypass Timer ONLY if VM is running and timer not already set
            if (isVmRunning && !this.bypassTimer && !this.loginBypassed) {
                this.bypassTimer = setTimeout(() => {
                     const btnForce = this.container.querySelector('#btn-force-login');
                     if (btnForce) {
                         btnForce.classList.remove('hidden');
                         btnForce.onclick = async () => {
                             const confirmed = await Notification.confirm(
                                 'กรุณาทำการล็อกอินใน VM Ubuntu ให้เรียบร้อยก่อนจะไปขั้นตอนถัดไป',
                                 'ยืนยันการเข้าสู่ระบบ',
                                 'warning'
                             );
                             if (confirmed) {
                                 this.forceLoginSuccess();
                             }
                         };
                     }
                }, 5000); // Wait 5s AFTER VM is running
            } else if (!isVmRunning && this.bypassTimer) {
                // If VM stops, reset timer? Optional, but safer to just let it hold or reset
                // For now, let's keep it simple. If VM stops, we pause checking but timer might have fired.
            }
            
            // Only check login if VM is running
            if (!isVmRunning) return;
            
            // If already forced success, skip check
            if (this.loginBypassed) return; 

            const isLoggedIn = await eel.check_vm_logged_in()();
            
            if (isLoggedIn) {
                this.forceLoginSuccess();
            }
        };

        this.loginInterval = setInterval(updateStatus, 2000);
        updateStatus();
    }
    
    forceLoginSuccess() {
        this.loginBypassed = true; // Flag to stop checking
        this.stopLoginPolling(); // Stop polling
        
        const indicator = this.container.querySelector('#login-status-indicator');
        const btnNext = this.container.querySelector('#btn-nav-next');
        const btnForce = this.container.querySelector('#btn-force-login');
        
        if (indicator) {
            indicator.className = "flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 transition-all";
            indicator.innerHTML = `
                <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                <span class="text-[10px] text-emerald-400 font-medium">เข้าสู่ระบบแล้ว</span>
            `;
        }
        
        if (btnForce) btnForce.classList.add('hidden');

        if (btnNext) {
            btnNext.disabled = false;
            btnNext.classList.remove('opacity-50', 'cursor-not-allowed', 'grayscale');
        }
    }

    stopLoginPolling() {
        if (this.loginInterval) {
            clearInterval(this.loginInterval);
            this.loginInterval = null;
        }
        if (this.bypassTimer) {
            clearTimeout(this.bypassTimer);
            this.bypassTimer = null;
        }
    }

    render() {
        const stepContent = this.getStepContent();

        // Show back button conditions:
        // - Must be > Step 1
        // - Hidden on Step 2 (Install) - User Request
        // - Hidden on Step 4 (Dashboard) - User Request
        // - Hidden on Step 3 if VM already exists (Prevent going back to install)
        const showBack = this.currentStep > 1 && 
                         this.currentStep !== 2 && 
                         this.currentStep !== 4 && 
                         !(this.currentStep === 3 && this.vmExists);
        const showNext = this.currentStep >= 3 && this.currentStep < this.totalSteps;

        this.container.innerHTML = `
        <div class="flex flex-col h-full overflow-hidden">
            <!-- Progress Indicator -->
            <div class="mb-3 flex-shrink-0">
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[10px] text-slate-400 font-medium">${this.currentStep} / ${this.totalSteps}</span>
                    <span class="text-[10px] text-sky-400">${this.getStepTitle()}</span>
                </div>
                <div class="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500 ease-out"
                         style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
                </div>
            </div>

            <!-- Step Content -->
            <div class="flex-1 flex flex-col justify-center overflow-y-auto overflow-x-hidden min-h-0">
                ${stepContent}
            </div>

            <!-- Navigation Footer -->
            <div class="pt-2 mt-auto border-t border-slate-800/50 flex-shrink-0">
                <div class="flex justify-end gap-2">
                    ${showBack ? `
                        <button id="btn-nav-back"
                            class="px-3 py-1.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 text-xs border border-slate-700/50 font-medium transition-all active:scale-[0.98]">
                            ย้อนกลับ
                        </button>
                    ` : ''}
                    ${showNext ? `
                        <button id="btn-nav-next"
                            class="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-medium transition-all active:scale-[0.98]">
                            ถัดไป
                        </button>
                    ` : ''}
                </div>
            </div>

            <!-- Loading Overlay -->
            <div id="wizard-loader" class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10" style="display: none;">
                <div class="flex flex-col items-center space-y-2">
                    <div class="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-xs text-slate-300">กำลังดำเนินการ...</span>
                </div>
            </div>
        </div>
        `;

        this.attachEventListeners();

        // Start IP polling when on Dashboard step (step 4)
        if (this.currentStep === 4 && !this.ipFound) {
            this.startIpPolling();
        }

        // Start Login polling when on Credentials step (step 3)
        if (this.currentStep === 3) {
            this.startLoginPolling();
        } else {
            this.stopLoginPolling();
        }
    }

    getStepTitle() {
        const titles = {
            0: 'ติดตั้ง VirtualBox',
            1: 'ตรวจสอบระบบ',
            2: 'ติดตั้ง Virtual Machine',
            3: 'ข้อมูลเข้าสู่ระบบ Virtual Machine',
            4: 'เปิด Dashboard'
        };
        return titles[this.currentStep] || '';
    }

    getStepContent() {
        switch (this.currentStep) {
            case 0:
                return this.renderStep0_VBoxInstall();
            case 1:
                return this.renderStep1_Checking();
            case 2:
                return this.renderStep2_Install();
            case 3:
                return this.renderStep3_VMCredentials();
            case 4:
                return this.renderStep4_Dashboard();
            default:
                return '<p class="text-slate-400">Unknown step</p>';
        }
    }

    renderStep0_VBoxInstall() {
        return `
        <div class="text-center space-y-4">
            <div class="w-20 h-20 mx-auto flex items-center justify-center mb-2">
                <img src="VirtualBox.png" class="w-full h-full object-contain drop-shadow-lg" alt="VirtualBox">
            </div>
            <div>
                <h3 class="text-lg font-bold text-white mb-1">ไม่พบ VirtualBox</h3>
                <p class="text-slate-400 text-xs">กรุณาติดตั้ง VirtualBox ก่อนดำเนินการต่อ</p>
            </div>
            <button id="btn-install-vbox"
                class="w-full p-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white text-sm font-semibold shadow-lg shadow-orange-900/30 transition-all active:scale-[0.98]">
                ติดตั้ง VirtualBox
            </button>
            <button id="btn-recheck"
                class="text-xs text-sky-400 hover:text-sky-300 transition-colors">
                ตรวจสอบอีกครั้ง
            </button>
        </div>
        `;
    }

    renderStep1_Checking() {
        return `
        <div class="text-center space-y-4">
            <div class="w-14 h-14 mx-auto bg-sky-500/10 rounded-xl flex items-center justify-center">
                <div class="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
                <h3 class="text-lg font-bold text-white mb-1">กำลังตรวจสอบระบบ</h3>
                <p class="text-slate-400 text-xs">รอสักครู่...</p>
            </div>
        </div>
        `;
    }

    renderStep2_Install() {
        // Show different UI based on OVA existence
        if (!this.ovaExists) {
            // OVA not found - show download section
            return `
            <div class="text-center space-y-4">
                <div class="w-20 h-20 mx-auto flex items-center justify-center mb-2">
                    <img src="virtualboxova_103624.webp" class="w-full h-full object-contain drop-shadow-lg" alt="OVA">
                </div>
                <div>
                    <h3 class="text-lg font-bold text-white mb-1">ไม่พบไฟล์ติดตั้ง</h3>
                    <p class="text-slate-400 text-xs">วางไฟล์ <code class="text-sky-400 bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">Wazuh-Install-Ready.ova</code><br>ในโฟลเดอร์เดียวกับโปรแกรม</p>
                </div>
                <div class="space-y-2">
                    <button id="btn-recheck-ova"
                        class="w-full p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 text-xs border border-slate-700/50 transition-all">
                        ตรวจสอบอีกครั้ง
                    </button>
                </div>
            </div>
            `;
        } else {
            // OVA found - show install button
            return `
            <div class="text-center space-y-4">
                <div class="w-20 h-20 mx-auto flex items-center justify-center mb-2">
                    <img src="virtualboxova_103624.webp" class="w-full h-full object-contain drop-shadow-lg" alt="OVA">
                </div>
                <div>
                    <h3 class="text-lg font-bold text-white mb-1">พร้อมติดตั้ง</h3>
                    <p class="text-slate-400 text-xs">พบไฟล์ <code class="text-emerald-400 bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">Wazuh-Install-Ready.ova</code></p>
                </div>
                <div class="space-y-2">
                    <button id="btn-install-vm"
                        class="w-full p-3 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-sm font-semibold shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98]">
                        ติดตั้ง Virtual Machine
                    </button>
                </div>
            </div>
            `;
        }
    }

    // Step 3 (Start/Stop) has been removed - VM control is now in the left column

    renderStep3_VMCredentials() {
        const vmUser = this.credentials?.vm?.user || 'adison';
        const vmPass = this.credentials?.vm?.pass || '132547';

        return `
        <div class="flex flex-col h-full items-center justify-center space-y-3 relative py-2">
            
            <!-- Header -->
            <div class="text-center space-y-1">
                <div class="inline-flex items-center justify-center w-16 h-16 mb-2">
                    <img src="UbuntuCoF.svg.png" class="w-full h-full object-contain drop-shadow-md" alt="Ubuntu">
                </div>
                <div>
                    <h3 class="text-base font-bold text-white tracking-tight">ข้อมูลบัญชี Virtual Machine</h3>
                    <p class="text-[10px] text-slate-400">ใช้สำหรับล็อกอินเข้าหน้าจอ VirtualBox</p>
                </div>
            </div>

            <!-- Login Status Indicator (Polled) -->
            <div id="login-status-indicator" class="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 transition-all">
                <div class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
                <span class="text-[10px] text-slate-400 font-medium">รอการล็อกอิน...</span>
            </div>

            <!-- Credentials Card -->
            <div class="w-full max-w-xs bg-slate-900/40 backdrop-blur-md rounded-2xl p-2 border border-white/5 space-y-1.5">
                <div class="flex items-center justify-between px-1">
                    <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">รายละเอียดบัญชี</span>
                </div>
                
                <div class="flex flex-col gap-1.5">
                    <!-- Username Row -->
                    <div class="group flex items-center justify-between p-1.5 pl-2 bg-slate-800/60 rounded-xl border border-slate-700/30 hover:border-purple-500/30 transition-all">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/10">
                                <svg class="w-3 h-3 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[7px] text-slate-500 leading-none mb-0.5 font-bold">USERNAME</span>
                                <span class="text-[11px] font-mono text-slate-200 font-medium tracking-wide group-hover:text-purple-300 transition-colors">${vmUser}</span>
                            </div>
                        </div>
                        <button class="copy-btn w-6 h-6 flex items-center justify-center rounded-lg bg-slate-700/30 hover:bg-purple-500 hover:text-white text-slate-400 transition-all active:scale-95" data-copy="${vmUser}" title="Copy Username">
                             <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                    </div>

                    <!-- Password Row -->
                    <div class="group flex items-center justify-between p-1.5 pl-2 bg-slate-800/60 rounded-xl border border-slate-700/30 hover:border-pink-500/30 transition-all">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/10">
                                <svg class="w-3 h-3 text-pink-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[7px] text-slate-500 leading-none mb-0.5 font-bold">PASSWORD</span>
                                <span class="text-[11px] font-mono text-slate-200 font-medium tracking-wide group-hover:text-pink-300 transition-colors">${vmPass}</span>
                            </div>
                        </div>
                        <button class="copy-btn w-6 h-6 flex items-center justify-center rounded-lg bg-slate-700/30 hover:bg-pink-500 hover:text-white text-slate-400 transition-all active:scale-95" data-copy="${vmPass}" title="Copy Password">
                            <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }

    renderStep4_Dashboard() {
        const wazuhUser = this.credentials?.wazuh?.user || 'admin';
        const wazuhPass = this.credentials?.wazuh?.pass || 'admin';
        const hasIp = this.wazuhIp && this.ipFound;

        return `
        <div class="flex flex-col h-full items-center justify-center space-y-3 relative py-2">
            
            <!-- Header -->
            <div class="text-center space-y-1">
                <div class="inline-flex items-center justify-center w-16 h-16 mb-2">
                    <img src="images.jpg" class="w-full h-full object-contain rounded-xl drop-shadow-md" alt="Wazuh">
                </div>
                <div>
                    <h3 class="text-base font-bold text-white tracking-tight">เข้าใช้งาน Wazuh Dashboard</h3>
                    <p class="text-[10px] text-slate-400">เชื่อมต่อผ่าน IP Address</p>
                </div>
            </div>

            <!-- Connection Status -->
            <div class="flex justify-center">
                ${hasIp 
                    ? `<div class="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full"><div class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div><span class="text-[9px] font-medium text-emerald-400">ONLINE</span></div>`
                    : `<div class="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full"><div class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div><span class="text-[9px] font-medium text-amber-400">CONNECTING</span></div>`
                }
            </div>

            <!-- IP Input Section -->
            <div class="w-full max-w-xs space-y-1.5">
                <div class="relative group">
                    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span class="text-slate-500 group-focus-within:text-sky-500 transition-colors">

                        </span>
                    </div>
                    
                    <input type="text" 
                        id="wazuh-ip-input" 
                        placeholder="192.168.x.x"
                        value="${hasIp ? this.wazuhIp : ''}"
                        class="w-full pl-2 pr-20 py-2.5 bg-slate-900/80 border ${hasIp ? 'border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-slate-700/50 text-slate-200'} rounded-2xl focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all font-mono text-xs shadow-inner"
                    />

                    <!-- Actions Container -->
                    <div class="absolute right-1.5 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-slate-800/80 rounded-xl p-0.5 border border-white/5 backdrop-blur-sm">
                        <!-- Refresh Button -->
                        <button id="btn-refresh-ip" 
                            class="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-700/50 transition-all hover:rotate-180 duration-500" 
                            title="Refresh IP">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        </button>
                        
                        <div class="w-px h-3 bg-slate-600/30"></div>

                        <!-- Open Button -->
                        <button id="btn-open-dashboard" 
                            class="p-1.5 rounded-lg text-sky-500 hover:text-white hover:bg-sky-500 transition-all active:scale-95 disabled:opacity-50 disabled:hover:bg-transparent" 
                            title="Open Dashboard">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Credentials Card -->
            <div class="w-full max-w-xs bg-slate-900/40 backdrop-blur-md rounded-2xl p-2 border border-white/5 space-y-1.5 mt-0.5">
                <div class="flex items-center justify-between px-1">
                    <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">รายละเอียดบัญชี</span>
                </div>
                
                <div class="flex flex-col gap-1.5">
                    <!-- Username Row -->
                    <div class="group flex items-center justify-between p-1.5 pl-2 bg-slate-800/60 rounded-xl border border-slate-700/30 hover:border-sky-500/30 transition-all">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/10">
                                <svg class="w-3 h-3 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[7px] text-slate-500 leading-none mb-0.5 font-bold">USERNAME</span>
                                <span class="text-[11px] font-mono text-slate-200 font-medium tracking-wide group-hover:text-sky-300 transition-colors">${wazuhUser}</span>
                            </div>
                        </div>
                        <button class="copy-btn w-6 h-6 flex items-center justify-center rounded-lg bg-slate-700/30 hover:bg-sky-500 hover:text-white text-slate-400 transition-all active:scale-95" data-copy="${wazuhUser}" title="Copy Username">
                             <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                    </div>

                    <!-- Password Row -->
                    <div class="group flex items-center justify-between p-1.5 pl-2 bg-slate-800/60 rounded-xl border border-slate-700/30 hover:border-emerald-500/30 transition-all">
                        <div class="flex items-center gap-2">
                            <div class="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/10">
                                <svg class="w-3 h-3 text-emerald-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[7px] text-slate-500 leading-none mb-0.5 font-bold">PASSWORD</span>
                                <span class="text-[11px] font-mono text-slate-200 font-medium tracking-wide group-hover:text-emerald-300 transition-colors">${wazuhPass}</span>
                            </div>
                        </div>
                        <button class="copy-btn w-6 h-6 flex items-center justify-center rounded-lg bg-slate-700/30 hover:bg-emerald-500 hover:text-white text-slate-400 transition-all active:scale-95" data-copy="${wazuhPass}" title="Copy Password">
                            <svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                        </button>
                    </div>
                </div>
            </div>

        </div>
        `;
    }

    attachEventListeners() {
        // Step 0 - VirtualBox Install
        const btnInstallVbox = this.container.querySelector('#btn-install-vbox');
        if (btnInstallVbox) {
            btnInstallVbox.addEventListener('click', async () => {
                this.setLoading(true, "กำลังติดตั้ง VirtualBox...");
                try {
                    const res = await eel.install_virtualbox()();
                    this.log(res.msg, res.status);
                } catch (e) {
                    this.log("ติดตั้ง VirtualBox ไม่สำเร็จ", "error");
                }
                this.setLoading(false);
            });
        }

        const btnRecheck = this.container.querySelector('#btn-recheck');
        if (btnRecheck) {
            btnRecheck.addEventListener('click', () => this.checkInitialState());
        }

        // Step 2 - Recheck OVA (when OVA not found)
        const btnRecheckOva = this.container.querySelector('#btn-recheck-ova');
        if (btnRecheckOva) {
            btnRecheckOva.addEventListener('click', async () => {
                const ovaCheck = await eel.check_ova_exists()();
                this.ovaExists = ovaCheck.exists;
                this.render();
                if (this.ovaExists) {
                    this.log("พบไฟล์ OVA แล้ว!", "success");
                } else {
                    this.log("ยังไม่พบไฟล์ OVA", "warning");
                }
            });
        }

        // Step 2 - Install VM (when OVA found)
        const btnInstallVm = this.container.querySelector('#btn-install-vm');
        if (btnInstallVm) {
            btnInstallVm.addEventListener('click', async () => {
                this.setLoading(true, "กำลังติดตั้ง Virtual Machine (อาจใช้เวลา 5-10 นาที)...");
                this.log("เริ่มติดตั้ง Wazuh Virtual Machine...", "warning");
                try {
                    const res = await eel.install_vm()();
                    this.log(res.msg, res.status);
                    if (res.status === 'success') {
                        this.vmExists = true;
                        // Enable the VM toggle button in the left column
                        if (window.vmController) {
                            window.vmController.enable();
                        }
                        this.goNext();
                    }
                } catch (e) {
                    this.log("ติดตั้ง Virtual Machine ไม่สำเร็จ", "error");
                }
                this.setLoading(false);
            });
        }

        // Step 3 (Start/Stop) removed - VM control is now handled in the left column

        // Footer Navigation Buttons
        const btnNavBack = this.container.querySelector('#btn-nav-back');
        if (btnNavBack) {
            btnNavBack.addEventListener('click', () => this.goBack());
        }

        const btnNavNext = this.container.querySelector('#btn-nav-next');
        if (btnNavNext) {
            btnNavNext.addEventListener('click', () => this.goNext());
        }

        // Step 4 - Dashboard
        const btnOpenDashboard = this.container.querySelector('#btn-open-dashboard');
        if (btnOpenDashboard) {
            btnOpenDashboard.addEventListener('click', () => {
                const ipInput = this.container.querySelector('#wazuh-ip-input');
                const ip = ipInput?.value?.trim();
                if (ip) {
                    window.open(`https://${ip}`, '_blank');
                    this.log(`เปิด Dashboard: https://${ip}`, 'success');
                } else {
                    this.log("กรุณากรอก IP Address", "warning");
                }
            });
        }

        // Refresh IP button
        const btnRefreshIp = this.container.querySelector('#btn-refresh-ip');
        if (btnRefreshIp) {
            btnRefreshIp.addEventListener('click', () => {
                this.ipFound = false;
                this.wazuhIp = null;
                this.render();
                this.startIpPolling();
            });
        }

        // Copy buttons
        const copyBtns = this.container.querySelectorAll('.copy-btn');
        copyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.getAttribute('data-copy');
                navigator.clipboard.writeText(text).then(() => {
                    // Original Copy Icon (from DOM or hardcoded) used in render methods
                    const originalIcon = `<svg class="w-3 h-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>`;
                    // Success Check Icon
                    const successIcon = `<svg class="w-3 h-3 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>`;
                    
                    btn.innerHTML = successIcon;
                    setTimeout(() => btn.innerHTML = originalIcon, 1500);
                    this.log(`คัดลอก "${text}" แล้ว`, 'success');
                });
            });
        });
    }
}
