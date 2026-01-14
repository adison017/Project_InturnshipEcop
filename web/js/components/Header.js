export default function Header() {
    return `
    <div class="relative w-full text-center flex flex-col items-center justify-center pt-2">
        <div class="relative group cursor-default">
            <!-- Elegant Glow -->
            <div class="absolute -inset-4 bg-gradient-to-tr from-gray-200 via-gray-100 to-white rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
            
            <!-- Logo Container -->
            <div class="relative w-24 h-24 bg-white rounded-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500 ease-out flex items-center justify-center shadow-sm">
                <img src="logo_transparent.png" class="w-16 h-16 object-contain drop-shadow-sm opacity-90 group-hover:opacity-100 transition-opacity" alt="Logo">

                <!-- Integrated Refresh Button -->
                <button onclick="window.location.reload()" 
                    class="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full border border-neutral-100 shadow-md flex items-center justify-center text-neutral-400 hover:text-black hover:border-neutral-300 transition-all opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 duration-300 z-10 hover:shadow-lg" 
                    title="Reload Application">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
        </div>
        
        <div class="mt-4 space-y-0.5">
            <h1 class="text-2xl font-bold tracking-tight text-neutral-900 font-sans">
                WAZUH <span class="font-light">SERVER</span>
            </h1>
            <div class="flex items-center justify-center gap-2">
                <p class="text-neutral-500 text-[10px] font-medium uppercase">Security Endpoint</p>
            </div>
        </div>
    </div>
    `;
}
