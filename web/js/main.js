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

        // Remove initial placeholder if it exists (optional check)
        // const initialMsg = box.querySelector('p');
        // if(initialMsg && initialMsg.innerText === '> System initialized...') initialMsg.remove();

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

// Main Application Logic
const App = {
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
        if (!confirm("ยืนยันการติดตั้ง? (อาจใช้เวลา 5-10 นาที)")) return;
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
            UI.setStatus(res.msg, res.status === 'success' ? 'success' : 'error');
        } catch (e) {
            UI.setStatus("สั่ง Start ไม่สำเร็จ", "error");
            console.error(e);
        }
    },

    stopVM: async () => {
        if (!confirm("ต้องการปิดเครื่อง Wazuh ใช่ไหม?")) return;
        UI.setStatus("ส่งคำสั่งปิดเครื่อง...", "warning");
        try {
            let res = await eel.stop_vm()();
            UI.setStatus(res.msg, res.status === 'success' ? 'success' : 'error');
        } catch (e) {
            UI.setStatus("สั่ง Stop ไม่สำเร็จ", "error");
            console.error(e);
        }
    },

    installVBox: async () => {
        let osVal = document.getElementById('os_input').value;
        if (!osVal) {
            alert("กรุณากรอกระบบปฏิบัติการก่อน (Please enter OS)");
            document.getElementById('os_input').focus();
            return;
        }

        UI.setStatus(`กำลังดาวน์โหลดและติดตั้ง VirtualBox สำหรับ ${osVal}... (อาจใช้เวลาสักพัก)`, "warning");
        try {
            let res = await eel.install_virtualbox(osVal)();
            UI.setStatus(res.msg, res.status === 'success' ? 'success' : 'error');
        } catch (e) {
            UI.setStatus("ติดตั้ง VirtualBox ไม่สำเร็จ", "error");
            console.error(e);
        }
    }
};

// Expose functions to global scope for HTML inline calls (onclick)
// Or better yet, we should attach event listeners in a init function, 
// but to keep compatibility with existing HTML 'onclick' attributes:
window.checkSys = App.checkSys;
window.installVM = App.installVM;
window.startVM = App.startVM;
window.stopVM = App.stopVM;
window.installVBox = App.installVBox;
window.setStatus = UI.setStatus;
