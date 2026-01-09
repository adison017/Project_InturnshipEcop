export default class Notification {
    /**
     * Shows a confirmation modal.
     * @param {string} message - The message to display.
     * @param {string} title - The title of the modal (optional).
     * @returns {Promise<boolean>} - Resolves to true if confirmed, false otherwise.
     */
    static async confirm(message, title = "Confirmation Needed") {
        return new Promise((resolve) => {
            // Check if modal container exists
            let modal = document.getElementById('custom-notification-modal');

            // Re-create the modal every time to ensure fresh state or reuse if efficient.
            // For simplicity and to ensure event listeners are clean, we can create it if missing,
            // or we'll just implement a render function.

            if (!modal) {
                modal = document.createElement('div');
                modal.id = 'custom-notification-modal';
                // Base styles for the backdrop
                modal.className = `
                    fixed inset-0 z-[100] flex items-center justify-center 
                    bg-slate-950/80 backdrop-blur-sm 
                    opacity-0 transition-opacity duration-300 pointer-events-none
                `;

                // Inner HTML structure
                modal.innerHTML = `
                    <div class="
                        relative bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl 
                        max-w-md w-[90%] transform scale-95 translate-y-4 transition-all duration-300
                        shadow-sky-500/10
                    ">
                        <!-- Glow effect -->
                        <div class="absolute -inset-1 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 rounded-2xl blur opacity-50 -z-10"></div>
                        
                        <div class="space-y-4">
                            <h3 id="notification-title" class="text-xl font-bold text-white tracking-wide"></h3>
                            <p id="notification-message" class="text-slate-300 font-light leading-relaxed"></p>
                            
                            <div class="flex justify-end space-x-3 pt-4">
                                <button id="notification-cancel" class="
                                    px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 
                                    text-slate-400 hover:text-white hover:bg-white/10 
                                    transition-all duration-200 text-sm font-medium
                                    focus:outline-none focus:ring-2 focus:ring-slate-500/50
                                ">
                                    Cancel
                                </button>
                                <button id="notification-ok" class="
                                    px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 
                                    text-white shadow-lg shadow-sky-900/50 
                                    hover:shadow-sky-600/50 hover:from-sky-500 hover:to-indigo-500 hover:-translate-y-0.5
                                    transition-all duration-200 text-sm font-medium
                                    focus:outline-none focus:ring-2 focus:ring-sky-500/50
                                ">
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                document.body.appendChild(modal);
            }

            const titleEl = modal.querySelector('#notification-title');
            const msgEl = modal.querySelector('#notification-message');
            const okBtn = modal.querySelector('#notification-ok');
            const cancelBtn = modal.querySelector('#notification-cancel');
            const contentDiv = modal.querySelector('div.relative'); // Valid selector for the inner card

            titleEl.textContent = title;
            msgEl.textContent = message;

            // Open Modal
            modal.classList.remove('opacity-0', 'pointer-events-none');
            // Small delay to allow display:block to apply before animating transform
            requestAnimationFrame(() => {
                contentDiv.classList.remove('scale-95', 'translate-y-4');
                contentDiv.classList.add('scale-100', 'translate-y-0');
            });

            // Cleanup & Resolve Function
            const close = (result) => {
                // Animate out
                contentDiv.classList.remove('scale-100', 'translate-y-0');
                contentDiv.classList.add('scale-95', 'translate-y-4');
                modal.classList.add('opacity-0', 'pointer-events-none');

                // Cleanup listeners
                okBtn.onclick = null;
                cancelBtn.onclick = null;

                // Return result after animation
                setTimeout(() => resolve(result), 300);
            };

            // Event Listeners (using onclick to replace previous listeners automatically if any)
            okBtn.onclick = () => close(true);
            cancelBtn.onclick = () => close(false);
        });
    }
}
