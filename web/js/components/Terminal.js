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
            class="bg-black/40 border border-white/10 rounded-b-xl p-4 h-32 overflow-y-auto font-['Silkscreen',_'Sarabun',_'Chakra_Petch',_monospace] font-medium text-[11px] shadow-inner scroll-smooth backdrop-blur-sm">
            
            <div class="mt-1.5 px-2 py-1 rounded-md break-words flex items-start bg-emerald-500/10 hover:bg-emerald-500/20">
                <span class="mr-2 opacity-70 select-none flex items-center h-full pt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                </span>
                <span class="text-emerald-400">System initialized...</span>
            </div>

            <div class="mt-1.5 px-2 py-1 rounded-md break-words flex items-start bg-sky-500/5 hover:bg-sky-500/10">
                <span class="mr-2 opacity-70 select-none flex items-center h-full pt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>
                </span>
                <span class="text-slate-500">Waiting for command...</span>
            </div>
        </div>
    </div>
    `;
}
