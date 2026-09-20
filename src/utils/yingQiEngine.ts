import { Solar } from "lunar-javascript";
import {
  EarthlyBranch,
  HeavenlyStem,
  LiuYaoResult,
  SixRelative,
  Wuxing,
  YingQiKeyDay,
  YingQiKeyDayRule,
  YingQiRelatedLine,
  BranchTimingInfo,
} from "../types/liuyao";
import { BRANCH_CHONG, BRANCH_HE } from "./liuyaoEngine";
import { BRANCH_WUXING } from "./calendar";

// 五行相生
export const WUXING_SHENG: Record<Wuxing, Wuxing> = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木",
};

// 五行相剋
export const WUXING_KE: Record<Wuxing, Wuxing> = {
  木: "土",
  土: "水",
  水: "火",
  火: "金",
  金: "木",
};

// 六親五行反查（相對於本宮五行）
export const SIX_RELATIVE_WUXING_OFFSET: Record<SixRelative, number> = {
  兄弟: 0, // 同我
  子孫: 1, // 我生
  妻財: 2, // 我剋
  官鬼: 3, // 剋我
  父母: 4, // 生我
};

// 三合局定義
export const SAN_HE_CONFIGS: Array<{
  name: string;
  branches: [EarthlyBranch, EarthlyBranch, EarthlyBranch];
  wuxing: Wuxing;
}> = [
  { name: "申子辰三合水局", branches: ["申", "子", "辰"], wuxing: "水" },
  { name: "亥卯未三合木局", branches: ["亥", "卯", "未"], wuxing: "木" },
  { name: "寅午戌三合火局", branches: ["寅", "午", "戌"], wuxing: "火" },
  { name: "巳酉丑三合金局", branches: ["巳", "酉", "丑"], wuxing: "金" },
];

// 墓庫對應 (金墓在丑、木墓在未、水土墓在辰、火墓在戌)
export const TOMB_MAP: Record<Wuxing, EarthlyBranch> = {
  金: "丑",
  木: "未",
  水: "辰",
  土: "辰",
  火: "戌",
};

const ALL_BRANCHES: EarthlyBranch[] = [
  "子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"
];

const WEEKDAY_NAMES = ["日", "一", "二", "三", "四", "五", "六"];

interface BranchRuleMatch {
  priority: "core" | "secondary" | "reference";
  nature: "auspicious" | "warning" | "turning" | "steady";
  category: "yongshen" | "dongbian" | "kongpo" | "hechong" | "yuanshen";
  title: string;
  reason: string;
  rule: YingQiKeyDayRule;
  relatedLines: YingQiRelatedLine[];
}

/**
 * 核心算法：全面解析卦象中動爻、變爻、月建、日辰、旬空之生剋合沖狀態，
 * 建立 12 地支易理作用規則表。
 */
