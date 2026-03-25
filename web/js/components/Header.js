export default function Header() {
    return `
    <div class="relative w-full text-center flex flex-col items-center justify-center pt-1">
        <div class="relative group cursor-default">
            <!-- Elegant Glow -->
            <div class="absolute -inset-4 bg-gradient-to-tr from-gray-200 via-gray-100 to-white rounded-full blur-xl opacity-0 group-hover:opacity-100 transition duration-700"></div>
            
            <!-- Logo Container (Circular with Refresh Icon) -->
            <div onclick="window.location.reload()" 
                 class="relative w-16 h-16 flex items-center justify-center cursor-pointer group" 
                 title="Reload Application">
                
                <!-- Spinning Refresh Icon (Absolute centered, visible on hover) -->
                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-50 group-hover:scale-[1.2] transition-all duration-500 pointer-events-none">
                     <svg xmlns="http://www.w3.org/2000/svg" class="w-full h-full text-neutral-500 animate-[spin_3s_linear_infinite]" fill="currentColor" viewBox="0 0 24 24" stroke="0.5">
                        <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                     </svg>
                </div>

                <!-- Central Logo (No Background) -->
                <div class="relative w-14 h-14 flex items-center justify-center transition-all duration-300 z-10">
                    <img src="logo_transparent.png" class="w-14 h-14 object-contain opacity-90 group-hover:opacity-100 transition-opacity" alt="Logo">
                </div>
            </div>
        </div>
        
        <div class="mt-2 space-y-0 relative">
            <h1 class="text-xl font-bold tracking-tight text-neutral-900 font-sans">
                WAZUH <span class="font-light">SERVER</span>
            </h1>
            <div class="flex items-center justify-center gap-2">
                <p class="text-neutral-500 text-[9px] font-medium uppercase">Security Endpoint</p>
            </div>
        </div>
    </div>
    `;
}
