import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Compass,
  CalendarDays,
  ShieldAlert,
  Zap,
} from "lucide-react";
import {
  LiuYaoResult,
  YingQiKeyDay,
  EarthlyBranch,
  BranchTimingInfo,
} from "../types/liuyao";
import { calculateUpcomingYingQiKeyDays } from "../utils/yingQiEngine";

interface YingQiSectionProps {
  result: LiuYaoResult;
  onSelectLine?: (lineIndex: number) => void;
}

export const YingQiSection: React.FC<YingQiSectionProps> = ({
  result,
  onSelectLine,
}) => {
  const [daysSpan, setDaysSpan] = useState<number>(30);
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedNature, setSelectedNature] = useState<string>("all");
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<EarthlyBranch | "all">("all");
  const [viewMode, setViewMode] = useState<"timeline" | "matrix">("timeline");
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [expandedDayIds, setExpandedDayIds] = useState<Record<string, boolean>>({});

  // Dynamic computation or reuse precomputed data
  const yingQiData = useMemo(() => {
    // If daysSpan is 30 and result already has keyDays, reuse it
    if (
      daysSpan === 30 &&
      result.layeredAnalysis?.layer14YingQi?.keyDays &&
      result.layeredAnalysis.layer14YingQi.keyDays.length > 0 &&
      result.layeredAnalysis.layer14YingQi.branchMatrix
    ) {
      return {
        keyDays: result.layeredAnalysis.layer14YingQi.keyDays,
        branchMatrix: result.layeredAnalysis.layer14YingQi.branchMatrix,
        executiveSummary:
          result.layeredAnalysis.layer14YingQi.executiveSummary ||
          result.layeredAnalysis.layer14YingQi.primaryYingQi,
      };
    }
    return calculateUpcomingYingQiKeyDays(result, daysSpan);
  }, [result, daysSpan]);

  const { keyDays, branchMatrix, executiveSummary } = yingQiData;

  // Filtered Key Days
  const filteredKeyDays = useMemo(() => {
    return keyDays.filter((k) => {
      if (selectedPriority === "core" && k.priority !== "core") return false;
      if (selectedPriority === "7days" && k.daysAway > 7) return false;
      if (selectedPriority === "14days" && k.daysAway > 14) return false;

      if (selectedCategory !== "all" && k.category !== selectedCategory) return false;
      if (selectedNature !== "all" && k.nature !== selectedNature) return false;
      if (selectedBranchFilter !== "all" && k.branch !== selectedBranchFilter) return false;

      return true;
    });
  }, [keyDays, selectedPriority, selectedCategory, selectedNature, selectedBranchFilter]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = keyDays.length;
    const coreCount = keyDays.filter((k) => k.priority === "core").length;
    const auspiciousCount = keyDays.filter((k) => k.nature === "auspicious").length;
    const warningCount = keyDays.filter((k) => k.nature === "warning").length;
    const turningCount = keyDays.filter((k) => k.nature === "turning").length;
    const next7Count = keyDays.filter((k) => k.daysAway <= 7).length;
    return { total, coreCount, auspiciousCount, warningCount, turningCount, next7Count };
  }, [keyDays]);

  const toggleDayExpanded = (id: string) => {
    setExpandedDayIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getPriorityStyle = (priority: YingQiKeyDay["priority"]) => {
    switch (priority) {
      case "core":
        return "bg-emerald-600 text-white shadow-2xs font-bold";
      case "secondary":
        return "bg-amber-100 text-amber-900 border border-amber-300 font-semibold";
      default:
        return "bg-stone-100 text-stone-700 border border-stone-200 font-medium";
    }
  };

  const getNatureStyle = (nature: YingQiKeyDay["nature"]) => {
    switch (nature) {
      case "auspicious":
        return "bg-emerald-50 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200";
      case "warning":
        return "bg-rose-50 text-rose-800 border-rose-300 ring-1 ring-rose-200";
      case "turning":
        return "bg-purple-50 text-purple-800 border-purple-300 ring-1 ring-purple-200";
      default:
        return "bg-sky-50 text-sky-800 border-sky-300 ring-1 ring-sky-200";
    }
  };

  const getBranchElementBadge = (wuxing: string) => {
    switch (wuxing) {
      case "金":
        return "bg-amber-100 text-amber-900 border-amber-300";
      case "木":
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case "水":
        return "bg-sky-100 text-sky-900 border-sky-300";
      case "火":
        return "bg-rose-100 text-rose-900 border-rose-300";
      default:
        return "bg-stone-200 text-stone-900 border-stone-300";
    }
  };

  return (
    <div
      id="yingqi-calculation-section"
      className="rounded-2xl border-2 border-emerald-300/80 bg-white p-5 shadow-md sm:p-6 space-y-5 transition"
    >
      {/* 1. Header & Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-sm ring-1 ring-emerald-400/40">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-serif text-base font-bold text-stone-900 sm:text-lg">
                【應期推算】六爻時空吉凶動態應期全鑑
              </h3>
              <span className="rounded-md bg-emerald-100 border border-emerald-300 px-2 py-0.5 text-xs font-bold text-emerald-900 shadow-2xs">
                自動篩選應期關鍵日
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              以動爻、變爻、月建、日辰生剋合沖為綱，篩選未來 {daysSpan} 天內吉凶成敗之應驗日子
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-lg bg-stone-100 p-0.5 border border-stone-200 text-xs">
            <button
              onClick={() => setViewMode("timeline")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                viewMode === "timeline"
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>時程列表</span>
            </button>
            <button
              onClick={() => setViewMode("matrix")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                viewMode === "matrix"
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              <span>十二地支全覽</span>
            </button>
          </div>

          <button
            onClick={() => setIsHelpOpen(!isHelpOpen)}
            className="flex items-center gap-1 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition cursor-pointer"
            title="查看應期推算易理說明"
          >
            <HelpCircle className="h-3.5 w-3.5 text-amber-700" />
            <span className="hidden sm:inline">易理依據</span>
          </button>
        </div>
      </div>

      {/* 2. Classical Principles Accordion (易理依據說明) */}
      {isHelpOpen && (
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-xs text-stone-700 space-y-2.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-1.5">
            <h4 className="font-serif font-bold text-amber-950 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-700" />
              《增刪卜易·應期總訣》六爻應期四大鐵律
            </h4>
            <span className="text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-medium">
              正統易理體系
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 pt-1">
            <div className="rounded-lg bg-white p-2.5 border border-stone-200 shadow-2xs">
              <strong className="text-emerald-900 block mb-1">① 動靜合沖律</strong>
              <span className="text-stone-600 text-[11px] leading-relaxed block">
                <strong>「動而逢值逢合，靜而逢值逢沖」</strong>。發動之爻待其逢值逢六合定局；安靜旺相之爻待逢日沖暗動或逢值應驗。
              </span>
            </div>
            <div className="rounded-lg bg-white p-2.5 border border-stone-200 shadow-2xs">
              <strong className="text-purple-900 block mb-1">② 旺衰空破律</strong>
              <span className="text-stone-600 text-[11px] leading-relaxed block">
                <strong>「旬空者出空沖空應，月破者出月填實逢合應」</strong>。落空逢出旬或沖空拔起；月破逢六合解破或出月交節逢值。
              </span>
            </div>
            <div className="rounded-lg bg-white p-2.5 border border-stone-200 shadow-2xs">
              <strong className="text-rose-900 block mb-1">③ 動變生剋律</strong>
              <span className="text-stone-600 text-[11px] leading-relaxed block">
                <strong>「化進神高升、化回生得源、化退神漸消、入墓庫逢沖」</strong>。變爻回生逢生旺值日發作，動爻入墓逢沖開墓門釋出。
              </span>
            </div>
            <div className="rounded-lg bg-white p-2.5 border border-stone-200 shadow-2xs">
              <strong className="text-amber-900 block mb-1">④ 伏藏合絆律</strong>
              <span className="text-stone-600 text-[11px] leading-relaxed block">
                <strong>「伏神透出沖飛應，合處逢沖解絆應」</strong>。用神伏藏待伏神值日或沖去飛神；爻逢日合絆住待逢沖日沖解。
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. Executive Summary Banner (核心定決橫幅) */}
      <div className="rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-amber-50/60 p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
                🎯
              </span>
              <h4 className="font-serif text-sm sm:text-base font-bold text-emerald-950">
                應期核心裁定
              </h4>
              <span className="text-[10px] bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800 font-semibold shadow-2xs">
                用神：【{result.yongShenCategory}】
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-emerald-900 leading-relaxed max-w-4xl">
              {executiveSummary}
            </p>
          </div>

          {/* Quick Stat Badges */}
          <div className="flex flex-wrap items-center gap-1.5 shrink-0 text-xs">
            <div className="rounded-lg bg-white px-2.5 py-1.5 border border-emerald-200 text-center shadow-2xs">
              <span className="text-[10px] text-stone-500 block">核心關鍵日</span>
              <strong className="text-emerald-700 text-sm font-bold">{stats.coreCount}</strong>
              <span className="text-[10px] text-stone-400"> 天</span>
            </div>
            <div className="rounded-lg bg-white px-2.5 py-1.5 border border-stone-200 text-center shadow-2xs">
              <span className="text-[10px] text-stone-500 block">7天內速應</span>
              <strong className="text-amber-700 text-sm font-bold">{stats.next7Count}</strong>
              <span className="text-[10px] text-stone-400"> 天</span>
            </div>
            <div className="rounded-lg bg-white px-2.5 py-1.5 border border-stone-200 text-center shadow-2xs">
              <span className="text-[10px] text-stone-500 block">大吉發越</span>
              <strong className="text-emerald-700 text-sm font-bold">{stats.auspiciousCount}</strong>
              <span className="text-[10px] text-stone-400"> 天</span>
            </div>
            <div className="rounded-lg bg-white px-2.5 py-1.5 border border-stone-200 text-center shadow-2xs">
              <span className="text-[10px] text-stone-500 block">防阻避凶</span>
              <strong className="text-rose-700 text-sm font-bold">{stats.warningCount}</strong>
              <span className="text-[10px] text-stone-400"> 天</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Controls & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs">
        {/* Days range selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-stone-700 flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5 text-emerald-700" /> 推算跨度：
          </span>
          {[
            { days: 14, label: "未來 14 天" },
            { days: 30, label: "未來 30 天（標準）" },
            { days: 60, label: "未來 60 天（長線）" },
          ].map((item) => (
            <button
              key={item.days}
              onClick={() => setDaysSpan(item.days)}
              className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                daysSpan === item.days
                  ? "bg-emerald-700 text-white shadow-2xs"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Priority quick filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-stone-700 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5 text-stone-500" /> 篩選：
          </span>
          {[
            { id: "all", label: `全部 (${stats.total})` },
            { id: "core", label: `🌟 最關鍵核心 (${stats.coreCount})` },
            { id: "7days", label: `⚡ 7天內 (${stats.next7Count})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedPriority(tab.id)}
              className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer transition ${
                selectedPriority === tab.id
                  ? "bg-amber-800 text-white shadow-2xs"
                  : "bg-white text-stone-600 border border-stone-200 hover:bg-stone-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Secondary filter chips: Category & Nature */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] pt-0.5">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-stone-500 font-medium">易理類別：</span>
          {[
            { id: "all", label: "全部類別" },
            { id: "yongshen", label: "用神應期" },
            { id: "dongbian", label: "動變生剋" },
            { id: "kongpo", label: "空破化解" },
            { id: "hechong", label: "合沖開閉" },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-2 py-0.5 rounded border transition cursor-pointer ${
                selectedCategory === c.id
                  ? "bg-stone-800 text-white border-stone-900 font-bold"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-stone-500 font-medium">吉凶性質：</span>
          {[
            { id: "all", label: "全部" },
            { id: "auspicious", label: "大吉發越" },
            { id: "warning", label: "防阻避凶" },
            { id: "turning", label: "轉折變革" },
            { id: "steady", label: "平順相循" },
          ].map((n) => (
            <button
              key={n.id}
              onClick={() => setSelectedNature(n.id)}
              className={`px-2 py-0.5 rounded border transition cursor-pointer ${
                selectedNature === n.id
                  ? "bg-stone-800 text-white border-stone-900 font-bold"
                  : "bg-white text-stone-600 border-stone-200 hover:bg-stone-100"
              }`}
            >
              {n.label}
            </button>
          ))}

          {selectedBranchFilter !== "all" && (
            <button
              onClick={() => setSelectedBranchFilter("all")}
              className="ml-1 text-rose-700 underline font-bold"
            >
              清除【{selectedBranchFilter}】地支篩選
            </button>
          )}
        </div>
      </div>

      {/* 5. View Mode: Timeline / List View */}
      {viewMode === "timeline" && (
        <div className="space-y-3">
          {filteredKeyDays.length > 0 ? (
            <div className="space-y-3">
              {filteredKeyDays.map((day) => {
                const isExpanded = expandedDayIds[day.id];
                const isToday = day.daysAway === 0;

                return (
                  <div
                    key={day.id}
                    className={`rounded-xl border p-4 transition duration-150 shadow-2xs hover:shadow-xs ${
                      day.priority === "core"
                        ? "border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-200"
                        : day.nature === "warning"
                        ? "border-rose-200 bg-rose-50/30"
                        : "border-stone-200 bg-white"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/80 pb-2.5 mb-2.5">
                      {/* Left: Date & Ganzhi */}
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-center justify-center rounded-xl bg-white border border-stone-200 px-3 py-1.5 shadow-2xs shrink-0 min-w-[76px]">
                          <span className="text-[10px] font-semibold text-stone-500">
                            {isToday ? "起卦日" : `${day.daysAway} 天後`}
                          </span>
                          <span className="font-serif text-sm font-bold text-stone-900 whitespace-nowrap">
                            {day.solarDateStr.split("年")[1]}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-serif text-base font-bold text-stone-900">
                              【{day.ganzhiDay}日】
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-xs font-bold border ${getBranchElementBadge(
                                day.wuxing
                              )}`}
                            >
                              {day.branch}{day.wuxing}
                            </span>
                            <span className="text-[11px] text-stone-500 font-medium">
                              農曆{day.lunarDateStr}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-stone-800 mt-0.5">
                            {day.title.replace(/^【.*?】/, "")}
                          </p>
                        </div>
                      </div>

                      {/* Right: Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs ${getPriorityStyle(
                            day.priority
                          )}`}
                        >
                          {day.priorityLabel}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold border ${getNatureStyle(
                            day.nature
                          )}`}
                        >
                          {day.natureLabel}
                        </span>
                        <span className="rounded-full bg-stone-100 border border-stone-200 px-2 py-0.5 text-xs text-stone-600 font-medium">
                          {day.categoryLabel}
                        </span>
                      </div>
                    </div>

                    {/* Reasons & Mechanics */}
                    <div className="space-y-2 text-xs">
                      <div className="bg-white/80 rounded-lg p-3 border border-stone-200/90 text-stone-700 leading-relaxed whitespace-pre-line">
                        {day.summaryReason}
                      </div>

                      {/* Classical Principle Citation */}
                      {day.rules.length > 0 && (
                        <div className="rounded-lg bg-amber-50/70 border border-amber-200/70 p-2.5 flex items-start gap-2">
                          <Sparkles className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                          <div className="text-[11px] leading-relaxed text-stone-700">
                            <strong className="text-amber-900 font-bold mr-1.5">
                              {day.rules[0].source}·{day.rules[0].principle}：
                            </strong>
                            <span>{day.rules[0].explanation}</span>
                          </div>
                        </div>
                      )}

                      {/* Involved lines badges */}
                      {day.relatedLines.length > 0 && (
                        <div className="flex items-center justify-between gap-2 pt-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] text-stone-500 font-medium">
                              關聯爻位：
                            </span>
                            {day.relatedLines.map((line) => (
                              <button
                                key={line.index}
                                onClick={() => onSelectLine && onSelectLine(line.index - 1)}
                                className="inline-flex items-center gap-1 rounded bg-stone-100 hover:bg-stone-200 border border-stone-200 px-2 py-0.5 text-[11px] font-medium text-stone-800 transition cursor-pointer"
                                title="點擊檢視此爻詳情"
                              >
                                <span>第 {line.index} 爻（{line.name}）</span>
                                <span className="text-stone-500 font-mono">
                                  {line.relative} {line.branch}
                                </span>
                                <span className="rounded bg-amber-100 text-amber-900 px-1 text-[9px] font-bold">
                                  {line.role}
                                </span>
                              </button>
                            ))}
                          </div>

                          {day.rules.length > 1 && (
                            <button
                              onClick={() => toggleDayExpanded(day.id)}
                              className="text-[11px] text-emerald-800 hover:text-emerald-950 font-bold flex items-center gap-0.5 cursor-pointer shrink-0"
                            >
                              <span>{isExpanded ? "收合條款" : `展開全案 (${day.rules.length}條)`}</span>
                              {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Expanded all rules */}
                      {isExpanded && day.rules.length > 1 && (
                        <div className="mt-2 space-y-1.5 pt-2 border-t border-stone-200">
                          {day.rules.slice(1).map((r, rIdx) => (
                            <div
                              key={rIdx}
                              className="rounded bg-stone-50 p-2 border border-stone-200 text-[11px] text-stone-700"
                            >
                              <strong className="text-stone-900 font-bold">{r.source}【{r.principle}】：</strong>
                              <span>{r.explanation}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-8 text-center text-stone-500 text-xs">
              <Calendar className="h-8 w-8 text-stone-400 mx-auto mb-2" />
              <p className="font-semibold text-stone-700 text-sm mb-1">
                當前篩選條件下無關鍵應期日
              </p>
              <p>請嘗試重設上方篩選選項，或擴大推算天數至未來 60 天。</p>
              <button
                onClick={() => {
                  setSelectedPriority("all");
                  setSelectedCategory("all");
                  setSelectedNature("all");
                  setSelectedBranchFilter("all");
                }}
                className="mt-3 rounded-lg bg-emerald-700 text-white px-3 py-1 text-xs font-semibold cursor-pointer shadow-2xs hover:bg-emerald-800 transition"
              >
                重設所有篩選
              </button>
            </div>
          )}
        </div>
      )}

      {/* 6. View Mode: 12-Branch Metaphysical Matrix (十二地支時空星盤) */}
      {viewMode === "matrix" && (
        <div className="space-y-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3.5 text-xs text-stone-700 leading-relaxed">
            <h4 className="font-bold text-amber-950 mb-1 flex items-center gap-1.5">
              <Compass className="h-4 w-4 text-amber-700" />
              十二地支全盤六爻時空角色與近期值日對照
            </h4>
            <p className="text-[11px] text-stone-600">
              六爻以十二地支為時空坐標。點擊任一地支卡片，即可快速篩選該地支在未來推算跨度內的所有關鍵應期日。
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
            {branchMatrix.map((item) => {
              const isSelected = selectedBranchFilter === item.branch;

              return (
                <div
                  key={item.branch}
                  onClick={() => {
                    setSelectedBranchFilter(isSelected ? "all" : item.branch);
                    setViewMode("timeline");
                  }}
                  className={`rounded-xl border p-3 transition cursor-pointer relative ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-400 shadow-sm"
                      : item.priority === "core"
                      ? "border-emerald-300 bg-emerald-50/50 hover:border-emerald-400"
                      : item.priority === "secondary"
                      ? "border-amber-200 bg-amber-50/40 hover:border-amber-300"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif text-base font-bold text-stone-900">
                        {item.branch}
                      </span>
                      <span
                        className={`rounded px-1 text-[10px] font-bold border ${getBranchElementBadge(
                          item.wuxing
                        )}`}
                      >
                        {item.wuxing}
                      </span>
                    </div>

                    {item.isKey && (
                      <span
                        className={`rounded px-1.5 py-0.2 text-[9px] font-bold ${
                          item.priority === "core"
                            ? "bg-emerald-600 text-white"
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}
                      >
                        {item.priority === "core" ? "核心" : "重要"}
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between text-stone-500">
                      <span>近期值日：</span>
                      <span className="font-bold text-stone-800">
                        {item.nextGanzhiDay || "—"}
                      </span>
                    </div>
                    {item.nextDaysAway !== undefined && (
                      <div className="flex justify-between text-stone-500">
                        <span>距起卦：</span>
                        <span className="font-semibold text-emerald-800">
                          {item.nextDaysAway === 0 ? "今日" : `${item.nextDaysAway}天後`}
                        </span>
                      </div>
                    )}

                    <div className="mt-1 pt-1 border-t border-stone-200/80">
                      <span className="text-[10px] text-stone-500 block mb-0.5">卦象角色：</span>
                      <div className="flex flex-wrap gap-1">
                        {item.roles.length > 0 ? (
                          item.roles.slice(0, 2).map((r, rIdx) => (
                            <span
                              key={rIdx}
                              className="rounded bg-stone-100 px-1 py-0.2 text-[9px] text-stone-700 truncate max-w-full"
                              title={r}
                            >
                              {r.replace(/^用神【.*?】/, "用神").replace(/^動爻【.*?】/, "動爻")}
                            </span>
                          ))
                        ) : (
                          <span className="text-[9px] text-stone-400">常規平爻</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. Footer: Classical Principles Footnote */}
      <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 text-[11px] text-stone-600 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-emerald-700 shrink-0" />
          <span>
            <strong>六爻應期要旨：</strong>「吉凶看用神，應期看動變合沖」。凡事之應，大約在動爻逢值、用神逢值逢沖、出空解破之期；遠者應年月，近者應日時。
          </span>
        </div>
        <span className="text-[10px] text-stone-400 whitespace-nowrap">
          依《增刪卜易》《卜筮正宗》《黃金策》正統易經古法演算
        </span>
      </div>
    </div>
  );
};
