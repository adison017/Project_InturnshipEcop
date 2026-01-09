// StepWizard Component - Step-by-step UI for Wazuh Launcher
import Notification from './Notification.js';

export default class StepWizard {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentStep = 1;
        this.totalSteps = 5; // Reduced from 6 to 5
        this.vmExists = false;
        this.ovaExists = false;
        this.vmRunning = false;
        this.credentials = null;
        this.wazuhIp = null;
        this.ipInterval = null;
        this.ipFound = false;

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
                this.currentStep = 3; // Go to Start/Stop
            } else {
                this.currentStep = 2; // Go to Install (merged with download)
            }

            this.render();
            this.log(`ตรวจสอบเสร็จสิ้น: VM ${this.vmExists ? 'พบ' : 'ไม่พบ'}`, this.vmExists ? 'success' : 'info');

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

    goNext() {
        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.render();
        }
    }

    goBack() {
        if (this.currentStep > 1) {
            this.stopIpPolling();
            this.currentStep--;
            this.render();
        }
    }

    // IP Polling Methods
    startIpPolling() {
        if (this.ipInterval) return; // Already polling

        this.log("กำลังค้นหา IP Address จาก VM...", "info");
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
                    statusEl.innerHTML = `<span class="text-emerald-400">✔ พบ IP: ${res.ip}</span>`;
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

    render() {
        const stepContent = this.getStepContent();

        this.container.innerHTML = `
        <div class="flex flex-col h-full">
            <!-- Progress Indicator -->
            <div class="mb-6">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs text-slate-400 font-medium">ขั้นตอน ${this.currentStep} / ${this.totalSteps}</span>
                    <span class="text-xs text-sky-400">${this.getStepTitle()}</span>
                </div>
                <div class="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div class="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-500 ease-out"
                         style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
                </div>
            </div>

            <!-- Step Content -->
            <div class="flex-1 flex flex-col justify-center">
                ${stepContent}
            </div>

            <!-- Loading Overlay -->
            <div id="wizard-loader" class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10" style="display: none;">
                <div class="flex flex-col items-center space-y-3">
                    <div class="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                    <span class="text-sm text-slate-300">กำลังดำเนินการ...</span>
                </div>
            </div>
        </div>
        `;

        this.attachEventListeners();

        // Start IP polling when on Dashboard step (step 5)
        if (this.currentStep === 5 && !this.ipFound) {
            this.startIpPolling();
        }
    }

    getStepTitle() {
        const titles = {
            0: 'ติดตั้ง VirtualBox',
            1: 'ตรวจสอบระบบ',
            2: 'ติดตั้ง VM',
            3: 'เริ่ม/หยุด VM',
            4: 'ข้อมูลเข้าสู่ระบบ VM',
            5: 'เปิด Dashboard'
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
                return this.renderStep3_StartStop();
            case 4:
                return this.renderStep4_VMCredentials();
            case 5:
                return this.renderStep5_Dashboard();
            default:
                return '<p class="text-slate-400">Unknown step</p>';
        }
    }

    renderStep0_VBoxInstall() {
        return `
        <div class="text-center space-y-6">
            <div class="w-20 h-20 mx-auto bg-amber-500/10 rounded-2xl flex items-center justify-center">
                <span class="text-4xl">⚠️</span>
            </div>
            <div>
                <h3 class="text-xl font-bold text-white mb-2">ไม่พบ VirtualBox</h3>
                <p class="text-slate-400 text-sm">กรุณาติดตั้ง VirtualBox ก่อนดำเนินการต่อ</p>
            </div>
            <button id="btn-install-vbox"
                class="w-full p-4 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-white font-semibold shadow-lg shadow-orange-900/30 transition-all active:scale-[0.98]">
                ติดตั้ง VirtualBox
            </button>
            <button id="btn-recheck"
                class="text-sm text-sky-400 hover:text-sky-300 transition-colors">
                ตรวจสอบอีกครั้ง
            </button>
        </div>
        `;
    }

    renderStep1_Checking() {
        return `
        <div class="text-center space-y-6">
            <div class="w-20 h-20 mx-auto bg-sky-500/10 rounded-2xl flex items-center justify-center">
                <div class="w-10 h-10 border-3 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div>
                <h3 class="text-xl font-bold text-white mb-2">กำลังตรวจสอบระบบ</h3>
                <p class="text-slate-400 text-sm">รอสักครู่...</p>
            </div>
        </div>
        `;
    }

    renderStep2_Install() {
        // Show different UI based on OVA existence
        if (!this.ovaExists) {
            // OVA not found - show download section
            return `
            <div class="text-center space-y-6">
                <div class="w-20 h-20 mx-auto bg-amber-500/10 rounded-2xl flex items-center justify-center">
                    <span class="text-4xl">📥</span>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-white mb-2">ไม่พบไฟล์ติดตั้ง</h3>
                    <p class="text-slate-400 text-sm">กรุณาวางไฟล์ <code class="text-sky-400 bg-slate-800 px-2 py-0.5 rounded">Wazuh-Install-Ready.ova</code><br>ในโฟลเดอร์เดียวกับโปรแกรม</p>
                </div>
                <div class="space-y-3">
                    <a href="https://drive.google.com/your-ova-link" target="_blank"
                        class="block w-full p-4 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-sky-900/30 transition-all active:scale-[0.98] text-center">
                        ดาวน์โหลด OVA
                    </a>
                    <button id="btn-recheck-ova"
                        class="w-full p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border border-slate-700/50 transition-all">
                        ตรวจสอบอีกครั้ง
                    </button>
                </div>
            </div>
            `;
        } else {
            // OVA found - show install button
            return `
            <div class="text-center space-y-6">
                <div class="w-20 h-20 mx-auto bg-emerald-500/10 rounded-2xl flex items-center justify-center">
                    <span class="text-4xl">📦</span>
                </div>
                <div>
                    <h3 class="text-xl font-bold text-white mb-2">พร้อมติดตั้ง</h3>
                    <p class="text-slate-400 text-sm">พบไฟล์ <code class="text-emerald-400 bg-slate-800 px-2 py-0.5 rounded">Wazuh-Install-Ready.ova</code></p>
                </div>
                <div class="space-y-3">
                    <button id="btn-install-vm"
                        class="w-full p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98]">
                        ติดตั้ง VM
                    </button>
                    <a href="https://drive.google.com/your-ova-link" target="_blank"
                        class="block w-full p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-400 border border-slate-700/50 transition-all text-center text-sm">
                        ดาวน์โหลด OVA ใหม่
                    </a>
                </div>
            </div>
            `;
        }
    }

    renderStep3_StartStop() {
        return `
        <div class="text-center space-y-6">
            <div class="w-20 h-20 mx-auto bg-indigo-500/10 rounded-2xl flex items-center justify-center">
                <span class="text-4xl">🖥️</span>
            </div>
            <div>
                <h3 class="text-xl font-bold text-white mb-2">Wazuh Server</h3>
                <p class="text-slate-400 text-sm">ควบคุมการทำงานของ VM</p>
            </div>
            <div class="grid grid-cols-2 gap-3">
                <button id="btn-start-vm"
                    class="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-emerald-900/30 transition-all active:scale-[0.98]">
                    Start
                </button>
                <button id="btn-stop-vm"
                    class="p-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-semibold shadow-lg shadow-red-900/30 transition-all active:scale-[0.98]">
                    Stop
                </button>
            </div>
            <button id="btn-next-step3"
                class="w-full p-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium transition-all active:scale-[0.98]">
                ถัดไป
            </button>
        </div>
        `;
    }

    renderStep4_VMCredentials() {
        const vmUser = this.credentials?.vm?.user || 'wazuh-user';
        const vmPass = this.credentials?.vm?.pass || 'wazuh';

        return `
        <div class="text-center space-y-6">
            <div class="w-20 h-20 mx-auto bg-purple-500/10 rounded-2xl flex items-center justify-center">
                <span class="text-4xl">🔐</span>
            </div>
            <div>
                <h3 class="text-xl font-bold text-white mb-2">ข้อมูลเข้าสู่ระบบ VM</h3>
                <p class="text-slate-400 text-sm">ใช้ข้อมูลนี้เข้าสู่ระบบใน VirtualBox</p>
            </div>
            
            <div class="space-y-3 text-left bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs text-slate-500 mb-1">Username</p>
                        <p class="text-lg text-sky-400 font-mono font-semibold">${vmUser}</p>
                    </div>
                    <button class="copy-btn p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all" data-copy="${vmUser}">
                        📋
                    </button>
                </div>
                <div class="h-px bg-slate-700/50"></div>
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-xs text-slate-500 mb-1">Password</p>
                        <p class="text-lg text-emerald-400 font-mono font-semibold">${vmPass}</p>
                    </div>
                    <button class="copy-btn p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all" data-copy="${vmPass}">
                        📋
                    </button>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <button id="btn-back-step4"
                    class="p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border border-slate-700/50 font-medium transition-all active:scale-[0.98]">
                    ย้อนกลับ
                </button>
                <button id="btn-next-step4"
                    class="p-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium transition-all active:scale-[0.98]">
                    ถัดไป
                </button>
            </div>
        </div>
        `;
    }

    renderStep5_Dashboard() {
        const wazuhUser = this.credentials?.wazuh?.user || 'admin';
        const wazuhPass = this.credentials?.wazuh?.pass || 'SecretPassword';
        const hasIp = this.wazuhIp && this.ipFound;

        return `
        <div class="text-center space-y-4">
            <div class="w-14 h-14 mx-auto bg-sky-500/10 rounded-2xl flex items-center justify-center">
                <span class="text-2xl">🌐</span>
            </div>
            <div>
                <h3 class="text-lg font-bold text-white mb-1">Wazuh Dashboard</h3>
                <p class="text-slate-400 text-xs">เปิดหน้า Dashboard และใช้ข้อมูลด้านล่างเข้าสู่ระบบ</p>
            </div>

            <div id="dashboard-ip-section" class="space-y-2">
                <!-- IP Status -->
                <div id="ip-status" class="text-xs py-2">
                    ${hasIp
                ? `<span class="text-emerald-400">✔ พบ IP: ${this.wazuhIp}</span>`
                : `<span class="text-amber-400 flex items-center justify-center">
                            <span class="inline-block w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mr-2"></span>
                            กำลังค้นหา IP จาก VM...
                           </span>`
            }
                </div>
                
                <!-- IP Input -->
                <input type="text" id="wazuh-ip-input" 
                    placeholder="กำลังค้นหา IP อัตโนมัติ..." 
                    value="${hasIp ? this.wazuhIp : ''}"
                    class="w-full p-3 rounded-xl bg-slate-800/50 border ${hasIp ? 'border-emerald-500/50 bg-emerald-900/20' : 'border-slate-700/50'} text-center text-sky-300 font-mono placeholder:text-slate-500 focus:outline-none focus:border-sky-500/50">
                
                <!-- Open Dashboard Button -->
                <button id="btn-open-dashboard"
                    ${!hasIp ? 'disabled' : ''}
                    class="w-full p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-blue-900/30 transition-all active:scale-[0.98] ${!hasIp ? 'opacity-50 cursor-not-allowed' : ''}">
                    เปิด Dashboard
                </button>
                
                <!-- Manual refresh -->
                <button id="btn-refresh-ip" class="text-xs text-sky-400 hover:text-sky-300 transition-colors">
                    ค้นหา IP อีกครั้ง
                </button>
            </div>
            
            <div class="space-y-2 text-left bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                <p class="text-xs text-slate-500 text-center mb-2">🔐 ข้อมูลเข้าสู่ระบบ Wazuh</p>
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-[10px] text-slate-500">Username</p>
                        <p class="text-sm text-sky-400 font-mono font-semibold">${wazuhUser}</p>
                    </div>
                    <button class="copy-btn p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all text-xs" data-copy="${wazuhUser}">
                        📋
                    </button>
                </div>
                <div class="h-px bg-slate-700/50"></div>
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-[10px] text-slate-500">Password</p>
                        <p class="text-sm text-emerald-400 font-mono font-semibold">${wazuhPass}</p>
                    </div>
                    <button class="copy-btn p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-400 hover:text-white transition-all text-xs" data-copy="${wazuhPass}">
                        📋
                    </button>
                </div>
            </div>

            <button id="btn-back-step5"
                class="w-full p-2.5 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 border border-slate-700/50 font-medium transition-all active:scale-[0.98] text-sm">
                ย้อนกลับ
            </button>
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
                this.setLoading(true, "กำลังติดตั้ง VM (อาจใช้เวลา 5-10 นาที)...");
                this.log("เริ่มติดตั้ง Wazuh VM...", "warning");
                try {
                    const res = await eel.install_vm()();
                    this.log(res.msg, res.status);
                    if (res.status === 'success') {
                        this.vmExists = true;
                        this.goNext();
                    }
                } catch (e) {
                    this.log("ติดตั้ง VM ไม่สำเร็จ", "error");
                }
                this.setLoading(false);
            });
        }

        // Step 3 - Start/Stop
        const btnStartVm = this.container.querySelector('#btn-start-vm');
        if (btnStartVm) {
            btnStartVm.addEventListener('click', async () => {
                this.setLoading(true, "กำลังเปิดเครื่อง...");
                try {
                    const res = await eel.start_vm()();
                    this.log(res.msg, res.status);
                    if (res.status === 'success') {
                        this.vmRunning = true;
                    }
                } catch (e) {
                    this.log("เปิดเครื่องไม่สำเร็จ", "error");
                }
                this.setLoading(false);
            });
        }

        const btnStopVm = this.container.querySelector('#btn-stop-vm');
        if (btnStopVm) {
            btnStopVm.addEventListener('click', async () => {
                const confirmed = await Notification.confirm(
                    "ยืนยันที่จะปิดการทำงานของ Wazuh Server หรือไม่?",
                    "ยืนยันการปิดเครื่อง"
                );

                if (!confirmed) return;

                this.setLoading(true, "กำลังปิดเครื่อง...");
                try {
                    const res = await eel.stop_vm()();
                    this.log(res.msg, res.status);
                    if (res.status === 'success') {
                        this.vmRunning = false;
                    }
                } catch (e) {
                    this.log("ปิดเครื่องไม่สำเร็จ", "error");
                }
                this.setLoading(false);
            });
        }

        const btnNextStep3 = this.container.querySelector('#btn-next-step3');
        if (btnNextStep3) {
            btnNextStep3.addEventListener('click', () => this.goNext());
        }

        // Step 4 - VM Credentials
        const btnBackStep4 = this.container.querySelector('#btn-back-step4');
        if (btnBackStep4) {
            btnBackStep4.addEventListener('click', () => this.goBack());
        }

        const btnNextStep4 = this.container.querySelector('#btn-next-step4');
        if (btnNextStep4) {
            btnNextStep4.addEventListener('click', () => this.goNext());
        }

        // Step 5 - Dashboard
        const btnBackStep5 = this.container.querySelector('#btn-back-step5');
        if (btnBackStep5) {
            btnBackStep5.addEventListener('click', () => this.goBack());
        }

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
                    btn.textContent = '✅';
                    setTimeout(() => btn.textContent = '📋', 1500);
                    this.log(`คัดลอก "${text}" แล้ว`, 'success');
                });
            });
        });
    }
}
