import {
  EarthlyBranch,
  FushenInfo,
  HeavenlyStem,
  HexagramData,
  PalaceName,
  SixRelative,
  SixSpirit,
  Wuxing,
  YaoLineDetail,
  YaoRemainder,
  DivinationResult,
  LiuYaoResult,
  NumberGuaResult,
  WangXiangLevel,
  DongBianDetail,
  LiuYaoLayeredAnalysis,
  Layer1ShiAnalysis,
  Layer2YingAnalysis,
  Layer3YongShenAnalysis,
  Layer4YuanShenAnalysis,
  Layer5JiShenAnalysis,
  Layer6FuShenAnalysis,
  Layer7FeiShenAnalysis,
  Layer8YueJianAnalysis,
  Layer9RiChenAnalysis,
  Layer10DongYaoAnalysis,
  Layer11BianYaoAnalysis,
  Layer12HeChongXingHaiAnalysis,
  Layer13XunKongAnalysis,
  Layer14YingQiAnalysis,
} from "../types/liuyao";
import { findHexagramByBinary, getPureHexagramOfPalace, HEXAGRAMS_DATA, TRIGRAMS } from "../data/hexagrams";
import { BRANCH_WUXING, GanzhiResult } from "./calendar";
import { calculateUpcomingYingQiKeyDays } from "./yingQiEngine";

// ----------------------------------------------------
// 先天八卦數理定義（邵雍《梅花易數》先天八卦數：乾一、兌二、離三、震四、巽五、坎六、艮七、坤八）
// ----------------------------------------------------
export const XIAN_TIAN_TRIGRAMS: Record<
  number,
  {
    name: PalaceName;
    symbol: string;
    nature: string;
    binary: string; // 3 bits, 從初爻至三爻 (bottom to top)
    desc: string;
  }
> = {
  1: { name: "乾", symbol: "☰", nature: "天", binary: "111", desc: "乾一（乾為天，純陽正氣）" },
  2: { name: "兌", symbol: "☱", nature: "澤", binary: "110", desc: "兌二（兌為澤，喜悅和睦）" },
  3: { name: "離", symbol: "☲", nature: "火", binary: "101", desc: "離三（離為火，光明依附）" },
  4: { name: "震", symbol: "☳", nature: "雷", binary: "100", desc: "震四（震為雷，奮起震動）" },
  5: { name: "巽", symbol: "☴", nature: "風", binary: "011", desc: "巽五（巽為風，順從柔和）" },
  6: { name: "坎", symbol: "☵", nature: "水", binary: "010", desc: "坎六（坎為水，深邃險難）" },
  7: { name: "艮", symbol: "☶", nature: "山", binary: "001", desc: "艮七（艮為山，篤實知止）" },
  8: { name: "坤", symbol: "☷", nature: "地", binary: "000", desc: "坤八（坤為地，厚德載物）" },
};

/**
 * 數字占卜起卦核心公式（邵雍《梅花易數》先天八卦數起卦法）：
 * 1. 第一數除以 8 餘數為【上卦】（外卦）
 * 2. 第二數除以 8 餘數為【下卦】（內卦）
 * 3. 第三數除以 6 餘數為【動爻】（1-6爻）
 * 
 * 餘數為 0 時，除以 8 視為 8（坤卦），除以 6 視為 6（上爻）。
 * 支援 000 ~ 999 任意三位數（如 000 ➔ 0 % 8 = 0 ➔ 8 坤卦）。
 */
export const calculateNumberGua = (
  num1: number,
  num2: number,
  num3: number
): NumberGuaResult => {
  const n1 = typeof num1 === "number" && !isNaN(num1) ? Math.max(0, Math.floor(Math.abs(num1))) : 431;
  const n2 = typeof num2 === "number" && !isNaN(num2) ? Math.max(0, Math.floor(Math.abs(num2))) : 379;
  const n3 = typeof num3 === "number" && !isNaN(num3) ? Math.max(0, Math.floor(Math.abs(num3))) : 847;

  // 1. 第一數求【上卦】（外卦）
  const upperRemainder = n1 % 8 === 0 ? 8 : n1 % 8;
  const upperTrig = XIAN_TIAN_TRIGRAMS[upperRemainder];

  // 2. 第二數求【下卦】（內卦）
  const lowerRemainder = n2 % 8 === 0 ? 8 : n2 % 8;
  const lowerTrig = XIAN_TIAN_TRIGRAMS[lowerRemainder];

  // 3. 第三數求【動爻】（1: 初爻, ..., 6: 上爻）
  const movingRemainder = n3 % 6 === 0 ? 6 : n3 % 6;
  const movingYaoIndex = movingRemainder;

  // 4. 合成 6-bit 二進制（注意：bits 0-2 為下卦初二三爻，bits 3-5 為上卦四五六爻）
  const lowerBits = lowerTrig.binary;
  const upperBits = upperTrig.binary;
  const origBits = lowerBits + upperBits;

  const originalHexagram = findHexagramByBinary(origBits);

  // 5. 構建六爻之揲蓍餘數 (6, 7, 8, 9)
  // 動爻：陽(1)為老陽 9 (◯發動變陰), 陰(0)為老陰 6 (✕發動變陽)
  // 靜爻：陽(1)為少陽 7 (靜陽), 陰(0)為少陰 8 (靜陰)
  const remainders: YaoRemainder[] = [];
  for (let i = 0; i < 6; i++) {
    const lineIndex = i + 1;
    const isYang = origBits[i] === "1";
    if (lineIndex === movingYaoIndex) {
      remainders.push(isYang ? 9 : 6);
    } else {
      remainders.push(isYang ? 7 : 8);
    }
  }

  // 6. 變卦二進制
  const changedBits = origBits
    .split("")
    .map((bit, idx) => {
      if (idx + 1 === movingYaoIndex) {
        return bit === "1" ? "0" : "1";
      }
      return bit;
    })
    .join("");

  const changedHexagram = findHexagramByBinary(changedBits);

  const yaoNames = ["初爻", "二爻", "三爻", "四爻", "五爻", "上爻"];
  const isMovingYang = origBits[movingYaoIndex - 1] === "1";
  const movingYaoName = `${yaoNames[movingYaoIndex - 1]}（${isMovingYang ? "老陽 ◯" : "老陰 ✕"}動）`;

  return {
    num1: n1,
    num2: n2,
    num3: n3,
    upperRemainder,
    upperTrigram: upperTrig.name,
    upperTrigramSymbol: upperTrig.symbol,
    lowerRemainder,
    lowerTrigram: lowerTrig.name,
    lowerTrigramSymbol: lowerTrig.symbol,
    movingRemainder,
    movingYaoIndex,
    movingYaoName,
    remainders,
    originalHexagramName: originalHexagram.name,
    changedHexagramName: changedHexagram.name,
  };
};

// NaJia definitions for all 8 Trigrams
// Inner: lines 1, 2, 3; Outer: lines 4, 5, 6
interface NaJiaTrigram {
  innerStem: HeavenlyStem;
  innerBranches: [EarthlyBranch, EarthlyBranch, EarthlyBranch];
  outerStem: HeavenlyStem;
  outerBranches: [EarthlyBranch, EarthlyBranch, EarthlyBranch];
}

export const NAJIA_TABLE: Record<PalaceName, NaJiaTrigram> = {
  乾: {
    innerStem: "甲",
    innerBranches: ["子", "寅", "辰"],
    outerStem: "壬",
    outerBranches: ["午", "申", "戌"],
  },
  坤: {
    innerStem: "乙",
    innerBranches: ["未", "巳", "卯"],
    outerStem: "癸",
    outerBranches: ["丑", "亥", "酉"],
  },
  震: {
    innerStem: "庚",
    innerBranches: ["子", "寅", "辰"],
    outerStem: "庚",
    outerBranches: ["午", "申", "戌"],
  },
  巽: {
    innerStem: "辛",
    innerBranches: ["丑", "亥", "酉"],
    outerStem: "辛",
    outerBranches: ["未", "巳", "卯"],
  },
  坎: {
    innerStem: "戊",
    innerBranches: ["寅", "辰", "午"],
    outerStem: "戊",
    outerBranches: ["申", "戌", "子"],
  },
  離: {
    innerStem: "己",
    innerBranches: ["卯", "丑", "亥"],
    outerStem: "己",
    outerBranches: ["酉", "未", "巳"],
  },
  艮: {
    innerStem: "丙",
    innerBranches: ["辰", "午", "申"],
    outerStem: "丙",
    outerBranches: ["戌", "子", "寅"],
  },
  兌: {
    innerStem: "丁",
    innerBranches: ["巳", "卯", "丑"],
    outerStem: "丁",
    outerBranches: ["亥", "酉", "未"],
  },
};

// Five Element Generation & Restriction
export const WUXING_RELATIONS: Record<
  Wuxing,
  { generates: Wuxing; restricts: Wuxing; generatedBy: Wuxing; restrictedBy: Wuxing }
> = {
  金: { generates: "水", restricts: "木", generatedBy: "土", restrictedBy: "火" },
  木: { generates: "火", restricts: "土", generatedBy: "水", restrictedBy: "金" },
  水: { generates: "木", restricts: "火", generatedBy: "金", restrictedBy: "土" },
  火: { generates: "土", restricts: "金", generatedBy: "木", restrictedBy: "水" },
  土: { generates: "金", restricts: "水", generatedBy: "火", restrictedBy: "木" },
};

// Compute Six Relative from Palace Element and Line Branch Element
export const getSixRelative = (palaceWuxing: Wuxing, branchWuxing: Wuxing): SixRelative => {
  if (palaceWuxing === branchWuxing) return "兄弟";
  if (WUXING_RELATIONS[branchWuxing].generates === palaceWuxing) return "父母"; // 生我者
  if (WUXING_RELATIONS[palaceWuxing].generates === branchWuxing) return "子孫"; // 我生者
  if (WUXING_RELATIONS[branchWuxing].restricts === palaceWuxing) return "官鬼"; // 剋我者
  if (WUXING_RELATIONS[palaceWuxing].restricts === branchWuxing) return "妻財"; // 我剋者
  return "兄弟";
};

// Compute Six Spirits from Day Stem
export const getSixSpirits = (dayStem: HeavenlyStem): SixSpirit[] => {
  const sequence: Record<string, SixSpirit[]> = {
    甲乙: ["青龍", "朱雀", "勾陳", "螣蛇", "白虎", "玄武"],
    丙丁: ["朱雀", "勾陳", "螣蛇", "白虎", "玄武", "青龍"],
    戊: ["勾陳", "螣蛇", "白虎", "玄武", "青龍", "朱雀"],
    己: ["螣蛇", "白虎", "玄武", "青龍", "朱雀", "勾陳"],
    庚辛: ["白虎", "玄武", "青龍", "朱雀", "勾陳", "螣蛇"],
    壬癸: ["玄武", "青龍", "朱雀", "勾陳", "螣蛇", "白虎"],
  };

  for (const [stems, spirits] of Object.entries(sequence)) {
    if (stems.includes(dayStem)) {
      return spirits;
    }
  }
  return ["青龍", "朱雀", "勾陳", "螣蛇", "白虎", "玄武"];
};