export const buildBranchRuleMap = (result: LiuYaoResult): Map<EarthlyBranch, BranchRuleMatch[]> => {
  const map = new Map<EarthlyBranch, BranchRuleMatch[]>();
  const addMatch = (branch: EarthlyBranch, match: BranchRuleMatch) => {
    const list = map.get(branch) || [];
    list.push(match);
    map.set(branch, list);
  };

  const yongShenCat = result.yongShenCategory;
  const yongShenLines = result.lines.filter((l) => l.originalRelative === yongShenCat);
  const movingLines = result.lines.filter((l) => l.isMoving);
  const xunKongRaw = result.xunKong || "";
  const voidBranches: EarthlyBranch[] = ALL_BRANCHES.filter((b) => xunKongRaw.includes(b));
  const yueJian = result.yueJian;
  const riChen = result.riChen;

  // 1. 用神推演（事之主體，最核心應期樞紐）
  if (yongShenLines.length > 0) {
    yongShenLines.forEach((yLine) => {
      const yBranch = yLine.originalBranch;
      const yWuxing = yLine.originalWuxing;
      const isMoving = yLine.isMoving;
      const isKong = yLine.isXunKong;
      const isPo = yLine.isMonthPo;
      const isAnDong = yLine.dayChongType === "暗動";

      // 1.1 用神逢值日
      addMatch(yBranch, {
        priority: "core",
        nature: "auspicious",
        category: "yongshen",
        title: `用神【${yLine.originalRelative}${yBranch}${yWuxing}】臨值專權`,
        reason: `用神逢值日當令，事神得位專權，為事態成熟大吉應驗之期。`,
        rule: {
          source: "《增刪卜易·應期總訣》",
          principle: "動而逢值、靜而逢值皆為正期",
          explanation: "凡用神逢值日，其氣最專、其力最純，定鼎事態結果。",
        },
        relatedLines: [
          {
            index: yLine.index,
            name: yLine.name,
            relative: yLine.originalRelative,
            branch: yBranch,
            role: isMoving ? "用神動爻" : "用神靜爻",
          },
        ],
      });

      // 1.2 用神逢沖日
      const chongBranch = BRANCH_CHONG[yBranch];
      if (!isMoving) {
        addMatch(chongBranch, {
          priority: "core",
          nature: "turning",
          category: "yongshen",
          title: `用神【${yBranch}】逢沖（暗動催發）`,
          reason: `用神安靜旺相，逢沖之日為「暗動」催發之期，事態急轉直下，神速應驗。`,
          rule: {
            source: "《增刪卜易·應期總訣》",
            principle: "靜而逢沖為應期",
            explanation: "旺相安靜之用神逢日沖，如靜水投石，暗中發力成事。",
          },
          relatedLines: [
            {
              index: yLine.index,
              name: yLine.name,
              relative: yLine.originalRelative,
              branch: yBranch,
              role: "用神逢沖暗動",
            },
          ],
        });
      }

      // 1.3 用神逢六合日
      const heBranch = BRANCH_HE[yBranch];
      addMatch(heBranch, {
        priority: isMoving || isPo ? "core" : "secondary",
        nature: "auspicious",
        category: isPo ? "kongpo" : "hechong",
        title: isPo
          ? `逢六合【${heBranch}】解用神月破`
          : isMoving
          ? `用神動爻逢合【${heBranch}】（動而逢合）`
          : `用神逢六合【${heBranch}】聚氣成吉`,
        reason: isPo
          ? `用神雖逢月建相沖（月破），但逢六合日合住用神，合能解破，化險為夷。`
          : isMoving
          ? `用神發動奔騰，逢六合之日合絆定性、事態圓滿收束。`
          : `用神逢六合日，得天地陰陽六合格局相抱，和順成祥。`,
        rule: {
          source: isPo ? "《卜筮正宗·月破章》" : "《增刪卜易·動變章》",
          principle: isPo ? "逢合解月破、反破為成" : "動而逢合為應期",
          explanation: isPo
            ? "月破之爻逢合之日為吉兆，解開破散之氣。"
            : "動爻急躁，遇合神收斂，事態遂得圓滿安定。",
        },
        relatedLines: [
          {
            index: yLine.index,
            name: yLine.name,
            relative: yLine.originalRelative,
            branch: yBranch,
            role: isPo ? "用神月破逢合" : "用神逢合",
          },
        ],
      });

      // 1.4 用神旬空（出空填實與沖空）
      if (isKong) {
        addMatch(yBranch, {
          priority: "core",
          nature: "turning",
          category: "kongpo",
          title: `用神【${yBranch}】出空填實`,
          reason: `用神當前落入旬空，待出旬填實之日，由虛返實，氣機大振，撥雲見日。`,
          rule: {
            source: "《增刪卜易·旬空章》",
            principle: "旬空者，出空填實之日應事",
            explanation: "空亡非永遠之空，待出旬值日，真氣復還，謀事遂通。",
          },
          relatedLines: [
            {
              index: yLine.index,
              name: yLine.name,
              relative: yLine.originalRelative,
              branch: yBranch,
              role: "用神出旬填實",
            },
          ],
        });

        addMatch(chongBranch, {
          priority: "secondary",
          nature: "turning",
          category: "kongpo",
          title: `逢沖【${chongBranch}】沖空填實`,
          reason: `用神落空，逢日辰相沖之日，沖空則動、震落空障，提早催發應事。`,
          rule: {
            source: "《卜筮正宗·旬空章》",
            principle: "旬空者，沖空亦能應事",
            explanation: "空爻受沖，如敲鐘發響，激起潛力發越成事。",
          },
          relatedLines: [
            {
              index: yLine.index,
              name: yLine.name,
              relative: yLine.originalRelative,
              branch: yBranch,
              role: "用神沖空拔起",
            },
          ],
        });
      }

      // 1.5 暗動逢值
      if (isAnDong) {
        addMatch(yBranch, {
          priority: "core",
          nature: "auspicious",
          category: "dongbian",
          title: `暗動用神【${yBranch}】臨值發作`,
          reason: `用神受日辰沖為暗動，暗動如同暗中籌謀，逢值之日全面公開顯化、迅猛成局。`,
          rule: {
            source: "《增刪卜易·暗動章》",
            principle: "暗動之爻逢值顯發",
            explanation: "暗動吉者暗中受福，逢值日大放光彩。",
          },
          relatedLines: [
            {
              index: yLine.index,
              name: yLine.name,
              relative: yLine.originalRelative,
              branch: yBranch,
              role: "用神暗動",
            },
          ],
        });
      }
    });
  } else {
    // 伏神查考：若用神不現於本卦，查看伏神
    const fuLines = result.lines.filter((l) => l.fushen && l.fushen.relative === yongShenCat);
    fuLines.forEach((fLine) => {
      const f = fLine.fushen!;
      const fuBranch = f.branch;
      const feiBranch = fLine.originalBranch;

      // 伏神值日透出
      addMatch(fuBranch, {
        priority: "core",
        nature: "turning",
        category: "yongshen",
        title: `伏神【${f.relative}${fuBranch}${f.wuxing}】透出值日`,
        reason: `用神伏藏，待伏神臨值之日破土而出，顯露端倪，事態展布！`,
        rule: {
          source: "《卜筮正宗·伏神章》",
          principle: "伏神透出之日為應期",
          explanation: "伏藏不見，遇臨值之日同氣相召，脫離飛神蔭蔽。",
        },
        relatedLines: [
          {
            index: fLine.index,
            name: fLine.name,
            relative: fLine.originalRelative,
            branch: feiBranch,
            role: "飛神壓伏",
          },
        ],
      });

      // 沖去飛神之日
      const feiChong = BRANCH_CHONG[feiBranch];
      addMatch(feiChong, {
        priority: "secondary",
        nature: "turning",
        category: "yongshen",
        title: `逢沖【${feiChong}】沖去飛神【${feiBranch}】`,
        reason: `飛神壓制伏神，逢沖破飛神之日，飛神破散無依，伏神得以破關而出成吉。`,
        rule: {
          source: "《黃金策》",
          principle: "沖飛露伏為應期",
          explanation: "飛神受沖散失，伏神無阻自現前。",
        },
        relatedLines: [
          {
            index: fLine.index,
            name: fLine.name,
            relative: fLine.originalRelative,
            branch: feiBranch,
            role: "飛神受沖破",
          },
        ],
      });
    });
  }

  // 2. 動爻與變爻生剋合沖推算（動態演變樞紐）
  movingLines.forEach((mLine) => {
    const origBranch = mLine.originalBranch;
    const origWuxing = mLine.originalWuxing;
    const changedBranch = mLine.changedBranch || origBranch;
    const changedWuxing = mLine.changedWuxing || origWuxing;
    const db = mLine.dongBianDetail;

    // 2.1 動爻逢值日
    addMatch(origBranch, {
      priority: mLine.originalRelative === yongShenCat ? "core" : "secondary",
      nature: "steady",
      category: "dongbian",
      title: `動爻【${mLine.name}·${origBranch}${origWuxing}】逢值成事`,
      reason: `第${mLine.index}爻發動，待發動之爻逢值當日，動氣貫徹，事務推動定局。`,
      rule: {
        source: "《增刪卜易·應期總訣》",
        principle: "動而逢值為應期",
        explanation: "動爻值日，其志得舒，所發之事至此大白。",
      },
      relatedLines: [
        {
          index: mLine.index,
          name: mLine.name,
          relative: mLine.originalRelative,
          branch: origBranch,
          role: "動爻臨值",
        },
      ],
    });

    // 2.2 動爻逢六合日
    const origHe = BRANCH_HE[origBranch];
    addMatch(origHe, {
      priority: "secondary",
      nature: "steady",
      category: "dongbian",
      title: `動爻【${origBranch}】逢合【${origHe}】羈絆收束`,
      reason: `動爻發動奔騰，逢六合日得合神相羈，吉事成定局，凶事受牽絆消解。`,
      rule: {
        source: "《增刪卜易》",
        principle: "動而逢合為應期",
        explanation: "動逢合絆，氣聚局成。",
      },
      relatedLines: [
        {
          index: mLine.index,
          name: mLine.name,
          relative: mLine.originalRelative,
          branch: origBranch,
          role: "動爻逢合",
        },
      ],
    });

    // 2.3 動變具體型態深入推演
    if (db) {
      if (db.type === "回頭生") {
        addMatch(changedBranch, {
          priority: "core",
          nature: "auspicious",
          category: "dongbian",
          title: `變爻【${changedBranch}${changedWuxing}】回頭生發越旺相`,
          reason: `動爻化出變爻【${changedBranch}】回頭生動爻，逢變爻生旺值日，源頭水發、福力倍增、大吉大順！`,
          rule: {
            source: "《卜筮正宗·動變生剋》",
            principle: "化回頭生，待變爻旺相逢值之日吉慶發作",
            explanation: "生我者為恩神，恩神值日得勢，諸事百順皆遂。",
          },
          relatedLines: [
            {
              index: mLine.index,
              name: mLine.name,
              relative: mLine.originalRelative,
              branch: origBranch,
              role: "動爻回頭生",
            },
          ],
        });
      } else if (db.type === "回頭剋") {
        addMatch(changedBranch, {
          priority: "core",
          nature: "warning",
          category: "dongbian",
          title: `變爻【${changedBranch}${changedWuxing}】回頭剋反噬（宜避凶）`,
          reason: `動爻化出變爻【${changedBranch}】回頭剋動爻，此日變爻剋神猖獗，防損折失利、是非破耗。`,
          rule: {
            source: "《增刪卜易·回頭剋章》",
            principle: "化回頭剋，逢變爻值日凶災發作，逢合剋神之日解救",
            explanation: "自作自受反噬己身，需防剋神值日衝擊。",
          },
          relatedLines: [
            {
              index: mLine.index,
              name: mLine.name,
              relative: mLine.originalRelative,
              branch: origBranch,
              role: "動爻受回頭剋",
            },
          ],
        });

        // 解救之期：六合剋神之日
        const keHe = BRANCH_HE[changedBranch];
        addMatch(keHe, {
          priority: "secondary",
          nature: "auspicious",
          category: "dongbian",
          title: `逢合【${keHe}】合住剋神【${changedBranch}】解圍`,
          reason: `變爻回頭剋動爻，逢六合合住剋神之日，剋神受貪合忘剋，危機化解！`,
          rule: {
            source: "《黃金策》",
            principle: "逢合貪合忘剋，災凶消散",
            explanation: "凶神受合無暇為禍，轉危為安。",
          },
          relatedLines: [
            {
              index: mLine.index,
              name: mLine.name,
              relative: mLine.originalRelative,
              branch: origBranch,
              role: "合住剋神",
            },
          ],
        });
      } else if (db.type === "化進神") {
        addMatch(changedBranch, {
          priority: "core",
          nature: "auspicious",
          category: "dongbian",
          title: `化進神【${changedBranch}】乘風破浪步步高升`,
          reason: `動爻化進神，逢化進地支【${changedBranch}】值日，氣勢如虹，高升進益之大吉期！`,
          rule: {
            source: "《增刪卜易·進退神章》",
            principle: "化進神者，逢化進之日大發其力",
            explanation: "進神日步步為營，勢不可擋，事必猛進。",
          },
          relatedLines: [
            {
              index: mLine.index,
              name: mLine.name,
              relative: mLine.originalRelative,
              branch: origBranch,
              role: "化進神當令",
            },
          ],
        });
      } else if (db.type === "化退神") {
        addMatch(changedBranch, {
          priority: "secondary",
          nature: "steady",
          category: "dongbian",
          title: `化退神【${changedBranch}】勢緩宜守`,
          reason: `動爻化退神，逢退神值日，氣機漸衰，行事宜退守蓄力，不宜冒進強求。`,
          rule: {
            source: "《增刪卜易·進退神章》",
            principle: "化退神者，逢退日事勢日消",
            explanation: "退神日宜安分守常，順其自然。",
          },
          relatedLines: [
            {
              index: mLine.index,
              name: mLine.name,
              relative: mLine.originalRelative,
              branch: origBranch,
              role: "化退神漸退",
            },
          ],
        });
      } else if (db.type === "化墓") {
        // 沖墓開庫之日
        const tombChong = BRANCH_CHONG[changedBranch];
        addMatch(tombChong, {
          priority: "core",
          nature: "turning",
          category: "dongbian",
          title: `逢沖【${tombChong}】沖開墓庫【${changedBranch}】脫困`,
          reason: `動爻化入墓庫受困受蒙，逢沖開墓庫之日（沖開墓門），頓開枷鎖，脫穎而出！`,
          rule: {
            source: "《卜筮正宗·隨鬼入墓章》",
            principle: "入墓者，逢沖墓之日開庫釋出",
            explanation: "墓庫逢沖如開鎖啟門，伏藏被困之氣得以舒展。",
          },
          relatedLines: [
            {
              index: mLine.index,
              name: mLine.name,
              relative: mLine.originalRelative,
              branch: origBranch,
              role: "動爻化墓待沖開",
            },
          ],
        });
      }
    }
  });

  // 3. 月建與日辰生剋合沖狀態（天時樞紐）
  // 3.1 月破爻逢合解破
  result.lines.forEach((line) => {
    if (line.isMonthPo) {
      const pBranch = line.originalBranch;
      const heP = BRANCH_HE[pBranch];
      addMatch(heP, {
        priority: "core",
        nature: "turning",
        category: "kongpo",
        title: `逢六合【${heP}】解第${line.index}爻月破【${pBranch}】`,
        reason: `第${line.index}爻逢月破大凶，逢六合日合住破爻，反破為生，化解危機！`,
        rule: {
          source: "《增刪卜易·月破章》",
          principle: "月破之爻逢合之日可成事",
          explanation: "月破雖如枯木，得六合相抱扶持，亦能枯木逢春。",
        },
        relatedLines: [
          {
            index: line.index,
            name: line.name,
            relative: line.originalRelative,
            branch: pBranch,
            role: "月破逢合解困",
          },
        ],
      });

      // 填實之日
      addMatch(pBranch, {
        priority: "secondary",
        nature: "turning",
        category: "kongpo",
        title: `月破爻【${pBranch}】逢值填實`,
        reason: `出月交節之後，月破之爻逢自身地支臨值填實，破象消融。`,
        rule: {
          source: "《卜筮正宗》",
          principle: "月破者出月填實逢合應",
          explanation: "脫離本月月令之殺氣，逢值日重新得氣。",
        },
        relatedLines: [
          {
            index: line.index,
            name: line.name,
            relative: line.originalRelative,
            branch: pBranch,
            role: "月破出月填實",
          },
        ],
      });
    }

    // 3.2 暗動之爻
    if (line.dayChongType === "暗動" && line.originalRelative !== yongShenCat) {
      addMatch(line.originalBranch, {
        priority: "secondary",
        nature: "auspicious",
        category: "dongbian",
        title: `暗動爻【${line.name}·${line.originalBranch}】臨值發用`,
        reason: `此爻得日辰沖為暗動，逢自身地支值日，隱密助力明朗化。`,
        rule: {
          source: "《增刪卜易·暗動章》",
          principle: "暗動之爻逢值發越",
          explanation: "暗中推動之事，逢值日公諸於世。",
        },
        relatedLines: [
          {
            index: line.index,
            name: line.name,
            relative: line.originalRelative,
            branch: line.originalBranch,
            role: "暗動爻",
          },
        ],
      });
    }

    // 3.3 日辰合絆之爻待沖開
    if (BRANCH_HE[riChen] === line.originalBranch) {
      const chongB = BRANCH_CHONG[line.originalBranch];
      addMatch(chongB, {
        priority: "secondary",
        nature: "turning",
        category: "hechong",
        title: `逢沖【${chongB}】沖開第${line.index}爻日辰合絆`,
        reason: `第${line.index}爻受當日起卦日辰【${riChen}】合絆住不能動彈，逢沖之日沖開鎖鏈，始得行動。`,
        rule: {
          source: "《增刪卜易·合絆章》",
          principle: "合處逢沖為應期",
          explanation: "爻受合絆如捆縛，必待逢沖日沖解其絆。",
        },
        relatedLines: [
          {
            index: line.index,
            name: line.name,
            relative: line.originalRelative,
            branch: line.originalBranch,
            role: "受日合絆待沖",
          },
        ],
      });
    }
  });

  // 4. 旬空通查（出旬與沖空）
  voidBranches.forEach((vBranch) => {
    // 檢查是否有爻落空
    const kongLines = result.lines.filter((l) => l.originalBranch === vBranch);
    if (kongLines.length > 0) {
      const kNames = kongLines.map((k) => `${k.name}(${k.originalRelative})`).join("、");
      // 出空填實
      addMatch(vBranch, {
        priority: kongLines.some((k) => k.originalRelative === yongShenCat || k.isMoving || k.isShi)
          ? "core"
          : "secondary",
        nature: "turning",
        category: "kongpo",
        title: `落空爻【${kNames}】出空填實`,
        reason: `當前值旬空之爻【${vBranch}】，待出旬填實之日，空亡變實，成事有期。`,
        rule: {
          source: "《增刪卜易·旬空章》",
          principle: "旬空者出空之日應事",
          explanation: "旬內之空非真無，出旬即得其用。",
        },
        relatedLines: kongLines.map((k) => ({
          index: k.index,
          name: k.name,
          relative: k.originalRelative,
          branch: vBranch,
          role: "旬空填實",
        })),
      });

      // 沖空之日
      const chongV = BRANCH_CHONG[vBranch];
      addMatch(chongV, {
        priority: "secondary",
        nature: "turning",
        category: "kongpo",
        title: `逢沖【${chongV}】沖起旬空爻【${vBranch}】`,
        reason: `旬空之爻逢相沖之日，暗中拔空動發，催成其事。`,
        rule: {
          source: "《卜筮正宗·旬空章》",
          principle: "沖空則起，激發潛能",
          explanation: "空爻遭沖，如睡獅乍醒，激發事變。",
        },
        relatedLines: kongLines.map((k) => ({
          index: k.index,
          name: k.name,
          relative: k.originalRelative,
          branch: vBranch,
          role: "沖空拔起",
        })),
      });
    }
  });

  // 5. 三合局補齊與中神推算
  const allHexBranches = result.lines.map((l) => l.originalBranch);
  SAN_HE_CONFIGS.forEach((cfg) => {
    const matched = cfg.branches.filter(
      (b) => allHexBranches.includes(b) || b === riChen || b === yueJian
    );
    if (matched.length === 2) {
      // 缺一字成局（半合局待補神）
      const missing = cfg.branches.find((b) => !matched.includes(b));
      if (missing) {
        addMatch(missing, {
          priority: "core",
          nature: "auspicious",
          category: "hechong",
          title: `補足【${missing}】成${cfg.name}`,
          reason: `卦中已有【${matched.join("、")}】半合${cfg.wuxing}局，逢【${missing}】日三足鼎立成局，聚萬眾之力，合氣大成！`,
          rule: {
            source: "《卜筮正宗·三合章》",
            principle: "虛一待用，逢缺神補齊之日應局",
            explanation: "三合局缺一字如鼎之缺足，補神值日則大局圓滿成就。",
          },
          relatedLines: result.lines
            .filter((l) => matched.includes(l.originalBranch))
            .map((l) => ({
              index: l.index,
              name: l.name,
              relative: l.originalRelative,
              branch: l.originalBranch,
              role: `參與${cfg.name}`,
            })),
        });
      }
    }
  });

  return map;
};

