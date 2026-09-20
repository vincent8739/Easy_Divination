import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";
import { DivinationResult, YaoLineDetail } from "../types/liuyao";
import { Activity, BarChart3, HelpCircle, Info, ShieldAlert, Sparkles, Sun, Moon, Zap, Layers } from "lucide-react";

export interface YaoEnergyData {
  index: number;
  name: string;
  lineLabel: string; // e.g. "初爻 父母子水"
  relative: string;
  branch: string;
  wuxing: string;
  isShi: boolean;
  isYing: boolean;
  isYong: boolean;
  isMoving: boolean;
  isMonthPo: boolean;
  isDayChong: boolean;
  dayChongType?: string;
  isXunKong: boolean;
  
  // Breakdown scores
  monthScore: number;
  monthReason: string;
  dayScore: number;
  dayReason: string;
  motionScore: number;
  motionReason: string;
  voidPenalty: number;
  
  // Total Net Energy
  totalEnergy: number;
  energyLevel: "至旺高盛" | "偏旺得力" | "平穩中和" | "偏衰失令" | "極衰破敗";
  energyColor: string;
  classicalSummary: string;
}

interface YaoEnergyChartProps {
  result: DivinationResult;
  selectedLineIndex: number | null;
  onSelectLine?: (index: number | null) => void;
}

