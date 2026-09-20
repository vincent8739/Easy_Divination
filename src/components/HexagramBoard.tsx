import React, { useState, useRef, useEffect } from "react";
import {
  DivinationResult,
  SixRelative,
  Wuxing,
  WangXiangLevel,
  YaoLineDetail,
} from "../types/liuyao";
import { YaoEnergyChart } from "./YaoEnergyChart";
import { YaoDetailModal } from "./YaoDetailModal";
import { LiuYao14Layers } from "./LiuYao14Layers";
import { YingQiSection } from "./YingQiSection";
import { toPng } from "html-to-image";
import {
  Sparkles,
  Printer,
  Check,
  Flame,
  BookOpen,
  ArrowRight,
  Zap,
  ShieldAlert,
  Compass,
  Sun,
  Moon,
  Activity,
  Layers,
  Info,
  HelpCircle,
  BarChart3,
  Download,
  FileJson,
  Image as ImageIcon,
  Loader2,
  Calendar,
  Hash,
} from "lucide-react";

interface HexagramBoardProps {
  result: DivinationResult;
  onYongShenChange: (newRelative: SixRelative) => void;
}

const WUXING_COLORS: Record<Wuxing, { bg: string; text: string; border: string }> = {
  金: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  木: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
  水: { bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-300" },
  火: { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-300" },
  土: { bg: "bg-amber-200/60", text: "text-amber-900", border: "border-amber-400" },
};

const SIX_SPIRIT_COLORS: Record<string, string> = {
  青龍: "text-emerald-800 bg-emerald-50 border-emerald-300",
  朱雀: "text-rose-800 bg-rose-50 border-rose-300",
  勾陳: "text-yellow-800 bg-yellow-50 border-yellow-300",
  螣蛇: "text-purple-800 bg-purple-50 border-purple-300",
  白虎: "text-stone-800 bg-stone-100 border-stone-300",
  玄武: "text-sky-800 bg-sky-50 border-sky-300",
};

const WANG_XIANG_BADGES: Record<WangXiangLevel, { label: string; style: string }> = {
  旺: { label: "旺", style: "bg-emerald-100 text-emerald-800 border-emerald-400" },
  相: { label: "相", style: "bg-teal-100 text-teal-800 border-teal-400" },
  休: { label: "休", style: "bg-amber-100 text-amber-800 border-amber-400" },
  囚: { label: "囚", style: "bg-orange-100 text-orange-800 border-orange-400" },
  死: { label: "死", style: "bg-rose-100 text-rose-800 border-rose-400" },
};

export const HexagramBoard: React.FC<HexagramBoardProps> = ({
  result,
  onYongShenChange,
}) => {
  const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null);
  const [isYaoDetailModalOpen, setIsYaoDetailModalOpen] = useState(false);
  const [activeYaoDetailIndex, setActiveYaoDetailIndex] = useState<number>(1);
  const [activeAnalysisTab, setActiveAnalysisTab] = useState<"biangua" | "dongbian" | "month" | "day" | "fushen">("biangua");

  const handleOpenYaoDetail = (lineIndex: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActiveYaoDetailIndex(lineIndex);
    setSelectedLineIndex(lineIndex);
    setIsYaoDetailModalOpen(true);
  };

  // Export States
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(event.target as Node)
      ) {
        setIsExportMenuOpen(false);
      }
    };
    if (isExportMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExportMenuOpen]);

  // Export JSON file
  const handleExportJson = () => {
    try {
      const jsonStr = JSON.stringify(result, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const safeTitle = (result.question || "六爻卦例").replace(/[\\/:*?"<>|]/g, "_").slice(0, 20);
      const filename = `${result.querent ? result.querent + "_" : ""}六爻排盤_${result.originalHexagram.name}${
        result.changedHexagram ? "之" + result.changedHexagram.name : ""
      }_${safeTitle}.json`;

      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportFeedback("JSON 資料已成功匯出下載！");
      setTimeout(() => setExportFeedback(null), 3000);
      setIsExportMenuOpen(false);
    } catch (err) {
      console.error("Failed to export JSON:", err);
      setExportFeedback("匯出 JSON 失敗，請重試");
      setTimeout(() => setExportFeedback(null), 3000);
    }
  };

  // Export High-Res Image (PNG)
  const handleExportImage = async () => {
    if (!boardContainerRef.current) return;
    setIsExportingImage(true);
    try {
      // Small pause to ensure rendering stability
      await new Promise((resolve) => setTimeout(resolve, 150));

      const dataUrl = await toPng(boardContainerRef.current, {
        backgroundColor: "#faf9f6",
        pixelRatio: 2,
        cacheBust: true,
        filter: (node: HTMLElement) => {
          if (node.id === "export-menu-dropdown") return false;
          if (node.id === "export-feedback-toast") return false;
          return true;
        },
      });

      const safeTitle = (result.question || "六爻卦例").replace(/[\\/:*?"<>|]/g, "_").slice(0, 20);
      const filename = `${result.querent ? result.querent + "_" : ""}六爻排盤_${result.originalHexagram.name}${
        result.changedHexagram ? "之" + result.changedHexagram.name : ""
      }_${safeTitle}.png`;

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportFeedback("高清排盤圖片 (PNG) 已成功下載！");
      setTimeout(() => setExportFeedback(null), 3000);
    } catch (err) {
      console.error("Failed to export image:", err);
      setExportFeedback("匯出圖片失敗，請重試");
      setTimeout(() => setExportFeedback(null), 3000);
    } finally {
      setIsExportingImage(false);
      setIsExportMenuOpen(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Find moving lines and special status lines
  const movingLines = result.lines.filter((l) => l.isMoving);
  const monthPoLines = result.lines.filter((l) => l.isMonthPo);
  const dayChongLines = result.lines.filter((l) => l.isDayChong);

  return (
    <div ref={boardContainerRef} id="hexagram-board-main-container" className="space-y-6">
      {/* Top Banner Card: Metadata & Ganzhi Information */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-amber-300">
                求占者：{result.querent}
              </span>
              <h2 className="font-serif text-lg font-bold text-stone-900 sm:text-2xl">
                {result.question}
              </h2>
            </div>
            <p className="mt-1 text-xs text-stone-500">
              起卦公曆：{result.dateTimeStr} · 節氣時令：{result.solarTermStr}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Export & Backup Dropdown Menu */}
            <div ref={exportDropdownRef} className="relative">
              <button
                id="btn-export-dropdown-toggle"
                type="button"
                onClick={() => setIsExportMenuOpen((prev) => !prev)}
                className="flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 active:scale-95 cursor-pointer shadow-2xs"
              >
                {isExportingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    <span>生成中...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 text-amber-700" />
                    <span>匯出排盤</span>
                  </>
                )}
              </button>

              {isExportMenuOpen && (
                <div
                  id="export-menu-dropdown"
                  className="absolute left-0 sm:left-auto sm:right-0 top-full mt-1.5 z-40 w-56 max-w-[calc(100vw-2rem)] rounded-xl border border-stone-200 bg-white p-1.5 shadow-xl ring-1 ring-stone-900/5"
                  style={{ maxWidth: "calc(100vw - 32px)" }}
                >
                  <div className="px-2.5 py-1.5 text-[11px] font-semibold text-stone-500 border-b border-stone-100">
                    匯出當前卦例結果
                  </div>

                  <button
                    id="btn-export-image-png"
                    type="button"
                    onClick={handleExportImage}
                    disabled={isExportingImage}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-xs text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition text-left cursor-pointer"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 border border-sky-200">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900">匯出為高清圖片 (PNG)</div>
                      <div className="text-[10px] text-stone-500">完整卦盤截圖，利於存檔分享</div>
                    </div>
                  </button>

                  <button
                    id="btn-export-json-file"
                    type="button"
                    onClick={handleExportJson}
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-xs text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition text-left cursor-pointer"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-200">
                      <FileJson className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-stone-900">匯出為 JSON 數據檔</div>
                      <div className="text-[10px] text-stone-500">完整六爻結構化數據備份</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            <button
              id="btn-print-paipan"
              onClick={handlePrint}
              className="flex items-center gap-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-100 hover:text-stone-900 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>列印排盤</span>
            </button>

            <button
              id="btn-quick-yingqi"
              type="button"
              onClick={() => {
                document.getElementById("yingqi-calculation-section")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex items-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-900 transition hover:bg-emerald-100 cursor-pointer shadow-2xs"
              title="快速跳轉至應期推算與關鍵日子列表"
            >
              <Calendar className="h-4 w-4 text-emerald-700" />
              <span>應期推算</span>
            </button>
          </div>
        </div>

        {/* Export Feedback Notification Banner */}
        {exportFeedback && (
          <div
            id="export-feedback-toast"
            className="mt-3 flex items-center justify-between rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-xs text-emerald-900 shadow-sm animate-in fade-in slide-in-from-top-1"
          >
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-600" />
              <span className="font-semibold">{exportFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setExportFeedback(null)}
              className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Metaphysics Parameters Summary Bar */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6 text-xs">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-2.5">
            <span className="text-stone-500 block mb-0.5 font-medium">年月日時干支</span>
            <span className="font-serif font-bold text-stone-900">
              {result.ganzhiYear}年 {result.ganzhiMonth}月<br />
              {result.ganzhiDay}日 {result.ganzhiHour}時
            </span>
          </div>

          <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-2.5">
            <span className="text-amber-800 block mb-0.5 font-semibold flex items-center gap-1">
              <Moon className="h-3 w-3 text-amber-600" /> 月建（月令權綱）
            </span>
            <span className="font-serif font-bold text-stone-900 text-sm">
              【{result.yueJian}】{result.yueJianWuxing}
            </span>
          </div>

          <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-2.5">
            <span className="text-amber-800 block mb-0.5 font-semibold flex items-center gap-1">
              <Sun className="h-3 w-3 text-amber-600" /> 日辰（當日主事）
            </span>
            <span className="font-serif font-bold text-stone-900 text-sm">
              【{result.riChen}】{result.riChenWuxing}
            </span>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-2.5">
            <span className="text-stone-500 block mb-0.5 font-medium">日旬空亡</span>
            <span className="font-bold text-rose-600">
              【{result.xunKong}】
            </span>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-2.5">
            <span className="text-stone-500 block mb-0.5 font-medium">日祿 · 貴人</span>
            <span className="text-stone-800 font-semibold">
              祿在【{result.dayLu}】· 貴【{result.dayGuiRen}】
            </span>
          </div>

          <div className="rounded-xl border border-stone-200 bg-stone-50 p-2.5">
            <span className="text-stone-500 block mb-0.5 font-medium">驛馬 · 桃花</span>
            <span className="text-stone-800 font-semibold">
              驛馬【{result.yiMa}】· 桃花【{result.taoHua}】
            </span>
          </div>
        </div>
      </div>

      {/* Number Divination Derivation Card (If created via 3-digit numbers) */}
      {result.numberGuaInfo && (
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 p-5 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-3 mb-3">
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-amber-700" />
              <h3 className="font-serif text-base font-bold text-stone-900 sm:text-lg">
                數字卦推演歷程（邵雍《梅花易數》先天八卦數理）
              </h3>
            </div>
            <span className="rounded-lg bg-amber-100/80 px-2.5 py-1 text-xs font-bold text-amber-900 border border-amber-200">
              起卦數字：{String(result.numberGuaInfo.num1).padStart(3, "0")} · {String(result.numberGuaInfo.num2).padStart(3, "0")} · {String(result.numberGuaInfo.num3).padStart(3, "0")}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3 text-xs sm:text-sm">
            {/* Upper Trigram */}
            <div className="rounded-xl border border-amber-200/80 bg-white p-3.5 shadow-2xs">
              <div className="text-xs text-amber-800 font-semibold mb-1 flex items-center justify-between">
                <span>第一數【求上卦 / 外卦】</span>
                <span className="text-[11px] text-stone-400 font-mono">模 8</span>
              </div>
              <div className="font-mono text-stone-700 text-xs sm:text-sm">
                {result.numberGuaInfo.num1} ÷ 8 ＝ {Math.floor(result.numberGuaInfo.num1 / 8)} ... 餘{" "}
                <span className="font-bold text-amber-700 text-base">{result.numberGuaInfo.upperRemainder}</span>
              </div>
              <div className="mt-1.5 font-serif font-bold text-stone-900 flex items-center gap-1.5">
                <span>➔ 上卦為【{result.numberGuaInfo.upperTrigram} {result.numberGuaInfo.upperTrigramSymbol}】</span>
              </div>
            </div>

            {/* Lower Trigram */}
            <div className="rounded-xl border border-amber-200/80 bg-white p-3.5 shadow-2xs">
              <div className="text-xs text-amber-800 font-semibold mb-1 flex items-center justify-between">
                <span>第二數【求下卦 / 內卦】</span>
                <span className="text-[11px] text-stone-400 font-mono">模 8</span>
              </div>
              <div className="font-mono text-stone-700 text-xs sm:text-sm">
                {result.numberGuaInfo.num2} ÷ 8 ＝ {Math.floor(result.numberGuaInfo.num2 / 8)} ... 餘{" "}
                <span className="font-bold text-amber-700 text-base">{result.numberGuaInfo.lowerRemainder}</span>
              </div>
              <div className="mt-1.5 font-serif font-bold text-stone-900 flex items-center gap-1.5">
                <span>➔ 下卦為【{result.numberGuaInfo.lowerTrigram} {result.numberGuaInfo.lowerTrigramSymbol}】</span>
              </div>
            </div>

            {/* Moving Line */}
            <div className="rounded-xl border border-rose-200/80 bg-white p-3.5 shadow-2xs">
              <div className="text-xs text-rose-800 font-semibold mb-1 flex items-center justify-between">
                <span>第三數【求動爻變革】</span>
                <span className="text-[11px] text-stone-400 font-mono">模 6</span>
              </div>
              <div className="font-mono text-stone-700 text-xs sm:text-sm">
                {result.numberGuaInfo.num3} ÷ 6 ＝ {Math.floor(result.numberGuaInfo.num3 / 6)} ... 餘{" "}
                <span className="font-bold text-rose-600 text-base">{result.numberGuaInfo.movingRemainder}</span>
              </div>
              <div className="mt-1.5 font-serif font-bold text-stone-900 flex items-center gap-1.5">
                <span>➔ 動爻為【{result.numberGuaInfo.movingYaoName}】</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hexagram Names & Special Classification */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Primary Hexagram Card */}
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/40 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 font-serif text-2xl font-bold text-amber-800 ring-1 ring-amber-300">
                本
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-xl font-bold text-stone-900">
                    《{result.originalHexagram.name}》
                  </h3>
                  <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
                    {result.originalHexagram.palaceTypeName}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  上【{result.originalHexagram.upperTrigram}】下【{result.originalHexagram.lowerTrigram}】· 所屬【{result.originalHexagram.palace}宮{result.originalHexagram.palaceWuxing}】· 世{result.originalHexagram.shiYao} 應{result.originalHexagram.yingYao}
                </p>
              </div>
            </div>
            {result.sixHeSixChong && (
              <span className="rounded-lg border border-amber-400 bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-900">
                {result.sixHeSixChong}
              </span>
            )}
          </div>
        </div>

        {/* Changed Hexagram Card */}
        <div className="rounded-2xl border border-stone-200 bg-gradient-to-br from-rose-50/40 via-white to-stone-50 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/10 font-serif text-2xl font-bold text-rose-700 ring-1 ring-rose-300">
                之
              </div>
              <div>
                {result.hasMovingYao && result.changedHexagram ? (
                  <>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif text-xl font-bold text-stone-900">
                        《{result.changedHexagram.name}》
                      </h3>
                      <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">
                        {result.movingCount} 爻發動
                      </span>
                      <span className="rounded bg-stone-200 px-2 py-0.5 text-xs font-semibold text-stone-800">
                        {result.changedHexagram.palaceTypeName}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-stone-500">
                      上【{result.changedHexagram.upperTrigram}】下【{result.changedHexagram.lowerTrigram}】· 所屬【{result.changedHexagram.palace}宮{result.changedHexagram.palaceWuxing}】· 世{result.changedHexagram.shiYao} 應{result.changedHexagram.yingYao}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="font-serif text-xl font-bold text-stone-600">
                      六爻皆靜 · 無變卦
                    </h3>
                    <p className="text-xs text-stone-500">
                      靜卦專看本卦世應生剋與用神旺衰
                    </p>
                  </>
                )}
              </div>
            </div>
            {result.hasMovingYao && result.changedSixHeSixChong && (
              <span className="rounded-lg border border-rose-300 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800">
                {result.changedSixHeSixChong}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Dual Hexagram Visual Transformation Board (本卦 ➔ 變卦 雙卦全象圖解對照) */}
      {result.hasMovingYao && result.changedHexagram && (
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3 mb-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <h3 className="font-serif text-base font-bold text-stone-900 sm:text-lg">
                本卦 ➔ 變卦（之卦）雙卦全象圖解對照
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="rounded bg-rose-50 border border-rose-200 px-2.5 py-1 font-bold text-rose-800">
                共 {result.movingCount} 爻發動演化
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-11 items-center">
            {/* Left: Primary Hexagram Visual Column (5 cols) */}
            <div className="lg:col-span-5 rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 font-serif text-sm font-bold text-amber-800 ring-1 ring-amber-300">
                    本
                  </span>
                  <div>
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      《{result.originalHexagram.name}》
                    </h4>
                    <span className="text-[11px] text-stone-600">
                      {result.originalHexagram.palace}宮{result.originalHexagram.palaceWuxing} · {result.originalHexagram.palaceTypeName}
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="text-amber-800 font-bold">世在第 {result.originalHexagram.shiYao} 爻</span>
                  <span className="text-stone-500 block">應在第 {result.originalHexagram.yingYao} 爻</span>
                </div>
              </div>

              {/* 6 lines from top (6) to bottom (1) */}
              <div className="space-y-1.5 font-mono text-xs">
                {result.lines
                  .slice()
                  .reverse()
                  .map((line) => (
                    <div
                      key={`orig-${line.index}`}
                      className={`grid grid-cols-[84px_1fr_96px] items-center rounded-lg p-2 transition ${
                        line.isMoving
                          ? "bg-amber-100/70 border border-amber-400 text-stone-900 ring-1 ring-amber-300 shadow-2xs font-bold"
                          : "bg-white border border-stone-200 text-stone-800 shadow-2xs"
                      }`}
                    >
                      {/* Left: Yao Name & Shi/Ying */}
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-serif font-bold text-stone-800 whitespace-nowrap">{line.name}</span>
                        {line.isShi && <span className="text-xs text-amber-700 font-bold whitespace-nowrap">【世】</span>}
                        {line.isYing && <span className="text-xs text-stone-600 font-semibold whitespace-nowrap">【應】</span>}
                      </div>

                      {/* Center: Exactly Centered Yao Symbol + Relative Moving Badge */}
                      <div className="relative flex items-center justify-center">
                        <span className={`font-mono text-sm tracking-widest font-bold select-none ${
                          line.yinYang === 1 ? "text-amber-700" : "text-stone-800"
                        }`}>
                          {line.symbolStr}
                        </span>
                        {line.remainder === 9 && (
                          <span className="absolute left-[calc(50%+50px)] rounded-full bg-rose-100 border border-rose-300 px-1.5 py-0.5 text-xs text-rose-800 font-bold whitespace-nowrap shadow-2xs">
                            9 ◯
                          </span>
                        )}
                        {line.remainder === 6 && (
                          <span className="absolute left-[calc(50%+50px)] rounded-full bg-sky-100 border border-sky-300 px-1.5 py-0.5 text-xs text-sky-800 font-bold whitespace-nowrap shadow-2xs">
                            6 ✕
                          </span>
                        )}
                      </div>

                      {/* Right: Six Relative + Stem/Branch/Wuxing */}
                      <div className="flex items-center gap-1.5 justify-end whitespace-nowrap">
                        <span className="font-serif font-bold text-amber-900">{line.originalRelative}</span>
                        <span className="text-stone-700 font-medium">{line.originalBranch}{line.originalWuxing}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Middle: Movement Transition Flow (1 col) */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center py-2">
              <div className="hidden lg:flex flex-col items-center gap-3">
                {result.lines
                  .slice()
                  .reverse()
                  .map((line) => (
                    <div key={`arrow-${line.index}`} className="h-9 flex items-center justify-center">
                      {line.isMoving ? (
                        <div className="flex items-center text-rose-600 font-bold animate-pulse">
                          <ArrowRight className="h-4 w-4" />
                        </div>
                      ) : (
                        <span className="text-stone-300 text-xs">──</span>
                      )}
                    </div>
                  ))}
              </div>
              <div className="lg:hidden flex items-center justify-center gap-2 py-1 text-xs text-rose-700 font-bold">
                <ArrowRight className="h-4 w-4 rotate-90" />
                <span>發動爻位推演轉變</span>
                <ArrowRight className="h-4 w-4 rotate-90" />
              </div>
            </div>

            {/* Right: Changed Hexagram Visual Column (5 cols) */}
            <div className="lg:col-span-5 rounded-xl border border-rose-200 bg-rose-50/30 p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-rose-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/15 font-serif text-sm font-bold text-rose-800 ring-1 ring-rose-300">
                    之
                  </span>
                  <div>
                    <h4 className="font-serif text-base font-bold text-stone-900">
                      《{result.changedHexagram.name}》
                    </h4>
                    <span className="text-[11px] text-stone-600">
                      {result.changedHexagram.palace}宮{result.changedHexagram.palaceWuxing} · {result.changedHexagram.palaceTypeName}
                    </span>
                  </div>
                </div>
                <div className="text-right text-xs">
                  <span className="text-rose-700 font-bold">世在第 {result.changedHexagram.shiYao} 爻</span>
                  <span className="text-stone-500 block">應在第 {result.changedHexagram.yingYao} 爻</span>
                </div>
              </div>

              {/* 6 lines in Changed Hexagram from top (6) to bottom (1) */}
              <div className="space-y-1.5 font-mono text-xs">
                {result.lines
                  .slice()
                  .reverse()
                  .map((line) => (
                    <div
                      key={`changed-${line.index}`}
                      className={`grid grid-cols-[84px_1fr_96px] items-center rounded-lg p-2 transition ${
                        line.isMoving
                          ? "bg-rose-100/70 border border-rose-400 text-stone-900 ring-1 ring-rose-300 shadow-2xs font-bold"
                          : "bg-white border border-stone-200 text-stone-600 shadow-2xs"
                      }`}
                    >
                      {/* Left: Yao Name & Changed Shi/Ying */}
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-serif font-bold text-stone-800 whitespace-nowrap">
                          {line.changedLineName || line.name}
                        </span>
                        {line.isChangedShi && (
                          <span className="text-xs text-rose-700 font-bold whitespace-nowrap">【之世】</span>
                        )}
                        {line.isChangedYing && (
                          <span className="text-xs text-stone-600 font-semibold whitespace-nowrap">【之應】</span>
                        )}
                      </div>

                      {/* Center: Exactly Centered Changed Yao Symbol + Moving Indicator */}
                      <div className="relative flex items-center justify-center">
                        <span className={`font-mono text-sm tracking-widest font-bold select-none ${
                          line.changedYinYang === 1 ? "text-amber-700" : "text-stone-800"
                        }`}>
                          {line.changedSymbolStr}
                        </span>
                        {line.isMoving && (
                          <span className="absolute left-[calc(50%+50px)] rounded bg-rose-100 border border-rose-300 px-1.5 py-0.5 text-[10px] text-rose-800 font-sans font-bold whitespace-nowrap shadow-2xs">
                            變
                          </span>
                        )}
                      </div>

                      {/* Right: Changed Relative + Branch/Wuxing */}
                      <div className="flex items-center gap-1.5 justify-end whitespace-nowrap">
                        <span className={`font-serif font-bold ${line.isMoving ? "text-amber-900" : "text-stone-600"}`}>
                          {line.changedRelative}
                        </span>
                        <span className={line.isMoving ? "text-stone-900 font-bold" : "text-stone-600"}>
                          {line.changedBranch}{line.changedWuxing}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* D3.js Metaphysics Energy Quantification Chart (六爻日月旺衰量化圖譜) */}
      <YaoEnergyChart
        result={result}
        selectedLineIndex={selectedLineIndex}
        onSelectLine={setSelectedLineIndex}
      />

      {/* Main Paipan Table Matrix (六爻納甲飛伏全覽) */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-md">
        <div className="border-b border-stone-200 bg-stone-50/80 px-4 py-3 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                <span>六爻納甲飛伏排盤矩陣</span>
                <span className="text-xs font-normal text-stone-500">
                  （自初爻至上爻 · 包含月令旺衰、月破、日沖暗動與動變生剋）
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-stone-600 font-medium">當前定位用神：</span>
              <div className="flex gap-1">
                {(["妻財", "官鬼", "父母", "子孫", "兄弟"] as SixRelative[]).map((rel) => (
                  <button
                    key={rel}
                    id={`btn-select-yongshen-${rel}`}
                    type="button"
                    onClick={() => onYongShenChange(rel)}
                    className={`rounded px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                      result.yongShenCategory === rel
                        ? "bg-amber-700 text-white shadow-2xs"
                        : "bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200"
                    }`}
                  >
                    {rel}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Yao Details Tip Banner */}
        <div className="flex items-center justify-between bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/70 px-4 sm:px-6 py-2.5 border-b border-amber-200 text-xs">
          <div className="flex items-center gap-2 text-amber-950 font-medium">
            <Sparkles className="h-4 w-4 text-amber-700 shrink-0" />
            <span>
              <strong>爻位深度推演：</strong>點擊表格任一爻位（或點擊「詳解」按鈕），可立即展開<strong>【納甲·六親·神煞·伏神·旺衰】</strong>全景精準易理彈窗！
            </span>
          </div>
          <span className="hidden md:inline-block rounded-md bg-white/90 border border-amber-300 px-2 py-0.5 text-[11px] font-bold text-amber-900 shadow-2xs">
            支援鍵盤 ← / → 切換爻位
          </span>
        </div>

        {/* Responsive Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-100/80 font-serif text-xs font-semibold text-stone-700">
                <th className="py-3 px-3 sm:px-4 text-center">六神</th>
                <th className="py-3 px-3 sm:px-4 bg-amber-100/50 text-amber-900">
                  伏神考證（本宮純卦）
                </th>
                <th className="py-3 px-3 sm:px-4 text-center">爻次 / 詳解</th>
                <th className="py-3 px-3 sm:px-4 font-bold text-stone-900">
                  本卦六親干支
                </th>
                <th className="py-3 px-3 sm:px-4 text-center">本卦爻象</th>
                <th className="py-3 px-3 sm:px-4 text-center">世應 / 用神</th>
                <th className="py-3 px-3 sm:px-4 text-center bg-stone-100 text-stone-800 font-bold">
                  月旺衰
                </th>
                <th className="py-3 px-3 sm:px-4">月破 / 日辰沖剋</th>
                {result.hasMovingYao && (
                  <>
                    <th className="py-3 px-3 sm:px-4 text-center bg-rose-50 text-rose-900 font-bold">
                      變卦爻象
                    </th>
                    <th className="py-3 px-3 sm:px-4 text-center bg-rose-50 text-rose-900 font-bold">
                      變卦世應
                    </th>
                    <th className="py-3 px-3 sm:px-4 bg-rose-50 text-rose-900 font-bold">
                      變卦六親干支
                    </th>
                    <th className="py-3 px-3 sm:px-4 bg-amber-50 font-bold text-amber-900">
                      動變生剋態勢
                    </th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {result.lines
                .slice()
                .reverse()
                .map((line) => {
                  const isYong = line.originalRelative === result.yongShenCategory;
                  const fushen = line.fushen;
                  const isFushenYong = fushen?.relative === result.yongShenCategory;
                  const isSelected = selectedLineIndex === line.index;

                  return (
                    <tr
                      key={line.index}
                      onClick={() => handleOpenYaoDetail(line.index)}
                      className={`transition cursor-pointer group ${
                        isSelected
                          ? "bg-amber-100/70 ring-1 ring-amber-500"
                          : isYong
                          ? "bg-amber-50/60 hover:bg-amber-100/50"
                          : line.isShi
                          ? "bg-stone-50 hover:bg-stone-100/80"
                          : "hover:bg-stone-50/80"
                      }`}
                    >
                      {/* 1. Six Spirit */}
                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-block rounded-md border px-2 py-0.5 text-xs font-bold ${
                            SIX_SPIRIT_COLORS[line.sixSpirit]
                          }`}
                        >
                          {line.sixSpirit}
                        </span>
                      </td>

                      {/* 2. Hidden Spirit (伏神推算) */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap bg-amber-50/30">
                        {fushen && (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`font-semibold ${
                                   fushen.isMissingInOriginal
                                    ? "text-rose-700 font-bold"
                                    : "text-stone-600"
                                }`}
                              >
                                {fushen.relative}
                              </span>
                              <span className="font-mono text-stone-700">
                                {fushen.stem}{fushen.branch}{fushen.wuxing}
                              </span>
                              {fushen.isMissingInOriginal && (
                                <span className="rounded bg-rose-100 border border-rose-300 px-1 py-0.2 text-[10px] font-bold text-rose-800">
                                  缺伏
                                </span>
                              )}
                              {isFushenYong && (
                                <span className="rounded bg-amber-600 px-1.5 py-0.2 text-[10px] font-bold text-white shadow-2xs">
                                  用神伏此
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 mt-0.5 text-[11px]">
                              <span
                                className={`font-medium ${
                                  fushen.relationWithFeishen === "飛生伏"
                                    ? "text-emerald-700 font-semibold"
                                    : fushen.relationWithFeishen === "飛剋伏"
                                    ? "text-rose-700 font-bold"
                                    : fushen.relationWithFeishen === "伏剋飛"
                                    ? "text-amber-800 font-semibold"
                                    : "text-stone-500"
                                }`}
                              >
                                【{fushen.relationWithFeishen}】
                              </span>
                              <span className="text-stone-500 text-[10px]">
                                {fushen.isEmerged ? "（易透出）" : "（難透出）"}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* 3. Yao Index & Name with Detail Trigger Button */}
                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap font-serif font-bold text-stone-800">
                        <div className="flex items-center justify-center gap-1.5">
                          <span className="group-hover:text-amber-900 transition">{line.name}</span>
                          <button
                            onClick={(e) => handleOpenYaoDetail(line.index, e)}
                            className="inline-flex items-center gap-0.5 rounded bg-amber-100/90 group-hover:bg-amber-200 border border-amber-300 px-1.5 py-0.5 text-[10px] font-sans text-amber-900 transition cursor-pointer shadow-2xs"
                            title={`點擊查看【${line.name}】納甲、神煞、伏神與旺衰推算彈窗`}
                          >
                            <Sparkles className="h-2.5 w-2.5 text-amber-700" />
                            詳解
                          </button>
                        </div>
                      </td>

                      {/* 4. Primary Hexagram Relative, Stem, Branch, Wuxing */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-serif font-bold ${
                              isYong ? "text-amber-900 underline decoration-amber-500 font-black" : "text-stone-900"
                            }`}
                          >
                            {line.originalRelative}
                          </span>
                          <span className="font-mono text-stone-700 font-medium">
                            {line.originalStem}{line.originalBranch}
                          </span>
                          <span
                            className={`inline-block rounded px-1.5 py-0.2 text-xs font-semibold ${
                              WUXING_COLORS[line.originalWuxing].text
                            } ${WUXING_COLORS[line.originalWuxing].bg} border ${WUXING_COLORS[line.originalWuxing].border}`}
                          >
                            {line.originalWuxing}
                          </span>
                        </div>
                      </td>

                      {/* 5. Primary Line Visual Symbol & Moving Indicator */}
                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        <div className="relative inline-flex items-center justify-center font-mono text-sm tracking-widest">
                          <span
                            className={
                              line.yinYang === 1
                                ? "text-amber-700 font-bold select-none"
                                : "text-stone-800 font-bold select-none"
                            }
                          >
                            {line.symbolStr}
                          </span>
                          {line.remainder === 9 && (
                            <span className="absolute left-[calc(100%+10px)] font-bold text-rose-600 text-xs">
                              ◯
                            </span>
                          )}
                          {line.remainder === 6 && (
                            <span className="absolute left-[calc(100%+10px)] font-bold text-sky-600 text-xs">
                              ✕
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 6. Shi / Ying & Yong Shen Tags */}
                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {line.isShi && (
                            <span className="rounded bg-rose-700 px-1.5 py-0.5 text-xs font-black text-white shadow-2xs">
                              世
                            </span>
                          )}
                          {line.isYing && (
                            <span className="rounded bg-stone-200 px-1.5 py-0.5 text-xs font-bold text-stone-700 border border-stone-300">
                              應
                            </span>
                          )}
                          {isYong && (
                            <span className="rounded border border-amber-500 bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-900">
                              用
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 7. 月旺衰 (Wang / Xiang / Xiu / Qiu / Si) */}
                      <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap bg-stone-50/50">
                        <span
                          className={`inline-block rounded border px-2 py-0.5 text-xs font-bold shadow-2xs ${
                            WANG_XIANG_BADGES[line.wangXiang].style
                          }`}
                          title={line.wangXiangDescription}
                        >
                          {WANG_XIANG_BADGES[line.wangXiang].label}
                        </span>
                      </td>

                      {/* 8. 月破 & 日辰生剋沖合 (暗動 / 日破 / 日沖動 / 沖空 / 旬空) */}
                      <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                        <div className="flex flex-wrap items-center gap-1">
                          {line.isMonthPo && (
                            <span
                              className="rounded border border-rose-300 bg-rose-100 px-1.5 py-0.5 text-[11px] font-bold text-rose-800 shadow-2xs"
                              title={line.monthPoDescription}
                            >
                              【月破】
                            </span>
                          )}

                          {line.isDayChong && line.dayChongType && (
                            <span
                              className={`rounded border px-1.5 py-0.5 text-[11px] font-bold ${
                                line.dayChongType === "暗動"
                                  ? "border-sky-300 bg-sky-100 text-sky-800"
                                  : line.dayChongType === "日破"
                                  ? "border-rose-300 bg-rose-100 text-rose-800"
                                  : line.dayChongType === "沖空"
                                  ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                                  : "border-purple-300 bg-purple-100 text-purple-800"
                              }`}
                              title={line.dayChongDescription}
                            >
                              【{line.dayChongType}】
                            </span>
                          )}

                          {line.isXunKong && (
                            <span className="rounded border border-purple-200 bg-purple-50 px-1.5 py-0.2 text-[11px] font-medium text-purple-800">
                              旬空
                            </span>
                          )}

                          {line.dayRelation === "臨日辰" && (
                            <span className="rounded border border-emerald-300 bg-emerald-100 px-1.5 py-0.2 text-[11px] font-bold text-emerald-900 shadow-2xs">
                              臨日辰
                            </span>
                          )}

                          {line.dayRelation === "日辰六合" && (
                            <span className="rounded border border-teal-200 bg-teal-50 px-1.5 py-0.2 text-[11px] font-medium text-teal-800">
                              日合
                            </span>
                          )}

                          {line.dayRelation === "日建同旺" && (
                            <span className="rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.2 text-[11px] font-medium text-emerald-800">
                              日辰比和
                            </span>
                          )}

                          {line.dayRelation === "得日辰生" && (
                            <span className="rounded border border-sky-200 bg-sky-50 px-1.5 py-0.2 text-[11px] font-medium text-sky-800">
                              日生
                            </span>
                          )}

                          {line.dayRelation === "受日辰剋" && (
                            <span className="rounded border border-rose-200 bg-rose-50 px-1.5 py-0.2 text-[11px] font-medium text-rose-800">
                              日剋
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 9, 10, 11, 12. Changed Hexagram details (all 6 lines) */}
                      {result.hasMovingYao && (
                        <>
                          {/* 變卦爻象 */}
                          <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap bg-rose-50/50 font-mono">
                            {line.isMoving ? (
                              <span className="text-rose-800 font-bold text-base tracking-widest">
                                {line.changedSymbolStr}
                              </span>
                            ) : (
                              <span className="text-stone-500 font-medium text-sm tracking-widest">
                                {line.changedSymbolStr}
                              </span>
                            )}
                          </td>

                          {/* 變卦世應 */}
                          <td className="py-3 px-3 sm:px-4 text-center whitespace-nowrap bg-rose-50/50">
                            {line.isChangedShi ? (
                              <span className="rounded bg-rose-100 px-1.5 py-0.5 text-xs font-bold text-rose-800 border border-rose-300">
                                之世
                              </span>
                            ) : line.isChangedYing ? (
                              <span className="rounded bg-stone-200 px-1.5 py-0.5 text-xs font-bold text-stone-700 border border-stone-300">
                                之應
                              </span>
                            ) : (
                              <span className="text-stone-400">-</span>
                            )}
                          </td>

                          {/* 變卦六親干支 */}
                          <td className="py-3 px-3 sm:px-4 whitespace-nowrap bg-rose-50/50">
                            {line.isMoving ? (
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-amber-900">
                                  {line.changedRelative}
                                </span>
                                <span className="font-mono text-stone-900 font-semibold">
                                  {line.changedStem}{line.changedBranch}
                                </span>
                                <span
                                  className={`rounded px-1.5 py-0.2 text-xs font-semibold ${
                                    WUXING_COLORS[line.changedWuxing || "土"].text
                                  } ${WUXING_COLORS[line.changedWuxing || "土"].bg} border ${WUXING_COLORS[line.changedWuxing || "土"].border}`}
                                >
                                  {line.changedWuxing}
                                </span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1.5 text-stone-500">
                                <span className="text-stone-600">{line.changedRelative}</span>
                                <span className="font-mono text-stone-600">
                                  {line.changedStem}{line.changedBranch}
                                </span>
                                <span className="text-xs text-stone-500 font-medium">
                                  {line.changedWuxing}
                                </span>
                              </div>
                            )}
                          </td>

                          {/* 動變生剋態勢 (回頭生、回頭剋、化進、化退等) */}
                          <td className="py-3 px-3 sm:px-4 whitespace-nowrap bg-amber-50/30">
                            {line.isMoving && line.dongBianDetail ? (
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`rounded-md border px-2 py-0.5 text-xs font-bold shadow-2xs ${
                                    line.dongBianDetail.type === "回頭生"
                                      ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                                      : line.dongBianDetail.type === "回頭剋"
                                      ? "border-rose-300 bg-rose-100 text-rose-800"
                                      : line.dongBianDetail.type === "化進神"
                                      ? "border-sky-300 bg-sky-100 text-sky-800"
                                      : line.dongBianDetail.type === "化退神"
                                      ? "border-amber-300 bg-amber-100 text-amber-800"
                                      : line.dongBianDetail.auspiciousness === "大吉" || line.dongBianDetail.auspiciousness === "吉"
                                      ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                                      : line.dongBianDetail.auspiciousness === "大凶" || line.dongBianDetail.auspiciousness === "凶"
                                      ? "border-rose-300 bg-rose-100 text-rose-800"
                                      : "border-stone-200 bg-stone-100 text-stone-700"
                                  }`}
                                >
                                  {line.dongBianDetail.title}
                                </span>
                                <span
                                  className={`text-[10px] font-bold ${
                                    line.dongBianDetail.auspiciousness === "大吉" || line.dongBianDetail.auspiciousness === "吉"
                                      ? "text-emerald-700"
                                      : line.dongBianDetail.auspiciousness === "大凶" || line.dongBianDetail.auspiciousness === "凶"
                                      ? "text-rose-700"
                                      : "text-stone-500"
                                  }`}
                                >
                                  【{line.dongBianDetail.auspiciousness}】
                                </span>
                              </div>
                            ) : (
                              <span className="text-stone-400 text-xs">靜（隨卦變）</span>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Line Deep Insight Popover / Card */}
      {selectedLineIndex !== null && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50/60 p-5 shadow-lg transition animate-in fade-in duration-200">
          {(() => {
            const l = result.lines[selectedLineIndex - 1];
            if (!l) return null;
            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-amber-200 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-amber-700 px-2 py-0.5 font-serif text-xs font-bold text-white">
                      第 {l.index} 爻 · {l.name}
                    </span>
                    <span className="font-serif font-bold text-stone-900">
                      {l.originalRelative} · {l.originalStem}{l.originalBranch}{l.originalWuxing}
                    </span>
                    {l.isShi && <span className="rounded bg-rose-100 border border-rose-300 px-1.5 text-xs text-rose-800 font-bold">世爻</span>}
                    {l.isYing && <span className="rounded bg-stone-200 px-1.5 text-xs text-stone-700 font-bold">應爻</span>}
                    {l.originalRelative === result.yongShenCategory && (
                      <span className="rounded bg-amber-200 border border-amber-400 px-1.5 text-xs text-amber-900 font-bold">當前用神</span>
                    )}
                    <button
                      onClick={() => handleOpenYaoDetail(l.index)}
                      className="ml-2 flex items-center gap-1.5 rounded-lg bg-amber-800 hover:bg-amber-900 text-white px-2.5 py-1 text-xs font-bold transition cursor-pointer shadow-2xs"
                      title="開啟全鑑彈窗查看納甲、六親、神煞、伏神及旺衰推算"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      開啟【{l.name}】全景易理推演彈窗
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedLineIndex(null)}
                    className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer font-medium"
                  >
                    關閉卡片 ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3 text-xs">
                  {/* Month Effect */}
                  <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs">
                    <span className="text-amber-900 font-bold block mb-1 flex items-center gap-1">
                      <Moon className="h-3.5 w-3.5 text-amber-700" /> 月令旺衰與月破
                    </span>
                    <p className="text-stone-700">{l.wangXiangDescription}</p>
                    {l.isMonthPo && (
                      <p className="mt-1 text-rose-700 font-semibold">{l.monthPoDescription}</p>
                    )}
                  </div>

                  {/* Day Effect */}
                  <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs">
                    <span className="text-amber-900 font-bold block mb-1 flex items-center gap-1">
                      <Sun className="h-3.5 w-3.5 text-amber-700" /> 日辰生剋沖合
                    </span>
                    <p className="text-stone-700">{l.dayRelationDescription}</p>
                    {l.isDayChong && l.dayChongDescription && (
                      <p className="mt-1 text-sky-700 font-semibold">{l.dayChongDescription}</p>
                    )}
                  </div>

                  {/* Movement & Transformation Dynamics */}
                  <div className="rounded-xl border border-stone-200 bg-white p-3.5 shadow-2xs">
                    <span className="text-amber-900 font-bold block mb-1 flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5 text-amber-700" /> 動變生剋動態
                    </span>
                    {l.isMoving && l.dongBianDetail ? (
                      <div>
                        <span className="font-bold text-amber-900">{l.dongBianDetail.title}</span>
                        <p className="mt-1 text-stone-700">{l.dongBianDetail.detail}</p>
                      </div>
                    ) : (
                      <p className="text-stone-500">此爻為靜爻，未發動變卦。專看月建日辰生剋。</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Traditional 14-Layer Classical Liu Yao Analytical Hierarchy */}
      <LiuYao14Layers
        result={result}
        onSelectLine={(idx) => setSelectedLineIndex(idx)}
        onOpenLineDetail={(idx) => handleOpenYaoDetail(idx)}
      />

      {/* Dedicated YingQi (應期推算) Prediction and Key Days List */}
      <YingQiSection
        result={result}
        onSelectLine={(idx) => setSelectedLineIndex(idx)}
      />

      {/* 2. Dedicated Metaphysics Analysis Deck: 月建、日辰、動變生剋（回頭生/剋、化進/退） */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-md sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
          <div className="flex items-center space-x-2">
            <Compass className="h-5 w-5 text-amber-700" />
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900 sm:text-lg">
                月建·日辰·動變生剋（回頭生剋/化進退）易理全鑑
              </h3>
              <p className="text-[11px] text-stone-500">
                深研事態演化之機：月建司三旬綱領，日辰操一日生殺，動變定終局歸宿
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs">
            <button
              onClick={() => setActiveAnalysisTab("biangua")}
              className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
                activeAnalysisTab === "biangua"
                  ? "bg-amber-700 text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              變卦之象（{result.hasMovingYao ? result.changedHexagram?.name : "無變"}）
            </button>
            <button
              onClick={() => setActiveAnalysisTab("dongbian")}
              className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
                activeAnalysisTab === "dongbian"
                  ? "bg-amber-700 text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              動變生剋（{movingLines.length}動爻）
            </button>
            <button
              onClick={() => setActiveAnalysisTab("month")}
              className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
                activeAnalysisTab === "month"
                  ? "bg-amber-700 text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              月建旺衰·月破
            </button>
            <button
              onClick={() => setActiveAnalysisTab("day")}
              className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
                activeAnalysisTab === "day"
                  ? "bg-amber-700 text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              日辰主事·日沖暗動
            </button>
            <button
              onClick={() => setActiveAnalysisTab("fushen")}
              className={`rounded-lg px-3 py-1 font-semibold transition cursor-pointer ${
                activeAnalysisTab === "fushen"
                  ? "bg-amber-700 text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
            >
              伏神飛神考證
            </button>
          </div>
        </div>

        {/* 為何有此生剋全鑑？基本知識補充 */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 text-xs text-stone-700 leading-relaxed space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-1.5 font-serif font-bold text-amber-900 text-xs sm:text-sm">
              <HelpCircle className="h-4 w-4 text-amber-700 shrink-0" />
              <span>【為何有此生剋全鑑？】月令、日辰與動變易理樞紐</span>
            </div>
            <span className="text-[10px] text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300 font-medium whitespace-nowrap">
              易理斷法鐵律
            </span>
          </div>

          <p className="text-[11px] text-stone-600">
            六爻占筮的核心精髓在於<strong>動態時空演化</strong>。靜態的卦象只是事物的初始底色，真正決定事態演進吉凶的是四大動力源：
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px] pt-0.5">
            <div className="rounded-lg bg-white p-2.5 border border-stone-200 shadow-2xs">
              <strong className="text-sky-800 block mb-0.5">① 月令提綱（定先天底氣）</strong>
              <span className="text-stone-600 text-[10px]">月建掌萬物生殺，同氣為旺、得生為相、生月為休、剋月為囚、受剋為死，正沖為月破（逢沖必敗）。</span>
            </div>
            <div className="rounded-lg bg-white p-2.5 border border-stone-200 shadow-2xs">
              <strong className="text-amber-800 block mb-0.5">② 日辰主宰（操當下生殺）</strong>
              <span className="text-stone-600 text-[10px]">日辰生扶為得助；旺相逢日沖化為「暗動」（暗中發力成事）；休囚逢沖為「日破」；落空逢沖為「沖空填實」。</span>
            </div>
            <div className="rounded-lg bg-white p-2.5 border border-stone-200 shadow-2xs">
              <strong className="text-purple-800 block mb-0.5">③ 動變生剋（化出吉凶）</strong>
              <span className="text-stone-600 text-[10px]">動爻與變爻依五行實際關係論生剋。變生動為回頭生、化進神大吉；變剋動為回頭剋、化退神大凶；動剋變為耗力、動生變為洩氣、同類為比和扶助。</span>
            </div>
            <div className="rounded-lg bg-white p-2.5 border border-stone-200 shadow-2xs">
              <strong className="text-rose-800 block mb-0.5">④ 變卦之象（事之終局）</strong>
              <span className="text-stone-600 text-[10px]">「本卦為事之始，變卦為事之終」。發動之爻牽引全盤氣場轉化，變卦之卦辭與大象即為最終歸宿。</span>
            </div>
          </div>
        </div>

        {/* Tab 1: 動變生剋 (回頭生、回頭剋、化進、化退、化絕、化墓、化空、化合等) */}
        {activeAnalysisTab === "dongbian" && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-150">
            {movingLines.length > 0 ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {movingLines.map((line) => {
                  const d = line.dongBianDetail;
                  if (!d) return null;

                  return (
                    <div
                      key={line.index}
                      className={`rounded-xl border p-4 transition ${
                        d.type === "回頭生" || d.type === "化進神"
                          ? "border-emerald-300 bg-emerald-50/50 ring-1 ring-emerald-300/40"
                          : d.type === "回頭剋" || d.type === "化退神" || d.type === "化絕" || d.type === "化墓"
                          ? "border-rose-300 bg-rose-50/50 ring-1 ring-rose-300/40"
                          : "border-stone-200 bg-stone-50/50"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-amber-100 border border-amber-300 px-2 py-0.5 font-serif text-xs font-bold text-amber-900">
                            第 {line.index} 爻（{line.name}）
                          </span>
                          <h4 className="font-serif text-sm font-bold text-stone-900">
                            {d.title}
                          </h4>
                        </div>
                        <span
                          className={`rounded px-2 py-0.5 text-xs font-bold ${
                            d.auspiciousness === "大吉"
                              ? "bg-emerald-600 text-white"
                              : d.auspiciousness === "吉"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : d.auspiciousness === "大凶"
                              ? "bg-rose-600 text-white"
                              : d.auspiciousness === "凶"
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : "bg-stone-100 text-stone-700"
                          }`}
                        >
                          {d.auspiciousness}
                        </span>
                      </div>

                      {/* Interaction Process */}
                      <div className="flex items-center justify-between bg-white rounded-lg p-2.5 border border-stone-200 text-xs mb-2.5">
                        <div className="text-center">
                          <span className="text-[10px] text-stone-500 block">動爻本位</span>
                          <span className="font-bold text-amber-900">
                            {line.originalRelative} {line.originalBranch}{line.originalWuxing}
                          </span>
                        </div>
                        <ArrowRight className="h-4 w-4 text-amber-700" />
                        <div className="text-center">
                          <span className="text-[10px] text-stone-500 block">變爻化出</span>
                          <span className="font-bold text-rose-900">
                            {line.changedRelative} {line.changedBranch}{line.changedWuxing}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-stone-500 block">動變定性</span>
                          <span className="font-semibold text-stone-800">{d.summary}</span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-700 leading-relaxed">
                        {d.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-6 text-center text-stone-600">
                <p className="font-serif text-base text-stone-800 font-bold mb-1">
                  六爻皆靜 · 無動爻發動
                </p>
                <p className="text-xs max-w-md mx-auto">
                  此卦無爻發動（無動變生剋、回頭生剋、化進退之象）。卦象安靜，行事主平穩守常，專以本卦世應關係與用神之月建旺衰、日辰生剋定吉凶。
                </p>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: 月建綱領與月旺衰、月破 */}
        {activeAnalysisTab === "month" && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-150">
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-xs leading-relaxed text-stone-700">
              <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                <Moon className="h-4 w-4 text-amber-700" /> 月建【{result.yueJian}】{result.yueJianWuxing} 司權總覽（萬物之綱領）
              </h4>
              <p>
                《增刪卜易》云：「月建司三旬之權，操萬物之生殺。」月建掌管月令氣運，凡爻與月建同五行為<strong>【旺】</strong>、受月建所生為<strong>【相】</strong>、生月建洩氣為<strong>【休】</strong>、剋月建受耗為<strong>【囚】</strong>、受月建剋制為<strong>【死】</strong>。凡與月建地支相沖之爻即為<strong>【月破】</strong>。
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              {result.lines.map((l) => (
                <div
                  key={l.index}
                  className={`rounded-xl border p-3.5 ${
                    l.isMonthPo
                      ? "border-rose-300 bg-rose-50/60 ring-1 ring-rose-300"
                      : l.wangXiang === "旺" || l.wangXiang === "相"
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-stone-200 bg-white shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-serif font-bold text-stone-900">
                      第 {l.index} 爻（{l.name}）{l.originalRelative}
                    </span>
                    <div className="flex gap-1">
                      <span
                        className={`rounded border px-1.5 py-0.2 font-bold ${
                          WANG_XIANG_BADGES[l.wangXiang].style
                        }`}
                      >
                        {l.wangXiang}
                      </span>
                      {l.isMonthPo && (
                        <span className="rounded bg-rose-600 px-1.5 py-0.2 font-bold text-white">
                          月破
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-stone-600">{l.wangXiangDescription}</p>
                  {l.isMonthPo && (
                    <p className="mt-1 text-rose-700 font-semibold">{l.monthPoDescription}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: 日辰主事與日沖暗動 */}
        {activeAnalysisTab === "day" && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-150">
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-xs leading-relaxed text-stone-700">
              <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                <Sun className="h-4 w-4 text-amber-700" /> 日辰【{result.riChen}】{result.riChenWuxing} 執權總覽（發動之樞紐）
              </h4>
              <p>
                《卜筮正宗》云：「日辰為六爻之主宰，操一日之生殺權衡。」爻遇日辰生扶為得助，遇日辰相剋為受制。爻逢日辰相沖：動爻逢沖為<strong>【日沖動】</strong>（事應加速）；旺相靜爻逢沖為<strong>【暗動】</strong>（暗中發力、吉凶倍增）；休囚靜爻逢沖為<strong>【日破】</strong>（破散無依）；旬空之爻逢沖為<strong>【沖空】</strong>（沖空則實）。
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
              {result.lines.map((l) => (
                <div
                  key={l.index}
                  className={`rounded-xl border p-3.5 ${
                    l.dayChongType === "暗動"
                      ? "border-sky-300 bg-sky-50/60 ring-1 ring-sky-300"
                      : l.dayChongType === "日破"
                      ? "border-rose-300 bg-rose-50/60 ring-1 ring-rose-300"
                      : l.dayRelation === "日建同旺" || l.dayRelation === "得日辰生"
                      ? "border-emerald-200 bg-emerald-50/50"
                      : "border-stone-200 bg-white shadow-2xs"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-serif font-bold text-stone-900">
                      第 {l.index} 爻（{l.name}）{l.originalRelative}
                    </span>
                    <div className="flex gap-1">
                      {l.dayChongType ? (
                        <span className="rounded bg-sky-600 px-1.5 py-0.2 font-bold text-white">
                          {l.dayChongType}
                        </span>
                      ) : (
                        <span className="rounded bg-stone-100 border border-stone-200 px-1.5 py-0.2 text-stone-700 font-medium">
                          {l.dayRelation}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-stone-600">{l.dayRelationDescription}</p>
                  {l.isDayChong && l.dayChongDescription && (
                    <p className="mt-1 text-sky-700 font-semibold">{l.dayChongDescription}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: 伏神飛神推算 */}
        {activeAnalysisTab === "fushen" && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-150">
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 text-xs leading-relaxed text-stone-700">
              <h4 className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-700" /> 伏神飛神推算（本宮八純卦對照）
              </h4>
              <p>
                {result.missingRelatives.length > 0 ? (
                  <>
                    本卦《{result.originalHexagram.name}》為【{result.originalHexagram.palace}宮{result.originalHexagram.palaceWuxing}】，缺少六親：
                    <strong className="text-rose-700">【{result.missingRelatives.join("、")}】</strong>。依法須從本宮首卦《{result.lines[0]?.fushen?.pureHexagramName}》查取伏神。飛生伏大吉易透出，飛剋伏受制難出，伏剋飛出暴有力。
                  </>
                ) : (
                  <>
                    本卦《{result.originalHexagram.name}》五行六親齊全，無缺失六親。下方為六爻與本宮首卦《{result.lines[0]?.fushen?.pureHexagramName}》之全覽對照。
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 text-xs">
              {result.lines.map((line) => {
                const f = line.fushen;
                if (!f) return null;
                const isHighlight = f.isMissingInOriginal || f.relative === result.yongShenCategory;

                return (
                  <div
                    key={line.index}
                    className={`rounded-xl border p-3.5 transition ${
                      isHighlight
                        ? "border-amber-300 bg-amber-50/60 ring-1 ring-amber-300"
                        : "border-stone-200 bg-white shadow-2xs"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-serif text-xs font-bold text-stone-900">
                        第 {line.index} 爻（{line.name}）飛伏對
                      </span>
                      {isHighlight && (
                        <span className="rounded bg-rose-100 border border-rose-300 px-1.5 py-0.5 text-[10px] font-bold text-rose-800">
                          {f.isMissingInOriginal ? "本卦所缺" : "用神所在"}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-stone-500">飛神（本卦）：</span>
                        <span className="font-semibold text-stone-900">
                          {line.originalRelative} {line.originalBranch}{line.originalWuxing}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-stone-500">伏神（純卦）：</span>
                        <span className="font-semibold text-amber-900">
                          {f.relative} {f.branch}{f.wuxing}
                        </span>
                      </div>

                      <div className="flex justify-between border-t border-stone-200 pt-1">
                        <span className="text-stone-500">生剋關係：</span>
                        <span
                          className={`font-bold ${
                            f.relationWithFeishen === "飛生伏"
                              ? "text-emerald-700"
                              : f.relationWithFeishen === "飛剋伏"
                              ? "text-rose-700"
                              : "text-amber-800"
                          }`}
                        >
                          {f.relationWithFeishen}（{f.relationDesc}）
                        </span>
                      </div>

                      <div className="text-[11px] text-stone-600">
                        <span className="text-stone-500 font-medium">出伏研判：</span>
                        {f.emergedReason}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 5: 變卦之象與演變斷語 (Biangua deep analysis) */}
        {activeAnalysisTab === "biangua" && (
          <div className="mt-4 space-y-4 animate-in fade-in duration-150">
            {result.hasMovingYao && result.changedHexagram ? (
              <div className="space-y-4">
                {/* Summary Banner */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 font-serif text-2xl font-bold text-rose-800 border border-rose-300 shadow-2xs">
                        之
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-serif text-lg font-bold text-stone-900">
                            變卦《{result.changedHexagram.name}》
                          </h4>
                          <span className="rounded bg-rose-100 border border-rose-300 px-2 py-0.5 text-xs font-bold text-rose-800">
                            {result.movingCount} 爻發動轉化
                          </span>
                          {result.changedSixHeSixChong && (
                            <span className="rounded border border-rose-300 bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-800">
                              {result.changedSixHeSixChong}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-stone-600">
                          所屬【{result.changedHexagram.palace}宮{result.changedHexagram.palaceWuxing}】· {result.changedHexagram.palaceTypeName} · 上卦【{result.changedHexagram.upperTrigram}】下卦【{result.changedHexagram.lowerTrigram}】· 世在第 {result.changedHexagram.shiYao} 爻，應在第 {result.changedHexagram.yingYao} 爻
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gua Ci & Meaning of Changed Hexagram */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
                    <span className="font-serif text-xs font-bold text-rose-900 block mb-1.5">
                      【變卦卦辭】《{result.changedHexagram.name}》
                    </span>
                    <p className="font-serif text-sm text-stone-800 leading-relaxed">
                      {result.changedHexagram.guaCi}
                    </p>
                    <div className="mt-3 border-t border-stone-200 pt-2 text-xs text-stone-600 leading-relaxed">
                      <span className="text-stone-800 font-semibold">【之卦大象】：</span>
                      {result.changedHexagram.xiangCi}
                    </div>
                  </div>

                  <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs space-y-2">
                    <span className="font-serif text-xs font-bold text-amber-900 block mb-1">
                      【變卦易理與事態歸宿研判】
                    </span>
                    <p className="text-xs text-stone-700 leading-relaxed">
                      六爻占卜中，「本卦為事之始，變卦為事之終」。發動之爻產生變動，導引全盤卦氣趨向變卦《{result.changedHexagram.name}》。
                    </p>
                    <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200 text-xs text-stone-700 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-stone-500">本卦宮位五行：</span>
                        <span className="font-bold text-stone-900">
                          {result.originalHexagram.palace}宮（{result.originalHexagram.palaceWuxing}）
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">變卦宮位五行：</span>
                        <span className="font-bold text-rose-800">
                          {result.changedHexagram.palace}宮（{result.changedHexagram.palaceWuxing}）
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-500">變卦六合/六沖格局：</span>
                        <span className="font-bold text-stone-800">
                          {result.changedSixHeSixChong || "一般常規卦象"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6-Lines Changed Comparison Grid */}
                <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
                  <h4 className="font-serif text-xs font-bold text-stone-900 mb-3">
                    【變卦各爻位納甲與動變詳情】
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {result.lines
                      .slice()
                      .reverse()
                      .map((line) => (
                        <div
                          key={`bg-card-${line.index}`}
                          className={`rounded-lg border p-3 text-xs ${
                            line.isMoving
                              ? "border-rose-300 bg-rose-50/50 ring-1 ring-rose-300"
                              : "border-stone-200 bg-stone-50/50"
                          }`}
                        >
                          <div className="flex items-center justify-between border-b border-stone-200 pb-1.5 mb-2">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-stone-900">{line.name}</span>
                              {line.isMoving ? (
                                <span className="rounded bg-rose-100 border border-rose-300 px-1 text-[10px] font-bold text-rose-800">
                                  動爻（{line.remainder}）
                                </span>
                              ) : (
                                <span className="text-[10px] text-stone-500">靜爻</span>
                              )}
                            </div>
                            <div>
                              {line.isChangedShi && (
                                <span className="rounded bg-rose-100 border border-rose-300 px-1.5 py-0.5 text-[10px] font-bold text-rose-800">
                                  之世
                                </span>
                              )}
                              {line.isChangedYing && (
                                <span className="rounded bg-stone-200 border border-stone-300 px-1.5 py-0.5 text-[10px] font-bold text-stone-700">
                                  之應
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className="flex justify-between text-stone-500">
                              <span>本卦爻象：</span>
                              <span className="text-stone-800 font-mono font-medium">
                                {line.originalRelative} {line.originalBranch}{line.originalWuxing}（{line.symbolStr}）
                              </span>
                            </div>
                            <div className="flex justify-between text-stone-500">
                              <span>變卦爻象：</span>
                              <span className={`font-mono font-bold ${line.isMoving ? "text-rose-800" : "text-stone-800"}`}>
                                {line.changedRelative} {line.changedBranch}{line.changedWuxing}（{line.changedSymbolStr}）
                              </span>
                            </div>
                            {line.dongBianDetail && (
                              <div className="mt-2 pt-1.5 border-t border-stone-200 flex items-center justify-between">
                                <span className="text-[11px] text-amber-900 font-bold">
                                  {line.dongBianDetail.title}
                                </span>
                                <span className="text-[10px] text-stone-600 font-medium">
                                  【{line.dongBianDetail.auspiciousness}】
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-stone-200 bg-stone-50/60 p-8 text-center">
                <p className="font-serif text-base font-bold text-stone-800">
                  本卦六爻皆靜，無發動之爻，故無變卦。
                </p>
                <p className="mt-2 text-xs text-stone-500 max-w-md mx-auto">
                  古法占斷云：「六爻皆靜，以本卦卦辭斷，兼看世應生剋與用神旺衰。」事情態勢平穩固守，無突發轉折之演變。
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Classical Texts: Gua Ci, Tuan, Xiang & Yao Ci */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-md sm:p-6">
        <div className="mb-4 flex items-center space-x-2 border-b border-stone-200 pb-3">
          <BookOpen className="h-5 w-5 text-amber-700" />
          <h3 className="font-serif text-base font-bold text-stone-900 sm:text-lg">
            《易經》經傳原文與動爻爻辭
          </h3>
        </div>

        <div className="space-y-4 text-xs sm:text-sm">
          {/* Gua Ci */}
          <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4">
            <h4 className="font-serif font-bold text-amber-900 mb-1">
              【卦辭】《{result.originalHexagram.name}》
            </h4>
            <p className="font-serif text-stone-800 leading-relaxed">
              {result.originalHexagram.guaCi}
            </p>
          </div>

          {/* Xiang Ci & Tuan Ci */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4">
              <h4 className="font-serif font-bold text-amber-900 mb-1">
                【象辭】
              </h4>
              <p className="text-stone-700 leading-relaxed">
                {result.originalHexagram.xiangCi}
              </p>
            </div>

            <div className="rounded-xl border border-stone-200 bg-stone-50/80 p-4">
              <h4 className="font-serif font-bold text-amber-900 mb-1">
                【彖傳】
              </h4>
              <p className="text-stone-700 leading-relaxed">
                {result.originalHexagram.tuanCi}
              </p>
            </div>
          </div>

          {/* Moving Yao Yao-Ci */}
          {result.hasMovingYao && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
              <h4 className="font-serif font-bold text-rose-900 mb-2">
                【動爻發動爻辭】
              </h4>
              <div className="space-y-2">
                {result.lines
                  .filter((l) => l.isMoving)
                  .map((l) => (
                    <div key={l.index} className="rounded-lg bg-white border border-rose-200 p-3 shadow-2xs">
                      <span className="font-serif font-bold text-amber-900 mr-2">
                        {l.yaoCi.split("：")[0]}：
                      </span>
                      <span className="text-stone-800">
                        {l.yaoCi.split("：")[1]}
                      </span>
                      {l.dongBianDetail && (
                        <span className="ml-2 inline-block rounded bg-rose-100 border border-rose-300 px-2 py-0.5 text-xs text-rose-800 font-semibold">
                          {l.dongBianDetail.title}（{l.dongBianDetail.summary}）
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Full Yao Line In-depth Reasoning Modal */}
      <YaoDetailModal
        isOpen={isYaoDetailModalOpen}
        onClose={() => setIsYaoDetailModalOpen(false)}
        result={result}
        initialLineIndex={activeYaoDetailIndex}
      />
    </div>
  );
};