// Derive Earthly Branch & Stem for 6 lines of a Hexagram
export const getHexagramLinesNaJia = (
  hexagram: HexagramData
): { stems: HeavenlyStem[]; branches: EarthlyBranch[]; wuxings: Wuxing[]; relatives: SixRelative[] } => {
  const lowerNajia = NAJIA_TABLE[hexagram.lowerTrigram];
  const upperNajia = NAJIA_TABLE[hexagram.upperTrigram];

  const stems: HeavenlyStem[] = [
    lowerNajia.innerStem,
    lowerNajia.innerStem,
    lowerNajia.innerStem,
    upperNajia.outerStem,
    upperNajia.outerStem,
    upperNajia.outerStem,
  ];

  const branches: EarthlyBranch[] = [
    lowerNajia.innerBranches[0],
    lowerNajia.innerBranches[1],
    lowerNajia.innerBranches[2],
    upperNajia.outerBranches[0],
    upperNajia.outerBranches[1],
    upperNajia.outerBranches[2],
  ];

  const wuxings = branches.map((b) => BRANCH_WUXING[b]);
  const relatives = wuxings.map((w) => getSixRelative(hexagram.palaceWuxing, w));

  return { stems, branches, wuxings, relatives };
};

// Standard Yao Line Name helper (初九, 初六, 九二, 六二, 九三, 六三, 九四, 六四, 九五, 六五, 上九, 上六)
export const getYaoLineName = (lineIndex: number, yinYang: 0 | 1): string => {
  const typeChar = yinYang === 1 ? "九" : "六";
  if (lineIndex === 1) return `初${typeChar}`;
  if (lineIndex === 6) return `上${typeChar}`;
  const posNames = ["", "初", "二", "三", "四", "五", "上"];
  return `${typeChar}${posNames[lineIndex]}`;
};

// Earthly Branch Clashes (地支六沖)
export const BRANCH_CHONG: Record<EarthlyBranch, EarthlyBranch> = {
  子: "午",
  丑: "未",
  寅: "申",
  卯: "酉",
  辰: "戌",
  巳: "亥",
  午: "子",
  未: "丑",
  申: "寅",
  酉: "卯",
  戌: "辰",
  亥: "巳",
};

// Earthly Branch Harmonies (地支六合)
export const BRANCH_HE: Record<EarthlyBranch, EarthlyBranch> = {
  子: "丑",
  丑: "子",
  寅: "亥",
  亥: "寅",
  卯: "戌",
  戌: "卯",
  辰: "酉",
  酉: "辰",
  巳: "申",
  申: "巳",
  午: "未",
  未: "午",
};

// Determine Wang / Xiang / Xiu / Qiu / Si based on Month Branch (月建旺衰)
export const calculateWangXiang = (
  branch: EarthlyBranch,
  yueJian: EarthlyBranch
): { level: WangXiangLevel; desc: string } => {
  const branchWuxing = BRANCH_WUXING[branch];
  const yueWuxing = BRANCH_WUXING[yueJian];

  // 1. 同我者旺 (當令)
  if (branchWuxing === yueWuxing) {
    return {
      level: "旺",
      desc: `月建【${yueJian}】${yueWuxing}當令同氣為旺，得令專權，生氣充沛最有力。`,
    };
  }
  // 2. 令生我者相
  if (WUXING_RELATIONS[yueWuxing].generates === branchWuxing) {
    return {
      level: "相",
      desc: `得月建【${yueJian}】${yueWuxing}相生為相，如雨露滋潤，生機蓬勃、後勁充沛。`,
    };
  }
  // 3. 我生令者休
  if (WUXING_RELATIONS[branchWuxing].generates === yueWuxing) {
    return {
      level: "休",
      desc: `生月建【${yueJian}】${yueWuxing}洩氣為休，功成身退，退居休養無力。`,
    };
  }
  // 4. 我剋令者囚
  if (WUXING_RELATIONS[branchWuxing].restricts === yueWuxing) {
    return {
      level: "囚",
      desc: `剋月建【${yueJian}】${yueWuxing}受耗為囚，力不從心，受制被困。`,
    };
  }
  // 5. 令剋我者死
  if (WUXING_RELATIONS[yueWuxing].restricts === branchWuxing) {
    return {
      level: "死",
      desc: `受月建【${yueJian}】${yueWuxing}所剋為死，如草木逢霜，枯朽無氣。`,
    };
  }

  return { level: "休", desc: "月令平氣" };
};

// Check Month Po (月破)
export const checkMonthPo = (
  branch: EarthlyBranch,
  yueJian: EarthlyBranch
): { isMonthPo: boolean; desc?: string } => {
  if (BRANCH_CHONG[yueJian] === branch) {
    return {
      isMonthPo: true,
      desc: `逢月建【${yueJian}】相沖為「月破」。如枯木逢暴風，主事受損、阻礙重重；須待出月或逢合、值日方能填實應事。`,
    };
  }
  return { isMonthPo: false };
};

// Calculate Day relation, Day Chong, An Dong, Ri Po, Ri Chong Dong
export const calculateDayRelationAndChong = (
  branch: EarthlyBranch,
  riChen: EarthlyBranch,
  isMoving: boolean,
  wangXiang: WangXiangLevel,
  isXunKong: boolean
): {
  isDayChong: boolean;
  dayChongType?: "暗動" | "日破" | "日沖動" | "沖空";
  dayChongDesc?: string;
  dayRelation: YaoLineDetail["dayRelation"];
  dayRelationDesc: string;
} => {
  const branchWuxing = BRANCH_WUXING[branch];
  const riWuxing = BRANCH_WUXING[riChen];

  // 1. Determine basic day relation
  let dayRelation: YaoLineDetail["dayRelation"] = "日平";
  let dayRelationDesc = "與日辰無特殊生剋，平穩隨常。";

  if (branch === riChen) {
    dayRelation = "臨日辰";
    dayRelationDesc = `地支與日辰【${riChen}】相同，臨日辰值日，專權當令，身強氣足最為有力。`;
  } else if (BRANCH_HE[riChen] === branch) {
    dayRelation = "日辰六合";
    dayRelationDesc = `與日辰【${riChen}】六合，得日辰牽絆成全，吉事添喜、凶事牽連不易解。`;
  } else if (branchWuxing === riWuxing) {
    dayRelation = "日建同旺";
    dayRelationDesc = `與日辰【${riChen}】${riWuxing}五行同氣（比和），得日辰同旺生氣相助。`;
  } else if (WUXING_RELATIONS[riWuxing].generates === branchWuxing) {
    dayRelation = "得日辰生";
    dayRelationDesc = `得日辰【${riChen}】${riWuxing}相生，得外力、貴人提攜相助。`;
  } else if (WUXING_RELATIONS[riWuxing].restricts === branchWuxing) {
    dayRelation = "受日辰剋";
    dayRelationDesc = `受日辰【${riChen}】${riWuxing}相剋，當日受制，行事多有壓力阻礙。`;
  } else if (WUXING_RELATIONS[branchWuxing].generates === riWuxing) {
    dayRelation = "生助日辰";
    dayRelationDesc = `生助日辰【${riChen}】${riWuxing}，自耗精力順應形勢。`;
  }

  // 2. Determine Day Chong (日沖)
  const isDayChong = BRANCH_CHONG[riChen] === branch;
  let dayChongType: YaoLineDetail["dayChongType"] = undefined;
  let dayChongDesc: string | undefined = undefined;

  if (isDayChong) {
    if (isMoving) {
      dayChongType = "日沖動";
      dayChongDesc = `動爻逢日辰【${riChen}】相沖為「日沖動」，如催馬加鞭，事態發作迅速、速戰速決。`;
    } else if (isXunKong) {
      dayChongType = "沖空";
      dayChongDesc = `旬空之爻逢日辰【${riChen}】相沖為「沖空」，沖空則實，動而有用，不再受空亡牽制。`;
    } else if (wangXiang === "旺" || wangXiang === "相" || dayRelation === "臨日辰" || dayRelation === "日建同旺" || dayRelation === "得日辰生") {
      dayChongType = "暗動";
      dayChongDesc = `旺相靜爻逢日辰【${riChen}】相沖為「暗動」，如伏兵暴起，暗中策動發力，福凶力量倍增且難以察覺。`;
    } else {
      dayChongType = "日破";
      dayChongDesc = `休囚無氣之靜爻逢日辰【${riChen}】相沖為「日破」，如風摧枯葉，主破散無依、謀事無成。`;
    }
  }

  return {
    isDayChong,
    dayChongType,
    dayChongDesc,
    dayRelation,
    dayRelationDesc,
  };
};