export const YaoEnergyChart: React.FC<YaoEnergyChartProps> = ({
  result,
  selectedLineIndex,
  onSelectLine,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [chartMode, setChartMode] = useState<"stacked" | "total" | "radar">("stacked");
  const [filterHighlight, setFilterHighlight] = useState<"all" | "shiying" | "yongshen" | "moving">("all");
  const [hoveredYao, setHoveredYao] = useState<YaoEnergyData | null>(null);

  // Compute energy data for all 6 lines
  const energyDataList: YaoEnergyData[] = useMemo(() => {
    return result.lines.map((line: YaoLineDetail) => {
      // 1. Calculate Month Score
      let monthScore = 0;
      let monthReason = "";

      if (line.originalBranch === result.yueJian) {
        monthScore = 100;
        monthReason = `臨月建【${result.yueJian}】，受月令最上司令同氣相扶，至旺至極 (+100)`;
      } else if (line.isMonthPo) {
        monthScore = -90;
        monthReason = `月破受衝【月建${result.yueJian} 沖剋 ${line.originalBranch}】，元氣被破，逢衝無氣 (-90)`;
      } else {
        switch (line.wangXiang) {
          case "旺":
            monthScore = 80;
            monthReason = `月令當旺（五行比和助旺）(+80)`;
            break;
          case "相":
            monthScore = 55;
            monthReason = `月令生扶（得月建五行之生）(+55)`;
            break;
          case "休":
            monthScore = -15;
            monthReason = `爻生月令，洩耗元神 (-15)`;
            break;
          case "囚":
            monthScore = -40;
            monthReason = `爻剋月令，反受其困 (-40)`;
            break;
          case "死":
            monthScore = -75;
            monthReason = `月令傷剋（受月建五行剋伐）(-75)`;
            break;
        }
      }

      // 2. Calculate Day Score
      let dayScore = 0;
      let dayReason = "";

      if (line.originalBranch === result.riChen) {
        dayScore = 100;
        dayReason = `臨日辰【${result.riChen}】，值日建司令專權，威權最盛 (+100)`;
      } else if (line.dayChongType === "暗動") {
        dayScore = 75;
        dayReason = `得月旺又受日辰沖動，化為【暗動】，有如神兵暗助 (+75)`;
      } else if (line.dayChongType === "日破") {
        dayScore = -80;
        dayReason = `失令休囚又受日辰沖擊，化為【日破】，破敗失神 (-80)`;
      } else if (line.dayChongType === "沖空") {
        dayScore = 40;
        dayReason = `爻逢旬空遇日辰沖之，為【沖空填實】，空而不空 (+40)`;
      } else {
        switch (line.dayRelation) {
          case "臨日辰":
            dayScore = 100;
            dayReason = `臨日辰值日司令專權 (+100)`;
            break;
          case "日建同旺":
            dayScore = 75;
            dayReason = `與日辰五行比和同旺 (+75)`;
            break;
          case "得日辰生":
            dayScore = 60;
            dayReason = `得日辰【${result.riChen}${result.riChenWuxing}】生扶庇佑 (+60)`;
            break;
          case "日辰六合":
            dayScore = 45;
            dayReason = `與日辰六合相親，有依有靠 (+45)`;
            break;
          case "生助日辰":
            dayScore = 10;
            dayReason = `爻生助日辰，微洩氣力 (+10)`;
            break;
          case "日平":
            dayScore = 0;
            dayReason = `與日辰無特殊刑沖剋合，平穩 (0)`;
            break;
          case "受日辰剋":
            dayScore = -55;
            dayReason = `受日辰【${result.riChen}${result.riChenWuxing}】嚴厲傷剋 (-55)`;
            break;
        }
      }

      // 3. Motion & Transformation Score
      let motionScore = 0;
      let motionReason = "靜爻無動變 (0)";

      if (line.isMoving) {
        if (line.dongBianDetail) {
          const title = line.dongBianDetail.title;
          if (title.includes("化進神")) {
            motionScore = 80;
            motionReason = `動化進神（氣勢磅礡、日增其盛）(+80)`;
          } else if (title.includes("化回頭生")) {
            motionScore = 70;
            motionReason = `動化回頭生（化出之爻反生本爻，愈動愈吉）(+70)`;
          } else if (title.includes("化退神")) {
            motionScore = -65;
            motionReason = `動化退神（後繼無力、逐漸衰歇）(-65)`;
          } else if (title.includes("化回頭剋")) {
            motionScore = -80;
            motionReason = `動化回頭剋（自投羅網，化出毒煞自傷）(-80)`;
          } else if (title.includes("化空") || title.includes("化墓") || title.includes("化絕")) {
            motionScore = -45;
            motionReason = `動化空/墓/絕（動而入衰地，難展才華）(-45)`;
          } else {
            motionScore = 30;
            motionReason = `發動變爻（動則有變，生發事端）(+30)`;
          }
        } else {
          motionScore = 25;
          motionReason = `發動演化 (+25)`;
        }
      }

      // 4. Void penalty (旬空)
      let voidPenalty = 0;
      if (line.isXunKong && line.dayChongType !== "沖空" && line.originalBranch !== result.riChen) {
        voidPenalty = -25;
      }

      // Total Net Energy
      const totalEnergy = monthScore + dayScore + motionScore + voidPenalty;

      // Grade classification
      let energyLevel: YaoEnergyData["energyLevel"] = "平穩中和";
      let energyColor = "#fbbf24"; // Amber
      let classicalSummary = "";

      if (totalEnergy >= 140) {
        energyLevel = "至旺高盛";
        energyColor = "#10b981"; // Emerald
        classicalSummary = "得日月動爻極品生扶，勢如破竹，百事亨通。";
      } else if (totalEnergy >= 60) {
        energyLevel = "偏旺得力";
        energyColor = "#34d399"; // Light green
        classicalSummary = "得令得助，根基深厚，具備成事之充足能量。";
      } else if (totalEnergy >= -10) {
        energyLevel = "平穩中和";
        energyColor = "#fbbf24"; // Amber
        classicalSummary = "旺衰均衡，無大生亦無大傷，順其自然可圖。";
      } else if (totalEnergy >= -70) {
        energyLevel = "偏衰失令";
        energyColor = "#f97316"; // Orange
        classicalSummary = "失令受制，元氣有所虧蝕，需待時日生扶方有轉機。";
      } else {
        energyLevel = "極衰破敗";
        energyColor = "#f43f5e"; // Rose Red
        classicalSummary = "受日月動爻重疊傷破，元神枯竭，凶險難支。";
      }

      const isYong = line.originalRelative === result.yongShenCategory;

      return {
        index: line.index,
        name: line.name,
        lineLabel: `${line.name} ${line.originalRelative}${line.originalBranch}${line.originalWuxing}`,
        relative: line.originalRelative,
        branch: line.originalBranch,
        wuxing: line.originalWuxing,
        isShi: line.isShi,
        isYing: line.isYing,
        isYong,
        isMoving: line.isMoving,
        isMonthPo: line.isMonthPo,
        isDayChong: line.isDayChong,
        dayChongType: line.dayChongType,
        isXunKong: line.isXunKong,
        monthScore,
        monthReason,
        dayScore,
        dayReason,
        motionScore,
        motionReason,
        voidPenalty,
        totalEnergy,
        energyLevel,
        energyColor,
        classicalSummary,
      };
    });
  }, [result]);

  // Render D3 Visual Chart
  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 700;
    const height = chartMode === "radar" ? 360 : 380;
    const margin = { top: 35, right: 35, bottom: 45, left: 140 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous drawing

    svg
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("width", "100%")
      .attr("height", height);

    // Filter items according to highlight mode
    const displayData = energyDataList
      .slice()
      .reverse(); // Display 6 (上爻) at top down to 1 (初爻) at bottom

    // -------------------------------------------------------------
    // MODE 1 & 2: DIVERGING BAR CHART (STACKED / TOTAL)
    // -------------------------------------------------------------
    if (chartMode === "stacked" || chartMode === "total") {
      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

      // X Scale: Energy score from -180 to +260
      const minVal = Math.min(-150, d3.min(displayData, (d) => d.totalEnergy) || -100);
      const maxVal = Math.max(220, d3.max(displayData, (d) => d.totalEnergy) || 180);

      const xScale = d3
        .scaleLinear()
        .domain([minVal - 20, maxVal + 30])
        .range([0, innerWidth]);

      // Y Scale: 6 Yao Lines
      const yScale = d3
        .scaleBand<number>()
        .domain(displayData.map((d) => d.index))
        .range([0, innerHeight])
        .padding(0.28);

      // Background Grid Lines
      const xGrid = d3.axisBottom(xScale).ticks(8).tickSize(-innerHeight).tickFormat(() => "");
      g.append("g")
        .attr("class", "grid")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xGrid)
        .call((grid) => grid.select(".domain").remove())
        .call((grid) =>
          grid
            .selectAll(".tick line")
            .attr("stroke", "#e7e5e4")
            .attr("stroke-dasharray", "2,2")
        );

      // Zero Baseline Indicator
      const zeroX = xScale(0);
      g.append("line")
        .attr("x1", zeroX)
        .attr("x2", zeroX)
        .attr("y1", -10)
        .attr("y2", innerHeight + 10)
        .attr("stroke", "#a8a29e")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,3");

      g.append("text")
        .attr("x", zeroX)
        .attr("y", -14)
        .attr("text-anchor", "middle")
        .attr("fill", "#78716c")
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .text("0 基準平衡線");

      // Positive / Negative Region labels
      g.append("text")
        .attr("x", xScale(Math.max(100, maxVal * 0.6)))
        .attr("y", -14)
        .attr("text-anchor", "middle")
        .attr("fill", "#059669")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .text("得令·生扶·旺相 ➔");

      g.append("text")
        .attr("x", xScale(Math.min(-70, minVal * 0.6)))
        .attr("y", -14)
        .attr("text-anchor", "middle")
        .attr("fill", "#e11d48")
        .attr("font-size", "10px")
        .attr("font-weight", "600")
        .text("⬅ 失令·傷剋·休囚破敗");

      // X Axis
      const xAxis = d3
        .axisBottom(xScale)
        .ticks(8)
        .tickFormat((d) => `${Number(d) > 0 ? "+" : ""}${d}`);
      g.append("g")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxis)
        .call((axis) => axis.select(".domain").attr("stroke", "#d6d3d1"))
        .call((axis) =>
          axis
            .selectAll(".tick text")
            .attr("fill", "#57534e")
            .attr("font-size", "10px")
        );

      // Render Each Yao Line Row
      displayData.forEach((d) => {
        const yPos = yScale(d.index) || 0;
        const rowHeight = yScale.bandwidth();

        // Check Highlight matching
        let isDimmed = false;
        if (filterHighlight === "shiying" && !d.isShi && !d.isYing) isDimmed = true;
        if (filterHighlight === "yongshen" && !d.isYong) isDimmed = true;
        if (filterHighlight === "moving" && !d.isMoving) isDimmed = true;

        const isSelected = selectedLineIndex === d.index;

        const rowG = g
          .append("g")
          .attr("class", `yao-row-${d.index}`)
          .style("cursor", "pointer")
          .style("opacity", isDimmed ? 0.25 : 1)
          .on("click", () => {
            if (onSelectLine) {
              onSelectLine(isSelected ? null : d.index);
            }
          })
          .on("mouseenter", () => {
            setHoveredYao(d);
          })
          .on("mouseleave", () => {
            setHoveredYao(null);
          });

        // Background highlight on selection/hover
        if (isSelected) {
          rowG
            .append("rect")
            .attr("x", -margin.left + 8)
            .attr("y", yPos - 3)
            .attr("width", innerWidth + margin.left + margin.right - 16)
            .attr("height", rowHeight + 6)
            .attr("rx", 6)
            .attr("fill", "rgba(245, 158, 11, 0.12)")
            .attr("stroke", "#f59e0b")
            .attr("stroke-width", 1.5);
        }

        // Left Label Text
        const labelG = rowG
          .append("g")
          .attr("transform", `translate(-10, ${yPos + rowHeight / 2})`);

        labelG
          .append("text")
          .attr("x", 0)
          .attr("y", -3)
          .attr("text-anchor", "end")
          .attr("fill", isSelected ? "#b45309" : "#1c1917")
          .attr("font-size", "11px")
          .attr("font-weight", isSelected || d.isShi || d.isYong ? "bold" : "normal")
          .text(`${d.name} ${d.relative}`);

        labelG
          .append("text")
          .attr("x", 0)
          .attr("y", 11)
          .attr("text-anchor", "end")
          .attr("fill", d.isShi ? "#b45309" : d.isYong ? "#0284c7" : "#78716c")
          .attr("font-size", "10px")
          .text(
            `${d.branch}${d.wuxing}${d.isShi ? "【世】" : d.isYing ? "【應】" : ""}${
              d.isYong ? "【用】" : ""
            }${d.isMoving ? " ◯" : ""}`
          );

        // --- DRAWING BARS BASED ON MODE ---
        if (chartMode === "total") {
          // Total Single Energy Bar with dynamic gradient fill
          const barWidth = Math.abs(xScale(d.totalEnergy) - zeroX);
          const barX = d.totalEnergy >= 0 ? zeroX : xScale(d.totalEnergy);

          rowG
            .append("rect")
            .attr("x", barX)
            .attr("y", yPos)
            .attr("width", Math.max(3, barWidth))
            .attr("height", rowHeight)
            .attr("rx", 4)
            .attr("fill", d.energyColor)
            .attr("opacity", 0.9)
            .attr("stroke", isSelected ? "#ffffff" : "none")
            .attr("stroke-width", 1.5);

          // Energy Number label on bar end
          const textX = d.totalEnergy >= 0 ? barX + barWidth + 6 : barX - 6;
          const textAnchor = d.totalEnergy >= 0 ? "start" : "end";

          rowG
            .append("text")
            .attr("x", textX)
            .attr("y", yPos + rowHeight / 2 + 4)
            .attr("text-anchor", textAnchor)
            .attr("fill", d.totalEnergy >= 0 ? "#047857" : "#be123c")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .text(`${d.totalEnergy > 0 ? "+" : ""}${d.totalEnergy} (${d.energyLevel})`);
        } else {
          // STACKED / MULTI-BAR DECOMPOSITION (Month, Day, Motion)
          let currentPos = zeroX;
          let currentNeg = zeroX;

          const components = [
            { label: "月建", val: d.monthScore, color: "#0284c7", negColor: "#0369a1" },
            { label: "日辰", val: d.dayScore, color: "#f59e0b", negColor: "#d97706" },
            { label: "動變", val: d.motionScore, color: "#9333ea", negColor: "#7e22ce" },
            { label: "旬空", val: d.voidPenalty, color: "#78716c", negColor: "#57534e" },
          ];

          components.forEach((comp) => {
            if (comp.val === 0) return;
            const w = Math.abs(xScale(comp.val) - zeroX);

            if (comp.val > 0) {
              rowG
                .append("rect")
                .attr("x", currentPos)
                .attr("y", yPos)
                .attr("width", w)
                .attr("height", rowHeight)
                .attr("fill", comp.color)
                .attr("opacity", 0.85)
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 0.5);

              currentPos += w;
            } else {
              const startX = currentNeg - w;
              rowG
                .append("rect")
                .attr("x", startX)
                .attr("y", yPos)
                .attr("width", w)
                .attr("height", rowHeight)
                .attr("fill", comp.negColor)
                .attr("opacity", 0.85)
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 0.5);

              currentNeg -= w;
            }
          });

          // Net total marker line & value badge
          const netX = xScale(d.totalEnergy);
          rowG
            .append("circle")
            .attr("cx", netX)
            .attr("cy", yPos + rowHeight / 2)
            .attr("r", 4.5)
            .attr("fill", d.energyColor)
            .attr("stroke", "#ffffff")
            .attr("stroke-width", 1.5);

          const textX = d.totalEnergy >= 0 ? Math.max(currentPos, netX) + 8 : Math.min(currentNeg, netX) - 8;
          const textAnchor = d.totalEnergy >= 0 ? "start" : "end";

          rowG
            .append("text")
            .attr("x", textX)
            .attr("y", yPos + rowHeight / 2 + 4)
            .attr("text-anchor", textAnchor)
            .attr("fill", d.totalEnergy >= 0 ? "#047857" : "#be123c")
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .text(`${d.totalEnergy > 0 ? "+" : ""}${d.totalEnergy}`);
        }
      });
    }

    // -------------------------------------------------------------
    // MODE 3: RADAR / POLAR ENERGY SPECTRUM
    // -------------------------------------------------------------
    if (chartMode === "radar") {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) - 50;

      const g = svg.append("g").attr("transform", `translate(${centerX},${centerY})`);

      // 6 angles for 6 Yao Lines
      const angleSlice = (Math.PI * 2) / 6;
      const rScale = d3.scaleLinear().domain([-100, 200]).range([15, radius]);

      // Draw concentric guide circles
      const levels = [-50, 0, 50, 100, 150];
      levels.forEach((lvl) => {
        const r = rScale(lvl);
        g.append("circle")
          .attr("r", r)
          .attr("fill", lvl === 0 ? "rgba(245, 158, 11, 0.06)" : "none")
          .attr("stroke", lvl === 0 ? "#a8a29e" : "#e7e5e4")
          .attr("stroke-width", lvl === 0 ? 1.5 : 1)
          .attr("stroke-dasharray", lvl === 0 ? "3,3" : "none");

        g.append("text")
          .attr("x", 4)
          .attr("y", -r + 10)
          .attr("fill", "#78716c")
          .attr("font-size", "9px")
          .text(`${lvl > 0 ? "+" : ""}${lvl}`);
      });

      // Axis spokes & labels
      energyDataList.forEach((d, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const lineX = radius * Math.cos(angle);
        const lineY = radius * Math.sin(angle);

        g.append("line")
          .attr("x1", 0)
          .attr("y1", 0)
          .attr("x2", lineX)
          .attr("y2", lineY)
          .attr("stroke", "#d6d3d1")
          .attr("stroke-width", 1);

        // Yao Label
        const labelX = (radius + 24) * Math.cos(angle);
        const labelY = (radius + 24) * Math.sin(angle);

        const isSelected = selectedLineIndex === d.index;

        const textG = g
          .append("g")
          .attr("transform", `translate(${labelX}, ${labelY})`)
          .style("cursor", "pointer")
          .on("click", () => onSelectLine && onSelectLine(isSelected ? null : d.index));

        textG
          .append("text")
          .attr("text-anchor", "middle")
          .attr("fill", isSelected ? "#b45309" : d.isShi ? "#0284c7" : "#1c1917")
          .attr("font-size", "11px")
          .attr("font-weight", d.isShi || d.isYong ? "bold" : "normal")
          .text(`${d.name} ${d.relative}`);

        textG
          .append("text")
          .attr("y", 12)
          .attr("text-anchor", "middle")
          .attr("fill", d.totalEnergy >= 0 ? "#047857" : "#be123c")
          .attr("font-size", "10px")
          .attr("font-weight", "bold")
          .text(`${d.totalEnergy > 0 ? "+" : ""}${d.totalEnergy}`);
      });

      // Polygon points for total energy
      const points: [number, number][] = energyDataList.map((d, i) => {
        const angle = i * angleSlice - Math.PI / 2;
        const r = rScale(Math.max(-90, d.totalEnergy));
        return [r * Math.cos(angle), r * Math.sin(angle)];
      });

      const lineGenerator = d3.line<[number, number]>().curve(d3.curveLinearClosed);

      // Radar fill
      g.append("path")
        .datum(points)
        .attr("d", lineGenerator)
        .attr("fill", "rgba(245, 158, 11, 0.2)")
        .attr("stroke", "#d97706")
        .attr("stroke-width", 2);

      // Point circles
      points.forEach((pt, i) => {
        const d = energyDataList[i];
        g.append("circle")
          .attr("cx", pt[0])
          .attr("cy", pt[1])
          .attr("r", 5)
          .attr("fill", d.energyColor)
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 1.5)
          .style("cursor", "pointer")
          .on("mouseenter", () => setHoveredYao(d))
          .on("mouseleave", () => setHoveredYao(null))
          .on("click", () => onSelectLine && onSelectLine(d.index));
      });
    }
  }, [energyDataList, chartMode, filterHighlight, selectedLineIndex, onSelectLine]);

  // Overall hexagram energy verdict
  const dominantYao = useMemo(() => {
    return [...energyDataList].sort((a, b) => b.totalEnergy - a.totalEnergy)[0];
  }, [energyDataList]);

  const weakestYao = useMemo(() => {
    return [...energyDataList].sort((a, b) => a.totalEnergy - b.totalEnergy)[0];
  }, [energyDataList]);

  const shiYao = useMemo(() => {
    return energyDataList.find((d) => d.isShi);
  }, [energyDataList]);

  const yongYao = useMemo(() => {
    return energyDataList.find((d) => d.isYong);
  }, [energyDataList]);

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-md sm:p-6 space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="h-5 w-5 text-amber-700" />
          <div>
            <h3 className="font-serif text-base font-bold text-stone-900 sm:text-lg">
              日月星辰六爻旺衰能量量化圖譜
            </h3>
            <p className="text-[11px] text-stone-500">
              三維力學量化：月建提綱 × 日辰主事 × 動變生剋
            </p>
          </div>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Chart View Switcher */}
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setChartMode("stacked")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer flex items-center gap-1 ${
                chartMode === "stacked"
                  ? "bg-amber-700 text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
              title="月建、日辰、動變三維疊加分量分析"
            >
              <Layers className="h-3.5 w-3.5" />
              三維分解
            </button>
            <button
              onClick={() => setChartMode("total")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer flex items-center gap-1 ${
                chartMode === "total"
                  ? "bg-amber-700 text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
              title="單一綜合能量淨值柱狀對照"
            >
              <BarChart3 className="h-3.5 w-3.5" />
              綜合能譜
            </button>
            <button
              onClick={() => setChartMode("radar")}
              className={`rounded-lg px-2.5 py-1 font-semibold transition cursor-pointer flex items-center gap-1 ${
                chartMode === "radar"
                  ? "bg-amber-700 text-white shadow-2xs"
                  : "text-stone-600 hover:text-stone-900"
              }`}
              title="六爻全盤雷達環形分佈"
            >
              <Sparkles className="h-3.5 w-3.5" />
              雷達天平
            </button>
          </div>

          {/* Quick Highlight Filter */}
          <div className="flex bg-stone-100 p-1 rounded-xl border border-stone-200">
            <button
              onClick={() => setFilterHighlight("all")}
              className={`rounded-lg px-2 py-1 font-medium transition cursor-pointer ${
                filterHighlight === "all" ? "bg-white text-amber-900 shadow-2xs font-semibold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              全盤六爻
            </button>
            <button
              onClick={() => setFilterHighlight("shiying")}
              className={`rounded-lg px-2 py-1 font-medium transition cursor-pointer ${
                filterHighlight === "shiying" ? "bg-white text-amber-900 shadow-2xs font-semibold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              世應聚焦
            </button>
            <button
              onClick={() => setFilterHighlight("yongshen")}
              className={`rounded-lg px-2 py-1 font-medium transition cursor-pointer ${
                filterHighlight === "yongshen" ? "bg-white text-amber-900 shadow-2xs font-semibold" : "text-stone-600 hover:text-stone-900"
              }`}
            >
              用神【{result.yongShenCategory}】
            </button>
            {result.hasMovingYao && (
              <button
                onClick={() => setFilterHighlight("moving")}
                className={`rounded-lg px-2 py-1 font-medium transition cursor-pointer ${
                  filterHighlight === "moving" ? "bg-white text-rose-800 shadow-2xs font-semibold" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                動爻專察
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Legend & Classical Principles */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-200">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-stone-800 font-semibold flex items-center gap-1">
            <Info className="h-3.5 w-3.5 text-amber-700" />
            能量維度：
          </span>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-sky-500"></span>
            <span>月建提綱（司萬卜旺衰）</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-amber-500"></span>
            <span>日辰主事（司發動生殺）</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-sm bg-purple-500"></span>
            <span>動變生剋（化進化退）</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-emerald-700 font-bold">🟢 旺盛</span>
          <span className="text-amber-700 font-bold">🟡 中和</span>
          <span className="text-rose-700 font-bold">🔴 衰破</span>
        </div>
      </div>

      {/* D3 Canvas Container */}
      <div ref={containerRef} className="w-full relative min-h-[380px] flex items-center justify-center">
        <svg ref={svgRef} className="overflow-visible select-none"></svg>
      </div>

      {/* Interactive Tooltip Card (Hovered or Selected Yao Line) */}
      {(hoveredYao || selectedLineIndex !== null) && (
        (() => {
          const item = hoveredYao || energyDataList.find((d) => d.index === selectedLineIndex);
          if (!item) return null;

          return (
            <div className="rounded-xl border border-amber-300 bg-amber-50/70 p-4 shadow-sm animate-in fade-in duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-700 font-serif text-sm font-bold text-white shadow-2xs">
                    {item.index}
                  </span>
                  <div>
                    <h4 className="font-serif text-sm font-bold text-stone-900 flex items-center gap-1.5">
                      <span>{item.name} · {item.relative}</span>
                      <span className="font-mono text-stone-800 font-semibold">{item.branch}{item.wuxing}</span>
                      {item.isShi && <span className="text-xs text-rose-800 font-bold">【世爻】</span>}
                      {item.isYing && <span className="text-xs text-stone-600 font-bold">【應爻】</span>}
                      {item.isYong && <span className="text-xs text-amber-900 font-bold">【當前用神】</span>}
                      {item.isMoving && <span className="text-xs text-rose-700 font-bold">【發動】</span>}
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="rounded-lg px-2.5 py-1 text-xs font-bold shadow-2xs bg-white border border-stone-200 text-stone-900"
                  >
                    綜合能值：{item.totalEnergy > 0 ? `+${item.totalEnergy}` : item.totalEnergy} · {item.energyLevel}
                  </span>
                </div>
              </div>

              {/* 3 Energy Pillars Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Month Power */}
                <div className="rounded-lg bg-white p-2.5 border border-stone-200 shadow-2xs">
                  <span className="font-semibold text-sky-800 flex items-center gap-1 mb-1">
                    <Moon className="h-3.5 w-3.5 text-sky-600" /> 月建司令影響（得分 {item.monthScore > 0 ? `+${item.monthScore}` : item.monthScore}）
                  </span>
                  <p className="text-stone-600 text-[11px] leading-relaxed">{item.monthReason}</p>
                </div>

                {/* Day Power */}
                <div className="rounded-lg bg-white p-2.5 border border-stone-200 shadow-2xs">
                  <span className="font-semibold text-amber-800 flex items-center gap-1 mb-1">
                    <Sun className="h-3.5 w-3.5 text-amber-600" /> 日辰生剋主事（得分 {item.dayScore > 0 ? `+${item.dayScore}` : item.dayScore}）
                  </span>
                  <p className="text-stone-600 text-[11px] leading-relaxed">{item.dayReason}</p>
                </div>

                {/* Motion Power */}
                <div className="rounded-lg bg-white p-2.5 border border-stone-200 shadow-2xs">
                  <span className="font-semibold text-purple-800 flex items-center gap-1 mb-1">
                    <Zap className="h-3.5 w-3.5 text-purple-600" /> 動變轉化能量（得分 {item.motionScore > 0 ? `+${item.motionScore}` : item.motionScore}）
                  </span>
                  <p className="text-stone-600 text-[11px] leading-relaxed">{item.motionReason}</p>
                </div>
              </div>

              {/* Classical Verdict */}
              <div className="mt-2.5 pt-2 border-t border-amber-200 flex items-center justify-between text-xs">
                <span className="text-stone-700">
                  <strong className="text-amber-900">易理綜斷：</strong>
                  {item.classicalSummary}
                </span>
              </div>
            </div>
          );
        })()
      )}

      {/* Hexagram Balance Summary Footer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        {/* Dominant Line */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
            <span>全盤能量至旺爻</span>
            <span className="text-emerald-700 font-bold">+{dominantYao?.totalEnergy}</span>
          </div>
          <p className="font-serif text-sm font-bold text-emerald-900">
            {dominantYao?.name} {dominantYao?.relative}（{dominantYao?.branch}{dominantYao?.wuxing}）
          </p>
          <p className="text-[11px] text-stone-600 mt-0.5">{dominantYao?.energyLevel} · 卦中核心動能</p>
        </div>

        {/* Weakest Line */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-3 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
            <span>全盤受制最衰爻</span>
            <span className="text-rose-700 font-bold">{weakestYao?.totalEnergy}</span>
          </div>
          <p className="font-serif text-sm font-bold text-rose-900">
            {weakestYao?.name} {weakestYao?.relative}（{weakestYao?.branch}{weakestYao?.wuxing}）
          </p>
          <p className="text-[11px] text-stone-600 mt-0.5">{weakestYao?.energyLevel} · 諸事最忌牽連</p>
        </div>

        {/* Shi Yao (Self) */}
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
            <span>世爻【求占者自體】</span>
            <span className="text-amber-800 font-bold">
              {shiYao?.totalEnergy && shiYao.totalEnergy > 0 ? `+${shiYao.totalEnergy}` : shiYao?.totalEnergy}
            </span>
          </div>
          <p className="font-serif text-sm font-bold text-amber-900">
            {shiYao?.name} {shiYao?.relative}（{shiYao?.branch}{shiYao?.wuxing}）
          </p>
          <p className="text-[11px] text-stone-600 mt-0.5">狀態：{shiYao?.energyLevel}</p>
        </div>

        {/* Yong Shen (Target) */}
        <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-stone-600 mb-1">
            <span>用神【{result.yongShenCategory}】</span>
            <span className="text-sky-800 font-bold">
              {yongYao?.totalEnergy && yongYao.totalEnergy > 0 ? `+${yongYao.totalEnergy}` : yongYao?.totalEnergy}
            </span>
          </div>
          <p className="font-serif text-sm font-bold text-sky-900">
            {yongYao ? `${yongYao.name} ${yongYao.branch}${yongYao.wuxing}` : "伏神待查"}
          </p>
          <p className="text-[11px] text-stone-600 mt-0.5">狀態：{yongYao ? yongYao.energyLevel : "需考伏神透出"}</p>
        </div>
      </div>
    </div>
  );
};
