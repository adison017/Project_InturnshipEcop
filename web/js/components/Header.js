export default function Header() {
    return `
    <div class="text-center flex-1 flex flex-col items-center justify-center">
        <div class="relative group">
            <div class="absolute -inset-1 bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div class="relative w-32 h-32 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-2xl">
                <img src="logo_transparent.png" class="w-24 h-24 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" alt="Logo">
            </div>
        </div>
        
        <h1 class="text-3xl font-bold tracking-tight mt-6 text-white text-shadow-sm">Wazuh <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Launcher</span></h1>
        <p class="text-slate-400 text-sm mt-2 font-light tracking-wide">Secure Endpoint Monitoring System</p>
    </div>
    `;
}
