export default function OSInput() {
    return `
    <div class="group">
        <label class="text-xs text-slate-400 ml-1 font-medium mb-1 block">ระบบปฏิบัติการที่ตรวจพบ (Detected OS)</label>
        <div class="relative">
            <input type="text" id="os_input" placeholder="Detecting..." readonly
                class="w-full pl-4 pr-4 py-3 bg-black/20 border border-slate-700/50 rounded-xl text-sm text-sky-300 font-semibold focus:outline-none cursor-default shadow-sm select-none">
            <div class="absolute right-3 top-2.5 text-sky-500 animate-pulse" id="os_icon">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
        </div>
    </div>
    <div class="h-px bg-slate-800/50 my-2"></div>
    `;
}
