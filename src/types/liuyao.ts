export type Wuxing = "金" | "木" | "水" | "火" | "土";

export type HeavenlyStem = "甲" | "乙" | "丙" | "丁" | "戊" | "己" | "庚" | "辛" | "壬" | "癸";
export type EarthlyBranch = "子" | "丑" | "寅" | "卯" | "辰" | "巳" | "午" | "未" | "申" | "酉" | "戌" | "亥";

export type SixRelative = "父母" | "子孫" | "官鬼" | "妻財" | "兄弟";
export type SixSpirit = "青龍" | "朱雀" | "勾陳" | "螣蛇" | "白虎" | "玄武";

export type YaoRemainder = 6 | 7 | 8 | 9;

export type PalaceName = "乾" | "坎" | "艮" | "震" | "巽" | "離" | "坤" | "兌";

export interface TrigramInfo {
  name: PalaceName;
  symbol: string;
  wuxing: Wuxing;
  binary: string; // 3 bits, e.g. "111" for Qian, "000" for Kun (bottom to top)
  nature: string;
  number: number;
}

export interface HexagramData {
  id: number;
  name: string;
  upperTrigram: PalaceName;
  lowerTrigram: PalaceName;
  binary: string; // 6 bits from bottom to top (bit 0 = 初爻, bit 5 = 上爻)
  palace: PalaceName;
  palaceWuxing: Wuxing;
  orderInPalace: number; // 1: 本宮/純卦, 2: 一世, 3: 二世, 4: 三世, 5: 四世, 6: 五世, 7: 遊魂, 8: 歸魂
  palaceTypeName: string; // "本宮卦", "一世卦", "二世卦", "三世卦", "四世卦", "五世卦", "遊魂卦", "歸魂卦"
  shiYao: number; // 1-6
  yingYao: number; // 1-6
  guaCi: string;
  tuanCi: string;
  xiangCi: string;
  yaoCi: string[]; // 6 strings from 初爻 to 上爻
}

export type WangXiangLevel = "旺" | "相" | "休" | "囚" | "死";

export interface DongBianDetail {
  type:
    | "回頭生"
    | "回頭剋"
    | "化進神"
    | "化退神"
    | "化絕"
    | "化墓"
    | "化空"
    | "化合"
    | "化反吟"
    | "化伏吟"
    | "動生變"
    | "動剋變"
    | "比和";
  title: string;
  summary: string;
  detail: string;
  auspiciousness: "大吉" | "吉" | "平" | "凶" | "大凶" | "變數";
}

export interface FushenInfo {
  relative: SixRelative;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  wuxing: Wuxing;
  pureHexagramName: string;
  lineIndex: number; // 1-6
  relationWithFeishen: "伏生飛" | "飛生伏" | "伏剋飛" | "飛剋伏" | "比和";
  relationDesc: string;
  isMissingInOriginal: boolean; // 是否為本卦所缺之六親
  isEmerged: boolean; // 伏神是否旺相/透出/得日建月建動爻生扶
  emergedReason: string;
}

export interface YaoLineDetail {
  index: number; // 1 = 初爻, 6 = 上爻
  name: string; // 初九, 初六, 六二, 九二, 六三, 九三, etc.
  remainder: YaoRemainder;
  isMoving: boolean;
  yinYang: 0 | 1; // 0 = 陰, 1 = 陽
  symbolStr: string; // "▅▅▅▅▅" or "▅▅　▅▅"
  movingMark: string; // "◯" for 9, "✕" for 6, "" for 7/8
  
  // NaJia in Primary Hexagram
  originalStem: HeavenlyStem;
  originalBranch: EarthlyBranch;
  originalWuxing: Wuxing;
  originalRelative: SixRelative;
  
  // NaJia in Changed Hexagram (if changed)
  changedYinYang?: 0 | 1;
  changedSymbolStr?: string;
  changedStem?: HeavenlyStem;
  changedBranch?: EarthlyBranch;
  changedWuxing?: Wuxing;
  changedRelative?: SixRelative;
  isChangedShi?: boolean;
  isChangedYing?: boolean;
  changedLineName?: string;
  changedYaoCi?: string;
  
  // Six Spirit
  sixSpirit: SixSpirit;
  
