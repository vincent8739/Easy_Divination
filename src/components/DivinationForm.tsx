import React, { useState, useEffect, useMemo } from "react";
import {
  Clock,
  User,
  HelpCircle,
  RefreshCw,
  Layers,
  CheckCircle2,
  ArrowRight,
  Hash,
  Shuffle,
  X,
  Sparkles,
  Info,
} from "lucide-react";
import { YaoRemainder, SixRelative, NumberGuaResult } from "../types/liuyao";
import { getGanzhiFromDate, GanzhiResult } from "../utils/calendar";
import { calculateNumberGua, XIAN_TIAN_TRIGRAMS } from "../utils/liuyaoEngine";

interface DivinationFormProps {
  onCalculate: (data: {
    querent: string;
    question: string;
    date: Date;
    remainders: YaoRemainder[];
    customYongShen?: SixRelative;
    numberGuaInfo?: NumberGuaResult;
  }) => void;
  initialValues?: {
    querent: string;
    question: string;
    date: Date;
    remainders?: YaoRemainder[];
    numberNumbers?: [number, number, number];
  };
}

const PRESET_QUESTIONS = [
  { label: "求財經營", relative: "妻財" as SixRelative, text: "問近期投資營商財運如何？" },
  { label: "事業工作", relative: "官鬼" as SixRelative, text: "問求職升遷與事業前景發展？" },
  { label: "戀愛婚姻", relative: "妻財" as SixRelative, text: "問感情姻緣與對方心意發展？" },
  { label: "身體健康", relative: "子孫" as SixRelative, text: "問身體健康狀況與求醫調理？" },
  { label: "考試升學", relative: "父母" as SixRelative, text: "問文憑證照與考試錄取結果？" },
  { label: "訴訟官司", relative: "官鬼" as SixRelative, text: "問官非紛爭與法務審理吉凶？" },
  { label: "出門遠行", relative: "子孫" as SixRelative, text: "問出外旅行、出差平安順遂？" },
  { label: "尋人失物", relative: "妻財" as SixRelative, text: "問遺失物品方位或失散音訊？" },
];

