import React, { useState } from "react";
import {
  User,
  Users,
  Target,
  Sparkles,
  Flame,
  Layers,
  Shield,
  Moon,
  Sun,
  Zap,
  RefreshCw,
  GitMerge,
  CircleOff,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Info,
  Compass,
  Calendar,
} from "lucide-react";
import { DivinationResult, LiuYaoLayeredAnalysis } from "../types/liuyao";

interface LiuYao14LayersProps {
  result: DivinationResult;
  onSelectLine?: (lineIndex: number) => void;
  onOpenLineDetail?: (lineIndex: number) => void;
}

type FilterCategory = "all" | "shiying" | "liuqin" | "shikong" | "dongbian" | "shensha" | "yingqi";

export const LiuYao14Layers: React.FC<LiuYao14LayersProps> = ({
  result,
  onSelectLine,
  onOpenLineDetail,
}) => {
  const analysis = result.layeredAnalysis;
  const [activeLayer, setActiveLayer] = useState<number | null>(null);
  const [filterCategory, setFilterCategory] = useState<FilterCategory>("all");
  const [expandedLayers, setExpandedLayers] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    10: true,
    11: true,
    12: true,
    13: true,
    14: true,
  });

  if (!analysis) {
    return null;
  }

  const toggleLayer = (layerNum: number) => {
    setExpandedLayers((prev) => ({
      ...prev,
      [layerNum]: !prev[layerNum],
    }));
  };

  const expandAll = () => {
    const all: Record<number, boolean> = {};
    for (let i = 1; i <= 14; i++) all[i] = true;
    setExpandedLayers(all);
  };

  const collapseAll = () => {
    const none: Record<number, boolean> = {};
    for (let i = 1; i <= 14; i++) none[i] = false;
    setExpandedLayers(none);
  };

  // 14 layer definitions with icons, categories and titles
  const layerDefs = [
    { num: 1, title: "世爻", subtitle: "我身本體·立場心態", icon: User, cat: "shiying", color: "text-amber-800 bg-amber-50 border-amber-200" },
    { num: 2, title: "應爻", subtitle: "彼方對象·環境相生剋", icon: Users, cat: "shiying", color: "text-teal-800 bg-teal-50 border-teal-200" },
    { num: 3, title: "用神", subtitle: "所求核心·定局主神", icon: Target, cat: "liuqin", color: "text-rose-800 bg-rose-50 border-rose-200" },
    { num: 4, title: "原神", subtitle: "用神之源·生助活泉", icon: Sparkles, cat: "liuqin", color: "text-emerald-800 bg-emerald-50 border-emerald-200" },
    { num: 5, title: "忌神", subtitle: "剋用阻力·仇神相助", icon: Flame, cat: "liuqin", color: "text-red-800 bg-red-50 border-red-200" },
    { num: 6, title: "伏神", subtitle: "底層暗線·本宮伏藏", icon: Layers, cat: "liuqin", color: "text-indigo-800 bg-indigo-50 border-indigo-200" },
    { num: 7, title: "飛神", subtitle: "表象覆蓋·飛伏生剋", icon: Shield, cat: "liuqin", color: "text-stone-800 bg-stone-100 border-stone-300" },
    { num: 8, title: "月建", subtitle: "三旬提綱·五行旺衰", icon: Moon, cat: "shikong", color: "text-sky-800 bg-sky-50 border-sky-200" },
    { num: 9, title: "日辰", subtitle: "當令生殺·暗動日破", icon: Sun, cat: "shikong", color: "text-amber-900 bg-amber-100 border-amber-300" },
    { num: 10, title: "動爻", subtitle: "機兆發動·生剋轉折", icon: Zap, cat: "dongbian", color: "text-orange-800 bg-orange-50 border-orange-200" },
    { num: 11, title: "變爻", subtitle: "事之終局·動變格局", icon: RefreshCw, cat: "dongbian", color: "text-purple-800 bg-purple-50 border-purple-200" },
    { num: 12, title: "合沖刑害", subtitle: "地支神機·三合三刑六害", icon: GitMerge, cat: "shensha", color: "text-cyan-800 bg-cyan-50 border-cyan-200" },
    { num: 13, title: "旬空", subtitle: "落空避凶·出旬填實", icon: CircleOff, cat: "shensha", color: "text-fuchsia-800 bg-fuchsia-50 border-fuchsia-200" },
    { num: 14, title: "應期", subtitle: "增刪鐵律·應驗日時", icon: Clock, cat: "yingqi", color: "text-emerald-900 bg-emerald-100 border-emerald-300" },
  ];

  const visibleLayerDefs = layerDefs.filter((l) => {
    if (filterCategory === "all") return true;
    return l.cat === filterCategory;
  });

  return (
    <div id="traditional-14-layers-panel" className="space-y-6">
      {/* Header & Controls */}
      <div className="rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-stone-50 to-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-200/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-800 text-amber-100 font-serif font-bold text-sm shadow-2xs">
                易
              </span>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                傳統六爻十四層逐層推演全鑑
              </h3>
              <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-xs font-semibold text-amber-900">
                野鶴·王洪緒·劉伯溫 正統傳承
              </span>
            </div>
            <p className="text-xs text-stone-600">
              遵循《增刪卜易》《卜筮正宗》《黃金策》正統易理體系，由「世、應、用、原、忌、伏、飛、月、日、動、變、合沖刑害、旬空、應期」十四重維度逐層深度剖析。
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={expandAll}
              className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 shadow-2xs transition cursor-pointer"
            >
              全部展開
            </button>
            <button
              onClick={collapseAll}
              className="rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 font-medium text-stone-700 hover:bg-stone-50 hover:text-stone-900 shadow-2xs transition cursor-pointer"
            >
              全部收合
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-semibold text-stone-500 mr-1">體系過濾：</span>
          <button
            onClick={() => setFilterCategory("all")}
            className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
              filterCategory === "all"
                ? "bg-amber-800 text-white shadow-2xs"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            全部 14 層
          </button>
          <button
            onClick={() => setFilterCategory("shiying")}
            className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
              filterCategory === "shiying"
                ? "bg-amber-800 text-white shadow-2xs"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            ①② 主客體系 (世·應)
          </button>
          <button
            onClick={() => setFilterCategory("liuqin")}
            className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
              filterCategory === "liuqin"
                ? "bg-amber-800 text-white shadow-2xs"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            ③④⑤⑥⑦ 六親綱維 (用·原·忌·伏·飛)
          </button>
          <button
            onClick={() => setFilterCategory("shikong")}
            className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
              filterCategory === "shikong"
                ? "bg-amber-800 text-white shadow-2xs"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            ⑧⑨ 時空氣場 (月建·日辰)
          </button>
          <button
            onClick={() => setFilterCategory("dongbian")}
            className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
              filterCategory === "dongbian"
                ? "bg-amber-800 text-white shadow-2xs"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            ⑩⑪ 動態演進 (動爻·變爻)
          </button>
          <button
            onClick={() => setFilterCategory("shensha")}
            className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
              filterCategory === "shensha"
                ? "bg-amber-800 text-white shadow-2xs"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            ⑫⑬ 神機定則 (合沖刑害·旬空)
          </button>
          <button
            onClick={() => setFilterCategory("yingqi")}
            className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
              filterCategory === "yingqi"
                ? "bg-amber-800 text-white shadow-2xs"
                : "bg-white border border-stone-200 text-stone-600 hover:bg-stone-50"
            }`}
          >
            ⑭ 決斷應驗 (應期推演)
          </button>
        </div>

        {/* Quick Stepper Bar (1-14 Pills) */}
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 pt-1">
          {layerDefs.map((def) => {
            const Icon = def.icon;
            const isExpanded = expandedLayers[def.num];
            return (
              <button
                key={def.num}
                onClick={() => {
                  toggleLayer(def.num);
                  const el = document.getElementById(`layer-card-${def.num}`);
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                className={`flex items-center gap-1.5 p-1.5 rounded-lg border text-left transition cursor-pointer ${
                  isExpanded
                    ? "bg-amber-100/90 border-amber-300 shadow-2xs text-amber-950"
                    : "bg-white/80 border-stone-200 hover:bg-amber-50/50 text-stone-700"
                }`}
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-800 text-[10px] font-bold text-amber-100">
                  {def.num < 10 ? `0${def.num}` : def.num}
                </span>
                <div className="truncate">
                  <span className="font-serif font-bold text-xs block leading-tight">{def.title}</span>
                  <span className="text-[9px] text-stone-500 truncate block">{def.subtitle.split("·")[0]}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 14 Layer Cards Container */}
      <div className="space-y-4">
        {/* ========================================================================= */}
        {/* LAYER 1: 世爻 (Shi Yao) */}
        {/* ========================================================================= */}
        {visibleLayerDefs.some((l) => l.num === 1) && (
          <div
            id="layer-card-1"
            className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-amber-300"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleLayer(1)}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-800 text-amber-100 font-bold text-sm shadow-2xs">
                  01
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      【第一層】世爻（我身本體·根基心態）
                    </h4>
                    <span className="rounded bg-amber-100 border border-amber-300 px-2 py-0.5 text-xs font-bold text-amber-900">
                      第 {analysis.layer1Shi.lineIndex} 爻 · {analysis.layer1Shi.relative}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">{analysis.layer1Shi.meaning}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onOpenLineDetail && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenLineDetail(analysis.layer1Shi.lineIndex);
                    }}
                    className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-900 transition"
                  >
                    開啟該爻推演
                  </button>
                )}
                {expandedLayers[1] ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
              </div>
            </div>

            {expandedLayers[1] && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-700">
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <span className="text-stone-400 block text-[10px]">納甲干支五行</span>
                    <strong className="text-stone-900 text-xs">{analysis.layer1Shi.stem}{analysis.layer1Shi.branch}（{analysis.layer1Shi.wuxing}）</strong>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <span className="text-stone-400 block text-[10px]">所臨六神</span>
                    <strong className="text-stone-900 text-xs">{analysis.layer1Shi.sixSpirit}</strong>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <span className="text-stone-400 block text-[10px]">月令旺衰</span>
                    <strong className="text-stone-900 text-xs">月令【{analysis.layer1Shi.wangXiang}】{analysis.layer1Shi.isMonthPo ? " (月破)" : ""}</strong>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <span className="text-stone-400 block text-[10px]">日辰動態</span>
                    <strong className="text-stone-900 text-xs">{analysis.layer1Shi.isXunKong ? "落旬空 " : ""}{analysis.layer1Shi.isMoving ? "發動變卦" : "安靜"}</strong>
                  </div>
                </div>

                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 text-stone-800 leading-relaxed">
                  <strong className="text-amber-900 font-bold block mb-1">【世爻現狀與吉凶判定】</strong>
                  <p>{analysis.layer1Shi.evaluation}</p>
                  <p className="mt-1 text-stone-600">{analysis.layer1Shi.dayRelation}</p>
                  {analysis.layer1Shi.dongBianSummary && (
                    <p className="mt-1 text-purple-900 font-medium">動變趨勢：{analysis.layer1Shi.dongBianSummary}</p>
                  )}
                </div>

                <div className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                  {analysis.layer1Shi.classicalQuote}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LAYER 2: 應爻 (Ying Yao) */}
        {/* ========================================================================= */}
        {visibleLayerDefs.some((l) => l.num === 2) && (
          <div
            id="layer-card-2"
            className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-teal-300"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleLayer(2)}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-800 text-teal-100 font-bold text-sm shadow-2xs">
                  02
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      【第二層】應爻（彼方對象·環境與世應生剋）
                    </h4>
                    <span className="rounded bg-teal-100 border border-teal-300 px-2 py-0.5 text-xs font-bold text-teal-900">
                      第 {analysis.layer2Ying.lineIndex} 爻 · {analysis.layer2Ying.relative}
                    </span>
                    <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-800">
                      {analysis.layer2Ying.relationWithShi}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">{analysis.layer2Ying.meaning}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onOpenLineDetail && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenLineDetail(analysis.layer2Ying.lineIndex);
                    }}
                    className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-teal-50 hover:bg-teal-100 border border-teal-300 px-2 py-1 text-xs font-semibold text-teal-900 transition"
                  >
                    開啟該爻推演
                  </button>
                )}
                {expandedLayers[2] ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
              </div>
            </div>

            {expandedLayers[2] && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-700">
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <span className="text-stone-400 block text-[10px]">應爻干支五行</span>
                    <strong className="text-stone-900 text-xs">{analysis.layer2Ying.stem}{analysis.layer2Ying.branch}（{analysis.layer2Ying.wuxing}）</strong>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <span className="text-stone-400 block text-[10px]">應爻六神</span>
                    <strong className="text-stone-900 text-xs">{analysis.layer2Ying.sixSpirit}</strong>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <span className="text-stone-400 block text-[10px]">應爻旺衰</span>
                    <strong className="text-stone-900 text-xs">月令【{analysis.layer2Ying.wangXiang}】</strong>
                  </div>
                  <div className="bg-stone-50 p-2 rounded-lg border border-stone-200">
                    <span className="text-stone-400 block text-[10px]">世應格局</span>
                    <strong className="text-teal-900 text-xs">{analysis.layer2Ying.relationWithShi}</strong>
                  </div>
                </div>

                <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 text-stone-800 leading-relaxed">
                  <strong className="text-teal-900 font-bold block mb-1">【世應交感考證】</strong>
                  <p>{analysis.layer2Ying.relationWithShiDesc}</p>
                </div>

                <div className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                  {analysis.layer2Ying.classicalQuote}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LAYER 3: 用神 (Yong Shen) */}
        {/* ========================================================================= */}
        {visibleLayerDefs.some((l) => l.num === 3) && (
          <div
            id="layer-card-3"
            className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-rose-300"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleLayer(3)}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-800 text-rose-100 font-bold text-sm shadow-2xs">
                  03
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      【第三層】用神（所求核心·定局主神）
                    </h4>
                    <span className="rounded bg-rose-100 border border-rose-300 px-2 py-0.5 text-xs font-bold text-rose-900">
                      類別：{analysis.layer3YongShen.category}
                    </span>
                    <span className="rounded bg-amber-100 border border-amber-300 px-2 py-0.5 text-xs font-bold text-amber-900">
                      能量指標 {analysis.layer3YongShen.powerScore}%
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">{analysis.layer3YongShen.selectionReason}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!analysis.layer3YongShen.isMissingInOriginal && onOpenLineDetail && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenLineDetail(analysis.layer3YongShen.primaryLineIndex);
                    }}
                    className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-900 transition"
                  >
                    開啟用神爻推演
                  </button>
                )}
                {expandedLayers[3] ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
              </div>
            </div>

            {expandedLayers[3] && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 animate-in fade-in duration-150 text-xs">
                {/* Power Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-stone-700">用神整體生克力量指數</span>
                    <span className="text-rose-900 font-bold">{analysis.layer3YongShen.powerScore} / 100</span>
                  </div>
                  <div className="h-2.5 w-full bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        analysis.layer3YongShen.powerScore >= 70
                          ? "bg-emerald-600"
                          : analysis.layer3YongShen.powerScore >= 45
                          ? "bg-amber-500"
                          : "bg-rose-600"
                      }`}
                      style={{ width: `${analysis.layer3YongShen.powerScore}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 bg-rose-50/60 rounded-xl border border-rose-200 text-stone-800 leading-relaxed">
                  <strong className="text-rose-900 font-bold block mb-1">【用神狀態斷語】</strong>
                  <p>{analysis.layer3YongShen.statusDescription}</p>
                  <p className="mt-1 font-semibold text-stone-900">{analysis.layer3YongShen.summary}</p>
                </div>

                <div className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                  {analysis.layer3YongShen.classicalQuote}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LAYER 4: 原神 (Yuan Shen) */}
        {/* ========================================================================= */}
        {visibleLayerDefs.some((l) => l.num === 4) && (
          <div
            id="layer-card-4"
            className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-emerald-300"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleLayer(4)}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-800 text-emerald-100 font-bold text-sm shadow-2xs">
                  04
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      【第四層】原神（用神之源·生助活泉）
                    </h4>
                    <span className="rounded bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-xs font-bold text-emerald-900">
                      生用神者：{analysis.layer4YuanShen.category}
                    </span>
                    <span className="rounded bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-800">
                      {analysis.layer4YuanShen.status}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    {analysis.layer4YuanShen.existInOriginal
                      ? `卦中於第 ${analysis.layer4YuanShen.lineIndices.join("、")} 爻現出原神`
                      : "卦中無原神，用神無本卦生助之源"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedLayers[4] ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
              </div>
            </div>

            {expandedLayers[4] && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-stone-800 leading-relaxed">
                  <strong className="text-emerald-900 font-bold block mb-1">【原神生扶效能分析】</strong>
                  <p>{analysis.layer4YuanShen.summary}</p>
                </div>

                {analysis.layer4YuanShen.details.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.layer4YuanShen.details.map((d) => (
                      <div key={d.lineIndex} className="p-2.5 rounded-lg border border-stone-200 bg-stone-50">
                        <div className="flex justify-between items-center mb-1">
                          <strong className="text-stone-900 font-serif">{d.name}（{d.branch}{d.wuxing}）</strong>
                          <span className="text-xs font-semibold text-emerald-800">月令【{d.wangXiang}】</span>
                        </div>
                        <p className="text-stone-600 text-[11px]">{d.effectDesc}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                  {analysis.layer4YuanShen.classicalQuote}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LAYER 5: 忌神 (Ji Shen) */}
        {/* ========================================================================= */}
        {visibleLayerDefs.some((l) => l.num === 5) && (
          <div
            id="layer-card-5"
            className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-red-300"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleLayer(5)}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-800 text-red-100 font-bold text-sm shadow-2xs">
                  05
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      【第五層】忌神（剋用阻力·仇神相助）
                    </h4>
                    <span className="rounded bg-red-100 border border-red-300 px-2 py-0.5 text-xs font-bold text-red-900">
                      剋用神者：{analysis.layer5JiShen.category}
                    </span>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                      analysis.layer5JiShen.threatLevel === "極高"
                        ? "bg-rose-600 text-white"
                        : analysis.layer5JiShen.threatLevel === "中等"
                        ? "bg-amber-200 text-amber-900"
                        : "bg-emerald-100 text-emerald-900"
                    }`}>
                      威脅等級：{analysis.layer5JiShen.threatLevel}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    仇神（生忌剋原者）：【{analysis.layer5JiShen.chouShenCategory}】
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedLayers[5] ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
              </div>
            </div>

            {expandedLayers[5] && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="p-3 bg-red-50/60 rounded-xl border border-red-200 text-stone-800 leading-relaxed">
                  <strong className="text-red-900 font-bold block mb-1">【忌神阻害推演】</strong>
                  <p>{analysis.layer5JiShen.summary}</p>
                </div>

                {analysis.layer5JiShen.details.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.layer5JiShen.details.map((d) => (
                      <div key={d.lineIndex} className="p-2.5 rounded-lg border border-stone-200 bg-stone-50">
                        <div className="flex justify-between items-center mb-1">
                          <strong className="text-stone-900 font-serif">{d.name}（{d.branch}{d.wuxing}）</strong>
                          <span className="text-xs font-semibold text-red-800">月令【{d.wangXiang}】</span>
                        </div>
                        <p className="text-stone-600 text-[11px]">{d.effectDesc}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                  {analysis.layer5JiShen.classicalQuote}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LAYER 6: 伏神 (Fu Shen) */}
        {/* ========================================================================= */}
        {visibleLayerDefs.some((l) => l.num === 6) && (
          <div
            id="layer-card-6"
            className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-indigo-300"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleLayer(6)}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-800 text-indigo-100 font-bold text-sm shadow-2xs">
                  06
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      【第六層】伏神（本宮八純卦底層伏藏）
                    </h4>
                    <span className="rounded bg-indigo-100 border border-indigo-300 px-2 py-0.5 text-xs font-bold text-indigo-900">
                      純卦：{analysis.layer6FuShen.pureHexagramName}
                    </span>
                    <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
                      本卦缺：{analysis.layer6FuShen.missingRelatives.length ? analysis.layer6FuShen.missingRelatives.join("、") : "無缺"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">{analysis.layer6FuShen.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedLayers[6] ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
              </div>
            </div>

            {expandedLayers[6] && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {analysis.layer6FuShen.fushenList.map((f) => (
                    <div
                      key={f.lineIndex}
                      className={`p-2.5 rounded-xl border ${
                        f.isMissingInOriginal
                          ? "bg-amber-50/70 border-amber-300 shadow-2xs"
                          : "bg-stone-50 border-stone-200"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <strong className="text-stone-900 font-serif">第 {f.lineIndex} 爻伏：{f.relative}{f.branch}{f.wuxing}</strong>
                        {f.isMissingInOriginal && (
                          <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            所缺正伏
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-600">飛伏關係：【{f.relationWithFeishen}】({f.relationDesc})</p>
                      <p className="text-[10px] mt-1 text-stone-500">{f.emergedReason}</p>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                  {analysis.layer6FuShen.classicalQuote}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LAYER 7: 飛神 (Fei Shen) */}
        {/* ========================================================================= */}
        {visibleLayerDefs.some((l) => l.num === 7) && (
          <div
            id="layer-card-7"
            className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-stone-400"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleLayer(7)}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-stone-800 text-stone-100 font-bold text-sm shadow-2xs">
                  07
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      【第七層】飛神（表象覆蓋·飛神空破解脫）
                    </h4>
                    <span className="rounded bg-stone-100 border border-stone-300 px-2 py-0.5 text-xs font-bold text-stone-900">
                      壓覆於伏神之上之卦面爻
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">{analysis.layer7FeiShen.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedLayers[7] ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
              </div>
            </div>

            {expandedLayers[7] && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {analysis.layer7FeiShen.feiShenList.map((f) => (
                    <div key={f.lineIndex} className="p-2.5 rounded-xl border border-stone-200 bg-stone-50">
                      <div className="flex justify-between items-center mb-1">
                        <strong className="text-stone-900 font-serif">{f.lineName}（飛:{f.feiRelative}{f.feiBranch}）</strong>
                        <span className="text-[10px] text-stone-500">伏:{f.fuRelative}{f.fuBranch}</span>
                      </div>
                      <p className="text-[11px] text-stone-700">{f.impactOnFu}</p>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                  {analysis.layer7FeiShen.classicalQuote}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LAYER 8: 月建 (Yue Jian) */}
        {/* ========================================================================= */}
        {visibleLayerDefs.some((l) => l.num === 8) && (
          <div
            id="layer-card-8"
            className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-sky-300"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleLayer(8)}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-800 text-sky-100 font-bold text-sm shadow-2xs">
                  08
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      【第八層】月建（三旬提綱·萬物旺相休囚死與月破）
                    </h4>
                    <span className="rounded bg-sky-100 border border-sky-300 px-2 py-0.5 text-xs font-bold text-sky-900">
                      月令【{analysis.layer8YueJian.ganzhiMonth}】{analysis.layer8YueJian.yueJianWuxing}旺
                    </span>
                    {analysis.layer8YueJian.monthPoLines.length > 0 && (
                      <span className="rounded bg-rose-600 text-white px-2 py-0.5 text-xs font-bold">
                        逢月破 {analysis.layer8YueJian.monthPoLines.length} 爻
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">{analysis.layer8YueJian.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedLayers[8] ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
              </div>
            </div>

            {expandedLayers[8] && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 animate-in fade-in duration-150 text-xs">
                {/* Wang Xiang Level Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <strong className="text-emerald-900 block text-xs">旺（同氣）</strong>
                    <span className="text-[11px] text-stone-600">{analysis.layer8YueJian.wangDistribution.旺.join("、") || "無"}</span>
                  </div>
                  <div className="p-2 bg-teal-50 border border-teal-200 rounded-lg">
                    <strong className="text-teal-900 block text-xs">相（令生）</strong>
                    <span className="text-[11px] text-stone-600">{analysis.layer8YueJian.wangDistribution.相.join("、") || "無"}</span>
                  </div>
                  <div className="p-2 bg-stone-50 border border-stone-200 rounded-lg">
                    <strong className="text-stone-700 block text-xs">休（生令）</strong>
                    <span className="text-[11px] text-stone-600">{analysis.layer8YueJian.wangDistribution.休.join("、") || "無"}</span>
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <strong className="text-amber-900 block text-xs">囚（剋令）</strong>
                    <span className="text-[11px] text-stone-600">{analysis.layer8YueJian.wangDistribution.囚.join("、") || "無"}</span>
                  </div>
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-lg">
                    <strong className="text-rose-900 block text-xs">死（令剋）</strong>
                    <span className="text-[11px] text-stone-600">{analysis.layer8YueJian.wangDistribution.死.join("、") || "無"}</span>
                  </div>
                </div>

                {analysis.layer8YueJian.monthPoLines.length > 0 && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-300 text-stone-800">
                    <strong className="text-rose-900 font-bold block mb-1">【月破考證】逢月建正沖</strong>
                    {analysis.layer8YueJian.monthPoLines.map((m) => (
                      <p key={m.lineIndex} className="text-xs">{m.name}（{m.branch}）：{m.desc}</p>
                    ))}
                  </div>
                )}

                <div className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                  {analysis.layer8YueJian.classicalQuote}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LAYER 9: 日辰 (Ri Chen) */}
        {/* ========================================================================= */}
        {visibleLayerDefs.some((l) => l.num === 9) && (
          <div
            id="layer-card-9"
            className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-amber-400"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleLayer(9)}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-900 text-amber-100 font-bold text-sm shadow-2xs">
                  09
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      【第九層】日辰（一日主宰·暗動·日破·生殺機杼）
                    </h4>
                    <span className="rounded bg-amber-100 border border-amber-300 px-2 py-0.5 text-xs font-bold text-amber-950">
                      日辰【{analysis.layer9RiChen.ganzhiDay}】{analysis.layer9RiChen.riChenWuxing}值令
                    </span>
                    {analysis.layer9RiChen.anDongLines.length > 0 && (
                      <span className="rounded bg-purple-100 border border-purple-300 text-purple-950 px-2 py-0.5 text-xs font-bold">
                        暗動 {analysis.layer9RiChen.anDongLines.length} 爻
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">{analysis.layer9RiChen.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedLayers[9] ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
              </div>
            </div>

            {expandedLayers[9] && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/50">
                    <strong className="text-purple-900 block mb-0.5">【暗動之爻】旺相逢日沖</strong>
                    <p className="text-stone-700 text-[11px]">
                      {analysis.layer9RiChen.anDongLines.length
                        ? analysis.layer9RiChen.anDongLines.map((a) => `${a.name}(${a.branch})`).join("、")
                        : "全卦無暗動"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-rose-200 bg-rose-50/50">
                    <strong className="text-rose-900 block mb-0.5">【日破之爻】休囚遭日沖</strong>
                    <p className="text-stone-700 text-[11px]">
                      {analysis.layer9RiChen.riPoLines.length
                        ? analysis.layer9RiChen.riPoLines.map((p) => `${p.name}(${p.branch})`).join("、")
                        : "全卦無日破"}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50">
                    <strong className="text-amber-900 block mb-0.5">【日辰六合】得日絆成全</strong>
                    <p className="text-stone-700 text-[11px]">
                      {analysis.layer9RiChen.riHeLines.length
                        ? analysis.layer9RiChen.riHeLines.map((h) => `${h.name}(${h.branch})`).join("、")
                        : "無特殊日合"}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                  {analysis.layer9RiChen.classicalQuote}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LAYER 10: 動爻 (Dong Yao) */}
        {/* ========================================================================= */}
        {visibleLayerDefs.some((l) => l.num === 10) && (
          <div
            id="layer-card-10"
            className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-orange-300"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleLayer(10)}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-800 text-orange-100 font-bold text-sm shadow-2xs">
                  10
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      【第十層】動爻（機兆發動·神機生剋權柄）
                    </h4>
                    <span className={`rounded px-2 py-0.5 text-xs font-bold ${
                      analysis.layer10DongYao.hasMoving
                        ? "bg-orange-100 border border-orange-300 text-orange-950"
                        : "bg-stone-100 text-stone-700"
                    }`}>
                      {analysis.layer10DongYao.hasMoving
                        ? `發動 ${analysis.layer10DongYao.movingLines.length} 爻`
                        : "六爻安靜（靜卦）"}
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">{analysis.layer10DongYao.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedLayers[10] ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
              </div>
            </div>

            {expandedLayers[10] && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 animate-in fade-in duration-150 text-xs">
                {analysis.layer10DongYao.hasMoving ? (
                  <div className="space-y-2">
                    {analysis.layer10DongYao.movingLines.map((m) => (
                      <div key={m.lineIndex} className="p-3 rounded-xl border border-orange-200 bg-orange-50/40">
                        <div className="flex justify-between items-center mb-1">
                          <strong className="text-stone-900 font-serif text-sm">
                            第 {m.lineIndex} 爻【{m.name}】（{m.relative}{m.branch}{m.wuxing}）發動
                          </strong>
                          <span className="rounded bg-orange-200 text-orange-950 text-[10px] font-bold px-2 py-0.5">
                            {m.dongBianDetail?.title || "發動"}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-[11px] text-stone-700">
                          <div className="bg-white p-2 rounded border border-stone-200">
                            <strong className="text-rose-900 block">對用神影響：</strong>
                            <span>{m.impactOnYong}</span>
                          </div>
                          <div className="bg-white p-2 rounded border border-stone-200">
                            <strong className="text-amber-900 block">對世爻影響：</strong>
                            <span>{m.impactOnShi}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600">
                    卦無動爻，事態平靜少變，全看日月建與世應旺衰。
                  </div>
                )}

                <div className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                  {analysis.layer10DongYao.classicalQuote}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LAYER 11: 變爻 (Bian Yao) */}
        {/* ========================================================================= */}
        {visibleLayerDefs.some((l) => l.num === 11) && (
          <div
            id="layer-card-11"
            className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-purple-300"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleLayer(11)}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-800 text-purple-100 font-bold text-sm shadow-2xs">
                  11
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      【第十一層】變爻（事態終局·回頭生剋·進退神）
                    </h4>
                    {analysis.layer11BianYao.changedHexagramName ? (
                      <span className="rounded bg-purple-100 border border-purple-300 px-2 py-0.5 text-xs font-bold text-purple-950">
                        變卦：{analysis.layer11BianYao.changedHexagramName}
                      </span>
                    ) : (
                      <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-700">無變卦</span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">{analysis.layer11BianYao.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedLayers[11] ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
              </div>
            </div>

            {expandedLayers[11] && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 animate-in fade-in duration-150 text-xs">
                {analysis.layer11BianYao.bianYaoList.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {analysis.layer11BianYao.bianYaoList.map((b) => (
                      <div key={b.lineIndex} className="p-3 rounded-xl border border-purple-200 bg-purple-50/40">
                        <div className="flex justify-between items-center mb-1">
                          <strong className="text-stone-900 font-serif">
                            {b.origLineName} → 化出【{b.changedLineName}】（{b.changedRelative}{b.changedBranch}）
                          </strong>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            b.auspiciousness === "大吉" || b.auspiciousness === "吉"
                              ? "bg-emerald-200 text-emerald-950"
                              : b.auspiciousness === "大凶" || b.auspiciousness === "凶"
                              ? "bg-rose-200 text-rose-950"
                              : "bg-stone-200 text-stone-800"
                          }`}>
                            {b.dynamicsType} · {b.auspiciousness}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-700 mt-1">{b.dynamicsSummary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600">
                    無動爻化變，終局以本卦卦象為憑。
                  </div>
                )}

                <div className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                  {analysis.layer11BianYao.classicalQuote}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LAYER 12: 合沖刑害 (He Chong Xing Hai) */}
        {/* ========================================================================= */}
        {visibleLayerDefs.some((l) => l.num === 12) && (
          <div
            id="layer-card-12"
            className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-cyan-300"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleLayer(12)}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-800 text-cyan-100 font-bold text-sm shadow-2xs">
                  12
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      【第十二層】合沖刑害（地支神機·三合三刑六害全盤）
                    </h4>
                    <span className="rounded bg-cyan-100 border border-cyan-300 px-2 py-0.5 text-xs font-bold text-cyan-950">
                      六合·六沖·三合·三刑·六害
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">{analysis.layer12HeChongXingHai.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedLayers[12] ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
              </div>
            </div>

            {expandedLayers[12] && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {/* 六合 */}
                  <div className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/40">
                    <strong className="text-emerald-900 block mb-1">【六合局象】主成全、牽絆</strong>
                    {analysis.layer12HeChongXingHai.sixHeList.length > 0 ? (
                      analysis.layer12HeChongXingHai.sixHeList.map((h, i) => (
                        <p key={i} className="text-[11px] text-stone-700">{h.pair}：{h.desc}</p>
                      ))
                    ) : (
                      <p className="text-[11px] text-stone-500">無六合</p>
                    )}
                  </div>

                  {/* 六沖 */}
                  <div className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/40">
                    <strong className="text-rose-900 block mb-1">【六沖局象】主破散、速決</strong>
                    {analysis.layer12HeChongXingHai.sixChongList.length > 0 ? (
                      analysis.layer12HeChongXingHai.sixChongList.map((c, i) => (
                        <p key={i} className="text-[11px] text-stone-700">{c.pair}：{c.desc}</p>
                      ))
                    ) : (
                      <p className="text-[11px] text-stone-500">無六沖</p>
                    )}
                  </div>

                  {/* 三合局 */}
                  <div className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/40">
                    <strong className="text-purple-900 block mb-1">【三合局象】聚眾成局</strong>
                    {analysis.layer12HeChongXingHai.sanHeJuList.length > 0 ? (
                      analysis.layer12HeChongXingHai.sanHeJuList.map((s, i) => (
                        <p key={i} className="text-[11px] text-stone-700">{s.name}：{s.effect}</p>
                      ))
                    ) : (
                      <p className="text-[11px] text-stone-500">無三合局</p>
                    )}
                  </div>

                  {/* 三刑 */}
                  <div className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/40">
                    <strong className="text-amber-900 block mb-1">【相刑局象】防爭訟內耗</strong>
                    {analysis.layer12HeChongXingHai.sanXingList.length > 0 ? (
                      analysis.layer12HeChongXingHai.sanXingList.map((x, i) => (
                        <p key={i} className="text-[11px] text-stone-700">{x.type}：{x.desc}</p>
                      ))
                    ) : (
                      <p className="text-[11px] text-stone-500">全卦無相刑</p>
                    )}
                  </div>

                  {/* 六害 */}
                  <div className="p-2.5 rounded-xl border border-stone-200 bg-stone-50">
                    <strong className="text-stone-900 block mb-1">【六害相穿】暗中阻隔</strong>
                    {analysis.layer12HeChongXingHai.liuHaiList.length > 0 ? (
                      analysis.layer12HeChongXingHai.liuHaiList.map((h, i) => (
                        <p key={i} className="text-[11px] text-stone-700">{h.pair}：{h.desc}</p>
                      ))
                    ) : (
                      <p className="text-[11px] text-stone-500">全卦無六害</p>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                  {analysis.layer12HeChongXingHai.classicalQuote}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LAYER 13: 旬空 (Xun Kong) */}
        {/* ========================================================================= */}
        {visibleLayerDefs.some((l) => l.num === 13) && (
          <div
            id="layer-card-13"
            className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-5 shadow-xs transition hover:border-fuchsia-300"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleLayer(13)}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-fuchsia-800 text-fuchsia-100 font-bold text-sm shadow-2xs">
                  13
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      【第十三層】旬空（真空·假空·沖空·出旬填實）
                    </h4>
                    <span className="rounded bg-fuchsia-100 border border-fuchsia-300 px-2 py-0.5 text-xs font-bold text-fuchsia-950">
                      {analysis.layer13XunKong.xunName}
                    </span>
                    {analysis.layer13XunKong.kongLines.length > 0 && (
                      <span className="rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-700">
                        {analysis.layer13XunKong.kongLines.length} 爻落空
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-stone-500">{analysis.layer13XunKong.summary}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedLayers[13] ? <ChevronUp className="h-5 w-5 text-stone-400" /> : <ChevronDown className="h-5 w-5 text-stone-400" />}
              </div>
            </div>

            {expandedLayers[13] && (
              <div className="mt-4 pt-3 border-t border-stone-100 space-y-3 animate-in fade-in duration-150 text-xs">
                {analysis.layer13XunKong.kongLines.length > 0 ? (
                  <div className="space-y-2">
                    {analysis.layer13XunKong.kongLines.map((k) => (
                      <div key={k.lineIndex} className="p-3 rounded-xl border border-fuchsia-200 bg-fuchsia-50/40">
                        <div className="flex justify-between items-center mb-1">
                          <strong className="text-stone-900 font-serif">
                            第 {k.lineIndex} 爻【{k.name}】（{k.relative}{k.branch}）逢旬空
                          </strong>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            k.isTrueKong ? "bg-rose-200 text-rose-950" : "bg-emerald-200 text-emerald-950"
                          }`}>
                            {k.kongTypeDesc}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-700 mt-1">出空應事：{k.outKongDate}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-stone-600">
                    卦中無爻落空亡，六爻皆實，行事實實在在。
                  </div>
                )}

                <div className="text-[11px] text-stone-500 italic bg-stone-50 p-2 rounded-lg border border-stone-200">
                  {analysis.layer13XunKong.classicalQuote}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* LAYER 14: 應期 (Ying Qi) */}
        {/* ========================================================================= */}
        {visibleLayerDefs.some((l) => l.num === 14) && (
          <div
            id="layer-card-14"
            className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/60 p-4 sm:p-5 shadow-md transition"
          >
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => toggleLayer(14)}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-850 text-emerald-100 font-bold text-sm shadow-2xs">
                  14
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif text-base font-bold text-emerald-950">
                      【第十四層】應期（增刪鐵律·吉凶成敗之應驗年月日時）
                    </h4>
                    <span className="rounded bg-emerald-600 text-white px-2.5 py-0.5 text-xs font-bold">
                      核心結論
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-900">{analysis.layer14YingQi.primaryYingQi}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {expandedLayers[14] ? <ChevronUp className="h-5 w-5 text-emerald-800" /> : <ChevronDown className="h-5 w-5 text-emerald-800" />}
              </div>
            </div>

            {expandedLayers[14] && (
              <div className="mt-4 pt-3 border-t border-emerald-200 space-y-3 animate-in fade-in duration-150 text-xs">
                <div className="p-3.5 bg-white rounded-xl border border-emerald-200 shadow-2xs space-y-2">
                  <strong className="text-emerald-950 font-bold block text-sm">【應期推導依據與條款】</strong>
                  <div className="space-y-1.5">
                    {analysis.layer14YingQi.rulesApplied.map((r, i) => (
                      <div key={i} className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100">
                        <div className="flex items-center justify-between font-semibold text-emerald-900">
                          <span>{r.condition}</span>
                          <span className="text-[10px] text-stone-500">{r.classicalSource}</span>
                        </div>
                        <p className="text-stone-700 text-xs mt-0.5 font-medium">➔ 預期時間：{r.prediction}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-stone-800">
                  <div className="p-2.5 bg-white rounded-lg border border-stone-200">
                    <span className="text-stone-400 block text-[10px]">日辰應期</span>
                    <strong className="text-emerald-900 text-xs">{analysis.layer14YingQi.timeUnitEstimates.dayTerm || "值日/逢沖日"}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-stone-200">
                    <span className="text-stone-400 block text-[10px]">月令應期</span>
                    <strong className="text-emerald-900 text-xs">{analysis.layer14YingQi.timeUnitEstimates.monthTerm || "交節出月"}</strong>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-stone-200">
                    <span className="text-stone-400 block text-[10px]">時辰觸發</span>
                    <strong className="text-emerald-900 text-xs">{analysis.layer14YingQi.timeUnitEstimates.hourTerm || "合沖之時"}</strong>
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 italic bg-white p-2 rounded-lg border border-stone-200">
                  《增刪卜易·應期總訣》：靜而逢值逢沖，動而逢值逢合；太旺者墓絕日應，休囚者生旺日應；旬空者出空沖空應，月破者出月填實應。
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      document.getElementById("yingqi-calculation-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-semibold transition cursor-pointer shadow-2xs"
                  >
                    <Calendar className="h-3.5 w-3.5" />
                    <span>查看完整未來關鍵應期日曆列表 ➔</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