  // Shi & Ying
  isShi: boolean;
  isYing: boolean;
  
  // Yong Shen tag
  isYongShen: boolean;
  
  // 月令旺衰 (旺、相、休、囚、死)
  wangXiang: WangXiangLevel;
  wangXiangDescription: string;

  // 月破 (Month Po)
  isMonthPo: boolean;
  monthPoDescription?: string;

  // 日沖與日動態 (暗動、日破、日沖動、沖空)
  isDayChong: boolean;
  dayChongType?: "暗動" | "日破" | "日沖動" | "沖空";
  dayChongDescription?: string;

  // 日辰關係 (臨日辰、日建同旺、得日生、受日剋、生助日辰、日合、日平)
  dayRelation: "臨日辰" | "日建同旺" | "得日辰生" | "受日辰剋" | "生助日辰" | "日辰六合" | "日平";
  dayRelationDescription: string;

  // 旬空
  isXunKong: boolean;

  // Wang Xiang & Shensha status tags (Combined for display badges)
  statusTags: string[];
  
  // 動變生剋 (化進神, 化退神, 化回頭生, 化回頭剋, 化空, 化墓, etc.)
  changeDynamics?: string;
  dongBianDetail?: DongBianDetail;
  
  // YaoCi
  yaoCi: string;
  
  // Corresponding Fushen
  fushen?: FushenInfo;
}

export interface DivinationResult {
  id: string;
  querent: string;
  question: string;
  yongShenCategory: SixRelative;
  
  // Time & Ganzhi
  date: Date;
  dateTimeStr: string;
  solarTermStr: string;
  ganzhiYear: string;
  ganzhiMonth: string;
  ganzhiDay: string;
  ganzhiHour: string;
  
  // Liu Yao Key Parameters
  yueJian: EarthlyBranch; // 月建
  yueJianWuxing: Wuxing;
  riChen: EarthlyBranch; // 日辰
  riChenWuxing: Wuxing;
  riGan: HeavenlyStem;
  xunKong: string; // 旬空
  dayLu: string; // 日祿
  dayGuiRen: string; // 天乙貴人
  yiMa: string; // 驛馬
  taoHua: string; // 桃花
  
  // Hexagrams
  remainders: YaoRemainder[]; // [初爻, 二爻, 三爻, 四爻, 五爻, 上爻]
  originalHexagram: HexagramData;
  changedHexagram?: HexagramData;
  hasMovingYao: boolean;
  movingCount: number;
  
  // Detailed Lines
  lines: YaoLineDetail[]; // Length 6, from 初爻 (index 0) to 上爻 (index 5)
  
  // Missing Six Relatives in Primary Hexagram
  missingRelatives: SixRelative[];
  
  // Summary & Classical Evaluation
  overallAuspiciousness: string;
  sixHeSixChong?: string; // 六合卦、六沖卦、遊魂卦、歸魂卦
  changedSixHeSixChong?: string; // 變卦之六合、六沖、遊魂、歸魂
  aiInterpretation?: string;
  createdAt: number;

  // Number Divination derivation (if generated from three 3-digit numbers)
  numberGuaInfo?: NumberGuaResult;

  // Traditional 14-Layer Analytical Hierarchy
  layeredAnalysis?: LiuYaoLayeredAnalysis;
}

export interface NumberGuaResult {
  num1: number;
  num2: number;
  num3: number;
  upperRemainder: number;
  upperTrigram: PalaceName;
  upperTrigramSymbol: string;
  lowerRemainder: number;
  lowerTrigram: PalaceName;
  lowerTrigramSymbol: string;
  movingRemainder: number;
  movingYaoIndex: number;
  movingYaoName: string;
  remainders: YaoRemainder[];
  originalHexagramName: string;
  changedHexagramName: string;
}

export type LiuYaoResult = DivinationResult;

// ----------------------------------------------------
// 傳統六爻 14 層逐層推演全鑑型別系統
// ----------------------------------------------------

export interface Layer1ShiAnalysis {
  lineIndex: number;
  name: string;
  relative: SixRelative;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  wuxing: Wuxing;
  sixSpirit: SixSpirit;
  wangXiang: WangXiangLevel;
  dayRelation: string;
  isMoving: boolean;
  isMonthPo: boolean;
  isDayChong: boolean;
  isXunKong: boolean;
  dongBianSummary?: string;
  meaning: string;
  classicalQuote: string;
  evaluation: string;
}

