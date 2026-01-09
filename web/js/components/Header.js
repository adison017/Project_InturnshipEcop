export default function Header() {
    return `
    <div class="relative w-full text-center flex flex-col items-center justify-center">
        <!-- Refresh Button -->
        <button onclick="window.location.reload()" class="absolute top-1 right-1 p-2 rounded-full text-slate-600 hover:bg-slate-800/50 hover:text-sky-400 transition-all duration-300" title="Refresh Application">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        </button>

        <div class="relative group">
            <div class="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
            <div class="relative w-20 h-20 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-xl">
                <img src="logo_transparent.png" class="w-14 h-14 object-contain drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]" alt="Logo">
            </div>
        </div>
        
        <h1 class="text-xl font-bold tracking-tight mt-3 text-white">Wazuh <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Launcher</span></h1>
        <p class="text-slate-400 text-[10px] mt-1 font-light tracking-wide">Secure Endpoint Monitoring</p>
    </div>
    `;
}
