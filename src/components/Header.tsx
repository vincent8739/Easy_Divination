import React from "react";
import { Compass, BookOpen, Feather } from "lucide-react";

interface HeaderProps {
  activeTab: "paipan" | "guide";
  setActiveTab: (tab: "paipan" | "guide") => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="border-b border-stone-200 bg-white/95 text-stone-900 shadow-xs backdrop-blur sticky top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-3.5 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/30">
            <Compass className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <h1 className="font-serif text-[13px] xs:text-sm sm:text-lg md:text-xl font-bold tracking-tight text-stone-900 leading-snug sm:leading-normal">
                簡易數字占卜排盤系統
              </h1>
              <span className="hidden xs:inline-flex rounded bg-amber-50 px-1.5 py-0.5 text-[10px] sm:text-xs font-semibold text-amber-800 ring-1 ring-amber-300 whitespace-nowrap">
                先天八卦數 · 京房納甲
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-500 hidden sm:block truncate">
              三組三位數（000~999）起卦 · 歲月日時干支排盤 · 傳統十四層全鑑
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 shrink-0 rounded-lg bg-stone-100 p-1 ring-1 ring-stone-200">
          <button
            id="tab-btn-paipan"
            onClick={() => setActiveTab("paipan")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all sm:px-3 sm:text-sm cursor-pointer whitespace-nowrap ${
              activeTab === "paipan"
                ? "bg-amber-600 text-white shadow-xs font-semibold"
                : "text-stone-600 hover:bg-white hover:text-stone-900"
            }`}
          >
            <Feather className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>起卦排盤</span>
          </button>

          <button
            id="tab-btn-guide"
            onClick={() => setActiveTab("guide")}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all sm:px-3 sm:text-sm cursor-pointer whitespace-nowrap ${
              activeTab === "guide"
                ? "bg-amber-600 text-white shadow-xs font-semibold"
                : "text-stone-600 hover:bg-white hover:text-stone-900"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span>易學研習</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
