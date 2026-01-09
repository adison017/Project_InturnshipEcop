export default class Notification {
    /**
     * Shows a confirmation modal.
     * @param {string} message - The message to display.
     * @param {string} title - The title of the modal (optional).
     * @returns {Promise<boolean>} - Resolves to true if confirmed, false otherwise.
     */
    /**
     * Shows a confirmation modal.
     * @param {string} message - The message to display.
     * @param {string} title - The title of the modal (optional).
     * @param {string} type - The type of confirmation (info, success, warning, error).
     * @returns {Promise<boolean>} - Resolves to true if confirmed, false otherwise.
     */
    static async confirm(message, title = "Confirmation Needed", type = 'info') {
        return new Promise((resolve) => {
            let modal = document.getElementById('custom-notification-modal');
            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'custom-notification-modal';
                modal.className = `fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-none`;
                document.body.appendChild(modal);
            }

            // Theme Configuration (Matched with alert)
            const themes = {
                info: {
                    border: 'border-sky-500/20',
                    glow: 'from-sky-500/20 to-indigo-500/20',
                    btnOk: 'from-sky-600 to-indigo-600 shadow-sky-900/50 hover:shadow-sky-600/50 hover:from-sky-500 hover:to-indigo-500',
                    icon: ''
                },
                success: {
                    border: 'border-emerald-500/30',
                    glow: 'from-emerald-500/20 to-teal-500/20',
                    btnOk: 'from-emerald-600 to-teal-600 shadow-emerald-900/50 hover:shadow-emerald-600/50 hover:from-emerald-500 hover:to-teal-500',
                    icon: 'text-emerald-400'
                },
                warning: {
                    border: 'border-amber-500/30',
                    glow: 'from-amber-500/20 to-orange-500/20',
                    btnOk: 'from-amber-600 to-orange-600 shadow-amber-900/50 hover:shadow-amber-600/50 hover:from-amber-500 hover:to-orange-500',
                    icon: 'text-amber-400'
                },
                error: {
                    border: 'border-red-500/30',
                    glow: 'from-red-500/20 to-rose-500/20',
                    btnOk: 'from-red-600 to-rose-600 shadow-red-900/50 hover:shadow-red-600/50 hover:from-red-500 hover:to-rose-500',
                    icon: 'text-red-400'
                }
            };
            const theme = themes[type] || themes.info;

            modal.innerHTML = `
                <div class="relative bg-slate-900 border ${theme.border} rounded-2xl p-6 shadow-2xl max-w-md w-[90%] transform scale-95 translate-y-4 transition-all duration-300 shadow-sky-500/5">
                    <div class="absolute -inset-1 bg-gradient-to-r ${theme.glow} rounded-2xl blur opacity-50 -z-10"></div>
                    <div class="space-y-4">
                        <h3 id="notification-title" class="text-xl font-bold text-white tracking-wide ${theme.icon}"></h3>
                        <p id="notification-message" class="text-slate-300 font-light leading-relaxed"></p>
                        
                        <div class="flex justify-end space-x-3 pt-4">
                            <button id="notification-cancel" class="
                                px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 
                                text-slate-400 hover:text-white hover:bg-white/10 
                                transition-all duration-200 text-sm font-medium
                                focus:outline-none focus:ring-2 focus:ring-slate-500/50
                            ">
                                ยกเลิก
                            </button>
                            <button id="notification-ok" class="
                                px-5 py-2.5 rounded-xl bg-gradient-to-r ${theme.btnOk} 
                                text-white shadow-lg 
                                hover:-translate-y-0.5
                                transition-all duration-200 text-sm font-medium
                                focus:outline-none focus:ring-2 focus:ring-sky-500/50
                            ">
                                ยืนยัน
                            </button>
                        </div>
                    </div>
                </div>
            `;

            const titleEl = modal.querySelector('#notification-title');
            const msgEl = modal.querySelector('#notification-message');
            const okBtn = modal.querySelector('#notification-ok');
            const cancelBtn = modal.querySelector('#notification-cancel');
            const contentDiv = modal.querySelector('div.relative');

            titleEl.textContent = title;
            msgEl.innerHTML = message;

            modal.classList.remove('opacity-0', 'pointer-events-none');
            requestAnimationFrame(() => {
                contentDiv.classList.remove('scale-95', 'translate-y-4');
                contentDiv.classList.add('scale-100', 'translate-y-0');
            });

            const close = (result) => {
                contentDiv.classList.remove('scale-100', 'translate-y-0');
                contentDiv.classList.add('scale-95', 'translate-y-4');
                modal.classList.add('opacity-0', 'pointer-events-none');
                okBtn.onclick = null;
                cancelBtn.onclick = null;
                setTimeout(() => resolve(result), 300);
            };

            okBtn.onclick = () => close(true);
            cancelBtn.onclick = () => close(false);
        });
    }

    /**
     * Shows an alert modal with a single OK button.
     * @param {string} message - The message to display.
     * @param {string} title - The title of the modal.
     * @param {string} type - The type of alert (info, success, warning, error).
     * @returns {Promise<void>} - Resolves when closed.
     */
    static async alert(message, title = "Alert", type = 'info') {
        return new Promise((resolve) => {
            let modal = document.getElementById('custom-notification-modal');

            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'custom-notification-modal';
                modal.className = `fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm opacity-0 transition-opacity duration-300 pointer-events-none`;
                document.body.appendChild(modal);
            }

            // Theme Configuration
            const themes = {
                info: {
                    border: 'border-sky-500/20',
                    glow: 'from-sky-500/20 to-indigo-500/20',
                    btn: 'from-sky-600 to-indigo-600 shadow-sky-900/50 hover:shadow-sky-600/50 hover:from-sky-500 hover:to-indigo-500',
                    icon: ''
                },
                success: {
                    border: 'border-emerald-500/30',
                    glow: 'from-emerald-500/20 to-teal-500/20',
                    btn: 'from-emerald-600 to-teal-600 shadow-emerald-900/50 hover:shadow-emerald-600/50 hover:from-emerald-500 hover:to-teal-500',
                    icon: 'text-emerald-400'
                },
                warning: {
                    border: 'border-amber-500/30',
                    glow: 'from-amber-500/20 to-orange-500/20',
                    btn: 'from-amber-600 to-orange-600 shadow-amber-900/50 hover:shadow-amber-600/50 hover:from-amber-500 hover:to-orange-500',
                    icon: 'text-amber-400'
                },
                error: {
                    border: 'border-red-500/30',
                    glow: 'from-red-500/20 to-rose-500/20',
                    btn: 'from-red-600 to-rose-600 shadow-red-900/50 hover:shadow-red-600/50 hover:from-red-500 hover:to-rose-500',
                    icon: 'text-red-400'
                }
            };

            const theme = themes[type] || themes.info;

            // Updated Modal HTML with Dynamic Themes
            modal.innerHTML = `
                <div class="relative bg-slate-900 border ${theme.border} rounded-2xl p-6 shadow-2xl max-w-md w-[90%] transform scale-95 translate-y-4 transition-all duration-300 shadow-sky-500/5">
                    <div class="absolute -inset-1 bg-gradient-to-r ${theme.glow} rounded-2xl blur opacity-50 -z-10"></div>
                    <div class="space-y-4">
                        <h3 id="notification-title" class="text-xl font-bold text-white tracking-wide ${theme.icon}"></h3>
                        <p id="notification-message" class="text-slate-300 font-light leading-relaxed"></p>
                        <div class="flex justify-end pt-4">
                            <button id="notification-ok" class="px-5 py-2.5 rounded-xl bg-gradient-to-r ${theme.btn} text-white shadow-lg transition-all font-medium focus:outline-none">
                                ตกลง
                            </button>
                        </div>
                    </div>
                </div>
            `;

            const titleEl = modal.querySelector('#notification-title');
            const msgEl = modal.querySelector('#notification-message');
            const okBtn = modal.querySelector('#notification-ok');
            const contentDiv = modal.querySelector('div.relative');

            titleEl.textContent = title;
            msgEl.innerHTML = message;

            modal.classList.remove('opacity-0', 'pointer-events-none');
            requestAnimationFrame(() => {
                contentDiv.classList.remove('scale-95', 'translate-y-4');
                contentDiv.classList.add('scale-100', 'translate-y-0');
            });

            const close = () => {
                contentDiv.classList.remove('scale-100', 'translate-y-0');
                contentDiv.classList.add('scale-95', 'translate-y-4');
                modal.classList.add('opacity-0', 'pointer-events-none');
                okBtn.onclick = null;
                setTimeout(resolve, 300);
            };

            okBtn.onclick = close;
        });
    }

    // Alias for show (compatibility with existing calls)
    static async show(message, type = 'info') {
        const title = type === 'warning' ? 'Warning' : (type === 'error' ? 'Error' : 'Notification');
        return this.alert(message, title, type);
    }
}
