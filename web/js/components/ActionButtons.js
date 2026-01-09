export default function ActionButtons() {
    return `
    <button onclick="installVBox()"
        class="group w-full relative overflow-hidden p-3.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600/50 text-slate-200 shadow-lg hover:shadow-sky-900/10 hover:border-sky-500/30 transition-all active:scale-[0.98]">
        <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="relative flex items-center justify-center">
            <span class="mr-3 text-lg opacity-80 group-hover:text-sky-400 transition-colors">💾</span>
            <span class="font-medium">0. ติดตั้ง VirtualBox (ถ้ายังไม่มี)</span>
        </div>
    </button>

    <button onclick="checkSys()"
        class="group w-full p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-700/40 text-slate-300 transition-all active:scale-[0.98] border border-slate-700/50 hover:border-slate-600">
        <div class="flex items-center justify-center">
            <span class="mr-3 text-slate-500 group-hover:text-white transition-colors">🔍</span>
            <span>1. ตรวจสอบระบบ</span>
        </div>
    </button>

    <button onclick="installVM()"
        class="group w-full relative overflow-hidden p-3.5 rounded-xl bg-gradient-to-r from-orange-600/90 to-amber-600/90 hover:from-orange-500 hover:to-amber-500 text-white font-medium shadow-lg shadow-orange-900/20 transition-all active:scale-[0.98] border border-white/10">
        <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
        <div class="relative flex items-center justify-center">
            <span class="mr-3 group-hover:scale-110 transition-transform">📦</span>
            2. ติดตั้ง Wazuh (Install)
        </div>
    </button>

    <div class="grid grid-cols-2 gap-3 pt-2">
        <button onclick="startVM()"
            class="group relative overflow-hidden p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98] border border-white/10">
            <div class="flex items-center justify-center">
                <span class="mr-2 group-hover:translate-x-0.5 transition-transform">🚀</span>
                Start
            </div>
        </button>

        <button onclick="stopVM()"
            class="group relative overflow-hidden p-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] border border-white/10">
            <div class="flex items-center justify-center">
                <span class="mr-2 group-hover:rotate-90 transition-transform duration-300">🛑</span>
                Stop
            </div>
        </button>
    </div>

    <button id="btn-dashboard" onclick="openDashboard()" disabled
        class="group w-full flex items-center justify-center p-3 rounded-xl bg-slate-800/50 text-slate-500 font-medium border border-slate-700/50 cursor-not-allowed transition-all mt-3">
        <span class="mr-2 text-xl grayscale opacity-50">🌐</span> 
        Open Dashboard (<span id="show-ip">Waiting...</span>)
    </button>
    `;
}
