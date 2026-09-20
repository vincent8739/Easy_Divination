import React, { useState, useEffect } from "react";
import {
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Zap,
  Shield,
  Layers,
  Award,
  Compass,
  BookOpen,
  ArrowRight,
  Info,
  Flame,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import {
  DivinationResult,
  YaoLineDetail,
  Wuxing,
  WangXiangLevel,
  SixRelative,
} from "../types/liuyao";

interface YaoDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: DivinationResult;
  initialLineIndex: number;
}

const WUXING_COLORS: Record<Wuxing, { bg: string; text: string; border: string }> = {
  金: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-300" },
  木: { bg: "bg-emerald-100", text: "text-emerald-800", border: "border-emerald-300" },
  水: { bg: "bg-sky-100", text: "text-sky-800", border: "border-sky-300" },
  火: { bg: "bg-rose-100", text: "text-rose-800", border: "border-rose-300" },
  土: { bg: "bg-amber-200/60", text: "text-amber-900", border: "border-amber-400" },
};

const SIX_SPIRIT_DATA: Record<string, { desc: string; characteristics: string; color: string }> = {
  青龍: {
    desc: "東方木神 · 吉慶貴人",
    characteristics: "主喜慶宴樂、求名升遷、貴人庇佑、嫁娶得財。為六神中最吉之神。",
    color: "text-emerald-800 bg-emerald-50 border-emerald-300",
  },
  朱雀: {
    desc: "南方火神 · 文書口舌",
    characteristics: "主文書契約、信息傳遞、文章文彩。失令動爻主口舌是非、官非爭訟。",
    color: "text-rose-800 bg-rose-50 border-rose-300",
  },
  勾陳: {
    desc: "中央土神 · 田土遲滯",
    characteristics: "主田土房產、勾連牽絆、辦事遲緩、舊事重提。行事宜穩健持重。",
    color: "text-yellow-800 bg-yellow-50 border-yellow-300",
  },
  螣蛇: {
    desc: "中央陰土 · 虛驚怪異",
    characteristics: "主多疑猜忌、怪異夢境、虛驚不安、暗藏變數狡詐。主心神不定。",
    color: "text-purple-800 bg-purple-50 border-purple-300",
  },
  白虎: {
    desc: "西方金神 · 剛強威武",
    characteristics: "主剛強勇猛、刑傷疾病、血光孝服、風波阻礙。發動宜防損傷與爭鬥。",
    color: "text-stone-800 bg-stone-100 border-stone-300",
  },
  玄武: {
    desc: "北方水神 · 陰謀隱密",
    characteristics: "主曖昧隱私、投機巧取、私情私欲、防範盜賊欺瞞。主暗中謀劃。",
    color: "text-sky-800 bg-sky-50 border-sky-300",
  },
};

const YAO_POSITION_MEANINGS: Record<number, { title: string; bodyPart: string; socialLevel: string; spatial: string }> = {
  1: { title: "初爻 · 根基初生", bodyPart: "足部、腳踝、腳指", socialLevel: "庶民、基層員工、幼輩、起步者", spatial: "地基、底層、田野、遠方" },
  2: { title: "二爻 · 中饋持家", bodyPart: "小腿、膝蓋、股部", socialLevel: "大夫、中層幹部、妻子、管家", spatial: "家宅、客廳、近處、室內" },
  3: { title: "三爻 · 過渡轉折", bodyPart: "腰部、腹部、腰腎", socialLevel: "公門中人、前線主管、轉折承擔者", spatial: "門戶、台階、內外卦交界處" },
  4: { title: "四爻 · 承上啟下", bodyPart: "胸膛、背部、肺胃", socialLevel: "諸侯、高管、近臣、幕僚重臣", spatial: "大堂、院落、近君之位" },
  5: { title: "五爻 · 尊位主宰", bodyPart: "心臟、面部、五官", socialLevel: "君主、董事長、決策者、當令權柄", spatial: "大廈頂層、首都、核心要津" },
  6: { title: "上爻 · 終局太上", bodyPart: "頭部、腦部、頭髮", socialLevel: "太上皇、顧問長老、退休前輩、神明", spatial: "宗廟、邊境、遠郊、屋頂" },
};

