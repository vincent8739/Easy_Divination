import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { DivinationForm } from "./components/DivinationForm";
import { HexagramBoard } from "./components/HexagramBoard";
import { LearningGuide } from "./components/LearningGuide";
import { DivinationResult, SixRelative, YaoRemainder, NumberGuaResult } from "./types/liuyao";
import { getGanzhiFromDate } from "./utils/calendar";
import { calculateLiuYaoDivination, calculateNumberGua } from "./utils/liuyaoEngine";
import confetti from "canvas-confetti";

export function App() {
  const [activeTab, setActiveTab] = useState<"paipan" | "guide">("paipan");
  const [divinationResult, setDivinationResult] = useState<DivinationResult | null>(null);

  // Initial demo calculation on first mount so user immediately sees a live working paipan
  useEffect(() => {
    if (!divinationResult) {
      const now = new Date();
      const ganzhi = getGanzhiFromDate(now);
      // Demo: 431 (上卦艮), 379 (下卦離), 847 (初爻動) -> 山火賁變艮為山
      const numGua = calculateNumberGua(431, 379, 847);
      const demoResult = calculateLiuYaoDivination(
        "求占居士",
        "問今年下半年事業升遷與財運發展？",
        numGua.remainders,
        ganzhi,
        "官鬼",
        numGua
      );
      setDivinationResult(demoResult);
    }
  }, []);

  const handleCalculate = (data: {
    querent: string;
    question: string;
    date: Date;
    remainders: YaoRemainder[];
    customYongShen?: SixRelative;
    numberGuaInfo?: NumberGuaResult;
  }) => {
    const ganzhi = getGanzhiFromDate(data.date);
    const result = calculateLiuYaoDivination(
      data.querent,
      data.question,
      data.remainders,
      ganzhi,
      data.customYongShen,
      data.numberGuaInfo
    );

    setDivinationResult(result);
    setActiveTab("paipan");

    // Subtle celebration feedback
    try {
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.85 },
        colors: ["#d97706", "#f59e0b", "#fbbf24", "#78716c"],
      });
    } catch {
      // ignore
    }
  };

  const handleYongShenChange = (newRelative: SixRelative) => {
    if (!divinationResult) return;
    const ganzhi = getGanzhiFromDate(divinationResult.date);
    const updated = calculateLiuYaoDivination(
      divinationResult.querent,
      divinationResult.question,
      divinationResult.remainders,
      ganzhi,
      newRelative,
      divinationResult.numberGuaInfo
    );
    setDivinationResult(updated);
  };

  return (
    <div className="min-h-screen text-stone-900 font-sans selection:bg-amber-500/20 selection:text-amber-900">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-3.5 py-6 sm:px-6 sm:py-8">
        {activeTab === "paipan" && (
          <div className="space-y-6 sm:space-y-8">
            {/* Input Form */}
            <DivinationForm
              onCalculate={handleCalculate}
              initialValues={
                divinationResult
                  ? {
                      querent: divinationResult.querent,
                      question: divinationResult.question,
                      date: divinationResult.date,
                      remainders: divinationResult.remainders,
                      numberNumbers: divinationResult.numberGuaInfo
                        ? [
                            divinationResult.numberGuaInfo.num1,
                            divinationResult.numberGuaInfo.num2,
                            divinationResult.numberGuaInfo.num3,
                          ]
                        : undefined,
                    }
                  : undefined
              }
            />

            {/* Hexagram Result Board */}
            {divinationResult && (
              <div id="hexagram-board-section">
                <HexagramBoard
                  result={divinationResult}
                  onYongShenChange={handleYongShenChange}
                />
              </div>
            )}
          </div>
        )}

        {activeTab === "guide" && <LearningGuide />}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-stone-200 bg-white/80 py-8 text-center text-xs text-stone-600 backdrop-blur shadow-xs">
        <p className="font-serif font-medium text-stone-800">六爻大衍筮法卜卦排盤系統 · 傳承京房納甲法、伏神推算、周易古經智慧</p>
        <p className="mt-1 text-stone-500">
          天地之數五十有五，大衍之數五十，其用四十有九
        </p>
      </footer>
    </div>
  );
}
export default App;
