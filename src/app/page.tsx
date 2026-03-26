"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type NodeKey = "ddmBasics" | "ggm" | "multistageDdm";
type LearningStatuses = Record<NodeKey, number>;

const STORAGE_KEY = "learning-node-statuses-v1";

const DEFAULT_STATUSES: LearningStatuses = {
  ddmBasics: 0,
  ggm: 0,
  multistageDdm: 0,
};

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(10, Math.round(value)));
}

function loadStatuses(): LearningStatuses {
  if (typeof window === "undefined") return DEFAULT_STATUSES;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATUSES;

    const parsed = JSON.parse(raw) as Partial<LearningStatuses>;
    return {
      ddmBasics: clampScore(parsed.ddmBasics ?? 0),
      ggm: clampScore(parsed.ggm ?? 0),
      multistageDdm: clampScore(parsed.multistageDdm ?? 0),
    };
  } catch {
    return DEFAULT_STATUSES;
  }
}

function getNodeClasses(score: number) {
  if (score === 10) {
    return "bg-green-100 text-green-800 border-green-400";
  }

  if (score >= 5) {
    return "bg-lime-100 text-lime-800 border-lime-400";
  }

  if (score >= 1) {
    return "bg-orange-100 text-orange-800 border-orange-300";
  }

  return "bg-slate-200 text-slate-500 border-slate-300";
}

function showLowScoreAlert(score: number) {
  return score >= 1 && score <= 4;
}

function ScoreBadge({ score }: { score: number }) {
  return (
    <div className="mt-2 text-xs font-semibold">
      Mastery Score: {score}
    </div>
  );
}

function LowScoreIndicator() {
  return (
    <div className="absolute -top-3 -right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
      <div className="flex items-center gap-[2px]">
        <span className="animate-pulse">!</span>
        <span className="animate-pulse" style={{ animationDelay: "0.2s" }}>!</span>
        <span className="animate-pulse" style={{ animationDelay: "0.4s" }}>!</span>
      </div>
    </div>
  );
}

export default function KnowledgeMap() {
  const [statuses, setStatuses] = useState<LearningStatuses>(DEFAULT_STATUSES);

  useEffect(() => {
    const syncStatuses = () => setStatuses(loadStatuses());

    syncStatuses();
    window.addEventListener("storage", syncStatuses);

    return () => window.removeEventListener("storage", syncStatuses);
  }, []);

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

      <div className="relative flex flex-col items-center mt-8">
        <div className="z-10 bg-indigo-600 text-white px-8 py-5 rounded-2xl shadow-xl border-4 border-indigo-200 w-80 text-center">
          <span className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Core Module</span>
          <h2 className="font-bold text-xl mt-1">Discounted Dividend Valuation</h2>
          <p className="text-sm text-indigo-100 mt-2">Equity Learning Module 2</p>
        </div>

        <div className="w-1 h-12 bg-slate-300"></div>
        <div className="hidden md:block w-[700px] h-1 bg-slate-300"></div>

        <div className="flex flex-col md:flex-row justify-between md:w-[700px] mt-0 gap-8 md:gap-0">
          <div className="flex flex-col items-center">
            <div className="hidden md:block w-1 h-12 bg-slate-300"></div>
            <div
              className={`relative px-6 py-4 rounded-xl shadow-sm border-2 w-56 text-center cursor-not-allowed opacity-90 ${getNodeClasses(statuses.ddmBasics)}`}
            >
              {showLowScoreAlert(statuses.ddmBasics) && <LowScoreIndicator />}
              <span className="text-xs font-bold uppercase tracking-wider">Concept 1</span>
              <h3 className="font-semibold mt-1">DDM Basics</h3>
              <p className="text-xs mt-2">(Locked)</p>
              <ScoreBadge score={statuses.ddmBasics} />
            </div>
          </div>

          <div className="flex flex-col items-center relative -top-4 md:top-0">
            <div className="hidden md:block w-1 h-12 bg-slate-300"></div>
            <Link href="/learn/ggm" className="transition-all duration-300 hover:scale-105 hover:-translate-y-1">
              <div
                className={`relative px-6 py-4 rounded-xl shadow-lg border-2 w-64 text-center cursor-pointer ring-4 ring-indigo-50 ${getNodeClasses(statuses.ggm)}`}
              >
                {showLowScoreAlert(statuses.ggm) ? (
                  <LowScoreIndicator />
                ) : (
                  <div className="absolute -top-3 -right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full animate-pulse">
                    ACTIVE DEMO
                  </div>
                )}
                <span className="text-xs font-bold uppercase tracking-wider">Concept 2</span>
                <h3 className="font-bold text-lg mt-1">The Gordon Growth Model</h3>
                <p className="text-xs mt-2">Interactive Tutor Session</p>
                <ScoreBadge score={statuses.ggm} />
              </div>
            </Link>
          </div>

          <div className="flex flex-col items-center">
            <div className="hidden md:block w-1 h-12 bg-slate-300"></div>
            <div
              className={`relative px-6 py-4 rounded-xl shadow-sm border-2 w-56 text-center cursor-not-allowed opacity-90 ${getNodeClasses(statuses.multistageDdm)}`}
            >
              {showLowScoreAlert(statuses.multistageDdm) && <LowScoreIndicator />}
              <span className="text-xs font-bold uppercase tracking-wider">Concept 3</span>
              <h3 className="font-semibold mt-1">Multistage DDM</h3>
              <p className="text-xs mt-2">(Locked)</p>
              <ScoreBadge score={statuses.multistageDdm} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
