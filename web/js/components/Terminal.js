export default function Terminal() {
    return `
    <div class="w-full">
        <div class="flex items-center justify-between px-4 py-2 bg-black/60 rounded-t-xl border border-white/10 border-b-0 backdrop-blur-md">
            <span class="text-[10px] text-slate-400 font-mono tracking-wider flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l3 3-3 3m5 0h3" />
                </svg>
                TERMINAL OUTPUT
            </span>
            <div class="flex space-x-1.5">
                <div class="w-2.5 h-2.5 rounded-full bg-red-500/80 shadow-sm"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-yellow-500/80 shadow-sm"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-emerald-500/80 shadow-sm"></div>
            </div>
        </div>
        <div id="status-box"
            class="bg-black/40 border border-white/10 rounded-b-xl p-4 h-32 overflow-y-auto font-['Silkscreen',_'Chakra_Petch',_monospace] font-medium text-xs shadow-inner scroll-smooth backdrop-blur-sm">
            <p id="status" class="text-emerald-400">> System initialized...</p>
            <p class="text-slate-500 mt-1">> Waiting for command...</p>
        </div>
    </div>
    `;
}
