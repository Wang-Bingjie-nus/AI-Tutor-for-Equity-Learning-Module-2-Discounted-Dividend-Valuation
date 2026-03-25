import Link from "next/link";

export default function KnowledgeMap() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
          Learning Map
        </h1>
        <p className="text-slate-500 mt-3 text-lg">
          Select a knowledge node to begin your session.
        </p>
      </div>

      {/* 图谱容器 */}
      <div className="relative flex flex-col items-center mt-8">
        
        {/* 中心节点：Module 2 */}
        <div className="z-10 bg-indigo-600 text-white px-8 py-5 rounded-2xl shadow-xl border-4 border-indigo-200 w-80 text-center">
          <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Core Module</span>
          <h2 className="font-bold text-xl mt-1">Discounted Dividend Valuation</h2>
          <p className="text-sm text-indigo-100 mt-2">Equity Learning Module 2</p>
        </div>

        {/* 主干连线 (垂直) */}
        <div className="w-1 h-12 bg-slate-300"></div>

        {/* 分支连线 (水平) - 仅在桌面端展开 */}
        <div className="hidden md:block w-[700px] h-1 bg-slate-300"></div>

        {/* 分支节点层 */}
        <div className="flex flex-col md:flex-row justify-between md:w-[700px] mt-0 gap-8 md:gap-0">
          
          {/* 节点 1: DDM Basics (占位) */}
          <div className="flex flex-col items-center">
            <div className="hidden md:block w-1 h-12 bg-slate-300"></div>
            <div className="bg-slate-200 text-slate-500 px-6 py-4 rounded-xl shadow-sm border-2 border-slate-300 w-56 text-center cursor-not-allowed opacity-70">
              <span className="text-xs font-bold uppercase tracking-wider">Concept 1</span>
              <h3 className="font-semibold mt-1">DDM Basics</h3>
              <p className="text-xs mt-2">(Locked)</p>
            </div>
          </div>

          {/* 节点 2: GGM Formula (高亮、可点击跳转) */}
          <div className="flex flex-col items-center relative -top-4 md:top-0">
            {/* 中间节点的连线 */}
            <div className="hidden md:block w-1 h-12 bg-slate-300"></div>
            {/* 这里的 Link 标签是 Next.js 的路由跳转 */}
            <Link href="/learn/ggm" className="transition-all duration-300 hover:scale-105 hover:-translate-y-1">
              <div className="bg-white text-slate-800 px-6 py-4 rounded-xl shadow-lg border-2 border-indigo-500 w-64 text-center cursor-pointer ring-4 ring-indigo-50">
                <div className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                  ACTIVE DEMO
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Concept 2</span>
                <h3 className="font-bold text-lg mt-1">The Gordon Growth Model</h3>
                <p className="text-xs mt-2 text-slate-500">Interactive Tutor Session</p>
              </div>
            </Link>
          </div>

          {/* 节点 3: Multistage DDM (占位) */}
          <div className="flex flex-col items-center">
            <div className="hidden md:block w-1 h-12 bg-slate-300"></div>
            <div className="bg-slate-200 text-slate-500 px-6 py-4 rounded-xl shadow-sm border-2 border-slate-300 w-56 text-center cursor-not-allowed opacity-70">
              <span className="text-xs font-bold uppercase tracking-wider">Concept 3</span>
              <h3 className="font-semibold mt-1">Multistage DDM</h3>
              <p className="text-xs mt-2">(Locked)</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}