export interface Layer2YingAnalysis {
  lineIndex: number;
  name: string;
  relative: SixRelative;
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  wuxing: Wuxing;
  sixSpirit: SixSpirit;
  wangXiang: WangXiangLevel;
  relationWithShi: "應生世" | "應剋世" | "世生應" | "世剋應" | "世應比和" | "世應相合" | "世應相沖";
  relationWithShiDesc: string;
  meaning: string;
  classicalQuote: string;
  evaluation: string;
}

export interface Layer3YongShenAnalysis {
  category: SixRelative;
  lineIndices: number[]; // 卦中出現該六親之爻位（可能多現）
  primaryLineIndex: number; // 取定之主用神爻（如無則為伏神爻）
  isMissingInOriginal: boolean; // 是否伏藏不上卦
  fuShenInfo?: FushenInfo;
  stem?: HeavenlyStem;
  branch?: EarthlyBranch;
  wuxing?: Wuxing;
  sixSpirit?: SixSpirit;
  wangXiang?: WangXiangLevel;
  dayRelation?: string;
  isMoving?: boolean;
  isMonthPo?: boolean;
  isDayChong?: boolean;
  isXunKong?: boolean;
  powerScore: number; // 0-100 力量評分
  statusDescription: string;
  classicalQuote: string;
  selectionReason: string;
  summary: string;
}

export interface Layer4YuanShenAnalysis {
  category: SixRelative; // 生用神之六親
  wuxing: Wuxing;
  existInOriginal: boolean;
  lineIndices: number[];
  movingIndices: number[];
  details: Array<{
    lineIndex: number;
    name: string;
    branch: EarthlyBranch;
    wuxing: Wuxing;
    sixSpirit: SixSpirit;
    wangXiang: WangXiangLevel;
    isMoving: boolean;
    isMonthPo: boolean;
    isXunKong: boolean;
    effectDesc: string;
  }>;
  status: "旺相發動生用" | "旺相安靜" | "休囚無力" | "受制逢破" | "伏藏不現" | "動化退剋";
  classicalQuote: string;
  summary: string;
}

export interface Layer5JiShenAnalysis {
  category: SixRelative; // 剋用神之六親
  wuxing: Wuxing;
  chouShenCategory: SixRelative; // 仇神（生忌神剋原神）
  existInOriginal: boolean;
  lineIndices: number[];
  movingIndices: number[];
  details: Array<{
    lineIndex: number;
    name: string;
    branch: EarthlyBranch;
    wuxing: Wuxing;
    sixSpirit: SixSpirit;
    wangXiang: WangXiangLevel;
    isMoving: boolean;
    isMonthPo: boolean;
    isXunKong: boolean;
    effectDesc: string;
  }>;
  status: "發動傷用（大凶）" | "旺相暗伏" | "休囚受制（無害）" | "化退回頭剋（轉危為安）" | "不上卦安靜";
  classicalQuote: string;
  threatLevel: "極高" | "中等" | "微弱" | "無威脅";
  summary: string;
}

export interface Layer6FuShenAnalysis {
  fushenList: FushenInfo[];
  yongShenFuShen?: FushenInfo;
  missingRelatives: SixRelative[];
  pureHexagramName: string;
  classicalQuote: string;
  summary: string;
}

export interface Layer7FeiShenAnalysis {
  feiShenList: Array<{
    lineIndex: number;
    lineName: string;
    feiRelative: SixRelative;
    feiBranch: EarthlyBranch;
    feiWuxing: Wuxing;
    fuRelative: SixRelative;
    fuBranch: EarthlyBranch;
    fuWuxing: Wuxing;
    relation: "伏生飛" | "飛生伏" | "伏剋飛" | "飛剋伏" | "比和";
    isFeiKong: boolean;
    isFeiPo: boolean;
    isFeiMoving: boolean;
    impactOnFu: string;
  }>;
  classicalQuote: string;
  summary: string;
}

