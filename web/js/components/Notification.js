export default class Notification {
    
    static getIcon(type) {
        const icons = {
            success: `<svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`,
            warning: `<svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            error: `<svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`,
            info: `<svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-sky-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
        };
        return icons[type] || icons.info;
    }

    static getTheme(type) {
        const themes = {
            info: {
                border: 'border-sky-100',
                glow: 'from-sky-50 to-indigo-50',
                btnOk: 'from-sky-500 to-indigo-500 shadow-sky-200 hover:shadow-sky-300 hover:from-sky-600 hover:to-indigo-600',
                badge: 'bg-sky-50 text-sky-600 border-sky-100'
            },
            success: {
                border: 'border-emerald-100',
                glow: 'from-emerald-50 to-teal-50',
                btnOk: 'from-emerald-500 to-teal-500 shadow-emerald-200 hover:shadow-emerald-300 hover:from-emerald-600 hover:to-teal-600',
                badge: 'bg-emerald-50 text-emerald-600 border-emerald-100'
            },
            warning: {
                border: 'border-amber-100',
                glow: 'from-amber-50 to-orange-50',
                btnOk: 'from-amber-500 to-orange-500 shadow-amber-200 hover:shadow-amber-300 hover:from-amber-600 hover:to-orange-600',
                badge: 'bg-amber-50 text-amber-600 border-amber-100'
            },
            error: {
                border: 'border-red-100',
                glow: 'from-red-50 to-rose-50',
                btnOk: 'from-red-500 to-rose-500 shadow-red-200 hover:shadow-red-300 hover:from-red-600 hover:to-rose-600',
                badge: 'bg-red-50 text-red-600 border-red-100'
            }
        };
        return themes[type] || themes.info;
    }

    static async confirm(message, title = "ยืนยันการทำรายการ", type = 'info') {
        return new Promise((resolve) => {
            let modal = document.getElementById('custom-notification-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'custom-notification-modal';
                modal.className = `fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] opacity-0 transition-opacity duration-300 pointer-events-none`;
                document.body.appendChild(modal);
            }

            const theme = this.getTheme(type);
            const iconSvg = this.getIcon(type);

            modal.innerHTML = `
                <div class="relative bg-white border ${theme.border} rounded-3xl p-8 shadow-xl max-w-sm w-[90%] transform scale-95 translate-y-4 transition-all duration-300">
                    <!-- Background Glow -->
                    <div class="absolute inset-0 bg-gradient-to-br ${theme.glow} rounded-3xl opacity-50 -z-10"></div>
                    
                    <div class="flex flex-col items-center text-center space-y-4">
                        <!-- Icon Bubble -->
                        <div class="w-20 h-20 rounded-full bg-white border ${theme.border} shadow-sm flex items-center justify-center mb-2">
                            ${iconSvg}
                        </div>

                        <div class="space-y-2">
                            <h3 id="notification-title" class="text-lg font-bold text-slate-800 tracking-tight">${title}</h3>
                            <p id="notification-message" class="text-sm text-slate-500 font-medium leading-relaxed px-2">${message}</p>
                        </div>
                        
                        <div class="flex items-center gap-3 w-full pt-4">
                            <button id="notification-cancel" class="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all duration-200 text-sm font-bold shadow-sm hover:shadow">
                                ยกเลิก
                            </button>
                            <button id="notification-ok" class="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r ${theme.btnOk} text-white shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all duration-200 text-sm font-bold">
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </div>
            `;

            this._setupAndShow(modal, resolve, true);
        });
    }

    static async alert(message, title = "แจ้งเตือน", type = 'info') {
        return new Promise((resolve) => {
            let modal = document.getElementById('custom-notification-modal');

            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'custom-notification-modal';
                modal.className = `fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] opacity-0 transition-opacity duration-300 pointer-events-none`;
                document.body.appendChild(modal);
            }

            const theme = this.getTheme(type);
            const iconSvg = this.getIcon(type);

            modal.innerHTML = `
                <div class="relative bg-white border ${theme.border} rounded-3xl p-8 shadow-xl max-w-sm w-[90%] transform scale-95 translate-y-4 transition-all duration-300">
                    <div class="absolute inset-0 bg-gradient-to-br ${theme.glow} rounded-3xl opacity-50 -z-10"></div>
                    
                    <div class="flex flex-col items-center text-center space-y-4">
                        <div class="w-20 h-20 rounded-full bg-white border ${theme.border} shadow-sm flex items-center justify-center mb-2">
                             ${iconSvg}
                        </div>

                        <div class="space-y-2">
                            <h3 id="notification-title" class="text-lg font-bold text-slate-800 tracking-tight">${title}</h3>
                            <p id="notification-message" class="text-sm text-slate-500 font-medium leading-relaxed px-2">${message}</p>
                        </div>
                        
                        <div class="w-full pt-4">
                            <button id="notification-ok" class="w-full px-4 py-2.5 rounded-xl bg-gradient-to-r ${theme.btnOk} text-white shadow-lg transition-all hover:-translate-y-0.5 font-bold text-sm">
                                ตกลง
                            </button>
                        </div>
                    </div>
                </div>
            `;

            this._setupAndShow(modal, resolve, false);
        });
    }

    static _setupAndShow(modal, resolve, isConfirm) {
        const okBtn = modal.querySelector('#notification-ok');
        const cancelBtn = modal.querySelector('#notification-cancel'); // May be null if alert
        const contentDiv = modal.querySelector('div.relative');

        modal.classList.remove('opacity-0', 'pointer-events-none');
        requestAnimationFrame(() => {
            contentDiv.classList.remove('scale-95', 'translate-y-4');
            contentDiv.classList.add('scale-100', 'translate-y-0');
        });

        const close = (result = null) => {
            contentDiv.classList.remove('scale-100', 'translate-y-0');
            contentDiv.classList.add('scale-95', 'translate-y-4');
            modal.classList.add('opacity-0', 'pointer-events-none');
            
            if (okBtn) okBtn.onclick = null;
            if (cancelBtn) cancelBtn.onclick = null;
            
            setTimeout(() => {
                resolve(result);
            }, 300);
        };

        if (okBtn) okBtn.onclick = () => close(true);
        if (cancelBtn) cancelBtn.onclick = () => close(false);
    }

    // Alias for show
    static async show(message, type = 'info') {
        const titleMap = {
            'warning': 'แจ้งเตือน',
            'error': 'เกิดข้อผิดพลาด',
            'success': 'ทำรายการสำเร็จ',
            'info': 'ข้อมูล'
        };
        const title = titleMap[type] || 'แจ้งเตือน';
        return this.alert(message, title, type);
    }
}
