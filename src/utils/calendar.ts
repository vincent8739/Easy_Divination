import { Solar, Lunar } from "lunar-javascript";
import { EarthlyBranch, HeavenlyStem, Wuxing } from "../types/liuyao";

export const BRANCH_WUXING: Record<EarthlyBranch, Wuxing> = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};

export const STEM_WUXING: Record<HeavenlyStem, Wuxing> = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

// 旬空對照 (甲子旬戌亥空, 甲戌旬申酉空, 甲申旬午未空, 甲午旬辰巳空, 甲辰旬寅卯空, 甲寅旬子丑空)
export const calculateXunKong = (dayStem: HeavenlyStem, dayBranch: EarthlyBranch): string => {
  const stems: HeavenlyStem[] = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const branches: EarthlyBranch[] = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

  const sIdx = stems.indexOf(dayStem);
  const bIdx = branches.indexOf(dayBranch);

  // The leader of the 10-day cycle (旬首) branch index = (bIdx - sIdx + 12) % 12
  const xunShouBranchIdx = (bIdx - sIdx + 12) % 12;
  // The two void branches are at (xunShouBranchIdx + 10) % 12 and (xunShouBranchIdx + 11) % 12
  const void1 = branches[(xunShouBranchIdx + 10) % 12];
  const void2 = branches[(xunShouBranchIdx + 11) % 12];

  return `${void1}${void2}空`;
};

// 日祿 (甲祿在寅, 乙祿在卯, 丙戊在巳, 丁己在午, 庚祿在申, 辛祿在酉, 壬祿在亥, 癸祿在子)
export const calculateDayLu = (dayStem: HeavenlyStem): string => {
  const luMap: Record<HeavenlyStem, string> = {
    甲: "寅",
    乙: "卯",
    丙: "巳",
    丁: "午",
    戊: "巳",
    己: "午",
    庚: "申",
    辛: "酉",
    壬: "亥",
    癸: "子",
  };
  return luMap[dayStem] || "無";
};

// 天乙貴人 (甲戊見牛羊，乙己鼠猴鄉，丙丁豬雞位，壬癸兔蛇藏，庚辛逢虎馬)
export const calculateDayGuiRen = (dayStem: HeavenlyStem): string => {
  const guiMap: Record<HeavenlyStem, string> = {
    甲: "丑未",
    戊: "丑未",
    乙: "子申",
    己: "子申",
    丙: "亥酉",
    丁: "亥酉",
    壬: "卯巳",
    癸: "卯巳",
    庚: "寅午",
    辛: "寅午",
  };
  return guiMap[dayStem] || "無";
};

// 驛馬 (申子辰馬在寅，寅午戌馬在申，巳酉丑馬在亥，亥卯未馬在巳)
export const calculateYiMa = (dayBranch: EarthlyBranch): string => {
  if (["申", "子", "辰"].includes(dayBranch)) return "寅";
  if (["寅", "午", "戌"].includes(dayBranch)) return "申";
  if (["巳", "酉", "丑"].includes(dayBranch)) return "亥";
  if (["亥", "卯", "未"].includes(dayBranch)) return "巳";
  return "無";
};

// 桃花 (申子辰見酉，寅午戌見卯，巳酉丑見午，亥卯未見子)
export const calculateTaoHua = (dayBranch: EarthlyBranch): string => {
  if (["申", "子", "辰"].includes(dayBranch)) return "酉";
  if (["寅", "午", "戌"].includes(dayBranch)) return "卯";
  if (["巳", "酉", "丑"].includes(dayBranch)) return "午";
  if (["亥", "卯", "未"].includes(dayBranch)) return "子";
  return "無";
};

export interface GanzhiResult {
  date: Date;
  dateTimeStr: string;
  solarTermStr: string;
  ganzhiYear: string;
  ganzhiMonth: string;
  ganzhiDay: string;
  ganzhiHour: string;
  yueJian: EarthlyBranch;
  yueJianWuxing: Wuxing;
  riChen: EarthlyBranch;
  riChenWuxing: Wuxing;
  riGan: HeavenlyStem;
  xunKong: string;
  dayLu: string;
  dayGuiRen: string;
  yiMa: string;
  taoHua: string;
}

export const getGanzhiFromDate = (date: Date): GanzhiResult => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  const solar = Solar.fromYmdHms(year, month, day, hour, minute, second);
  const lunar = solar.getLunar();

  const ganzhiYear = lunar.getYearInGanZhiExact() || lunar.getYearInGanZhi();
  const ganzhiMonth = lunar.getMonthInGanZhiExact() || lunar.getMonthInGanZhi();
  const ganzhiDay = lunar.getDayInGanZhiExact() || lunar.getDayInGanZhi();
  const ganzhiHour = lunar.getTimeInGanZhi();

  const riGan = ganzhiDay.charAt(0) as HeavenlyStem;
  const riChen = ganzhiDay.charAt(1) as EarthlyBranch;
  const yueJian = ganzhiMonth.charAt(1) as EarthlyBranch;

  const yueJianWuxing = BRANCH_WUXING[yueJian] || "土";
  const riChenWuxing = BRANCH_WUXING[riChen] || "土";

  const xunKong = calculateXunKong(riGan, riChen);
  const dayLu = calculateDayLu(riGan);
  const dayGuiRen = calculateDayGuiRen(riGan);
  const yiMa = calculateYiMa(riChen);
  const taoHua = calculateTaoHua(riChen);

  // Solar Term info
  const prevJie = lunar.getPrevJieQi();
  const nextJie = lunar.getNextJieQi();
  const solarTermStr = `${prevJie?.getName() || ""}氣後 · ${nextJie?.getName() || ""}前`;

  const pad = (n: number) => n.toString().padStart(2, "0");
  const dateTimeStr = `${year}年${pad(month)}月${pad(day)}日 ${pad(hour)}時${pad(minute)}分`;

  return {
    date,
    dateTimeStr,
    solarTermStr,
    ganzhiYear,
    ganzhiMonth,
    ganzhiDay,
    ganzhiHour,
    yueJian,
    yueJianWuxing,
    riChen,
    riChenWuxing,
    riGan,
    xunKong,
    dayLu,
    dayGuiRen,
    yiMa,
    taoHua,
  };
};