export interface Layer8YueJianAnalysis {
  yueJian: EarthlyBranch;
  yueJianWuxing: Wuxing;
  ganzhiMonth: string;
  wangDistribution: {
    旺: string[];
    相: string[];
    休: string[];
    囚: string[];
    死: string[];
  };
  monthPoLines: Array<{
    lineIndex: number;
    name: string;
    relative: SixRelative;
    branch: EarthlyBranch;
    desc: string;
  }>;
  classicalQuote: string;
  summary: string;
}

export interface Layer9RiChenAnalysis {
  riChen: EarthlyBranch;
  riChenWuxing: Wuxing;
  riGan: HeavenlyStem;
  ganzhiDay: string;
  riHeLines: Array<{ lineIndex: number; name: string; branch: EarthlyBranch; desc: string }>;
  anDongLines: Array<{ lineIndex: number; name: string; branch: EarthlyBranch; desc: string }>;
  riPoLines: Array<{ lineIndex: number; name: string; branch: EarthlyBranch; desc: string }>;
  riChongDongLines: Array<{ lineIndex: number; name: string; branch: EarthlyBranch; desc: string }>;
  chongKongLines: Array<{ lineIndex: number; name: string; branch: EarthlyBranch; desc: string }>;
  classicalQuote: string;
  summary: string;
}

export interface Layer10DongYaoAnalysis {
  movingLines: Array<{
    lineIndex: number;
    name: string;
    relative: SixRelative;
    branch: EarthlyBranch;
    wuxing: Wuxing;
    sixSpirit: SixSpirit;
    wangXiang: WangXiangLevel;
    dongBianDetail?: DongBianDetail;
    impactOnYong: string;
    impactOnShi: string;
  }>;
  hasMoving: boolean;
  classicalQuote: string;
  summary: string;
}

export interface Layer11BianYaoAnalysis {
  changedHexagramName?: string;
  changedHexagramPalace?: string;
  bianYaoList: Array<{
    lineIndex: number;
    origLineName: string;
    origBranch: EarthlyBranch;
    changedLineName: string;
    changedBranch: EarthlyBranch;
    changedRelative: SixRelative;
    dynamicsType: string;
    dynamicsSummary: string;
    auspiciousness: string;
  }>;
  changedGuaCi?: string;
  classicalQuote: string;
  summary: string;
}

export interface Layer12HeChongXingHaiAnalysis {
  sixHeList: Array<{ type: "爻爻相合" | "爻日六合" | "爻月六合"; pair: string; desc: string }>;
  sixChongList: Array<{ type: "爻爻相沖" | "爻日相沖" | "爻月相沖(月破)"; pair: string; desc: string }>;
  sanHeJuList: Array<{ name: string; branches: string[]; targetWuxing: Wuxing; linesInvolved: string; effect: string }>;
  sanXingList: Array<{ type: "恃勢之刑" | "無恩之刑" | "無禮之刑" | "自刑"; pair: string; desc: string }>;
  liuHaiList: Array<{ pair: string; desc: string }>;
  classicalQuote: string;
  summary: string;
}

export interface Layer13XunKongAnalysis {
  xunKongBranches: string; // e.g. "戌亥"
  xunName: string; // 甲子旬, 甲戌旬...
  kongLines: Array<{
    lineIndex: number;
    name: string;
    relative: SixRelative;
    branch: EarthlyBranch;
    isTrueKong: boolean; // 真空 vs 假空
    kongTypeDesc: string; // 旺不為空、動不為空、受日沖沖空、休囚真空
    outKongDate: string; // 出空應事之期
  }>;
  classicalQuote: string;
  summary: string;
}

export interface YingQiKeyDayRule {
  source: string; // 《增刪卜易》《卜筮正宗》《黃金策》
  principle: string; // 易理原則（如：動而逢值逢合、靜而逢值逢沖、出空填實、逢合解破、變爻回生）
  explanation: string; // 白話詳解與推論依據
}

export interface YingQiRelatedLine {
  index: number; // 爻位 (1-6)
  name: string; // "初九", "六二" 等
  relative: SixRelative; // "官鬼", "妻財" 等
  branch: EarthlyBranch; // "子", "寅" 等
  role: string; // "用神本位", "發動之爻", "變爻化出", "月破之爻", "暗動之爻", "原神發動", "伏神所在"
}