export const DivinationForm: React.FC<DivinationFormProps> = ({
  onCalculate,
  initialValues,
}) => {
  const [methodMode, setMethodMode] = useState<"number" | "stalk">("number");

  const [querent, setQuerent] = useState(initialValues?.querent || "");
  const [question, setQuestion] = useState(initialValues?.question || "");
  const [date, setDate] = useState<Date>(initialValues?.date || new Date());

  // Date and Time breakdown fields
  const [year, setYear] = useState<number>(date.getFullYear());
  const [month, setMonth] = useState<number>(date.getMonth() + 1);
  const [day, setDay] = useState<number>(date.getDate());
  const [hour, setHour] = useState<number>(date.getHours());
  const [minute, setMinute] = useState<number>(date.getMinutes());

  // --- 3-Digit Number Divination States (000 ~ 999) ---
  // Pure string state to allow:
  // 1. Completely blank inputs when clearing (no auto-fill "0")
  // 2. Numbers starting with "0" (e.g. "0", "01", "007", "042", "000")
  const [num1Str, setNum1Str] = useState<string>(
    initialValues?.numberNumbers ? String(initialValues.numberNumbers[0]).padStart(3, "0") : "431"
  );
  const [num2Str, setNum2Str] = useState<string>(
    initialValues?.numberNumbers ? String(initialValues.numberNumbers[1]).padStart(3, "0") : "379"
  );
  const [num3Str, setNum3Str] = useState<string>(
    initialValues?.numberNumbers ? String(initialValues.numberNumbers[2]).padStart(3, "0") : "847"
  );
  const [numError, setNumError] = useState<string | null>(null);

  // --- 6 Yao remainders for Da Yan Stalk mode (6, 7, 8, 9) ---
  const [remainders, setRemainders] = useState<YaoRemainder[]>(
    initialValues?.remainders || [7, 8, 7, 8, 9, 8]
  );

  const [ganzhiPreview, setGanzhiPreview] = useState<GanzhiResult>(getGanzhiFromDate(date));
  const [selectedYongShen, setSelectedYongShen] = useState<SixRelative | undefined>(undefined);

  // Sync date when components change
  useEffect(() => {
    try {
      const newDate = new Date(year, month - 1, day, hour, minute, 0);
      setDate(newDate);
      setGanzhiPreview(getGanzhiFromDate(newDate));
    } catch {
      // ignore invalid dates
    }
  }, [year, month, day, hour, minute]);

  const handleSetCurrentTime = () => {
    const now = new Date();
    setYear(now.getFullYear());
    setMonth(now.getMonth() + 1);
    setDay(now.getDate());
    setHour(now.getHours());
    setMinute(now.getMinutes());
    setDate(now);
    setGanzhiPreview(getGanzhiFromDate(now));
  };

  /**
   * Handle 3-digit number change:
   * - Only numeric digits allowed.
   * - Max 3 characters.
   * - When cleared (empty string), do NOT auto-pad with "0".
   * - Supports leading zeros ("0", "00", "007", "042", "000").
   */
  const handleDigitChange = (val: string, setter: (s: string) => void) => {
    const cleaned = val.replace(/\D/g, "");
    const trimmed = cleaned.slice(0, 3);
    setter(trimmed);
    setNumError(null);
  };

  /**
   * Format on blur: if user typed e.g. "7" or "42", pad to 3 digits ("007", "042").
   * If empty, KEEP EMPTY (do NOT force "000"!).
   */
  const handleBlurPad = (val: string, setter: (s: string) => void) => {
    if (val.length > 0 && val.length < 3) {
      setter(val.padStart(3, "0"));
    }
  };

  // Generate random 3-digit numbers (000 ~ 999)
  const handleGenerateRandomNumbers = () => {
    const r1 = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    const r2 = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    const r3 = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
    setNum1Str(r1);
    setNum2Str(r2);
    setNum3Str(r3);
    setNumError(null);
  };

  // Clear all 3-digit inputs to empty strings
  const handleClearAllNumbers = () => {
    setNum1Str("");
    setNum2Str("");
    setNum3Str("");
    setNumError(null);
  };

  // Load classic demo numbers (431, 379, 847)
  const handleLoadDemoNumbers = () => {
    setNum1Str("431");
    setNum2Str("379");
    setNum3Str("847");
    setNumError(null);
  };

  // Real-time calculation of number gua preview
  const liveNumberGua = useMemo<NumberGuaResult | null>(() => {
    if (num1Str.trim() === "" || num2Str.trim() === "" || num3Str.trim() === "") {
      return null;
    }
    const n1 = parseInt(num1Str, 10);
    const n2 = parseInt(num2Str, 10);
    const n3 = parseInt(num3Str, 10);
    if (isNaN(n1) || isNaN(n2) || isNaN(n3)) return null;

    try {
      return calculateNumberGua(n1, n2, n3);
    } catch {
      return null;
    }
  }, [num1Str, num2Str, num3Str]);

  const handleRemainderChange = (index: number, val: YaoRemainder) => {
    const next = [...remainders];
    next[index] = val;
    setRemainders(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (methodMode === "number") {
      if (num1Str.trim() === "" || num2Str.trim() === "" || num3Str.trim() === "") {
        setNumError("請完整輸入三個 3 位數（000 ~ 999），三組數值皆為必填。");
        return;
      }
      const n1 = parseInt(num1Str, 10);
      const n2 = parseInt(num2Str, 10);
      const n3 = parseInt(num3Str, 10);
      if (isNaN(n1) || isNaN(n2) || isNaN(n3) || n1 < 0 || n1 > 999 || n2 < 0 || n2 > 999 || n3 < 0 || n3 > 999) {
        setNumError("數值必須為 000 至 999 之間的合法 3 位數。");
        return;
      }

      const targetDate = new Date(year, month - 1, day, hour, minute, 0);
      const numGua = calculateNumberGua(n1, n2, n3);
      onCalculate({
        querent: querent.trim() || "求占者",
        question: question.trim() || "問事吉凶",
        date: targetDate,
        remainders: numGua.remainders,
        customYongShen: selectedYongShen,
        numberGuaInfo: numGua,
      });
    } else {
      const targetDate = new Date(year, month - 1, day, hour, minute, 0);
      onCalculate({
        querent: querent.trim() || "求占者",
        question: question.trim() || "問事吉凶",
        date: targetDate,
        remainders,
        customYongShen: selectedYongShen,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1. Querent & Question Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-4 flex items-center justify-between border-b border-stone-200 pb-3">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-amber-600" />
            <h2 className="font-serif text-base font-bold text-stone-900 sm:text-lg">
              第一步：求占人與問事類別
            </h2>
          </div>
          <span className="text-xs text-stone-600 font-medium">心誠則靈 · 意念集中</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Querent Name */}
          <div>
            <label htmlFor="input-querent" className="mb-1.5 block text-xs font-semibold text-stone-700">
              求占者姓名 / 稱謂
            </label>
            <input
              id="input-querent"
              type="text"
              value={querent}
              onChange={(e) => setQuerent(e.target.value)}
              placeholder="例如：王居士、求占弟子（可留空）"
              className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 transition focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
          </div>

          {/* Question */}
          <div>
            <label htmlFor="input-question" className="mb-1.5 block text-xs font-semibold text-stone-700">
              求占事項 / 具體事由
            </label>
            <input
              id="input-question"
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="例如：問今年下半年事業升遷與財運發展？"
              className="w-full rounded-xl border border-stone-300 bg-stone-50 px-3.5 py-2.5 text-sm text-stone-900 transition focus:border-amber-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-600"
            />
          </div>
        </div>

        {/* Quick Question Presets */}
        <div className="mt-4">
          <span className="mb-2 block text-xs font-medium text-stone-500">
            常問事由快速套用（自動設定相應用神類別）：
          </span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {PRESET_QUESTIONS.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => {
                  setQuestion(item.text);
                  setSelectedYongShen(item.relative);
                }}
                className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs text-stone-700 transition hover:border-amber-400 hover:bg-amber-50 hover:text-amber-900 cursor-pointer"
              >
                {item.label} · <span className="text-amber-700 font-semibold">{item.relative}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Date & Time Selection Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <h2 className="font-serif text-base font-bold text-stone-900 sm:text-lg">
              第二步：起卦時間與天干地支（公曆精準排盤）
            </h2>
          </div>
          <button
            type="button"
            onClick={handleSetCurrentTime}
            className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>對齊當前時間</span>
          </button>
        </div>

        {/* Date Time Inputs */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div>
            <label className="mb-1 block text-xs text-stone-500 font-medium">年（公曆）</label>
            <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 focus-within:bg-white focus-within:border-amber-500">
              <input
                id="input-year"
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-transparent text-sm text-stone-900 focus:outline-none"
              />
              <span className="text-xs text-stone-500">年</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-stone-500 font-medium">月</label>
            <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 focus-within:bg-white focus-within:border-amber-500">
              <input
                id="input-month"
                type="number"
                min={1}
                max={12}
                value={month}
                onChange={(e) => setMonth(Number(e.target.value))}
                className="w-full bg-transparent text-sm text-stone-900 focus:outline-none"
              />
              <span className="text-xs text-stone-500">月</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-stone-500 font-medium">日</label>
            <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 focus-within:bg-white focus-within:border-amber-500">
              <input
                id="input-day"
                type="number"
                min={1}
                max={31}
                value={day}
                onChange={(e) => setDay(Number(e.target.value))}
                className="w-full bg-transparent text-sm text-stone-900 focus:outline-none"
              />
              <span className="text-xs text-stone-500">日</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-stone-500 font-medium">時（24小時制）</label>
            <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 focus-within:bg-white focus-within:border-amber-500">
              <input
                id="input-hour"
                type="number"
                min={0}
                max={23}
                value={hour}
                onChange={(e) => setHour(Number(e.target.value))}
                className="w-full bg-transparent text-sm text-stone-900 focus:outline-none"
              />
              <span className="text-xs text-stone-500">時</span>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-stone-500 font-medium">分</label>
            <div className="flex items-center rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-2 focus-within:bg-white focus-within:border-amber-500">
              <input
                id="input-minute"
                type="number"
                min={0}
                max={59}
                value={minute}
                onChange={(e) => setMinute(Number(e.target.value))}
                className="w-full bg-transparent text-sm text-stone-900 focus:outline-none"
              />
              <span className="text-xs text-stone-500">分</span>
            </div>
          </div>
        </div>

        {/* Ganzhi & Metaphysics Preview Bar */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/60 p-3 sm:p-3.5">
          <div className="grid grid-cols-2 gap-2.5 text-xs sm:grid-cols-3 md:grid-cols-6">
            <div className="flex flex-col">
              <span className="text-stone-500 text-[11px]">歲次年柱</span>
              <span className="font-serif text-sm font-bold text-stone-900">
                {ganzhiPreview.ganzhiYear}年
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-stone-500 text-[11px]">月建月柱</span>
              <span className="font-serif text-sm font-bold text-stone-900">
                {ganzhiPreview.ganzhiMonth}月（建{ganzhiPreview.yueJian}）
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-stone-500 text-[11px]">日辰日柱</span>
              <span className="font-serif text-sm font-bold text-stone-900">
                {ganzhiPreview.ganzhiDay}日（辰{ganzhiPreview.riChen}）
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-stone-500 text-[11px]">時辰時柱</span>
              <span className="font-serif text-sm font-bold text-stone-900">
                {ganzhiPreview.ganzhiHour}時
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-stone-500 text-[11px]">日旬空亡</span>
              <span className="font-bold text-rose-600 text-sm">
                {ganzhiPreview.xunKong}
              </span>
            </div>

            <div className="flex flex-col">
              <span className="text-stone-500 text-[11px]">神煞吉星</span>
              <span className="text-stone-800 font-medium text-[11px] leading-tight">
                貴人:{ganzhiPreview.dayGuiRen} · 驛馬:{ganzhiPreview.yiMa} · 祿:{ganzhiPreview.dayLu}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Divination Method & Input Card */}
      <div className="rounded-2xl border border-stone-200 bg-white p-4 sm:p-6 shadow-xs">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
          <div className="flex items-center space-x-2">
            <Hash className="h-5 w-5 text-amber-600 shrink-0" />
            <div>
              <h2 className="font-serif text-base font-bold text-stone-900 sm:text-lg">
                第三步：選擇起卦方式與輸入數值
              </h2>
              <p className="text-xs text-stone-500">
                支援三個 3 位數（000 ~ 999）先天八卦數占卜，或六爻揲蓍餘數（6, 7, 8, 9）排盤
              </p>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex rounded-xl bg-stone-100 p-1 ring-1 ring-stone-200">
            <button
              id="mode-btn-number"
              type="button"
              onClick={() => setMethodMode("number")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                methodMode === "number"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Hash className="h-3.5 w-3.5" />
              <span>三個 3 位數起卦（000~999）</span>
            </button>
            <button
              id="mode-btn-stalk"
              type="button"
              onClick={() => setMethodMode("stalk")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                methodMode === "stalk"
                  ? "bg-amber-600 text-white shadow-xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>揲蓍餘數（6, 7, 8, 9）</span>
            </button>
          </div>
        </div>

        {/* --- METHOD A: Three 3-digit Numbers (000 ~ 999) --- */}
        {methodMode === "number" && (
          <div className="space-y-4">
            {/* Action Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-stone-50 p-2.5 sm:p-3 border border-stone-200">
              <div className="flex items-center gap-1 text-xs text-stone-600">
                <Info className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  清除時<strong>不會自動補「0」</strong>，可開頭輸入<strong>「0」</strong>（合法數值：000 ~ 999）。
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  id="btn-random-numbers"
                  type="button"
                  onClick={handleGenerateRandomNumbers}
                  className="flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 transition hover:bg-amber-100 cursor-pointer"
                >
                  <Shuffle className="h-3.5 w-3.5 text-amber-700" />
                  <span>隨機產生三位數</span>
                </button>
                <button
                  id="btn-clear-numbers"
                  type="button"
                  onClick={handleClearAllNumbers}
                  className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-100 cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5 text-stone-500" />
                  <span>全部清空</span>
                </button>
                <button
                  id="btn-demo-numbers"
                  type="button"
                  onClick={handleLoadDemoNumbers}
                  className="flex items-center gap-1 rounded-lg border border-stone-300 bg-white px-2.5 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-100 cursor-pointer"
                >
                  <span>示範數（431, 379, 847）</span>
                </button>
              </div>
            </div>

            {/* Error banner if any */}
            {numError && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                {numError}
              </div>
            )}

            {/* Three Input Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Number 1: Upper Trigram */}
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-4 transition focus-within:border-amber-500 focus-within:bg-amber-50/60">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="input-num-1" className="text-xs font-bold text-stone-900 flex items-center gap-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[11px] font-bold text-white">
                      1
                    </span>
                    第一數【求上卦 / 外卦】
                  </label>
                  <span className="text-[11px] text-stone-500">除以 8 求餘數</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="input-num-1"
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    pattern="[0-9]*"
                    value={num1Str}
                    onChange={(e) => handleDigitChange(e.target.value, setNum1Str)}
                    onBlur={() => handleBlurPad(num1Str, setNum1Str)}
                    placeholder="如 431"
                    className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-center font-mono text-xl font-bold tracking-widest text-stone-900 shadow-2xs transition focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                  {num1Str !== "" && (
                    <button
                      type="button"
                      onClick={() => setNum1Str("")}
                      className="absolute right-2.5 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                      title="清空此欄"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="mt-2 text-center text-xs text-stone-600">
                  {num1Str !== "" ? (
                    (() => {
                      const n = parseInt(num1Str, 10);
                      const rem = n % 8 === 0 ? 8 : n % 8;
                      const trig = XIAN_TIAN_TRIGRAMS[rem];
                      return (
                        <span className="font-medium">
                          {n} ÷ 8 ＝ {Math.floor(n / 8)} ... 餘{" "}
                          <strong className="text-amber-700 font-bold text-sm">{rem}</strong> ➔ 上卦【
                          <strong className="text-stone-900">{trig.name} {trig.symbol}</strong>】
                        </span>
                      );
                    })()
                  ) : (
                    <span className="text-stone-400">請輸入 000 ~ 999 數字</span>
                  )}
                </div>
              </div>

              {/* Number 2: Lower Trigram */}
              <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-4 transition focus-within:border-amber-500 focus-within:bg-amber-50/60">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="input-num-2" className="text-xs font-bold text-stone-900 flex items-center gap-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-600 text-[11px] font-bold text-white">
                      2
                    </span>
                    第二數【求下卦 / 內卦】
                  </label>
                  <span className="text-[11px] text-stone-500">除以 8 求餘數</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="input-num-2"
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    pattern="[0-9]*"
                    value={num2Str}
                    onChange={(e) => handleDigitChange(e.target.value, setNum2Str)}
                    onBlur={() => handleBlurPad(num2Str, setNum2Str)}
                    placeholder="如 379"
                    className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-center font-mono text-xl font-bold tracking-widest text-stone-900 shadow-2xs transition focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600"
                  />
                  {num2Str !== "" && (
                    <button
                      type="button"
                      onClick={() => setNum2Str("")}
                      className="absolute right-2.5 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                      title="清空此欄"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="mt-2 text-center text-xs text-stone-600">
                  {num2Str !== "" ? (
                    (() => {
                      const n = parseInt(num2Str, 10);
                      const rem = n % 8 === 0 ? 8 : n % 8;
                      const trig = XIAN_TIAN_TRIGRAMS[rem];
                      return (
                        <span className="font-medium">
                          {n} ÷ 8 ＝ {Math.floor(n / 8)} ... 餘{" "}
                          <strong className="text-amber-700 font-bold text-sm">{rem}</strong> ➔ 下卦【
                          <strong className="text-stone-900">{trig.name} {trig.symbol}</strong>】
                        </span>
                      );
                    })()
                  ) : (
                    <span className="text-stone-400">請輸入 000 ~ 999 數字</span>
                  )}
                </div>
              </div>

              {/* Number 3: Moving Line */}
              <div className="rounded-xl border border-rose-200/80 bg-rose-50/20 p-4 transition focus-within:border-rose-500 focus-within:bg-rose-50/40">
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="input-num-3" className="text-xs font-bold text-stone-900 flex items-center gap-1">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[11px] font-bold text-white">
                      3
                    </span>
                    第三數【求動爻變革】
                  </label>
                  <span className="text-[11px] text-stone-500">除以 6 求餘數</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="input-num-3"
                    type="text"
                    inputMode="numeric"
                    maxLength={3}
                    pattern="[0-9]*"
                    value={num3Str}
                    onChange={(e) => handleDigitChange(e.target.value, setNum3Str)}
                    onBlur={() => handleBlurPad(num3Str, setNum3Str)}
                    placeholder="如 847"
                    className="w-full rounded-lg border border-stone-300 bg-white px-3.5 py-2.5 text-center font-mono text-xl font-bold tracking-widest text-stone-900 shadow-2xs transition focus:border-rose-600 focus:outline-none focus:ring-1 focus:ring-rose-600"
                  />
                  {num3Str !== "" && (
                    <button
                      type="button"
                      onClick={() => setNum3Str("")}
                      className="absolute right-2.5 rounded-full p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-700 cursor-pointer"
                      title="清空此欄"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="mt-2 text-center text-xs text-stone-600">
                  {num3Str !== "" ? (
                    (() => {
                      const n = parseInt(num3Str, 10);
                      const rem = n % 6 === 0 ? 6 : n % 6;
                      const yaoNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
                      return (
                        <span className="font-medium">
                          {n} ÷ 6 ＝ {Math.floor(n / 6)} ... 餘{" "}
                          <strong className="text-rose-600 font-bold text-sm">{rem}</strong> ➔ 動爻【
                          <strong className="text-stone-900">{yaoNames[rem - 1]}發動</strong>】
                        </span>
                      );
                    })()
                  ) : (
                    <span className="text-stone-400">請輸入 000 ~ 999 數字</span>
                  )}
                </div>
              </div>
            </div>

            {/* Live Deduction Preview Banner */}
            {liveNumberGua && (
              <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 via-white to-amber-50 p-4 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span className="font-serif text-sm font-bold text-stone-900">
                      即時卦象數理推演結果
                    </span>
                  </div>
                  <span className="text-xs text-stone-500 font-mono">
                    [{num1Str.padStart(3, "0")}, {num2Str.padStart(3, "0")}, {num3Str.padStart(3, "0")}]
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500">本卦成卦：</span>
                    <strong className="font-serif text-base text-amber-900 font-bold">
                      《{liveNumberGua.originalHexagramName}》
                    </strong>
                    <span className="text-xs text-stone-600">
                      （上{liveNumberGua.upperTrigram} 下{liveNumberGua.lowerTrigram}）
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-stone-500">動變之卦：</span>
                    <strong className="font-serif text-base text-rose-700 font-bold">
                      《{liveNumberGua.changedHexagramName}》
                    </strong>
                    <span className="text-xs font-semibold text-rose-800 bg-rose-50 border border-rose-200 rounded px-1.5 py-0.5">
                      {liveNumberGua.movingYaoName}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- METHOD B: Da Yan Stalk Remainders (6, 7, 8, 9) --- */}
        {methodMode === "stalk" && (
          <div className="space-y-3">
            <div className="rounded-xl bg-stone-50 p-3 text-xs text-stone-600 border border-stone-200">
              大衍筮法以四除之：9為老陽（◯動）、8為少陰、7為少陽、6為老陰（✕動）。
              依序從底部的<strong>初爻</strong>點選至頂部的<strong>上爻</strong>。
            </div>

            {/* Yao Lines Selector Stack (Displayed from 上爻 top to 初爻 bottom) */}
            <div className="space-y-2.5">
              {[5, 4, 3, 2, 1, 0].map((idx) => {
                const yaoNumber = idx + 1;
                const yaoLabel = ["初爻 (底)", "二爻", "三爻", "四爻", "五爻", "上爻 (頂)"][idx];
                const currentVal = remainders[idx];

                return (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-stone-200 bg-stone-50/70 p-2.5 sm:p-3 transition hover:border-stone-300 hover:bg-stone-100/50"
                  >
                    {/* Left Line Name & Symbol Preview */}
                    <div className="flex items-center justify-between sm:justify-start space-x-3">
                      <span className="w-18 sm:w-20 font-serif text-sm font-semibold text-stone-800">
                        {yaoLabel}
                      </span>

                      {/* Line Visual Symbol */}
                      <div className="flex h-8 w-28 items-center justify-center rounded-lg border border-stone-200 bg-white px-2 font-mono text-sm tracking-widest text-stone-900 shadow-2xs">
                        <div className="relative inline-flex items-center justify-center">
                          {currentVal === 9 ? (
                            <>
                              <span className="text-rose-600 font-bold select-none">▅▅▅▅▅</span>
                              <span className="absolute left-[calc(100%+6px)] text-xs text-rose-600 font-bold">◯</span>
                            </>
                          ) : currentVal === 7 ? (
                            <span className="text-stone-900 select-none">▅▅▅▅▅</span>
                          ) : currentVal === 6 ? (
                            <>
                              <span className="text-sky-600 font-bold select-none">▅▅　▅▅</span>
                              <span className="absolute left-[calc(100%+6px)] text-xs text-sky-600 font-bold">✕</span>
                            </>
                          ) : (
                            <span className="text-stone-600 select-none">▅▅　▅▅</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Selector Radio Buttons for 6, 7, 8, 9 */}
                    <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap sm:items-center sm:gap-2">
                      {[
                        { val: 9 as YaoRemainder, label: "9 老陽 (◯發動)", desc: "變少陰", color: "rose" },
                        { val: 7 as YaoRemainder, label: "7 少陽", desc: "靜陽", color: "amber" },
                        { val: 8 as YaoRemainder, label: "8 少陰", desc: "靜陰", color: "stone" },
                        { val: 6 as YaoRemainder, label: "6 老陰 (✕發動)", desc: "變少陽", color: "sky" },
                      ].map((btn) => {
                        const isSelected = currentVal === btn.val;
                        return (
                          <button
                            key={btn.val}
                            id={`yao-${yaoNumber}-val-${btn.val}`}
                            type="button"
                            onClick={() => handleRemainderChange(idx, btn.val)}
                            className={`rounded-lg px-2.5 py-2 sm:px-3 sm:py-1.5 text-xs font-semibold transition-all cursor-pointer text-center ${
                              isSelected
                                ? btn.val === 9
                                  ? "border border-rose-400 bg-rose-50 text-rose-800 ring-1 ring-rose-400 shadow-2xs font-bold"
                                  : btn.val === 6
                                  ? "border border-sky-400 bg-sky-50 text-sky-800 ring-1 ring-sky-400 shadow-2xs font-bold"
                                  : btn.val === 7
                                  ? "border border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-400 shadow-2xs font-bold"
                                  : "border border-stone-400 bg-stone-200 text-stone-900 ring-1 ring-stone-400 shadow-2xs font-bold"
                                : "border border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900"
                            }`}
                          >
                            {btn.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Action Button */}
      <div className="flex justify-center pt-2">
        <button
          id="btn-submit-divination"
          type="submit"
          className="group relative flex items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 px-8 py-3.5 text-base font-bold text-white shadow-md transition-all hover:brightness-105 active:scale-[0.99] sm:w-80 cursor-pointer"
        >
          <CheckCircle2 className="h-5 w-5" />
          <span>立即排盤與伏神推算</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
};
