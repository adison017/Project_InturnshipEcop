export default function Terminal() {
    return `
    <div class="w-full h-36 flex flex-col min-h-0 bg-slate-950 rounded-xl border border-slate-800 shadow-sm overflow-hidden font-mono text-[10px]">
        <!-- Terminal Header -->
        <div class="flex items-center justify-between px-3 py-1.5 bg-slate-900 border-b border-slate-800 flex-shrink-0">
            <div class="flex space-x-1.5">
                <div class="w-2.5 h-2.5 rounded-full bg-[#ff5f56] hover:bg-[#ff5f56]/80 transition-colors"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] hover:bg-[#ffbd2e]/80 transition-colors"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-[#27c93f] hover:bg-[#27c93f]/80 transition-colors"></div>
            </div>
            <div class="text-slate-500 text-[9px] font-medium tracking-wide flex items-center gap-1.5 opacity-80">
                user@wazuh-server
            </div>
            <div class="w-8"></div>
        </div>
        
        <!-- Terminal Body -->
        <div id="terminal-body" 
            class="flex-1 px-4 pt-3 overflow-y-auto font-mono text-slate-300 custom-scrollbar relative leading-relaxed scrollbar-thumb-slate-700 scrollbar-track-transparent">
            
            <div id="terminal-content" class="space-y-0.5">
                <!-- Initial Messages -->
                <div class="flex items-start">
                    <span class="text-slate-500">System initialized...</span>
                </div>
            </div>

            <!-- Active Line / Cursor -->
            <div class="flex items-center mt-1 mb-8">
                <span class="w-1.5 h-3 bg-slate-400 animate-pulse block"></span>
            </div>
        </div>
    </div>
    `;
}