export interface YingQiKeyDay {
  id: string;
  date: Date;
  solarDateStr: string; // "2026年09月12日 (六)"
  lunarDateStr: string; // "八月初二"
  ganzhiDay: string; // "戊申"
  stem: HeavenlyStem;
  branch: EarthlyBranch;
  wuxing: Wuxing;
  daysAway: number; // 距離起卦日天數 (0=當日, 1, 2...)
  priority: "core" | "secondary" | "reference"; // 核心應期 / 重要應期 / 輔助參考
  priorityLabel: string; // "最關鍵核心日" | "重要應期日" | "輔助參考日"
  nature: "auspicious" | "warning" | "turning" | "steady"; // 大吉 / 防阻 / 轉折 / 平順
  natureLabel: string; // "大吉發越" | "防阻避凶" | "轉折變革" | "平順相循"
  category: "yongshen" | "dongbian" | "kongpo" | "hechong" | "yuanshen";
  categoryLabel: string; // "用神應期" | "動變生剋" | "空破解圍" | "合沖開閉" | "原神救助"
  title: string; // "用神【官鬼申金】逢值專權 · 百事成實"
  summaryReason: string; // 綜合生剋合沖判定
  rules: YingQiKeyDayRule[];
  relatedLines: YingQiRelatedLine[];
}

export interface BranchTimingInfo {
  branch: EarthlyBranch;
  wuxing: Wuxing;
  roles: string[];
  isKey: boolean;
  priority: "core" | "secondary" | "reference" | "normal";
  nextDateStr?: string;
  nextGanzhiDay?: string;
  nextDaysAway?: number;
  effectSummary: string;
}

export interface Layer14YingQiAnalysis {
  primaryYingQi: string; // 最核心應期結論
  rulesApplied: Array<{
    condition: string; // 條款依據（例：用神旬空待出旬、用神入墓待逢沖、原神發動待逢值）
    prediction: string; // 具體應事時間
    classicalSource: string; // 《增刪卜易·應期章》
  }>;
  timeUnitEstimates: {
    yearTerm?: string;
    monthTerm?: string;
    dayTerm?: string;
    hourTerm?: string;
  };
  keyDays?: YingQiKeyDay[]; // 自動篩選未來關鍵應期日子列表
  branchMatrix?: BranchTimingInfo[]; // 十二地支全盤易理時空對照表
  executiveSummary?: string; // 應期綜述斷語
  summary: string;
}

export interface LiuYaoLayeredAnalysis {
  layer1Shi: Layer1ShiAnalysis;
  layer2Ying: Layer2YingAnalysis;
  layer3YongShen: Layer3YongShenAnalysis;
  layer4YuanShen: Layer4YuanShenAnalysis;
  layer5JiShen: Layer5JiShenAnalysis;
  layer6FuShen: Layer6FuShenAnalysis;
  layer7FeiShen: Layer7FeiShenAnalysis;
  layer8YueJian: Layer8YueJianAnalysis;
  layer9RiChen: Layer9RiChenAnalysis;
  layer10DongYao: Layer10DongYaoAnalysis;
  layer11BianYao: Layer11BianYaoAnalysis;
  layer12HeChongXingHai: Layer12HeChongXingHaiAnalysis;
  layer13XunKong: Layer13XunKongAnalysis;
  layer14YingQi: Layer14YingQiAnalysis;
}

export interface StalkChangeStep {
  changeIndex: number; // 1, 2, 3
  stalksBefore: number; // e.g. 49, 44, 40
  leftCount: number;
  rightCount: number;
  hangOne: number; // 1
  leftRemainder: number; // 1, 2, 3, 4
  rightRemainder: number; // 1, 2, 3, 4
  totalDiscarded: number; // 5, 9 or 4, 8
  stalksRemaining: number;
}

export interface StalkYaoStep {
  yaoIndex: number; // 1-6
  changes: StalkChangeStep[];
  finalStalks: number; // 36, 32, 28, 24
  remainderValue: YaoRemainder; // 9, 8, 7, 6
  lineNature: string; // "老陽 (九)", "少陰 (八)", "少陽 (七)", "老陰 (六)"
}