// Calculate detailed DongBian dynamics (動變生剋: 回頭生, 回頭剋, 化進, 化退, 化絕, 化墓, 化空, 化合, etc.)
export const calculateDongBianDetail = (
  origBranch: EarthlyBranch,
  origWuxing: Wuxing,
  changedBranch: EarthlyBranch,
  changedWuxing: Wuxing,
  isChangedXunKong: boolean
): DongBianDetail => {
  // 進神 (Advance Spirit)
  const jinMap: Record<string, string> = {
    寅: "卯",
    巳: "午",
    申: "酉",
    亥: "子",
    丑: "辰",
    辰: "未",
    未: "戌",
    戌: "丑",
  };

  // 退神 (Retreat Spirit)
  const tuiMap: Record<string, string> = {
    卯: "寅",
    午: "巳",
    酉: "申",
    子: "亥",
    辰: "丑",
    未: "辰",
    戌: "未",
    丑: "戌",
  };

  // 1. 進神
  if (jinMap[origBranch] === changedBranch) {
    return {
      type: "化進神",
      title: `化進神（${origBranch}化${changedBranch}）`,
      summary: "動化進神 · 氣勢倍增",
      detail: `動爻【${origBranch}${origWuxing}】動化【${changedBranch}${changedWuxing}】為化進神。同氣相求、由後進前，如旭日東升、步步高升，氣勢倍增，事多進展順暢且綿長。`,
      auspiciousness: "大吉",
    };
  }

  // 2. 退神
  if (tuiMap[origBranch] === changedBranch) {
    return {
      type: "化退神",
      title: `化退神（${origBranch}化${changedBranch}）`,
      summary: "動化退神 · 後勁不足",
      detail: `動爻【${origBranch}${origWuxing}】動化【${changedBranch}${changedWuxing}】為化退神。同氣後退，如日薄西山、秋葉凋零，後勁匱乏，事態漸漸消退萎縮，虎頭蛇尾。`,
      auspiciousness: "凶",
    };
  }

  // 3. 回頭生 (Return Generation)
  if (WUXING_RELATIONS[changedWuxing].generates === origWuxing) {
    return {
      type: "回頭生",
      title: `化回頭生（${changedBranch}${changedWuxing}生${origBranch}${origWuxing}）`,
      summary: "變爻回頭生動爻 · 大吉",
      detail: `變爻【${changedBranch}${changedWuxing}】回頭生動爻【${origBranch}${origWuxing}】。得變爻源泉之生助，如枯木逢春、貴人暗扶，根基穩固，先難後易，吉慶自招。`,
      auspiciousness: "大吉",
    };
  }

  // 4. 回頭剋 (Return Restriction)
  if (WUXING_RELATIONS[changedWuxing].restricts === origWuxing) {
    return {
      type: "回頭剋",
      title: `化回頭剋（${changedBranch}${changedWuxing}剋${origBranch}${origWuxing}）`,
      summary: "變爻回頭剋動爻 · 大凶",
      detail: `變爻【${changedBranch}${changedWuxing}】回頭剋動爻【${origBranch}${origWuxing}】。變爻反戈一擊自殘根基，猶如後院起火，所謀先成後敗、得而復失，為六爻大凶之象。`,
      auspiciousness: "大凶",
    };
  }

  // 5. 動化空亡 (Transformation into XunKong)
  if (isChangedXunKong) {
    return {
      type: "化空",
      title: `動化旬空（化${changedBranch}空亡）`,
      summary: "變爻逢旬空 · 虛花無實",
      detail: `變爻【${changedBranch}${changedWuxing}】逢當日旬空，動化空亡。猶如水中撈月、築沙造塔，眼前難收實效，需待出空填實之日方能應驗。`,
      auspiciousness: "變數",
    };
  }

  // 6. 動化入墓 (Transformation to Tomb: 金丑 木未 水土辰 火戌)
  const isTomb =
    (origWuxing === "金" && changedBranch === "丑") ||
    (origWuxing === "木" && changedBranch === "未") ||
    ((origWuxing === "水" || origWuxing === "土") && changedBranch === "辰") ||
    (origWuxing === "火" && changedBranch === "戌");

  if (isTomb) {
    return {
      type: "化墓",
      title: `動化入墓（${origBranch}化${changedBranch}墓）`,
      summary: "動爻化入墓庫 · 蒙蔽受困",
      detail: `動爻【${origBranch}${origWuxing}】動化【${changedBranch}】為化入墓庫。主受困、受阻、神智昏昧、被拘禁或才能難以施展，需逢沖墓之日方能脫困。`,
      auspiciousness: "凶",
    };
  }

  // 7. 動化絕地 (Transformation to Severance)
  const isJue =
    (origWuxing === "金" && (changedBranch === "寅" || changedBranch === "巳")) ||
    (origWuxing === "木" && changedBranch === "申") ||
    ((origWuxing === "水" || origWuxing === "土") && changedBranch === "巳") ||
    (origWuxing === "火" && changedBranch === "亥");

  if (isJue) {
    return {
      type: "化絕",
      title: `動化絕地（${origBranch}化${changedBranch}絕）`,
      summary: "動爻化入絕地 · 生氣斷絕",
      detail: `動爻【${origBranch}${origWuxing}】動化【${changedBranch}${changedWuxing}】為絕地。生氣枯竭、後援斷絕，事態陷入絕境難以維持。`,
      auspiciousness: "凶",
    };
  }

  // 8. 動化六合
  if (BRANCH_HE[origBranch] === changedBranch) {
    return {
      type: "化合",
      title: `動化六合（${origBranch}${changedBranch}相合）`,
      summary: "動變地支相合 · 絆住相親",
      detail: `動爻【${origBranch}】與變爻【${changedBranch}】地支六合。主情意纏綿、有人成全相助，但亦主事情被羈絆牽連，不易迅速了結。`,
      auspiciousness: "吉",
    };
  }

  // 9. 動化反吟 / 六沖
  if (BRANCH_CHONG[origBranch] === changedBranch) {
    return {
      type: "化反吟",
      title: `動化反吟（${origBranch}${changedBranch}相沖）`,
      summary: "動變地支相沖 · 事多反覆",
      detail: `動爻【${origBranch}】與變爻【${changedBranch}】地支相沖為反吟。主反覆無常、去而復來、心緒不寧、折騰難定。`,
      auspiciousness: "凶",
    };
  }

  // 10. 動化伏吟
  if (origBranch === changedBranch) {
    return {
      type: "化伏吟",
      title: `動化伏吟（${origBranch}化${changedBranch}同支）`,
      summary: "動變地支相同 · 停滯呻吟",
      detail: `動爻【${origBranch}】化出同地支【${changedBranch}】為伏吟。主停滯不前、進退兩難、心中憂鬱呻吟。`,
      auspiciousness: "平",
    };
  }

  // 11. 動生變 (洩氣)
  if (WUXING_RELATIONS[origWuxing].generates === changedWuxing) {
    return {
      type: "動生變",
      title: `動生變爻（${origBranch}${origWuxing}生${changedBranch}${changedWuxing}）`,
      summary: "動爻生變爻 · 力量外洩",
      detail: `動爻【${origBranch}${origWuxing}】生出變爻【${changedBranch}${changedWuxing}】。為洩氣之象，主自身多所付出、勞碌操心，收穫不及付出。`,
      auspiciousness: "平",
    };
  }

  // 12. 動剋變 (耗力)
  if (WUXING_RELATIONS[origWuxing].restricts === changedWuxing) {
    return {
      type: "動剋變",
      title: `動剋變爻（${origBranch}${origWuxing}剋${changedBranch}${changedWuxing}）`,
      summary: "動爻剋變爻 · 勞力掌控",
      detail: `動爻【${origBranch}${origWuxing}】剋制變爻【${changedBranch}${changedWuxing}】。需耗費心力征服掌控，有得有耗。`,
      auspiciousness: "平",
    };
  }

  // 13. 比和
  return {
    type: "比和",
    title: `動變比和（${origBranch}${origWuxing}化${changedBranch}${changedWuxing}）`,
    summary: "動變同類比和",
    detail: `動爻【${origBranch}${origWuxing}】與變爻【${changedBranch}${changedWuxing}】五行同氣相助，平穩相持。`,
    auspiciousness: "平",
  };
};

// Legacy helper for quick string
export const getChangeDynamics = (
  origBranch: EarthlyBranch,
  origWuxing: Wuxing,
  changedBranch: EarthlyBranch,
  changedWuxing: Wuxing
): string => {
  const detail = calculateDongBianDetail(origBranch, origWuxing, changedBranch, changedWuxing, false);
  return detail.summary;
};

// Auto guess Yong Shen by question context
export const guessYongShenFromQuestion = (question: string): SixRelative => {
  const q = question.toLowerCase();
  if (
    q.includes("財") ||
    q.includes("錢") ||
    q.includes("生意") ||
    q.includes("買賣") ||
    q.includes("投資") ||
    q.includes("獲利") ||
    q.includes("股票") ||
    q.includes("薪水") ||
    q.includes("老婆") ||
    q.includes("妻子") ||
    q.includes("女友")
  ) {
    return "妻財";
  }
  if (
    q.includes("官") ||
    q.includes("事業") ||
    q.includes("工作") ||
    q.includes("升遷") ||
    q.includes("求職") ||
    q.includes("面試") ||
    q.includes("考試") ||
    q.includes("訴訟") ||
    q.includes("官司") ||
    q.includes("丈夫") ||
    q.includes("男友") ||
    q.includes("職位") ||
    q.includes("升職") ||
    q.includes("疾病") ||
    q.includes("病情") ||
    q.includes("盜賊")
  ) {
    return "官鬼";
  }
  if (
    q.includes("學業") ||
    q.includes("證照") ||
    q.includes("合約") ||
    q.includes("文書") ||
    q.includes("父母") ||
    q.includes("長輩") ||
    q.includes("房子") ||
    q.includes("買房") ||
    q.includes("車") ||
    q.includes("房產") ||
    q.includes("消息") ||
    q.includes("文章")
  ) {
    return "父母";
  }
  if (
    q.includes("子") ||
    q.includes("女") ||
    q.includes("孩子") ||
    q.includes("懷孕") ||
    q.includes("求醫") ||
    q.includes("吃藥") ||
    q.includes("平安") ||
    q.includes("消災") ||
    q.includes("旅遊") ||
    q.includes("寵物") ||
    q.includes("後代")
  ) {
    return "子孫";
  }
  if (
    q.includes("朋友") ||
    q.includes("兄弟") ||
    q.includes("姐妹") ||
    q.includes("同事") ||
    q.includes("合夥") ||
    q.includes("競爭") ||
    q.includes("借錢") ||
    q.includes("同輩")
  ) {
    return "兄弟";
  }

  // Default to 官鬼 for generic career/destiny inquiry, or 妻財
  return "官鬼";
};

// Check Liu He (六合) or Liu Chong (六沖) for hexagram
export const checkHexagramCategory = (hex: HexagramData): string => {
  const chongGua = [
    "乾為天",
    "坎為水",
    "艮為山",
    "震為雷",
    "巽為風",
    "離為火",
    "坤為地",
    "兌為澤",
    "天雷無妄",
    "雷天大壯",
  ];
  const heGua = [
    "天地否",
    "地天泰",
    "水地比",
    "地水師",
    "火山旅",
    "山火賁",
    "澤水困",
    "水澤節",
  ];

  if (chongGua.includes(hex.name)) {
    return "六沖卦（主散、主速、沖決事變）";
  }
  if (heGua.includes(hex.name)) {
    return "六合卦（主和、主久、事多牽連成全）";
  }
  if (hex.orderInPalace === 7) {
    return "遊魂卦（心無定向、身處異地、事多飄忽）";
  }
  if (hex.orderInPalace === 8) {
    return "歸魂卦（事歸原處、回心轉意、落葉歸根）";
  }
  return "";
};

// Analyze Fushen (Hidden Spirit) status and emerged reason according to classical Wen Wang Gua
export const analyzeFushenStatus = (
  pureBranch: EarthlyBranch,
  pureWuxing: Wuxing,
  origBranch: EarthlyBranch,
  origWuxing: Wuxing,
  relationWithFeishen: FushenInfo["relationWithFeishen"],
  ganzhi: GanzhiResult
): { isEmerged: boolean; emergedReason: string } => {
  const yueWuxing = ganzhi.yueJianWuxing;
  const riWuxing = ganzhi.riChenWuxing;
  const yueJian = ganzhi.yueJian;
  const riChen = ganzhi.riChen;

  // Month relationship with Fushen
  const isLinYue = pureBranch === yueJian;
  const isYueSheng = WUXING_RELATIONS[yueWuxing].generates === pureWuxing;
  const isYueBi = pureWuxing === yueWuxing;
  const isYueKe = WUXING_RELATIONS[yueWuxing].restricts === pureWuxing;
  const isYueXie = WUXING_RELATIONS[pureWuxing].generates === yueWuxing;
  const isYueHao = WUXING_RELATIONS[pureWuxing].restricts === yueWuxing;

  // Day relationship with Fushen
  const isLinRi = pureBranch === riChen;
  const isRiSheng = WUXING_RELATIONS[riWuxing].generates === pureWuxing;
  const isRiBi = pureWuxing === riWuxing;
  const isRiKe = WUXING_RELATIONS[riWuxing].restricts === pureWuxing;
  const isRiXie = WUXING_RELATIONS[pureWuxing].generates === riWuxing;
  const isRiHao = WUXING_RELATIONS[pureWuxing].restricts === riWuxing;

  // Feishen conditions
  const feishenClashed = BRANCH_CHONG[riChen] === origBranch || BRANCH_CHONG[yueJian] === origBranch;
  const feishenKong = ganzhi.xunKong.includes(origBranch);

  const monthHelp = isLinYue ? `臨月建【${yueJian}】` : isYueSheng ? `得月建【${yueJian}】生` : isYueBi ? `得月建【${yueJian}】比旺` : "";
  const dayHelp = isLinRi ? `臨日辰【${riChen}】值日` : isRiSheng ? `得日辰【${riChen}】生` : isRiBi ? `得日辰【${riChen}】比旺` : "";

  const monthHurt = isYueKe ? `受月建【${yueJian}】剋` : isYueXie ? `洩氣於月建` : isYueHao ? `剋月建受耗` : "";
  const dayHurt = isRiKe ? `受日辰【${riChen}】剋` : isRiXie ? `洩氣於日辰【${riChen}】` : isRiHao ? `剋日辰受耗` : "";

  // 1. 飛生伏 (飛神生伏神，名為長生得助)
  if (relationWithFeishen === "飛生伏") {
    let reason = "得飛神相生（長生得助）";
    if (monthHelp && dayHelp) reason += `，兼${monthHelp}、${dayHelp}，伏而極盛易透出`;
    else if (monthHelp) reason += `，兼${monthHelp}，易透出有用`;
    else if (dayHelp) reason += `，兼${dayHelp}，易透出有用`;
    else if (dayHurt) reason += `（雖${dayHurt}），易透出有用`;
    else reason += "，易透出有用";
    return { isEmerged: true, emergedReason: reason };
  }

  // 2. 伏剋飛 (伏神剋飛神，名為出暴)
  if (relationWithFeishen === "伏剋飛") {
    let reason = "伏剋飛神為出暴（有破土之勢）";
    if (monthHelp && dayHelp) reason += `，且${monthHelp}、${dayHelp}，氣勢強旺`;
    else if (monthHelp) reason += `，且${monthHelp}`;
    else if (dayHelp) reason += `，且${dayHelp}`;
    return { isEmerged: true, emergedReason: reason };
  }

  // 3. 飛神逢空或逢沖
  if (feishenKong) {
    let reason = "飛神逢旬空，遮擋已除，伏神得出";
    if (monthHelp) reason += `，兼${monthHelp}`;
    if (dayHelp) reason += `，兼${dayHelp}`;
    return { isEmerged: true, emergedReason: reason };
  }

  if (feishenClashed) {
    let reason = "飛神逢日月沖動，遮障破散，伏神乘機透出";
    if (monthHelp) reason += `，兼${monthHelp}`;
    if (dayHelp) reason += `，兼${dayHelp}`;
    return { isEmerged: true, emergedReason: reason };
  }

  // 4. 日月旺相生扶情況
  if (monthHelp && dayHelp) {
    return { isEmerged: true, emergedReason: `${monthHelp}且${dayHelp}，日月雙得生扶，伏而有力` };
  }

  if (monthHelp && !dayHelp) {
    let reason = `${monthHelp}扶助`;
    if (dayHurt) reason += `（雖${dayHurt}）`;
    reason += "，得天時之氣伏而有力";
    return { isEmerged: true, emergedReason: reason };
  }

  if (!monthHelp && dayHelp) {
    let reason = `${dayHelp}扶助`;
    if (monthHurt) reason += `（雖${monthHurt}）`;
    reason += "，得地利日辰值令透出";
    return { isEmerged: true, emergedReason: reason };
  }

  // 5. 飛剋伏 (受飛神壓迫且無日月生扶)
  if (relationWithFeishen === "飛剋伏") {
    return {
      isEmerged: false,
      emergedReason: "受飛神剋制壓迫，且無日月生扶，伏藏難出",
    };
  }

  // 6. 其他無力情況
  return {
    isEmerged: false,
    emergedReason: "伏藏受制或休囚無力，須待逢沖、值日或出月方得出",
  };
};

