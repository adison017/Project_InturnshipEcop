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
    },

    setOS: (osName, osDetail) => {
        const input = document.getElementById('os_input');
        const icon = document.getElementById('os_icon');
        if (input) {
            input.value = `${osName}`; // Show main OS name
            // Optional: Tooltip with detail
            input.title = `Detailed: ${osDetail}`;
        }
        if (icon) {
            icon.classList.remove('animate-pulse');
        }
    }
};

// Global polling interval
let ipInterval;

// Main Application Logic
const App = {
    init: async () => {
        // Auto-detect OS on startup
        try {
            let res = await eel.get_os_info()();
            UI.setStatus(`Detected Host OS: ${res.os} (${res.detail})`, 'info');
            UI.setOS(res.os, res.detail);
        } catch (e) {
            UI.setStatus("Failed to detect OS", 'error');
            console.error(e);
        }
    },

    checkSys: async () => {
        UI.setStatus("กำลังตรวจสอบระบบ...", "warning");
        try {
            let res = await eel.check_system()();
            UI.setStatus(res.msg, res.status === 'success' ? 'success' : 'error');
        } catch (e) {
            UI.setStatus("Error: เชื่อมต่อ Python ไม่ได้", "error");
            console.error(e);
        }
    },

    installVM: async () => {
        if (!await Notification.confirm("ยืนยันการติดตั้ง? (อาจใช้เวลา 5-10 นาที)", "Installation Confirmation")) return;
        UI.setStatus("เริ่มกระบวนการติดตั้ง...", "warning");
        UI.setStatus("กรุณารอสักครู่ ห้ามปิดโปรแกรม...", "info");

        try {
            let res = await eel.install_vm()();
            UI.setStatus(res.msg, res.status === 'success' ? 'success' : 'error');
        } catch (e) {
            UI.setStatus("เกิดข้อผิดพลาดในการติดตั้ง", "error");
            console.error(e);
        }
    },

    startVM: async () => {
        UI.setStatus("กำลังสั่งเปิดเครื่อง...", "warning");
        try {
            let res = await eel.start_vm()();

            if (res.status === 'success') {
                UI.setStatus(res.msg, 'success');
                // เริ่มกระบวนการเช็ค IP
                UI.setStatus("รอการเชื่อมต่อ Network...", "info");
                // เช็ค IP ทุกๆ 3 วินาที
                if (ipInterval) clearInterval(ipInterval); // เคลียร์ของเก่าก่อน (ถ้ามี)
                ipInterval = setInterval(App.pollIP, 3000);
            } else {
                UI.setStatus(res.msg, 'error');
            }

        } catch (e) {
            UI.setStatus("สั่ง Start ไม่สำเร็จ", "error");
            console.error(e);
        }
    },

    pollIP: async () => {
        try {
            let res = await eel.get_wazuh_ip()();

            if (res.status === 'success') {
                const ip = res.ip;
                App.dashboardUrl = `https://${ip}`;

                const btn = document.getElementById('btn-dashboard');
                const txt = document.getElementById('show-ip');

                if (btn && txt) {
                    // เปลี่ยนสถานะเป็น Active (สีฟ้า)
                    btn.disabled = false;
                    btn.className = "group w-full flex items-center justify-center p-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium shadow-lg shadow-blue-900/20 transition-all active:scale-95 mt-3";

                    // อัปเดตข้อความและไอคอน
                    txt.innerText = ip;
                    const icon = btn.querySelector('span:first-child');
                    if (icon) icon.classList.remove('grayscale', 'opacity-50');
                }

                UI.setStatus(`เชื่อมต่อสำเร็จ! IP: ${ip}`, "success");
                UI.setStatus("คลิกปุ่มสีฟ้าด้านบนเพื่อเข้าใช้งาน", "success");

                clearInterval(ipInterval);
            }
        } catch (e) {
            console.log("Polling IP...", e);
        }
    },

    openDashboard: () => {
        if (App.dashboardUrl) {
            window.open(App.dashboardUrl, '_blank');
        } else {
            UI.setStatus("ยังไม่ได้รับ IP Address", "warning");
        }
    },

    stopVM: async () => {
        if (!await Notification.confirm("ต้องการปิดเครื่อง Wazuh ใช่ไหม?", "Stop System")) return;
        UI.setStatus("ส่งคำสั่งปิดเครื่อง...", "warning");
        try {
            let res = await eel.stop_vm()();
            UI.setStatus(res.msg, res.status === 'success' ? 'success' : 'error');

            // Reset Dashboard Button to Disabled State
            const btn = document.getElementById('btn-dashboard');
            const txt = document.getElementById('show-ip');

            if (btn) {
                btn.disabled = true;
                btn.className = "group w-full flex items-center justify-center p-3 rounded-xl bg-slate-800/50 text-slate-500 font-medium border border-slate-700/50 cursor-not-allowed transition-all mt-3";
                const icon = btn.querySelector('span:first-child');
                if (icon) icon.classList.add('grayscale', 'opacity-50');
            }
            if (txt) txt.innerText = "Waiting...";

            if (ipInterval) clearInterval(ipInterval);

        } catch (e) {
            UI.setStatus("สั่ง Stop ไม่สำเร็จ", "error");
            console.error(e);
        }
    },

    installVBox: async () => {
        // No longer need to read input, backend handles it
        UI.setStatus(`กำลังเตรียมติดตั้ง VirtualBox ตามระบบปฏิบัติการที่ตรวจพบ...`, "warning");
        try {
            let res = await eel.install_virtualbox()();
            UI.setStatus(res.msg, res.status === 'success' ? 'success' : 'error');
        } catch (e) {
            UI.setStatus("ติดตั้ง VirtualBox ไม่สำเร็จ", "error");
            console.error(e);
        }
    }
};

// Expose functions to global scope for HTML inline calls (onclick)
window.checkSys = App.checkSys;
window.installVM = App.installVM;
window.startVM = App.startVM;
window.stopVM = App.stopVM;
window.installVBox = App.installVBox;
window.openDashboard = App.openDashboard;
window.setStatus = UI.setStatus;

// Start init when loaded
window.addEventListener('DOMContentLoaded', () => {
    // Wait slightly for Eel to be ready
    setTimeout(App.init, 500);
});
