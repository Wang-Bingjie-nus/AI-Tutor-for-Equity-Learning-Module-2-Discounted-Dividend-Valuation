"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NodeState = { score: number; needsReview: boolean };              // 节点状态
const DEFAULT_STATE: NodeState = { score: 0, needsReview: false };     // 初始化

export default function KnowledgeMap() {
  // 记录节点状态，控制主界面可视化
  const [ddmState, setDdmState] = useState<NodeState>(DEFAULT_STATE);
  const [ggmState, setGgmState] = useState<NodeState>(DEFAULT_STATE);

  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);        // 好像是加载的bug，但没造成实际影响
    
    const rawDdm = window.localStorage.getItem("ddm-proactive-state-v1");
    if (rawDdm) {
      try { setDdmState(JSON.parse(rawDdm)); } catch (e) { console.error(e); }
    }

    const rawGgm = window.localStorage.getItem("ggm-proactive-state-v1");
    if (rawGgm) {
      try { setGgmState(JSON.parse(rawGgm)); } catch (e) { console.error(e); }
    }
  }, []);

  if (!hasMounted) {
    return <div className="min-h-screen bg-slate-50" />;      // 过渡
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Learning Map</h1>
        <p className="text-slate-500 mt-3 text-lg">Select a knowledge node to begin your session.</p>
      </div>

      <div className="relative flex flex-col items-center mt-8">
        <div className="z-10 bg-indigo-600 text-white px-8 py-5 rounded-2xl shadow-xl border-4 border-indigo-200 w-80 text-center">
          <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Core Module</span>
          <h2 className="font-bold text-xl mt-1">Discounted Dividend Valuation</h2>
        </div>

        <div className="w-1 h-12 bg-slate-300"></div>
        <div className="hidden md:block w-[700px] h-1 bg-slate-300"></div>

        <div className="flex flex-col md:flex-row justify-between md:w-[700px] mt-0 gap-8 md:gap-0">
          
          {/* Node 1 - DDM Basics */}
          <div className="flex flex-col items-center relative -top-4 md:top-0">
            <div className="hidden md:block w-1 h-12 bg-slate-300"></div>
            <Link href="/learn/ddm" className="transition-all duration-300 hover:scale-105 hover:-translate-y-1">
              <div className={`relative px-6 py-4 rounded-xl shadow-lg border-2 w-64 text-center cursor-pointer ring-4 ring-indigo-50 ${ddmState.score >= 8 && !ddmState.needsReview ? 'bg-green-100 text-green-800 border-green-400' : 'bg-white text-slate-800 border-indigo-200'}`}>
                
                {ddmState.needsReview ? (
                   <div className="absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md animate-pulse">
                     NEEDS REVIEW
                   </div>
                ) : (
                  <div className="absolute -top-3 -right-3 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    ACTIVE
                  </div>
                )}
                
                <span className="text-xs font-bold uppercase tracking-wider">Concept 1</span>
                <h3 className="font-bold text-lg mt-1">DDM Basics</h3>
                <div className="mt-2 text-xs font-semibold">Mastery: {ddmState.score}/10</div>
              </div>
            </Link>
          </div>

          {/* Node 2 - GGM */}
          <div className="flex flex-col items-center relative -top-4 md:top-0">
            <div className="hidden md:block w-1 h-12 bg-slate-300"></div>
            <Link href="/learn/ggm" className="transition-all duration-300 hover:scale-105 hover:-translate-y-1">
              <div className={`relative px-6 py-4 rounded-xl shadow-lg border-2 w-64 text-center cursor-pointer ring-4 ring-indigo-50 ${ggmState.score >= 8 && !ggmState.needsReview ? 'bg-green-100 text-green-800 border-green-400' : 'bg-white text-slate-800 border-indigo-200'}`}>
                
                {ggmState.needsReview ? (
                   <div className="absolute -top-3 -right-3 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md animate-pulse">
                     NEEDS REVIEW
                   </div>
                ) : (
                  <div className="absolute -top-3 -right-3 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    ACTIVE
                  </div>
                )}
                
                <span className="text-xs font-bold uppercase tracking-wider">Concept 2</span>
                <h3 className="font-bold text-lg mt-1">The Gordon Growth Model</h3>
                <div className="mt-2 text-xs font-semibold">Mastery: {ggmState.score}/10</div>
              </div>
            </Link>
          </div>

          {/* Node 3 - Multistage DDM */}
          <div className="flex flex-col items-center">
            <div className="hidden md:block w-1 h-12 bg-slate-300"></div>
            <div className="relative px-6 py-4 rounded-xl shadow-sm border-2 w-56 text-center cursor-not-allowed opacity-90 bg-slate-200 text-slate-500 border-slate-300">
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