// Relative generation and restriction helper mappings
export const RELATIVE_GENERATOR: Record<SixRelative, SixRelative> = {
  妻財: "子孫", // 子孫生妻財
  官鬼: "妻財", // 妻財生官鬼
  父母: "官鬼", // 官鬼生父母
  子孫: "兄弟", // 兄弟生子孫
  兄弟: "父母", // 父母生兄弟
};

export const RELATIVE_RESTRICTOR: Record<SixRelative, SixRelative> = {
  妻財: "兄弟", // 兄弟剋妻財
  官鬼: "子孫", // 子孫剋官鬼
  父母: "妻財", // 妻財剋父母
  子孫: "父母", // 父母剋子孫
  兄弟: "官鬼", // 官鬼剋兄弟
};

export const CHOU_SHEN_MAP: Record<SixRelative, SixRelative> = {
  妻財: "父母", // 生兄弟剋子孫
  官鬼: "兄弟", // 生子孫剋妻財
  父母: "子孫", // 生妻財剋官鬼
  子孫: "官鬼", // 生父母剋兄弟
  兄弟: "妻財", // 生官鬼剋父母
};

export const getXunNameFromBranches = (xunKongBranches: string): string => {
  if (xunKongBranches.includes("戌") && xunKongBranches.includes("亥")) return "甲子旬（戌亥空）";
  if (xunKongBranches.includes("申") && xunKongBranches.includes("酉")) return "甲戌旬（申酉空）";
  if (xunKongBranches.includes("午") && xunKongBranches.includes("未")) return "甲申旬（午未空）";
  if (xunKongBranches.includes("辰") && xunKongBranches.includes("巳")) return "甲午旬（辰巳空）";
  if (xunKongBranches.includes("寅") && xunKongBranches.includes("卯")) return "甲辰旬（寅卯空）";
  if (xunKongBranches.includes("子") && xunKongBranches.includes("丑")) return "甲寅旬（子丑空）";
  return `${xunKongBranches}空亡`;
};