/**
 * 依據占卦基準日，推算未來 N 天（預設 30 天）之「應期關鍵日子」完整列表
 */
export const calculateUpcomingYingQiKeyDays = (
  result: LiuYaoResult,
  daysToScan: number = 30
): { keyDays: YingQiKeyDay[]; branchMatrix: BranchTimingInfo[]; executiveSummary: string } => {
  const branchRuleMap = buildBranchRuleMap(result);
  const baseDate = new Date(result.date);

  const keyDays: YingQiKeyDay[] = [];
  const branchNextSeenMap = new Map<
    EarthlyBranch,
    { dateStr: string; ganzhiDay: string; daysAway: number }
  >();

  for (let offset = 0; offset <= daysToScan; offset++) {
    const curDate = new Date(baseDate.getTime() + offset * 86400000);
    const solar = Solar.fromYmdHms(
      curDate.getFullYear(),
      curDate.getMonth() + 1,
      curDate.getDate(),
      12,
      0,
      0
    );
    const lunar = solar.getLunar();

    const ganzhiDay = lunar.getDayInGanZhiExact() || lunar.getDayInGanZhi();
    const stem = ganzhiDay.charAt(0) as HeavenlyStem;
    const branch = ganzhiDay.charAt(1) as EarthlyBranch;
    const wuxing = BRANCH_WUXING[branch] || "土";

    const solarDateStr = `${curDate.getFullYear()}年${String(curDate.getMonth() + 1).padStart(
      2,
      "0"
    )}月${String(curDate.getDate()).padStart(2, "0")}日 (${WEEKDAY_NAMES[curDate.getDay()]})`;
    const lunarDateStr = `${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;

    // Record next occurrence for 12-branch matrix
    if (!branchNextSeenMap.has(branch)) {
      branchNextSeenMap.set(branch, {
        dateStr: solarDateStr,
        ganzhiDay,
        daysAway: offset,
      });
    }

    const matches = branchRuleMap.get(branch);
    if (matches && matches.length > 0) {
      // 合併多重作用，計算最高優先級與綜合性質
      let highestPriority: "core" | "secondary" | "reference" = "reference";
      if (matches.some((m) => m.priority === "core")) {
        highestPriority = "core";
      } else if (matches.some((m) => m.priority === "secondary")) {
        highestPriority = "secondary";
      }

      // 性質優先級：warning (防阻) > turning (轉折) > auspicious (大吉) > steady (平順)
      let overallNature: "auspicious" | "warning" | "turning" | "steady" = "steady";
      if (matches.some((m) => m.nature === "warning")) {
        overallNature = "warning";
      } else if (matches.some((m) => m.nature === "turning")) {
        overallNature = "turning";
      } else if (matches.some((m) => m.nature === "auspicious")) {
        overallNature = "auspicious";
      }

      // 類別標籤（優先以用神或動變為主）
      const primeMatch =
        matches.find((m) => m.category === "yongshen") ||
        matches.find((m) => m.category === "dongbian") ||
        matches.find((m) => m.category === "kongpo") ||
        matches[0];

      const priorityLabel =
        highestPriority === "core"
          ? "最關鍵核心日"
          : highestPriority === "secondary"
          ? "重要應期日"
          : "輔助參考日";

      const natureLabel =
        overallNature === "auspicious"
          ? "大吉發越"
          : overallNature === "warning"
          ? "防阻避凶"
          : overallNature === "turning"
          ? "轉折變革"
          : "平順相循";

      const categoryLabelMap = {
        yongshen: "用神應期",
        dongbian: "動變生剋",
        kongpo: "空破解圍",
        hechong: "合沖開閉",
        yuanshen: "原神救助",
      };

      // 綜合所有條款理由
      const allReasons = matches.map((m) => `• ${m.title}：${m.reason}`).join("\n");
      const rules = matches.map((m) => m.rule);
      const relatedLinesMap = new Map<number, YingQiRelatedLine>();
      matches.forEach((m) => {
        m.relatedLines.forEach((rl) => {
          if (!relatedLinesMap.has(rl.index)) {
            relatedLinesMap.set(rl.index, rl);
          }
        });
      });

      const primeTitle =
        matches.length > 1
          ? `【${ganzhiDay}日】${matches[0].title}（兼逢${matches.length}重易理作用）`
          : `【${ganzhiDay}日】${matches[0].title}`;

      keyDays.push({
        id: `yingqi-day-${offset}-${ganzhiDay}`,
        date: curDate,
        solarDateStr,
        lunarDateStr,
        ganzhiDay,
        stem,
        branch,
        wuxing,
        daysAway: offset,
        priority: highestPriority,
        priorityLabel,
        nature: overallNature,
        natureLabel,
        category: primeMatch.category,
        categoryLabel: categoryLabelMap[primeMatch.category] || "易理應期",
        title: primeTitle,
        summaryReason: allReasons,
        rules,
        relatedLines: Array.from(relatedLinesMap.values()).sort((a, b) => a.index - b.index),
      });
    }
  }

  // 排序：按天數前後自然排列（已自然遞增）
  // 建立十二地支全盤易理時空對照表
  const branchMatrix: BranchTimingInfo[] = ALL_BRANCHES.map((b) => {
    const matches = branchRuleMap.get(b) || [];
    const nextSeen = branchNextSeenMap.get(b);
    const isKey = matches.length > 0;
    const wuxing = BRANCH_WUXING[b] || "土";

    let priority: "core" | "secondary" | "reference" | "normal" = "normal";
    if (matches.some((m) => m.priority === "core")) priority = "core";
    else if (matches.some((m) => m.priority === "secondary")) priority = "secondary";
    else if (matches.some((m) => m.priority === "reference")) priority = "reference";

    const roles = matches.map((m) => m.title);
    if (b === result.yueJian) roles.unshift("當令月建");
    if (b === result.riChen) roles.unshift("當值日辰");

    const effectSummary =
      matches.length > 0
        ? matches.map((m) => m.title).join("；")
        : `常規平淡地支，非本卦首要牽引動力。`;

    return {
      branch: b,
      wuxing,
      roles: Array.from(new Set(roles)),
      isKey,
      priority,
      nextDateStr: nextSeen?.dateStr,
      nextGanzhiDay: nextSeen?.ganzhiDay,
      nextDaysAway: nextSeen?.daysAway,
      effectSummary,
    };
  });

  // 綜合總結斷語 (Executive Summary)
  const coreDays = keyDays.filter((k) => k.priority === "core" && k.daysAway > 0);
  const earliestCore = coreDays[0] || keyDays.find((k) => k.daysAway > 0) || keyDays[0];

  let executiveSummary = "";
  if (earliestCore) {
    executiveSummary = `推演核心應期首定於【${earliestCore.solarDateStr}】（${earliestCore.ganzhiDay}日，起卦後第 ${earliestCore.daysAway} 天）。此日${earliestCore.title}，依${earliestCore.rules[0]?.source || "《增刪卜易》"}「${earliestCore.rules[0]?.principle || "逢值逢沖成事"}」之訓，為氣數交匯激發、吉凶底定之第一關鍵節點！`;
  } else {
    executiveSummary = `卦象氣場平穩固守，諸爻少有激烈衝激，事態漸進徐行，專以月令提綱與用神生旺之期應事。`;
  }

  return {
    keyDays,
    branchMatrix,
    executiveSummary,
  };
};
