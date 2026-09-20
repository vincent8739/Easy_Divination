import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Hexagram AI Deep Interpretation Endpoint
app.post("/api/gemini/interpret", async (req, res) => {
  try {
    const {
      divinationResult,
      userQuestion,
      previousInterpretation,
      querent,
      question,
      dateTimeStr,
      ganzhiStr,
      xunKongStr,
      originalGuaName,
      changedGuaName,
      palaceInfo,
      movingYaoDescriptions,
      fushenAnalysis,
      yongShen,
      customNote,
    } = req.body;

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY 未設定，無法啟用 AI 深度解卦。請在設定中配置 API 密鑰。",
      });
    }

    let prompt = "";

    if (userQuestion && previousInterpretation) {
      // Follow-up conversation
      prompt = `你是一位精通《易經》、《卜筮正宗》、《增刪卜易》與六爻大衍筮法的當代易學宗師。
求占者針對剛才的解卦提出了進一步的追問，請依據卦象納甲、動變生剋（回頭生/剋、化進/退）、月破、日沖暗動與用神旺衰，為求占者提供切合易理且具啟發性的解答。

【前次解卦分析摘要】：
${previousInterpretation}

【求占者追問】：
「${userQuestion}」

請針對求占者的追問，結合本卦、之卦、用神及動爻變化，給出清晰、條理分明、直指核心的易理解析。`;
    } else if (divinationResult) {
      // Full structured divination result from client
      const r = divinationResult;
      const linesAnalysis = r.lines
        .map(
          (l: any) =>
            `第${l.index}爻（${l.name}）：六神[${l.sixSpirit}] · 本卦[${l.originalRelative} ${l.originalStem}${l.originalBranch}${l.originalWuxing}] ${
              l.isShi ? "【世爻】" : l.isYing ? "【應爻】" : ""
            } ${l.originalRelative === r.yongShenCategory ? "【用神】" : ""} · 月旺衰[${l.wangXiang}] ${
              l.isMonthPo ? "【月破】" : ""
            } · 日辰關係[${l.dayRelation || ""}] ${l.dayChongType ? "【" + l.dayChongType + "】" : ""} ${
              l.isMoving
                ? `-> 變爻[${l.changedRelative} ${l.changedBranch}${l.changedWuxing}] · 動變動態[${
                    l.dongBianDetail ? l.dongBianDetail.title + "：" + l.dongBianDetail.summary + "（" + l.dongBianDetail.auspiciousness + "）" : l.changeDynamics || ""
                  }]`
                : "（靜爻）"
            }\n    伏神考證：${
              l.fushen
                ? `伏神[${l.fushen.relative} ${l.fushen.branch}${l.fushen.wuxing}] · 飛伏關係[${l.fushen.relationWithFeishen}：${l.fushen.relationDesc}] · 出伏判斷[${l.fushen.isEmerged ? "可透出有用" : "伏藏難出"}：${l.fushen.emergedReason}]`
                : "無"
            }`
        )
        .join("\n");

      const movingDetails = r.lines
        .filter((l: any) => l.isMoving && l.dongBianDetail)
        .map((l: any) => `第${l.index}爻（${l.name}）：【${l.dongBianDetail.title}】${l.dongBianDetail.summary}（${l.dongBianDetail.auspiciousness}）- ${l.dongBianDetail.detail}`)
        .join("\n");

      prompt = `你是一位精通《易經》、《卜筮正宗》、《增刪卜易》、《易隱》與大衍筮法六爻預測學的國學大師與易學專家。
請根據以下詳盡嚴謹的六爻大衍筮法排盤數據，為求占者提供兼具傳統易理深度、邏輯縝密且富有人生啟發的深度斷卦分析。

【求占資訊】
- 求占者：${r.querent}
- 占問事由：${r.question}
- 起卦時間：${r.dateTimeStr}（節氣：${r.solarTermStr}）
- 四柱干支：${r.ganzhiYear}年 ${r.ganzhiMonth}月 ${r.ganzhiDay}日 ${r.ganzhiHour}時
- 綱領主宰：月建【${r.yueJian}】${r.yueJianWuxing} · 日辰【${r.riChen}】${r.riChenWuxing} · 旬空【${r.xunKong}】
- 神煞：貴人[${r.dayGuiRen}] 驛馬[${r.yiMa}] 祿[${r.dayLu}] 桃花[${r.taoHua}]
- 本卦：《${r.originalHexagram.name}》（${r.originalHexagram.palace}宮${r.originalHexagram.palaceWuxing} · ${r.originalHexagram.palaceTypeName} · 世${r.originalHexagram.shiYao} 應${r.originalHexagram.yingYao}）${r.sixHeSixChong ? " · 特殊：" + r.sixHeSixChong : ""}
- 之卦（變卦）：${r.hasMovingYao && r.changedHexagram ? `《${r.changedHexagram.name}》（${r.movingCount}爻發動）` : "六爻皆靜 · 無變卦"}
- 指定用神：【${r.yongShenCategory}】
- 缺伏六親：${r.missingRelatives.length > 0 ? `缺【${r.missingRelatives.join("、")}】，伏於《${r.lines[0]?.fushen?.pureHexagramName}》` : "五行六親齊全"}

【六爻納甲排盤全覽】
${linesAnalysis}

【動變生剋（回頭生/剋、化進/退）詳情】
${movingDetails || "六爻皆靜，無動爻發動。專依本卦世應關係與用神在月建、日辰之生剋旺衰定吉凶。"}

請按照以下專業結構進行深入剖析：

一、【卦意總論與時空機運】
- 解構本卦與變卦之卦象、卦辭意涵，分析月建【${r.yueJian}】${r.yueJianWuxing}與日辰【${r.riChen}】${r.riChenWuxing}對全卦五行氣數的提綱主導。

二、【用神旺衰與飛伏推演】
- 研判用神【${r.yongShenCategory}】在月令下的旺相休囚死狀態，是否逢月破、旬空、日生、日剋、日合、暗動或日破。
- 若用神為伏神，詳述伏神與飛神的生剋關係（伏生飛、飛生伏、伏剋飛、飛剋伏、比和），以及出伏條件與時機。

三、【動變生剋與應期預判】
- 深入剖析動爻之變化：化回頭生、化回頭剋、化進神、化退神、化絕、化墓、化空之吉凶成敗。
- 研判世爻（求占者）與應爻（對方/事態）之相互承應與六親互動。
- 根據爻象推估事態發展的吉凶轉機與關鍵「應期」（何月、何日、何干支值日逢合逢沖）。

四、【易道指引與處事方略】
- 秉持「善易者不卜」、「君子居則觀其象而玩其辭，動則觀其變而玩其占」之易德。
- 給出具體、可行、充滿智慧修為的處事建議。

文風要求：傳統易學術語與現代通俗說明相結合，言之有物，邏輯縝密，客觀端正，條理清晰。`;
    } else {
      // Fallback simple payload
      prompt = `你是一位精通《易經》與大衍筮法六爻預測學的國學大師。
求占者：${querent || "未具名"}，占問事由：${question || "綜合運勢"}。
本卦：${originalGuaName || "易卦"}，之卦：${changedGuaName || "無"}。
請為求占者提供嚴謹客觀的易理深度分析與處事建議。`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        systemInstruction: "你是一位精研京房納甲、六爻神課與大衍筮法的當代易學宗師，精通干支五行生剋制化、飛伏神斷法、動變生剋（回頭生剋、化進退）與易理哲學。",
        temperature: 0.7,
      },
    });

    res.json({
      success: true,
      interpretation: response.text || "未能生成解卦分析，請稍後重試。",
    });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({
      error: error.message || "解卦生成過程中發生錯誤",
    });
  }
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Liu Yao Da Yan Divination Server running on port ${PORT}`);
  });
}

startServer();