// Calculate all 14 classical Liu Yao layers in exact sequence
export const calculateLiuYaoLayeredAnalysis = (
  lines: YaoLineDetail[],
  ganzhi: GanzhiResult,
  originalHexagram: HexagramData,
  changedHexagram: HexagramData | undefined,
  yongShenCategory: SixRelative,
  missingRelatives: SixRelative[]
): LiuYaoLayeredAnalysis => {
  // 1. 世爻 (Shi Yao)
  const shiLine = lines.find((l) => l.isShi) || lines[originalHexagram.shiYao - 1] || lines[0];
  const shiEval =
    shiLine.isMonthPo
      ? "世爻逢月破，自身根基受損，行事多受阻，宜防暗耗或謀事難定。"
      : shiLine.isXunKong
      ? "世爻落旬空，自身心無定見、猶豫不決，或隱忍避禍，出空方能全力施為。"
      : shiLine.wangXiang === "旺" || shiLine.wangXiang === "相"
      ? "世爻得月令生旺，自身底氣充沛、心態堅定、身強能任大事。"
      : "世爻休囚無力，自身力量較為單薄，宜依託外力或順勢而為。";

  const layer1Shi: Layer1ShiAnalysis = {
    lineIndex: shiLine.index,
    name: `${shiLine.name}【世爻】`,
    relative: shiLine.originalRelative,
    stem: shiLine.originalStem,
    branch: shiLine.originalBranch,
    wuxing: shiLine.originalWuxing,
    sixSpirit: shiLine.sixSpirit,
    wangXiang: shiLine.wangXiang,
    dayRelation: shiLine.dayRelationDescription,
    isMoving: shiLine.isMoving,
    isMonthPo: shiLine.isMonthPo,
    isDayChong: shiLine.isDayChong,
    isXunKong: shiLine.isXunKong,
    dongBianSummary: shiLine.dongBianDetail?.summary,
    meaning: `世爻居第${shiLine.index}爻，代表求問者自身、本體地位、心態動向與吉凶承受之主體。持【${shiLine.originalRelative}】臨【${shiLine.sixSpirit}】。`,
    classicalQuote: "《黃金策》曰：「世為己，應為人；世位強旺，我身有力；世爻受制，動輒得咎。」",
    evaluation: shiEval,
  };

  // 2. 應爻 (Ying Yao)
  const yingLine = lines.find((l) => l.isYing) || lines[originalHexagram.yingYao - 1] || lines[3];
  let relationWithShi: Layer2YingAnalysis["relationWithShi"] = "世應比和";
  let relationWithShiDesc = "";

  if (BRANCH_HE[shiLine.originalBranch] === yingLine.originalBranch) {
    relationWithShi = "世應相合";
    relationWithShiDesc = `世爻【${shiLine.originalBranch}】與應爻【${yingLine.originalBranch}】地支六合。主雙方同心合意、百事和睦相生、謀事易成。`;
  } else if (BRANCH_CHONG[shiLine.originalBranch] === yingLine.originalBranch) {
    relationWithShi = "世應相沖";
    relationWithShiDesc = `世爻【${shiLine.originalBranch}】與應爻【${yingLine.originalBranch}】地支相沖。主彼此相悖、同床異夢、各懷心思或易生爭執對立。`;
  } else if (WUXING_RELATIONS[yingLine.originalWuxing].generates === shiLine.originalWuxing) {
    relationWithShi = "應生世";
    relationWithShiDesc = `應爻【${yingLine.originalBranch}${yingLine.originalWuxing}】生世爻【${shiLine.originalBranch}${shiLine.originalWuxing}】。大吉之象，彼方對我有利、貴人樂意相助、事來就我。`;
  } else if (WUXING_RELATIONS[yingLine.originalWuxing].restricts === shiLine.originalWuxing) {
    relationWithShi = "應剋世";
    relationWithShiDesc = `應爻【${yingLine.originalBranch}${yingLine.originalWuxing}】剋世爻【${shiLine.originalBranch}${shiLine.originalWuxing}】。彼強我弱、對方施加壓力或對我有防範排擠，行事宜慎。`;
  } else if (WUXING_RELATIONS[shiLine.originalWuxing].generates === yingLine.originalWuxing) {
    relationWithShi = "世生應";
    relationWithShiDesc = `世爻【${shiLine.originalBranch}${shiLine.originalWuxing}】生應爻【${yingLine.originalBranch}${yingLine.originalWuxing}】。我方付出較多、主動求人討好，多勞少獲。`;
  } else if (WUXING_RELATIONS[shiLine.originalWuxing].restricts === yingLine.originalWuxing) {
    relationWithShi = "世剋應";
    relationWithShiDesc = `世爻【${shiLine.originalBranch}${shiLine.originalWuxing}】剋應爻【${yingLine.originalBranch}${yingLine.originalWuxing}】。我方佔據主導，需付出魄力征服掌控，事在人為。`;
  } else {
    relationWithShi = "世應比和";
    relationWithShiDesc = `世應五行同氣（${shiLine.originalWuxing}），平起平坐、平等共處。`;
  }

  const layer2Ying: Layer2YingAnalysis = {
    lineIndex: yingLine.index,
    name: `${yingLine.name}【應爻】`,
    relative: yingLine.originalRelative,
    stem: yingLine.originalStem,
    branch: yingLine.originalBranch,
    wuxing: yingLine.originalWuxing,
    sixSpirit: yingLine.sixSpirit,
    wangXiang: yingLine.wangXiang,
    relationWithShi,
    relationWithShiDesc,
    meaning: `應爻居第${yingLine.index}爻，代表問事之對象、對手、他人、所往之地或所處外部環境。持【${yingLine.originalRelative}】臨【${yingLine.sixSpirit}】。`,
    classicalQuote: "《卜筮正宗》曰：「應為百事之基，應生世吉、應剋世凶；世應相合必有歡情，世應相沖終生齟齬。」",
    evaluation: relationWithShiDesc,
  };

  // 3. 用神 (Yong Shen)
  const yongShenLines = lines.filter((l) => l.originalRelative === yongShenCategory);
  const isMissingInOriginal = yongShenLines.length === 0;
  const fuShenInfo = lines.find((l) => l.fushen?.relative === yongShenCategory)?.fushen;
  let primaryLineIndex = yongShenLines[0]?.index || fuShenInfo?.lineIndex || 1;
  let selectionReason = "卦中獨現此用神爻，為定局主神。";

  if (yongShenLines.length > 1) {
    // Selection precedence: Moving > Shi > Holds Day/Month > Wang
    const movingYong = yongShenLines.find((l) => l.isMoving);
    const shiYong = yongShenLines.find((l) => l.isShi);
    const dayMonthYong = yongShenLines.find(
      (l) => l.originalBranch === ganzhi.riChen || l.originalBranch === ganzhi.yueJian
    );

    if (movingYong) {
      primaryLineIndex = movingYong.index;
      selectionReason = `用神多現（${yongShenLines.map((l) => l.name).join("、")}），取發動之【${movingYong.name}】為主用神（神兆機於動）。`;
    } else if (shiYong) {
      primaryLineIndex = shiYong.index;
      selectionReason = `用神多現，取臨世之【${shiYong.name}】為主用神（用神持世，切身最緊）。`;
    } else if (dayMonthYong) {
      primaryLineIndex = dayMonthYong.index;
      selectionReason = `用神多現，取臨日月建之【${dayMonthYong.name}】為主用神（得令秉權）。`;
    } else {
      primaryLineIndex = yongShenLines[0].index;
      selectionReason = `用神兩現俱靜，取旺相有氣之【${yongShenLines[0].name}】為主用神。`;
    }
  } else if (isMissingInOriginal) {
    primaryLineIndex = fuShenInfo?.lineIndex || 1;
    selectionReason = `本卦六爻無【${yongShenCategory}】，用神伏藏，需查本宮八純卦對應之伏神。`;
  }

  const primaryYongLine = lines.find((l) => l.index === primaryLineIndex) || lines[0];

  // Power Score calculation (0 - 100)
  let powerScore = 50;
  if (!isMissingInOriginal) {
    if (primaryYongLine.wangXiang === "旺") powerScore += 25;
    else if (primaryYongLine.wangXiang === "相") powerScore += 18;
    else if (primaryYongLine.wangXiang === "休") powerScore -= 5;
    else if (primaryYongLine.wangXiang === "囚") powerScore -= 15;
    else if (primaryYongLine.wangXiang === "死") powerScore -= 25;

    if (primaryYongLine.dayRelation === "臨日辰") powerScore += 20;
    else if (primaryYongLine.dayRelation === "得日辰生") powerScore += 15;
    else if (primaryYongLine.dayRelation === "日建同旺") powerScore += 12;
    else if (primaryYongLine.dayRelation === "日辰六合") powerScore += 10;
    else if (primaryYongLine.dayRelation === "受日辰剋") powerScore -= 20;

    if (primaryYongLine.isMonthPo) powerScore -= 30;
    if (primaryYongLine.isXunKong) powerScore -= 15;
    if (primaryYongLine.isMoving) {
      if (primaryYongLine.dongBianDetail?.auspiciousness === "大吉") powerScore += 20;
      else if (primaryYongLine.dongBianDetail?.auspiciousness === "吉") powerScore += 10;
      else if (primaryYongLine.dongBianDetail?.auspiciousness === "凶") powerScore -= 20;
      else if (primaryYongLine.dongBianDetail?.auspiciousness === "大凶") powerScore -= 35;
    }
  } else if (fuShenInfo) {
    powerScore = fuShenInfo.isEmerged ? 45 : 25;
  }
  powerScore = Math.max(5, Math.min(98, powerScore));

  const layer3YongShen: Layer3YongShenAnalysis = {
    category: yongShenCategory,
    lineIndices: yongShenLines.map((l) => l.index),
    primaryLineIndex,
    isMissingInOriginal,
    fuShenInfo,
    stem: isMissingInOriginal ? fuShenInfo?.stem : primaryYongLine.originalStem,
    branch: isMissingInOriginal ? fuShenInfo?.branch : primaryYongLine.originalBranch,
    wuxing: isMissingInOriginal ? fuShenInfo?.wuxing : primaryYongLine.originalWuxing,
    sixSpirit: isMissingInOriginal ? undefined : primaryYongLine.sixSpirit,
    wangXiang: isMissingInOriginal ? undefined : primaryYongLine.wangXiang,
    dayRelation: isMissingInOriginal ? undefined : primaryYongLine.dayRelationDescription,
    isMoving: isMissingInOriginal ? false : primaryYongLine.isMoving,
    isMonthPo: isMissingInOriginal ? false : primaryYongLine.isMonthPo,
    isDayChong: isMissingInOriginal ? false : primaryYongLine.isDayChong,
    isXunKong: isMissingInOriginal ? false : primaryYongLine.isXunKong,
    powerScore,
    statusDescription: isMissingInOriginal
      ? `用神【${yongShenCategory}】不上卦，伏於第${fuShenInfo?.lineIndex || 1}爻【${fuShenInfo?.branch}${fuShenInfo?.wuxing}】，${fuShenInfo?.emergedReason}。`
      : `用神【${yongShenCategory}】臨第${primaryYongLine.index}爻【${primaryYongLine.originalBranch}${primaryYongLine.originalWuxing}】，月令【${primaryYongLine.wangXiang}】，${primaryYongLine.dayRelationDescription}。`,
    classicalQuote: "《增刪卜易》曰：「用神為一卦之綱領，吉凶皆由此定。用神旺相，諸事大吉；用神休囚死絕空破，萬謀皆空。」",
    selectionReason,
    summary:
      powerScore >= 70
        ? `用神強旺有力（能量指標 ${powerScore}%），得天時地利，所謀易就。`
        : powerScore >= 45
        ? `用神力量中平（能量指標 ${powerScore}%），吉凶相伴，須看原神生扶或逢時發力。`
        : `用神休囚受損（能量指標 ${powerScore}%），阻礙重重，宜靜守避險。`,
  };

  // 4. 原神 (Yuan Shen)
  const yuanShenCategory = RELATIVE_GENERATOR[yongShenCategory];
  const yuanShenLines = lines.filter((l) => l.originalRelative === yuanShenCategory);
  const movingYuanLines = yuanShenLines.filter((l) => l.isMoving);

  let yuanShenStatus: Layer4YuanShenAnalysis["status"] = "休囚無力";
  let yuanShenSummary = "";

  if (yuanShenLines.length === 0) {
    yuanShenStatus = "伏藏不現";
    yuanShenSummary = `卦中無【${yuanShenCategory}】（原神不現），用神無生助之源，全賴日月生扶。`;
  } else if (movingYuanLines.some((l) => l.dongBianDetail?.auspiciousness === "大吉" || l.dongBianDetail?.type === "回頭生" || l.dongBianDetail?.type === "化進神")) {
    yuanShenStatus = "旺相發動生用";
    yuanShenSummary = `原神【${yuanShenCategory}】發動化吉生助用神，如源泉湧動、貴人提攜，大吉之象！`;
  } else if (movingYuanLines.some((l) => l.dongBianDetail?.type === "回頭剋" || l.dongBianDetail?.type === "化退神" || l.dongBianDetail?.type === "化絕")) {
    yuanShenStatus = "動化退剋";
    yuanShenSummary = `原神【${yuanShenCategory}】發動卻化回頭剋或化退神，生助用神之力虎頭蛇尾、後援斷絕。`;
  } else if (yuanShenLines.some((l) => l.isMonthPo || (l.isXunKong && l.wangXiang === "死"))) {
    yuanShenStatus = "受制逢破";
    yuanShenSummary = `原神【${yuanShenCategory}】逢月破或真空受制，無力生助用神。`;
  } else if (yuanShenLines.some((l) => l.wangXiang === "旺" || l.wangXiang === "相")) {
    yuanShenStatus = "旺相安靜";
    yuanShenSummary = `原神【${yuanShenCategory}】旺相安靜，暗蓄生氣，隨時可助用神一臂之力。`;
  } else {
    yuanShenStatus = "休囚無力";
    yuanShenSummary = `原神【${yuanShenCategory}】休囚無氣，生助用神之力微弱。`;
  }

  const layer4YuanShen: Layer4YuanShenAnalysis = {
    category: yuanShenCategory,
    wuxing: yuanShenLines[0]?.originalWuxing || "木",
    existInOriginal: yuanShenLines.length > 0,
    lineIndices: yuanShenLines.map((l) => l.index),
    movingIndices: movingYuanLines.map((l) => l.index),
    details: yuanShenLines.map((l) => ({
      lineIndex: l.index,
      name: l.name,
      branch: l.originalBranch,
      wuxing: l.originalWuxing,
      sixSpirit: l.sixSpirit,
      wangXiang: l.wangXiang,
      isMoving: l.isMoving,
      isMonthPo: l.isMonthPo,
      isXunKong: l.isXunKong,
      effectDesc: l.isMoving
        ? `動爻發動，${l.dongBianDetail?.summary || "發動生用"}`
        : `靜爻，${l.wangXiangDescription}`,
    })),
    status: yuanShenStatus,
    classicalQuote: "《卜筮正宗·原神章》曰：「原神發動，事必有濟；原神旺相，福壽綿長；原神休囚受剋，用神無援。」",
    summary: yuanShenSummary,
  };

  // 5. 忌神 (Ji Shen)
  const jiShenCategory = RELATIVE_RESTRICTOR[yongShenCategory];
  const chouShenCategory = CHOU_SHEN_MAP[yongShenCategory];
  const jiShenLines = lines.filter((l) => l.originalRelative === jiShenCategory);
  const movingJiLines = jiShenLines.filter((l) => l.isMoving);

  let jiShenStatus: Layer5JiShenAnalysis["status"] = "休囚受制（無害）";
  let jiThreat: Layer5JiShenAnalysis["threatLevel"] = "無威脅";
  let jiSummary = "";

  if (jiShenLines.length === 0) {
    jiShenStatus = "不上卦安靜";
    jiThreat = "無威脅";
    jiSummary = `卦中無【${jiShenCategory}】（忌神不上卦），用神不受內在威脅，阻力微小。`;
  } else if (movingJiLines.some((l) => l.dongBianDetail?.type === "回頭剋" || l.dongBianDetail?.type === "化退神")) {
    jiShenStatus = "化退回頭剋（轉危為安）";
    jiThreat = "微弱";
    jiSummary = `忌神【${jiShenCategory}】雖發動，但化回頭剋或化退神，自顧不暇、難以傷用，轉危為安。`;
  } else if (movingJiLines.length > 0) {
    jiShenStatus = "發動傷用（大凶）";
    jiThreat = "極高";
    jiSummary = `忌神【${jiShenCategory}】發動直剋用神！如猛虎下山、橫生阻礙，主謀事受損受挫，需防小人災咎。`;
  } else if (jiShenLines.some((l) => l.wangXiang === "旺" || l.wangXiang === "相")) {
    jiShenStatus = "旺相暗伏";
    jiThreat = "中等";
    jiSummary = `忌神【${jiShenCategory}】旺相安靜，暗藏威脅，如伏虎待時，逢日沖沖起或值日時仍需防範。`;
  } else {
    jiShenStatus = "休囚受制（無害）";
    jiThreat = "微弱";
    jiSummary = `忌神【${jiShenCategory}】休囚受制無氣，如拔牙之虎，不足為慮。`;
  }

  const layer5JiShen: Layer5JiShenAnalysis = {
    category: jiShenCategory,
    wuxing: jiShenLines[0]?.originalWuxing || "金",
    chouShenCategory,
    existInOriginal: jiShenLines.length > 0,
    lineIndices: jiShenLines.map((l) => l.index),
    movingIndices: movingJiLines.map((l) => l.index),
    details: jiShenLines.map((l) => ({
      lineIndex: l.index,
      name: l.name,
      branch: l.originalBranch,
      wuxing: l.originalWuxing,
      sixSpirit: l.sixSpirit,
      wangXiang: l.wangXiang,
      isMoving: l.isMoving,
      isMonthPo: l.isMonthPo,
      isXunKong: l.isXunKong,
      effectDesc: l.isMoving
        ? `動爻發動剋用神，${l.dongBianDetail?.summary || "發動剋用"}`
        : `靜爻，${l.wangXiangDescription}`,
    })),
    status: jiShenStatus,
    classicalQuote: "《增刪卜易·忌神章》曰：「忌神發動，剋害無休；忌神化退化絕，雖凶不凶；忌神無氣，如斬草除根。」",
    threatLevel: jiThreat,
    summary: jiSummary,
  };

  // 6. 伏神 (Fu Shen)
  const allFushen = lines.map((l) => l.fushen).filter((f): f is FushenInfo => Boolean(f));
  const yongShenFu = allFushen.find((f) => f.relative === yongShenCategory);
  const pureHexName = allFushen[0]?.pureHexagramName || `${originalHexagram.palace}為宮純卦`;

  const layer6FuShen: Layer6FuShenAnalysis = {
    fushenList: allFushen,
    yongShenFuShen: yongShenFu,
    missingRelatives,
    pureHexagramName: pureHexName,
    classicalQuote: "《黃金策》曰：「伏無提攜不能起，飛無遮蔽自現前。飛生伏得長生，伏剋飛為出暴。」",
    summary: isMissingInOriginal
      ? `本卦所缺【${missingRelatives.join("、")}】。用神【${yongShenCategory}】伏於本宮【${pureHexName}】第${yongShenFu?.lineIndex}爻，${yongShenFu?.emergedReason}。`
      : `本卦用神上卦，六親基本具足（缺：${missingRelatives.length ? missingRelatives.join("、") : "無缺失"}）。伏神作為底層暗線參考。`,
  };

  // 7. 飛神 (Fei Shen)
  const feiShenList = lines.map((l) => {
    const fu = l.fushen;
    return {
      lineIndex: l.index,
      lineName: l.name,
      feiRelative: l.originalRelative,
      feiBranch: l.originalBranch,
      feiWuxing: l.originalWuxing,
      fuRelative: fu?.relative || "兄弟",
      fuBranch: fu?.branch || "子",
      fuWuxing: fu?.wuxing || "水",
      relation: fu?.relationWithFeishen || "比和",
      isFeiKong: l.isXunKong,
      isFeiPo: l.isMonthPo,
      isFeiMoving: l.isMoving,
      impactOnFu: l.isXunKong
        ? "飛神逢旬空，遮擋撤除，伏神最易透出！"
        : l.isMonthPo
        ? "飛神逢月破，遮障瓦解，伏神得出！"
        : l.isMoving
        ? "飛神發動，氣場激盪，牽引伏神動態。"
        : fu?.relationDesc || "飛神安靜壓覆伏神。",
    };
  });

  const layer7FeiShen: Layer7FeiShenAnalysis = {
    feiShenList,
    classicalQuote: "《卜筮正宗》曰：「飛神空破，伏神易出；飛神相生，伏得滋養；飛神剋伏，受制難展。」",
    summary: "飛神為顯露於卦面之現狀，壓於伏神之上。若飛神逢空、逢破、逢沖，則伏神易脫困透出成事。",
  };

  // 8. 月建 (Yue Jian)
  const wangDist: Layer8YueJianAnalysis["wangDistribution"] = {
    旺: [],
    相: [],
    休: [],
    囚: [],
    死: [],
  };
  const monthPoLines: Layer8YueJianAnalysis["monthPoLines"] = [];

  lines.forEach((l) => {
    wangDist[l.wangXiang].push(`${l.name}(${l.originalRelative}${l.originalBranch})`);
    if (l.isMonthPo) {
      monthPoLines.push({
        lineIndex: l.index,
        name: l.name,
        relative: l.originalRelative,
        branch: l.originalBranch,
        desc: l.monthPoDescription || "逢月令正沖為月破，萬物無氣受損。",
      });
    }
  });

  const layer8YueJian: Layer8YueJianAnalysis = {
    yueJian: ganzhi.yueJian,
    yueJianWuxing: ganzhi.yueJianWuxing,
    ganzhiMonth: ganzhi.ganzhiMonth,
    wangDistribution: wangDist,
    monthPoLines,
    classicalQuote: "《增刪卜易》曰：「月建司三旬之權，操萬卦之提綱。旺相者福盛，休囚者力薄；逢沖者為月破，出月方實。」",
    summary: `當前值【${ganzhi.ganzhiMonth}】月令，${ganzhi.yueJianWuxing}旺。月破之爻：${
      monthPoLines.length ? monthPoLines.map((m) => `${m.name}（${m.branch}）`).join("、") : "全卦無月破，根基穩固"
    }。`,
  };

  // 9. 日辰 (Ri Chen)
  const riHeLines: Layer9RiChenAnalysis["riHeLines"] = [];
  const anDongLines: Layer9RiChenAnalysis["anDongLines"] = [];
  const riPoLines: Layer9RiChenAnalysis["riPoLines"] = [];
  const riChongDongLines: Layer9RiChenAnalysis["riChongDongLines"] = [];
  const chongKongLines: Layer9RiChenAnalysis["chongKongLines"] = [];

  lines.forEach((l) => {
    if (l.dayRelation === "日辰六合") {
      riHeLines.push({ lineIndex: l.index, name: l.name, branch: l.originalBranch, desc: l.dayRelationDescription });
    }
    if (l.dayChongType === "暗動") {
      anDongLines.push({ lineIndex: l.index, name: l.name, branch: l.originalBranch, desc: l.dayChongDescription || "暗中發力成事" });
    }
    if (l.dayChongType === "日破") {
      riPoLines.push({ lineIndex: l.index, name: l.name, branch: l.originalBranch, desc: l.dayChongDescription || "休囚遭沖破散" });
    }
    if (l.dayChongType === "日沖動") {
      riChongDongLines.push({ lineIndex: l.index, name: l.name, branch: l.originalBranch, desc: l.dayChongDescription || "動逢日沖事速發" });
    }
    if (l.dayChongType === "沖空") {
      chongKongLines.push({ lineIndex: l.index, name: l.name, branch: l.originalBranch, desc: l.dayChongDescription || "沖空填實有用" });
    }
  });

  const layer9RiChen: Layer9RiChenAnalysis = {
    riChen: ganzhi.riChen,
    riChenWuxing: ganzhi.riChenWuxing,
    riGan: ganzhi.riGan,
    ganzhiDay: ganzhi.ganzhiDay,
    riHeLines,
    anDongLines,
    riPoLines,
    riChongDongLines,
    chongKongLines,
    classicalQuote: "《黃金策》曰：「日辰主一日之生殺，操當下之機杼。生之則吉，剋之則凶；旺沖為暗動，衰沖為日破。」",
    summary: `當前值【${ganzhi.ganzhiDay}】日辰，${ganzhi.riChenWuxing}當令。${
      anDongLines.length ? `【暗動爻】：${anDongLines.map((a) => a.name).join("、")}（如伏兵突起）；` : ""
    }${
      riPoLines.length ? `【日破爻】：${riPoLines.map((p) => p.name).join("、")}（摧折無依）；` : ""
    }${
      riHeLines.length ? `【日合爻】：${riHeLines.map((h) => h.name).join("、")}（得日絆成全）；` : "全卦日辰生剋有序。"
    }`,
  };

  // 10. 動爻 (Dong Yao)
  const movingLines = lines.filter((l) => l.isMoving);
  const layer10DongYao: Layer10DongYaoAnalysis = {
    hasMoving: movingLines.length > 0,
    movingLines: movingLines.map((l) => {
      let impactOnYong = "動爻轉化生剋全盤";
      let impactOnShi = "牽動世爻氣場";

      if (WUXING_RELATIONS[l.originalWuxing].generates === layer3YongShen.wuxing) {
        impactOnYong = "動爻五行生助用神，催化吉慶成事。";
      } else if (WUXING_RELATIONS[l.originalWuxing].restricts === layer3YongShen.wuxing) {
        impactOnYong = "動爻五行剋傷用神，事多阻力與衝擊。";
      }

      if (WUXING_RELATIONS[l.originalWuxing].generates === shiLine.originalWuxing) {
        impactOnShi = "動爻生世爻，自身得利益或貴人助。";
      } else if (WUXING_RELATIONS[l.originalWuxing].restricts === shiLine.originalWuxing) {
        impactOnShi = "動爻剋世爻，自身承擔壓力與風險。";
      }

      return {
        lineIndex: l.index,
        name: l.name,
        relative: l.originalRelative,
        branch: l.originalBranch,
        wuxing: l.originalWuxing,
        sixSpirit: l.sixSpirit,
        wangXiang: l.wangXiang,
        dongBianDetail: l.dongBianDetail,
        impactOnYong,
        impactOnShi,
      };
    }),
    classicalQuote: "《周易·繫辭》曰：「吉凶悔吝者，生乎動者也。神兆機於動，卦無動爻則事態安靜，動爻一發則乾坤變易。」",
    summary:
      movingLines.length === 0
        ? "六爻安靜無動爻（靜卦），事態平穩隨常，專以日月建為生剋主軸。"
        : `卦中共有 ${movingLines.length} 個動爻發動（${movingLines.map((m) => m.name).join("、")}），為事態變革轉折之關鍵樞紐。`,
  };

  // 11. 變爻 (Bian Yao)
  const bianYaoList: Layer11BianYaoAnalysis["bianYaoList"] = [];
  movingLines.forEach((l) => {
    if (l.changedBranch && l.changedRelative && l.dongBianDetail) {
      bianYaoList.push({
        lineIndex: l.index,
        origLineName: l.name,
        origBranch: l.originalBranch,
        changedLineName: l.changedLineName || "變爻",
        changedBranch: l.changedBranch,
        changedRelative: l.changedRelative,
        dynamicsType: l.dongBianDetail.type,
        dynamicsSummary: l.dongBianDetail.summary,
        auspiciousness: l.dongBianDetail.auspiciousness,
      });
    }
  });

  const layer11BianYao: Layer11BianYaoAnalysis = {
    changedHexagramName: changedHexagram?.name,
    changedHexagramPalace: changedHexagram ? `${changedHexagram.palace}宮${changedHexagram.palaceTypeName}` : undefined,
    bianYaoList,
    changedGuaCi: changedHexagram?.guaCi,
    classicalQuote: "《增刪卜易》曰：「本卦為事之始，變卦為事之終。動化回頭生、化進神者終成；動化回頭剋、化退神者終敗。」",
    summary: changedHexagram
      ? `動變化出【${changedHexagram.name}】（${changedHexagram.palace}宮）。${
          bianYaoList.map((b) => `【${b.origLineName}】${b.dynamicsSummary}`).join("；")
        }`
      : "本卦無動變，事態以本卦大象與日月生剋為終局。",
  };

  // 12. 合沖刑害 (He Chong Xing Hai)
  const sixHeList: Layer12HeChongXingHaiAnalysis["sixHeList"] = [];
  const sixChongList: Layer12HeChongXingHaiAnalysis["sixChongList"] = [];
  const sanHeJuList: Layer12HeChongXingHaiAnalysis["sanHeJuList"] = [];
  const sanXingList: Layer12HeChongXingHaiAnalysis["sanXingList"] = [];
  const liuHaiList: Layer12HeChongXingHaiAnalysis["liuHaiList"] = [];

  // Pairwise lines scan for Liu He & Liu Chong
  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const b1 = lines[i].originalBranch;
      const b2 = lines[j].originalBranch;
      if (BRANCH_HE[b1] === b2) {
        sixHeList.push({
          type: "爻爻相合",
          pair: `${lines[i].name}(${b1}) 與 ${lines[j].name}(${b2})`,
          desc: `地支【${b1}${b2}六合】，主二爻情投意合、事相牽連相助。`,
        });
      }
      if (BRANCH_CHONG[b1] === b2) {
        sixChongList.push({
          type: "爻爻相沖",
          pair: `${lines[i].name}(${b1}) 與 ${lines[j].name}(${b2})`,
          desc: `地支【${b1}${b2}相沖】，主二爻互不相讓、事有衝撞反覆。`,
        });
      }
    }
  }

  // Month & Day He/Chong
  lines.forEach((l) => {
    if (BRANCH_HE[ganzhi.riChen] === l.originalBranch) {
      sixHeList.push({
        type: "爻日六合",
        pair: `${l.name}(${l.originalBranch}) 與 日辰(${ganzhi.riChen})`,
        desc: `得日辰六合絆住，吉事添喜、凶事難解。`,
      });
    }
    if (BRANCH_HE[ganzhi.yueJian] === l.originalBranch) {
      sixHeList.push({
        type: "爻月六合",
        pair: `${l.name}(${l.originalBranch}) 與 月建(${ganzhi.yueJian})`,
        desc: `得月建六合，得天時提攜合旺。`,
      });
    }
    if (l.isMonthPo) {
      sixChongList.push({
        type: "爻月相沖(月破)",
        pair: `${l.name}(${l.originalBranch}) 與 月建(${ganzhi.yueJian})`,
        desc: `逢月令正沖為月破，衰絕受損。`,
      });
    }
    if (l.isDayChong) {
      sixChongList.push({
        type: "爻日相沖",
        pair: `${l.name}(${l.originalBranch}) 與 日辰(${ganzhi.riChen})`,
        desc: `逢日辰相沖（${l.dayChongType || "日沖"}）。`,
      });
    }
  });

  // San He Ju scan
  const allBranchesInHex = lines.map((l) => l.originalBranch);
  const SAN_HE_CONFIGS: Array<{ name: string; branches: [EarthlyBranch, EarthlyBranch, EarthlyBranch]; targetWuxing: Wuxing }> = [
    { name: "申子辰三合水局", branches: ["申", "子", "辰"], targetWuxing: "水" },
    { name: "亥卯未三合木局", branches: ["亥", "卯", "未"], targetWuxing: "木" },
    { name: "寅午戌三合火局", branches: ["寅", "午", "戌"], targetWuxing: "火" },
    { name: "巳酉丑三合金局", branches: ["巳", "酉", "丑"], targetWuxing: "金" },
  ];

  SAN_HE_CONFIGS.forEach((cfg) => {
    const present = cfg.branches.filter((b) => allBranchesInHex.includes(b) || b === ganzhi.riChen || b === ganzhi.yueJian);
    if (present.length >= 2) {
      const isComplete = present.length === 3;
      sanHeJuList.push({
        name: cfg.name + (isComplete ? "（局成）" : "（半合局）"),
        branches: present,
        targetWuxing: cfg.targetWuxing,
        linesInvolved: present.join("、"),
        effect: isComplete
          ? `三合${cfg.targetWuxing}局圓滿，聚眾合力，大幅加強【${cfg.targetWuxing}】五行氣勢！`
          : `得【${present.join("、")}】半合${cfg.targetWuxing}局，有聚力成事之意。`,
      });
    }
  });

  // San Xing scan
  const branchesSet = new Set(allBranchesInHex);
  if (branchesSet.has("寅") && branchesSet.has("巳") && branchesSet.has("申")) {
    sanXingList.push({
      type: "恃勢之刑",
      pair: "寅、巳、申俱備",
      desc: "犯恃勢之刑。主依仗權勢爭端、官非是非、防暗箭相傷。",
    });
  }
  if (branchesSet.has("丑") && branchesSet.has("戌") && branchesSet.has("未")) {
    sanXingList.push({
      type: "無恩之刑",
      pair: "丑、戌、未俱備",
      desc: "犯無恩之刑。主恩將仇報、骨肉朋友反目、小人相爭。",
    });
  }
  if (branchesSet.has("子") && branchesSet.has("卯")) {
    sanXingList.push({
      type: "無禮之刑",
      pair: "子、卯相見",
      desc: "犯無禮之刑。主禮法不周、風流男女糾紛、名譽受損。",
    });
  }

  // Liu Hai scan
  const LIU_HAI_PAIRS: Record<EarthlyBranch, EarthlyBranch> = {
    子: "未", 未: "子",
    丑: "午", 午: "丑",
    寅: "巳", 巳: "寅",
    卯: "辰", 辰: "卯",
    申: "亥", 亥: "申",
    酉: "戌", 戌: "酉",
  };

  for (let i = 0; i < lines.length; i++) {
    for (let j = i + 1; j < lines.length; j++) {
      const b1 = lines[i].originalBranch;
      const b2 = lines[j].originalBranch;
      if (LIU_HAI_PAIRS[b1] === b2) {
        liuHaiList.push({
          pair: `${lines[i].name}(${b1}) 與 ${lines[j].name}(${b2})`,
          desc: `犯六害相穿（${b1}${b2}相害），主暗中妨害、嫉妒阻隔、不易防備。`,
        });
      }
    }
  }

  const layer12HeChongXingHai: Layer12HeChongXingHaiAnalysis = {
    sixHeList,
    sixChongList,
    sanHeJuList,
    sanXingList,
    liuHaiList,
    classicalQuote: "《卜筮正宗》曰：「合者事之所聚，沖者事之所散；刑者防傷防訟，害者暗箭相穿。神機全在合沖刑害之間。」",
    summary: `全卦神機：六合 ${sixHeList.length} 組、六沖 ${sixChongList.length} 組、三合局 ${
      sanHeJuList.length ? sanHeJuList[0].name : "無"
    }、相刑 ${sanXingList.length ? sanXingList[0].type : "無"}、相害 ${liuHaiList.length} 處。`,
  };

  // 13. 旬空 (Xun Kong)
  const xunName = getXunNameFromBranches(ganzhi.xunKong);
  const kongLines = lines
    .filter((l) => l.isXunKong)
    .map((l) => {
      const isTrueKong = l.wangXiang === "死" && !l.isMoving && l.dayRelation !== "得日辰生" && l.dayRelation !== "臨日辰";
      let kongTypeDesc = "假空（動不為空、旺相不為空）";
      if (isTrueKong) {
        kongTypeDesc = "真空（休囚無氣、靜無生扶，到底為空）";
      } else if (l.dayChongType === "沖空") {
        kongTypeDesc = "沖空（逢日辰相沖，沖空則實有用）";
      } else if (l.isMoving) {
        kongTypeDesc = "動空（動不為空，事後必應）";
      } else if (l.wangXiang === "旺" || l.wangXiang === "相") {
        kongTypeDesc = "旺相空（得時得令，過旬出空即發）";
      }

      return {
        lineIndex: l.index,
        name: l.name,
        relative: l.originalRelative,
        branch: l.originalBranch,
        isTrueKong,
        kongTypeDesc,
        outKongDate: `出旬填實之【${l.originalBranch}】日/月，或逢沖【${BRANCH_CHONG[l.originalBranch]}】之日`,
      };
    });

  const layer13XunKong: Layer13XunKongAnalysis = {
    xunKongBranches: ganzhi.xunKong,
    xunName,
    kongLines,
    classicalQuote: "《增刪卜易·旬空章》曰：「旺不為空，動不為空，有日辰生扶者不為空。惟休囚無氣受剋者為真空，真空到底無成也。」",
    summary:
      kongLines.length === 0
        ? `當前值【${xunName}】，六爻皆無落空，事態實在無欺、進展真確。`
        : `落空爻位：${kongLines.map((k) => `${k.name}（${k.branch}空亡·${k.kongTypeDesc}）`).join("、")}。`,
  };

  // 14. 應期 (Ying Qi)
  const rulesApplied: Layer14YingQiAnalysis["rulesApplied"] = [];
  const targetBranch = layer3YongShen.branch || "子";

  if (layer3YongShen.isXunKong) {
    rulesApplied.push({
      condition: `用神逢旬空【${targetBranch}】`,
      prediction: `出旬值【${targetBranch}】日/月，或逢沖【${BRANCH_CHONG[targetBranch]}】之日時應事。`,
      classicalSource: "《增刪卜易》：用神旬空，出空填實之日應事；或逢沖空之日應事。",
    });
  } else if (layer3YongShen.isMonthPo) {
    rulesApplied.push({
      condition: `用神逢月破【${targetBranch}】`,
      prediction: `出月交節後，或逢合【${BRANCH_HE[targetBranch]}】、值日【${targetBranch}】填實之日時應事。`,
      classicalSource: "《卜筮正宗》：用神月破，出月填實或逢合之日應事。",
    });
  } else if (layer3YongShen.isMoving) {
    rulesApplied.push({
      condition: `用神發動【${targetBranch}】`,
      prediction: `用神逢值【${targetBranch}】日，或逢六合【${BRANCH_HE[targetBranch]}】之日應事。`,
      classicalSource: "《增刪卜易》：動而逢值逢合為應期。",
    });
  } else {
    rulesApplied.push({
      condition: `用神安靜【${targetBranch}】旺相`,
      prediction: `逢沖【${BRANCH_CHONG[targetBranch]}】沖動之日，或逢值【${targetBranch}】之日時應事。`,
      classicalSource: "《增刪卜易》：靜而逢值逢沖為應期。",
    });
  }

  // Check Yuan Shen moving rule
  if (layer4YuanShen.movingIndices.length > 0) {
    const yuanBranch = layer4YuanShen.details[0]?.branch || "寅";
    rulesApplied.push({
      condition: `原神【${layer4YuanShen.category}】發動`,
      prediction: `原神逢值【${yuanBranch}】日或生用神之期吉慶發作。`,
      classicalSource: "《黃金策》：原神發動，待原神逢值逢合之日應吉。",
    });
  }

  // Check Fu Shen emerged rule
  if (isMissingInOriginal && fuShenInfo) {
    rulesApplied.push({
      condition: `用神伏藏【${fuShenInfo.branch}】`,
      prediction: `伏神透出之【${fuShenInfo.branch}】日，或沖去飛神之日應事。`,
      classicalSource: "《卜筮正宗》：伏神透出或沖飛之期為應期。",
    });
  }

  const primaryYingQi = rulesApplied[0]?.prediction || `值【${targetBranch}】日或逢合【${BRANCH_HE[targetBranch]}】日應驗。`;

  const layer14YingQi: Layer14YingQiAnalysis = {
    primaryYingQi,
    rulesApplied,
    timeUnitEstimates: {
      dayTerm: primaryYingQi,
      monthTerm: `逢【${targetBranch}】月或【${BRANCH_HE[targetBranch]}】月建令`,
      hourTerm: `逢【${targetBranch}】時或【${BRANCH_HE[targetBranch]}】時辰觸發`,
    },
    summary: `斷應期核心推演：${rulesApplied.map((r) => r.condition + " → " + r.prediction).join("；")}`,
  };

  return {
    layer1Shi,
    layer2Ying,
    layer3YongShen,
    layer4YuanShen,
    layer5JiShen,
    layer6FuShen,
    layer7FeiShen,
    layer8YueJian,
    layer9RiChen,
    layer10DongYao,
    layer11BianYao,
    layer12HeChongXingHai,
    layer13XunKong,
    layer14YingQi,
  };
};

