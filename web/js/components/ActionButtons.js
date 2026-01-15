export default function ActionButtons() {
    return `
    <button onclick="installVBox()"
        class="group w-full relative overflow-hidden p-3.5 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 border border-slate-600/50 text-slate-200 shadow-lg hover:shadow-sky-900/10 hover:border-sky-500/30 transition-all active:scale-[0.98]">
        <div class="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div class="relative flex items-center justify-center">
            <span class="mr-3 opacity-80 group-hover:text-sky-400 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
            </span>
            <span class="font-medium">0. ติดตั้ง VirtualBox (ถ้ายังไม่มี)</span>
        </div>
    </button>

    <button onclick="checkSys()"
        class="group w-full p-3.5 rounded-xl bg-slate-800/40 hover:bg-slate-700/40 text-slate-300 transition-all active:scale-[0.98] border border-slate-700/50 hover:border-slate-600">
        <div class="flex items-center justify-center">
            <span class="mr-3 text-slate-500 group-hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </span>
            <span>1. ตรวจสอบระบบ</span>
        </div>
    </button>

    <button onclick="installVM()"
        class="group w-full relative overflow-hidden p-3.5 rounded-xl bg-gradient-to-r from-orange-600/90 to-amber-600/90 hover:from-orange-500 hover:to-amber-500 text-white font-medium shadow-lg shadow-orange-900/20 transition-all active:scale-[0.98] border border-white/10">
        <div class="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
        <div class="relative flex items-center justify-center">
            <span class="mr-3 group-hover:scale-110 transition-transform">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
            </span>
            2. ติดตั้ง Wazuh (Install)
        </div>
    </button>

    <div class="grid grid-cols-2 gap-3 pt-2">
        <button onclick="startVM()"
            class="group relative overflow-hidden p-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98] border border-white/10">
            <div class="flex items-center justify-center">
                <span class="mr-2 group-hover:translate-x-0.5 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </span>
                Start
            </div>
        </button>

        <button onclick="stopVM()"
            class="group relative overflow-hidden p-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-medium shadow-lg shadow-red-900/20 transition-all active:scale-[0.98] border border-white/10">
            <div class="flex items-center justify-center">
                <span class="mr-2 group-hover:rotate-90 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                </span>
                Stop
            </div>
        </button>
    </div>

    <button id="btn-dashboard" onclick="openDashboard()" disabled
        class="group w-full flex items-center justify-center p-3 rounded-xl bg-slate-800/50 text-slate-500 font-medium border border-slate-700/50 cursor-not-allowed transition-all mt-3">
        <span class="mr-2 grayscale opacity-50">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </span> 
        Open Dashboard (<span id="show-ip">Waiting...</span>)
    </button>
    `;
}