export const YaoDetailModal: React.FC<YaoDetailModalProps> = ({
  isOpen,
  onClose,
  result,
  initialLineIndex,
}) => {
  const [currentLineIndex, setCurrentLineIndex] = useState<number>(initialLineIndex);
  const [activeTab, setActiveTab] = useState<"najia" | "shensha" | "fushen" | "wangxiang">("najia");

  useEffect(() => {
    setCurrentLineIndex(initialLineIndex);
  }, [initialLineIndex, isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, currentLineIndex]);

  if (!isOpen) return null;

  const line: YaoLineDetail | undefined = result.lines.find((l) => l.index === currentLineIndex);
  if (!line) return null;

  const isYong = line.originalRelative === result.yongShenCategory;
  const fushen = line.fushen;
  const isFushenYong = fushen?.relative === result.yongShenCategory;

  const handlePrev = () => {
    setCurrentLineIndex((prev) => (prev > 1 ? prev - 1 : 6));
  };

  const handleNext = () => {
    setCurrentLineIndex((prev) => (prev < 6 ? prev + 1 : 1));
  };

  // Shen Sha Calculations
  const branch = line.originalBranch;
  const isGuiRen = result.dayGuiRen.includes(branch);
  const isYiMa = result.yiMa === branch;
  const isTaoHua = result.taoHua === branch;
  const isDayLu = result.dayLu === branch;
  const isXunKong = result.xunKong.includes(branch);

  const matchedShenShaList: Array<{ name: string; tag: string; isMatch: boolean; desc: string; source: string }> = [
    {
      name: "天乙貴人",
      tag: "貴人星",
      isMatch: isGuiRen,
      desc: "易學萬事第一吉神。主逢凶化吉、遇難呈祥、得尊長與貴人鼎力相助、官訟消散、病遇良醫。",
      source: `日干【${result.riGan}】之貴人為【${result.dayGuiRen}】`,
    },
    {
      name: "驛馬星",
      tag: "動態星",
      isMatch: isYiMa,
      desc: "主奔波遠行、升遷調動、求名得位、差旅走動。若臨動爻則事態演變急迫迅速。",
      source: `日支【${result.riChen}】之驛馬為【${result.yiMa}】`,
    },
    {
      name: "桃花 (咸池)",
      tag: "情緣星",
      isMatch: isTaoHua,
      desc: "主人緣魅力、異性情緣、文藝才華。旺相得吉神主風雅出眾；休囚受剋或落官鬼防酒色是非。",
      source: `日支【${result.riChen}】之桃花為【${result.taoHua}】`,
    },
    {
      name: "日祿 (祿神)",
      tag: "食祿星",
      isMatch: isDayLu,
      desc: "日干本氣歸祿之位。主正俸薪資、官貴祿位、財源穩固、自身立足得地、享用不絕。",
      source: `日干【${result.riGan}】之日祿為【${result.dayLu}】`,
    },
    {
      name: "旬空 (空亡)",
      tag: "空亡煞",
      isMatch: isXunKong,
      desc: "主虛妄不實、心存疑惑、暫無著落。靜空為真真空，動空或受日沖為沖空填實，出旬逢沖即得用。",
      source: `當日值旬空為【${result.xunKong}】`,
    },
  ];

  const posData = YAO_POSITION_MEANINGS[line.index];

  return (
    <div
      id="yao-detail-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === "yao-detail-modal-backdrop") {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-2xl border border-stone-200 bg-[#faf9f6] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-gradient-to-r from-amber-50 via-white to-amber-50/60 px-4 sm:px-6 py-3.5">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-700 text-white font-serif font-bold text-lg shadow-sm">
              {line.name}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  【{line.name}】爻位精準易理與納甲全鑑
                </h3>
                {line.isShi && (
                  <span className="rounded bg-rose-700 px-1.5 py-0.5 text-xs font-black text-white shadow-2xs">
                    世爻
                  </span>
                )}
                {line.isYing && (
                  <span className="rounded bg-stone-200 border border-stone-300 px-1.5 py-0.5 text-xs font-bold text-stone-700">
                    應爻
                  </span>
                )}
                {isYong && (
                  <span className="rounded border border-amber-500 bg-amber-100 px-1.5 py-0.5 text-xs font-bold text-amber-900 shadow-2xs">
                    問事用神爻
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                所屬本卦：《{result.originalHexagram.name}》（{result.originalHexagram.palace}宮{result.originalHexagram.palaceWuxing} · {result.originalHexagram.palaceTypeName}）
                {result.hasMovingYao && line.isMoving && (
                  <span className="text-rose-700 font-semibold ml-1.5">
                    → 發動變之卦《{result.changedHexagram?.name}》【{line.changedLineName}】
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <button
              onClick={onClose}
              id="btn-close-yao-modal"
              className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-200/70 hover:text-stone-800 transition cursor-pointer"
              title="關閉 (Esc)"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Yao Navigation Bar (Quick switch between lines 1-6) */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-stone-100/80 px-4 sm:px-6 py-2">
          <button
            onClick={handlePrev}
            id="btn-yao-prev"
            className="flex items-center gap-1 text-xs font-medium text-stone-700 hover:text-amber-800 bg-white border border-stone-200 rounded-lg px-2.5 py-1 transition cursor-pointer shadow-2xs"
          >
            <ChevronLeft className="h-4 w-4" /> 上一爻
          </button>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            {result.lines.map((l) => (
              <button
                key={l.index}
                id={`btn-yao-select-${l.index}`}
                onClick={() => setCurrentLineIndex(l.index)}
                className={`rounded-lg px-2.5 py-1 text-xs font-serif font-bold transition cursor-pointer ${
                  l.index === currentLineIndex
                    ? "bg-amber-800 text-white shadow-sm ring-1 ring-amber-700"
                    : l.originalRelative === result.yongShenCategory
                    ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                    : l.isShi
                    ? "bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200"
                    : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-50"
                }`}
              >
                第{l.index}爻 {l.name}
                {l.isMoving && <span className="ml-1 text-rose-500">●</span>}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            id="btn-yao-next"
            className="flex items-center gap-1 text-xs font-medium text-stone-700 hover:text-amber-800 bg-white border border-stone-200 rounded-lg px-2.5 py-1 transition cursor-pointer shadow-2xs"
          >
            下一爻 <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-white px-4 sm:px-6">
          <button
            onClick={() => setActiveTab("najia")}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 px-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === "najia"
                ? "border-amber-700 text-amber-900 bg-amber-50/50"
                : "border-transparent text-stone-600 hover:text-stone-900"
            }`}
          >
            <Layers className="h-4 w-4" />
            納甲與六親推演
          </button>
          <button
            onClick={() => setActiveTab("shensha")}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 px-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === "shensha"
                ? "border-amber-700 text-amber-900 bg-amber-50/50"
                : "border-transparent text-stone-600 hover:text-stone-900"
            }`}
          >
            <Shield className="h-4 w-4" />
            六神與神煞考證
          </button>
          <button
            onClick={() => setActiveTab("fushen")}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 px-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === "fushen"
                ? "border-amber-700 text-amber-900 bg-amber-50/50"
                : "border-transparent text-stone-600 hover:text-stone-900"
            }`}
          >
            <Compass className="h-4 w-4" />
            伏神查尋與出伏判定
          </button>
          <button
            onClick={() => setActiveTab("wangxiang")}
            className={`flex items-center gap-1.5 border-b-2 py-2.5 px-3 text-xs sm:text-sm font-bold transition cursor-pointer ${
              activeTab === "wangxiang"
                ? "border-amber-700 text-amber-900 bg-amber-50/50"
                : "border-transparent text-stone-600 hover:text-stone-900"
            }`}
          >
            <Zap className="h-4 w-4" />
            旺衰生剋推算鏈
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* TAB 1: 納甲與六親推算 */}
          {activeTab === "najia" && (
            <div className="space-y-4">
              {/* Basic NaJia Card */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
                <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-1.5 border-b border-stone-100 pb-2 mb-3">
                  <Layers className="h-4 w-4 text-amber-700" />
                  一、本爻納甲干支與陰陽爻象
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                    <span className="text-stone-500 block text-[11px]">爻位與象徵</span>
                    <span className="font-serif font-bold text-stone-900 text-sm">
                      第 {line.index} 爻 · {line.name}
                    </span>
                    <span className="font-mono text-stone-700 block mt-0.5">
                      {line.symbolStr}（{line.yinYang === 1 ? "陽爻" : "陰爻"}）
                    </span>
                  </div>

                  <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                    <span className="text-stone-500 block text-[11px]">納甲天干地支</span>
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      {line.originalStem}{line.originalBranch}
                    </span>
                    <span
                      className={`inline-block rounded px-1.5 py-0.2 mt-0.5 text-[10px] font-bold ${
                        WUXING_COLORS[line.originalWuxing].text
                      } ${WUXING_COLORS[line.originalWuxing].bg} border ${
                        WUXING_COLORS[line.originalWuxing].border
                      }`}
                    >
                      五行屬 {line.originalWuxing}
                    </span>
                  </div>

                  <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                    <span className="text-stone-500 block text-[11px]">動靜態勢（餘數）</span>
                    <span className="font-bold text-stone-900 text-sm">
                      {line.remainder === 9
                        ? "老陽發動 (9 ◯)"
                        : line.remainder === 6
                        ? "老陰發動 (6 ✕)"
                        : line.remainder === 7
                        ? "少陽安靜 (7)"
                        : "少陰安靜 (8)"}
                    </span>
                    <span className="text-stone-600 block mt-0.5 text-[11px]">
                      {line.isMoving ? "【動爻】發動變爻" : "【靜爻】安靜不變"}
                    </span>
                  </div>

                  <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                    <span className="text-stone-500 block text-[11px]">世應與用神身份</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {line.isShi && (
                        <span className="rounded bg-rose-700 px-1.5 py-0.2 text-[11px] font-bold text-white">
                          世爻（求占自身）
                        </span>
                      )}
                      {line.isYing && (
                        <span className="rounded bg-stone-200 px-1.5 py-0.2 text-[11px] font-bold text-stone-700">
                          應爻（彼方環境）
                        </span>
                      )}
                      {!line.isShi && !line.isYing && (
                        <span className="text-stone-500">間爻（旁爻助事）</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Six Relatives Systematic Derivation */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
                <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-1.5 border-b border-stone-100 pb-2 mb-3">
                  <Award className="h-4 w-4 text-amber-700" />
                  二、八宮六親生剋由來邏輯推演
                </h4>
                <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
                  <p>
                    六爻六親之安立，乃依據漢代京房易納甲之法，以本卦所屬<strong>【{result.originalHexagram.palace}宮】（五行屬{result.originalHexagram.palaceWuxing}）</strong>為「我」之主體：
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 rounded-lg bg-amber-50/40 p-3 border border-amber-200">
                    <div>
                      <strong className="text-amber-950 block mb-1">六親定名萬象通則：</strong>
                      <ul className="space-y-1 text-stone-700 list-disc list-inside">
                        <li><strong>生我者為父母：</strong>如生【{result.originalHexagram.palaceWuxing}】者為父母</li>
                        <li><strong>我生者為子孫：</strong>【{result.originalHexagram.palaceWuxing}】所生者為子孫</li>
                        <li><strong>剋我者為官鬼：</strong>剋【{result.originalHexagram.palaceWuxing}】者為官鬼</li>
                        <li><strong>我剋者為妻財：</strong>【{result.originalHexagram.palaceWuxing}】所剋者為妻財</li>
                        <li><strong>同我者為兄弟：</strong>與【{result.originalHexagram.palaceWuxing}】同氣者為兄弟</li>
                      </ul>
                    </div>

                    <div className="flex flex-col justify-center rounded-md bg-white p-3 border border-amber-100">
                      <span className="text-stone-500 font-medium">本爻推算結果：</span>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-serif font-black text-amber-900 text-lg">
                          【{line.originalRelative}】
                        </span>
                        <span className="text-stone-600">
                          （本爻【{line.originalBranch}】屬【{line.originalWuxing}】）
                        </span>
                      </div>
                      <p className="mt-1.5 text-stone-600 text-[11px]">
                        因為本卦屬【{result.originalHexagram.palace}宮{result.originalHexagram.palaceWuxing}】，而本爻納甲為【{line.originalWuxing}】，兩者五行生剋推演即定為<strong>「{line.originalRelative}」</strong>。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Yao Position Spatial & Classical Yi Meaning */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
                <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-1.5 border-b border-stone-100 pb-2 mb-3">
                  <BookOpen className="h-4 w-4 text-amber-700" />
                  三、爻位時空象義與周易本義
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
                  <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                    <span className="text-stone-500 block text-[11px]">爻位尊卑象徵</span>
                    <strong className="text-stone-900 block">{posData.socialLevel}</strong>
                  </div>
                  <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                    <span className="text-stone-500 block text-[11px]">身體對應部位</span>
                    <strong className="text-stone-900 block">{posData.bodyPart}</strong>
                  </div>
                  <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                    <span className="text-stone-500 block text-[11px]">空間環境對應</span>
                    <strong className="text-stone-900 block">{posData.spatial}</strong>
                  </div>
                </div>

                <div className="rounded-lg bg-amber-50/50 p-3 border border-amber-200 text-xs">
                  <span className="font-serif font-bold text-amber-950 block mb-1">
                    《周易》本卦爻辭考證：
                  </span>
                  <p className="font-serif text-stone-800 text-sm leading-relaxed">
                    {line.yaoCi}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 神煞與六神考證 */}
          {activeTab === "shensha" && (
            <div className="space-y-4">
              {/* Six Spirit Detail */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
                <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-1.5 border-b border-stone-100 pb-2 mb-3">
                  <Sparkles className="h-4 w-4 text-amber-700" />
                  一、當值六神【{line.sixSpirit}】心性與易理考證
                </h4>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-xl bg-stone-50 p-4 border border-stone-200">
                  <div className={`rounded-xl border px-4 py-3 text-center ${SIX_SPIRIT_DATA[line.sixSpirit]?.color || "bg-stone-100 text-stone-800"}`}>
                    <span className="font-serif text-xl font-bold block">{line.sixSpirit}</span>
                    <span className="text-[11px] font-medium block mt-0.5">{SIX_SPIRIT_DATA[line.sixSpirit]?.desc}</span>
                  </div>

                  <div className="space-y-1.5 text-xs flex-1">
                    <div>
                      <strong className="text-stone-900">起六神排法依據：</strong>
                      <span className="text-stone-700 ml-1">
                        占卦日干為<strong>【{result.riGan}】</strong>，由初爻起算依序推排，本爻（第 {line.index} 爻）值<strong>【{line.sixSpirit}】</strong>。
                      </span>
                    </div>
                    <div>
                      <strong className="text-stone-900">六神斷事象意：</strong>
                      <p className="text-stone-700 mt-0.5 leading-relaxed">
                        {SIX_SPIRIT_DATA[line.sixSpirit]?.characteristics}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shen Sha Match Evaluation */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
                <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-1.5 border-b border-stone-100 pb-2 mb-3">
                  <Shield className="h-4 w-4 text-amber-700" />
                  二、日辰吉凶神煞配對檢驗（本爻地支：【{line.originalBranch}】）
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  {matchedShenShaList.map((shenSha, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl border p-3.5 transition ${
                        shenSha.isMatch
                          ? "border-amber-300 bg-amber-50/70 shadow-2xs ring-1 ring-amber-400"
                          : "border-stone-200 bg-white opacity-85"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-serif font-bold text-stone-900 text-sm">
                            {shenSha.name}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            （{shenSha.tag}）
                          </span>
                        </div>
                        {shenSha.isMatch ? (
                          <span className="flex items-center gap-1 rounded bg-amber-700 px-2 py-0.5 text-[11px] font-bold text-white shadow-2xs">
                            <CheckCircle2 className="h-3 w-3" /> 本爻臨值
                          </span>
                        ) : (
                          <span className="text-[11px] text-stone-400 font-medium">
                            未臨此爻
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 block mb-1">
                        查法：{shenSha.source}
                      </span>
                      <p className="text-stone-700 leading-relaxed">
                        {shenSha.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 伏神查尋與出伏判定 */}
          {activeTab === "fushen" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
                <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-1.5 border-b border-stone-100 pb-2 mb-3">
                  <Compass className="h-4 w-4 text-amber-700" />
                  一、伏神尋根與飛伏納甲比對
                </h4>

                {fushen ? (
                  <div className="space-y-3 text-xs">
                    <p className="text-stone-700">
                      六爻占卦中，若所求六親未在本卦六爻中顯現（或欲探究事態底層潛伏因素），須至本宮八純卦<strong>《{fushen.pureHexagramName}》</strong>查尋同爻位之六親：
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Feishen */}
                      <div className="rounded-lg bg-stone-50 p-3 border border-stone-200">
                        <span className="text-stone-500 block text-[11px] font-medium">
                          【飛神】（本卦第 {line.index} 爻）
                        </span>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-serif font-bold text-stone-900 text-base">
                            {line.originalRelative}
                          </span>
                          <span className="font-mono text-stone-700">
                            {line.originalStem}{line.originalBranch}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                              WUXING_COLORS[line.originalWuxing].text
                            } ${WUXING_COLORS[line.originalWuxing].bg} border ${
                              WUXING_COLORS[line.originalWuxing].border
                            }`}
                          >
                            {line.originalWuxing}
                          </span>
                        </div>
                        <p className="mt-1 text-stone-500 text-[11px]">
                          顯現於外之現狀爻位，如地表覆蓋之物。
                        </p>
                      </div>

                      {/* Fushen */}
                      <div className="rounded-lg bg-amber-50/60 p-3 border border-amber-200">
                        <span className="text-amber-900 block text-[11px] font-medium">
                          【伏神】（取自本宮純卦《{fushen.pureHexagramName}》第 {line.index} 爻）
                        </span>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-serif font-bold text-amber-950 text-base">
                            {fushen.relative}
                          </span>
                          <span className="font-mono text-stone-800">
                            {fushen.stem}{fushen.branch}
                          </span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                              WUXING_COLORS[fushen.wuxing].text
                            } ${WUXING_COLORS[fushen.wuxing].bg} border ${
                              WUXING_COLORS[fushen.wuxing].border
                            }`}
                          >
                            {fushen.wuxing}
                          </span>
                          {fushen.isMissingInOriginal && (
                            <span className="rounded bg-rose-100 border border-rose-300 px-1 py-0.2 text-[10px] font-bold text-rose-800">
                              本卦全缺
                            </span>
                          )}
                          {isFushenYong && (
                            <span className="rounded bg-amber-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                              用神伏此
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-stone-600 text-[11px]">
                          隱伏於底層之潛在種子，待天時地利透出。
                        </p>
                      </div>
                    </div>

                    {/* Relation */}
                    <div className="rounded-lg bg-stone-100/70 p-3 border border-stone-200">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-stone-900">
                          飛伏生剋關係：【{fushen.relationWithFeishen}】
                        </span>
                      </div>
                      <p className="mt-1 text-stone-700 leading-relaxed">
                        {fushen.relationDesc}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-stone-500">無伏神資料。</p>
                )}
              </div>

              {/* Emergence / Out of Hidden State */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
                <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-1.5 border-b border-stone-100 pb-2 mb-3">
                  <Flame className="h-4 w-4 text-amber-700" />
                  二、伏神透出（出伏）易理深度判定
                </h4>

                <div className="space-y-3 text-xs">
                  <div
                    className={`rounded-xl border p-4 ${
                      fushen?.isEmerged
                        ? "border-emerald-300 bg-emerald-50/60"
                        : "border-amber-300 bg-amber-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span
                        className={`rounded-md px-2 py-0.5 font-bold ${
                          fushen?.isEmerged
                            ? "bg-emerald-700 text-white"
                            : "bg-amber-700 text-white"
                        }`}
                      >
                        {fushen?.isEmerged ? "★ 易於透出（得力可用）" : "▲ 伏藏難出（待時逢沖）"}
                      </span>
                    </div>
                    <p className="text-stone-800 leading-relaxed font-medium">
                      <strong>考證推斷：</strong>{fushen?.emergedReason}
                    </p>
                  </div>

                  <div className="rounded-lg bg-stone-50 p-3 border border-stone-200 space-y-1 text-stone-600 text-[11px]">
                    <strong className="text-stone-900 block text-xs mb-1">《增刪卜易》伏神有用五大原則：</strong>
                    <div>1. <strong>得日月生扶：</strong>伏神得月令或日辰生扶、比旺，為旺相有力。</div>
                    <div>2. <strong>得飛神相生：</strong>飛神生伏神，名為得長生，源源不絕。</div>
                    <div>3. <strong>伏剋飛名出暴：</strong>伏神有力剋制飛神，如破土拔筍。</div>
                    <div>4. <strong>飛神逢沖逢空：</strong>飛神逢旬空或日月沖動，遮蔽已除，伏神自出。</div>
                    <div>5. <strong>日辰臨值合出：</strong>遇伏神地支值日或逢六合之期，必然顯現應驗。</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 旺衰生剋推算鏈 */}
          {activeTab === "wangxiang" && (
            <div className="space-y-4">
              {/* Step 1: Month Branch */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
                  <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-1.5">
                    <Moon className="h-4 w-4 text-sky-700" />
                    第一步：月建提綱（司萬物之綱領 · 先天力量源泉）
                  </h4>
                  <span className="rounded bg-sky-100 text-sky-800 border border-sky-300 px-2 py-0.5 text-xs font-bold">
                    月令【{result.ganzhiMonth}】· 月支【{result.yueJian}{result.yueJianWuxing}】
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-stone-700">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                      <span className="text-stone-500 block text-[11px]">月建五行關係</span>
                      <strong className="text-stone-900 block mt-0.5">
                        本爻【{line.originalWuxing}】對比月建【{result.yueJianWuxing}】
                      </strong>
                    </div>
                    <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                      <span className="text-stone-500 block text-[11px]">旺衰定性評級</span>
                      <span className="font-bold text-amber-900 block mt-0.5">
                        【月令 {line.wangXiang}】
                      </span>
                    </div>
                    <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                      <span className="text-stone-500 block text-[11px]">月破檢驗（正沖）</span>
                      <span className={`font-bold block mt-0.5 ${line.isMonthPo ? "text-rose-700" : "text-emerald-700"}`}>
                        {line.isMonthPo ? "★ 逢月破（大凶之阻）" : "✓ 非月破（無破散）"}
                      </span>
                    </div>
                  </div>

                  <p className="rounded-lg bg-sky-50/50 p-3 border border-sky-100 leading-relaxed text-stone-800">
                    {line.wangXiangDescription}
                    {line.isMonthPo && (
                      <span className="block mt-1 text-rose-800 font-semibold">
                        {line.monthPoDescription}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Step 2: Day Branch */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
                  <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-1.5">
                    <Sun className="h-4 w-4 text-amber-600" />
                    第二步：日辰主事（操一日之生殺 · 當令機杼與暗動）
                  </h4>
                  <span className="rounded bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-xs font-bold">
                    日辰【{result.ganzhiDay}】· 日支【{result.riChen}{result.riChenWuxing}】
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-stone-700">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                      <span className="text-stone-500 block text-[11px]">日辰生剋定性</span>
                      <strong className="text-stone-900 block mt-0.5">
                        【{line.dayRelation}】
                      </strong>
                    </div>
                    <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                      <span className="text-stone-500 block text-[11px]">日辰相沖動靜</span>
                      <span className={`font-bold block mt-0.5 ${line.isDayChong ? "text-sky-700" : "text-stone-600"}`}>
                        {line.isDayChong ? `【${line.dayChongType}】` : "無相沖"}
                      </span>
                    </div>
                    <div className="rounded-lg bg-stone-50 p-2.5 border border-stone-200">
                      <span className="text-stone-500 block text-[11px]">旬空狀態</span>
                      <span className={`font-bold block mt-0.5 ${line.isXunKong ? "text-purple-700" : "text-emerald-700"}`}>
                        {line.isXunKong ? "★ 落入旬空" : "✓ 未落旬空"}
                      </span>
                    </div>
                  </div>

                  <p className="rounded-lg bg-amber-50/50 p-3 border border-amber-100 leading-relaxed text-stone-800">
                    {line.dayRelationDescription}
                    {line.isDayChong && line.dayChongDescription && (
                      <span className="block mt-1 text-sky-800 font-semibold">
                        {line.dayChongDescription}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Step 3: Movement & Transformation Dynamics (Only if moving) */}
              <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-2xs">
                <div className="flex items-center justify-between border-b border-stone-100 pb-2 mb-3">
                  <h4 className="font-serif text-sm font-bold text-amber-950 flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-rose-600" />
                    第三步：動變生剋態勢（事態最終歸宿與轉化）
                  </h4>
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-bold ${
                      line.isMoving
                        ? "bg-rose-100 text-rose-800 border border-rose-300"
                        : "bg-stone-100 text-stone-600 border border-stone-200"
                    }`}
                  >
                    {line.isMoving ? "【發動有變】" : "【安靜無動】"}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs text-stone-700">
                  {line.isMoving && line.dongBianDetail ? (
                    <div className="space-y-3">
                      <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3.5">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-serif font-bold text-stone-900 text-sm">
                            {line.dongBianDetail.title}
                          </span>
                          <span className="rounded bg-rose-700 text-white px-2 py-0.5 font-bold text-xs">
                            吉凶：【{line.dongBianDetail.auspiciousness}】
                          </span>
                        </div>
                        <p className="text-stone-800 leading-relaxed font-medium">
                          {line.dongBianDetail.detail}
                        </p>
                      </div>

                      {line.changedYaoCi && (
                        <div className="rounded-lg bg-stone-50 p-3 border border-stone-200 text-xs">
                          <span className="font-serif font-bold text-stone-900 block mb-1">
                            變卦《{result.changedHexagram?.name}》【{line.changedLineName}】爻辭：
                          </span>
                          <p className="font-serif text-stone-700">
                            {line.changedYaoCi}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="rounded-lg bg-stone-50 p-3 border border-stone-200 text-stone-600">
                      此爻為靜爻，未發動變化。事態順從常道，吉凶全憑月建、日辰生剋扶抑及卦中他爻發動生剋。
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-stone-200 bg-stone-50 px-4 sm:px-6 py-3">
          <div className="text-xs text-stone-500">
            提示：可使用鍵盤方向鍵 <kbd className="rounded border bg-white px-1 py-0.5 font-mono text-[10px]">←</kbd> <kbd className="rounded border bg-white px-1 py-0.5 font-mono text-[10px]">→</kbd> 切換爻位，按 <kbd className="rounded border bg-white px-1 py-0.5 font-mono text-[10px]">Esc</kbd> 關閉
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-stone-300 bg-white px-4 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 transition cursor-pointer shadow-2xs"
          >
            關閉視窗
          </button>
        </div>
      </div>
    </div>
  );
};