// Main function: Calculate complete Liu Yao Divination result
export const calculateLiuYaoDivination = (
  querent: string,
  question: string,
  remainders: YaoRemainder[], // [初爻, 二爻, 三爻, 四爻, 五爻, 上爻]
  ganzhi: GanzhiResult,
  customYongShen?: SixRelative,
  numberGuaInfo?: NumberGuaResult
): DivinationResult => {
  if (remainders.length !== 6) {
    throw new Error("Must provide exactly 6 remainders for all six lines (初爻至上爻)");
  }

  // 1. Build original binary and changed binary
  // 6: 老陰 (yin, changes to yang)
  // 7: 少陽 (yang, stays yang)
  // 8: 少陰 (yin, stays yin)
  // 9: 老陽 (yang, changes to yin)
  const origBits = remainders.map((r) => (r === 7 || r === 9 ? "1" : "0")).join("");
  const changedBits = remainders.map((r) => {
    if (r === 6) return "1"; // 老陰變少陽
    if (r === 9) return "0"; // 老陽變少陰
    return r === 7 ? "1" : "0";
  }).join("");

  const originalHexagram = findHexagramByBinary(origBits);
  const hasMovingYao = remainders.some((r) => r === 6 || r === 9);
  const movingCount = remainders.filter((r) => r === 6 || r === 9).length;

  let changedHexagram: HexagramData | undefined = undefined;
  if (hasMovingYao) {
    changedHexagram = findHexagramByBinary(changedBits);
  }

  // 2. NaJia for Primary Hexagram
  const origNajia = getHexagramLinesNaJia(originalHexagram);

  // 3. NaJia for Changed Hexagram (if moving)
  let changedNajia: ReturnType<typeof getHexagramLinesNaJia> | undefined = undefined;
  if (changedHexagram) {
    changedNajia = getHexagramLinesNaJia(changedHexagram);
  }

  // 4. Six Spirits from Day Stem
  const sixSpirits = getSixSpirits(ganzhi.riGan);

  // 5. Check Missing Relatives in Primary Hexagram
  const allSixRelatives: SixRelative[] = ["父母", "子孫", "官鬼", "妻財", "兄弟"];
  const existingRelatives = new Set(origNajia.relatives);
  const missingRelatives = allSixRelatives.filter((r) => !existingRelatives.has(r));

  // 6. Look up Pure Palace Hexagram (本宮純卦) for Hidden Spirits (伏神)
  const purePalaceHex = getPureHexagramOfPalace(originalHexagram.palace);
  const pureNajia = getHexagramLinesNaJia(purePalaceHex);

  // 7. Yong Shen determination
  const yongShenCategory = customYongShen || guessYongShenFromQuestion(question);

  // 8. Build detailed Yao Lines array (0 = 初爻, 5 = 上爻)
  const lines: YaoLineDetail[] = [];

  for (let i = 0; i < 6; i++) {
    const lineIndex = i + 1; // 1 to 6
    const rem = remainders[i];
    const isMoving = rem === 6 || rem === 9;
    const yinYang: 0 | 1 = rem === 7 || rem === 9 ? 1 : 0;
    const symbolStr = yinYang === 1 ? "▅▅▅▅▅" : "▅▅　▅▅";
    const movingMark = rem === 9 ? "◯ (老陽發動)" : rem === 6 ? "✕ (老陰發動)" : "";

    // Standard Yao line name (e.g. 初九, 初六, 九二, 六二, 九三, 六三...)
    const lineName = getYaoLineName(lineIndex, yinYang);

    const origStem = origNajia.stems[i];
    const origBranch = origNajia.branches[i];
    const origWuxing = origNajia.wuxings[i];
    const origRelative = origNajia.relatives[i];

    const isShi = originalHexagram.shiYao === lineIndex;
    const isYing = originalHexagram.yingYao === lineIndex;
    const isYongShen = origRelative === yongShenCategory;

    // 1. Wang / Xiang / Xiu / Qiu / Si based on Month (月令旺衰)
    const { level: wangXiang, desc: wangXiangDescription } = calculateWangXiang(origBranch, ganzhi.yueJian);

    // 2. Month Po (月破)
    const { isMonthPo, desc: monthPoDescription } = checkMonthPo(origBranch, ganzhi.yueJian);

    // 3. XunKong (旬空)
    const isXunKong = ganzhi.xunKong.includes(origBranch);

    // 4. Day relation & Day Chong (日辰生剋合沖、暗動、日破、沖動、沖空)
    const {
      isDayChong,
      dayChongType,
      dayChongDesc: dayChongDescription,
      dayRelation,
      dayRelationDesc: dayRelationDescription,
    } = calculateDayRelationAndChong(origBranch, ganzhi.riChen, isMoving, wangXiang, isXunKong);

    // 5. Build Status Tags array for visual badge displays
    const statusTags: string[] = [];
    statusTags.push(`月令${wangXiang}`);
    if (isMonthPo) statusTags.push("月破");
    if (isXunKong) statusTags.push("旬空");
    if (dayRelation === "臨日辰") statusTags.push("臨日辰");
    if (dayRelation === "日辰六合") statusTags.push("日合");
    if (dayRelation === "日建同旺") statusTags.push("日辰比和");
    if (dayRelation === "得日辰生") statusTags.push("日辰生");
    if (dayRelation === "受日辰剋") statusTags.push("日辰剋");
    if (dayChongType) statusTags.push(dayChongType);

    // Changed Yao details
    let changedYinYang: (0 | 1) | undefined = undefined;
    let changedSymbolStr: string | undefined = undefined;
    let changedStem: HeavenlyStem | undefined = undefined;
    let changedBranch: EarthlyBranch | undefined = undefined;
    let changedWuxing: Wuxing | undefined = undefined;
    let changedRelative: SixRelative | undefined = undefined;
    let isChangedShi: boolean | undefined = undefined;
    let isChangedYing: boolean | undefined = undefined;
    let changedLineName: string | undefined = undefined;
    let changedYaoCi: string | undefined = undefined;
    let changeDynamics: string | undefined = undefined;
    let dongBianDetail: DongBianDetail | undefined = undefined;

    if (changedHexagram && changedNajia) {
      changedYinYang = isMoving ? (rem === 6 ? 1 : 0) : yinYang;
      changedSymbolStr = changedYinYang === 1 ? "▅▅▅▅▅" : "▅▅　▅▅";
      changedStem = changedNajia.stems[i];
      changedBranch = changedNajia.branches[i];
      changedWuxing = changedNajia.wuxings[i];
      // Changed relative is calculated against the original Hexagram's palace Wuxing in standard Wen Wang Gua!
      changedRelative = getSixRelative(originalHexagram.palaceWuxing, changedWuxing);
      isChangedShi = changedHexagram.shiYao === lineIndex;
      isChangedYing = changedHexagram.yingYao === lineIndex;
      changedLineName = getYaoLineName(lineIndex, changedYinYang);
      changedYaoCi = changedHexagram.yaoCi[i];

      if (isMoving) {
        const isChangedXunKong = ganzhi.xunKong.includes(changedBranch);
        dongBianDetail = calculateDongBianDetail(origBranch, origWuxing, changedBranch, changedWuxing, isChangedXunKong);
        changeDynamics = dongBianDetail.title;
      }
    }

    // Fushen (Hidden Spirit) on this line from Pure Palace Hexagram
    const pureRel = pureNajia.relatives[i];
    const pureStem = pureNajia.stems[i];
    const pureBranch = pureNajia.branches[i];
    const pureWuxing = pureNajia.wuxings[i];

    // Compute relation between Fushen (pure) and Feishen (original)
    let relationWithFeishen: FushenInfo["relationWithFeishen"] = "比和";
    let relationDesc = "";
    if (pureWuxing === origWuxing) {
      relationWithFeishen = "比和";
      relationDesc = "飛伏同氣，比和相助";
    } else if (WUXING_RELATIONS[pureWuxing].generates === origWuxing) {
      relationWithFeishen = "伏生飛";
      relationDesc = "伏生飛神，伏神洩氣，難以全力發揮";
    } else if (WUXING_RELATIONS[origWuxing].generates === pureWuxing) {
      relationWithFeishen = "飛生伏";
      relationDesc = "飛神生伏神，名為長生得助，極易透出有用";
    } else if (WUXING_RELATIONS[pureWuxing].restricts === origWuxing) {
      relationWithFeishen = "伏剋飛";
      relationDesc = "伏神剋飛神，名為出暴，伏神有勢可破關而出";
    } else if (WUXING_RELATIONS[origWuxing].restricts === pureWuxing) {
      relationWithFeishen = "飛剋伏";
      relationDesc = "飛神剋伏神，名為受制，受飛神壓迫，凶困難出";
    }

    // Check if Fushen is emerged (出伏/透出條件與精確生剋說明)
    const { isEmerged, emergedReason } = analyzeFushenStatus(
      pureBranch,
      pureWuxing,
      origBranch,
      origWuxing,
      relationWithFeishen,
      ganzhi
    );

    const isMissingInOriginal = missingRelatives.includes(pureRel);

    const fushen: FushenInfo = {
      relative: pureRel,
      stem: pureStem,
      branch: pureBranch,
      wuxing: pureWuxing,
      pureHexagramName: purePalaceHex.name,
      lineIndex,
      relationWithFeishen,
      relationDesc,
      isMissingInOriginal,
      isEmerged,
      emergedReason,
    };

    lines.push({
      index: lineIndex,
      name: lineName,
      remainder: rem,
      isMoving,
      yinYang,
      symbolStr,
      movingMark,
      originalStem: origStem,
      originalBranch: origBranch,
      originalWuxing: origWuxing,
      originalRelative: origRelative,
      changedYinYang,
      changedSymbolStr,
      changedStem,
      changedBranch,
      changedWuxing,
      changedRelative,
      isChangedShi,
      isChangedYing,
      changedLineName,
      changedYaoCi,
      sixSpirit: sixSpirits[i],
      isShi,
      isYing,
      isYongShen,
      wangXiang,
      wangXiangDescription,
      isMonthPo,
      monthPoDescription,
      isDayChong,
      dayChongType,
      dayChongDescription,
      dayRelation,
      dayRelationDescription,
      isXunKong,
      statusTags,
      changeDynamics,
      dongBianDetail,
      yaoCi: originalHexagram.yaoCi[i],
      fushen,
    });
  }

  // Summary and Auspiciousness evaluation
  const sixHeSixChong = checkHexagramCategory(originalHexagram);
  const changedSixHeSixChong = changedHexagram ? checkHexagramCategory(changedHexagram) : undefined;

  let overallAuspiciousness = "平穩相濟";
  if (sixHeSixChong.includes("六合")) {
    overallAuspiciousness = "諸事和合 · 吉星高照";
  } else if (sixHeSixChong.includes("六沖")) {
    overallAuspiciousness = "動盪多變 · 宜守不宜急";
  } else if (originalHexagram.palaceTypeName === "遊魂卦") {
    overallAuspiciousness = "心無定見 · 行事猶豫";
  } else if (originalHexagram.palaceTypeName === "歸魂卦") {
    overallAuspiciousness = "事歸本位 · 宜定心守成";
  }

  // 14-Layer Classical Liu Yao Analytical Hierarchy
  const layeredAnalysis = calculateLiuYaoLayeredAnalysis(
    lines,
    ganzhi,
    originalHexagram,
    changedHexagram,
    yongShenCategory,
    missingRelatives
  );

  const finalResult: LiuYaoResult = {
    id: `div_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    querent,
    question,
    yongShenCategory,
    date: ganzhi.date,
    dateTimeStr: ganzhi.dateTimeStr,
    solarTermStr: ganzhi.solarTermStr,
    ganzhiYear: ganzhi.ganzhiYear,
    ganzhiMonth: ganzhi.ganzhiMonth,
    ganzhiDay: ganzhi.ganzhiDay,
    ganzhiHour: ganzhi.ganzhiHour,
    yueJian: ganzhi.yueJian,
    yueJianWuxing: ganzhi.yueJianWuxing,
    riChen: ganzhi.riChen,
    riChenWuxing: ganzhi.riChenWuxing,
    riGan: ganzhi.riGan,
    xunKong: ganzhi.xunKong,
    dayLu: ganzhi.dayLu,
    dayGuiRen: ganzhi.dayGuiRen,
    yiMa: ganzhi.yiMa,
    taoHua: ganzhi.taoHua,
    remainders,
    originalHexagram,
    changedHexagram,
    hasMovingYao,
    movingCount,
    lines,
    missingRelatives,
    overallAuspiciousness,
    sixHeSixChong,
    changedSixHeSixChong,
    createdAt: Date.now(),
    numberGuaInfo,
    layeredAnalysis,
  };

  // Automatically derive upcoming key YingQi days for the next 30 days
  try {
    const yingQiData = calculateUpcomingYingQiKeyDays(finalResult, 30);
    layeredAnalysis.layer14YingQi.keyDays = yingQiData.keyDays;
    layeredAnalysis.layer14YingQi.branchMatrix = yingQiData.branchMatrix;
    layeredAnalysis.layer14YingQi.executiveSummary = yingQiData.executiveSummary;
  } catch (err) {
    console.error("Failed to compute YingQi key days:", err);
  }

  return finalResult;
};
