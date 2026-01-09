export default function OSInput() {
    return `
    <div class="group">
        <label class="text-xs text-slate-400 ml-1 font-medium mb-1 block">ระบบปฏิบัติการ (Operating System)</label>
        <div class="relative">
            <input type="text" id="os_input" placeholder="เช่น Windows 11, Windows 10"
                class="w-full pl-4 pr-4 py-3 bg-black/20 border border-slate-700/50 rounded-xl text-sm text-slate-200 focus:outline-none focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-slate-600 shadow-sm hover:border-slate-600/50">
            <div class="absolute right-3 top-2.5 text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>
        </div>
    </div>
    <div class="h-px bg-slate-800/50 my-2"></div>
    `;
}
