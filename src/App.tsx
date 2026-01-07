// ======================================================
// SECTION 1 — Imports and Base Types
// ======================================================

import React, { useMemo, useState } from "react";

// ----------------------
// Type Definitions
// ----------------------

type StageKey =
  | "exploration"
  | "mining"
  | "processing"
  | "components"
  | "end_products";

type RiskLevel = "low" | "medium" | "high";
type ChinaExposure = "low" | "medium" | "high";
type ChinaComfort = "neutral" | "prefer_low" | "prefer_high";

type KnowledgeLevel = "low" | "medium" | "high";

type Weights = {
  upstream: number;
  midstream: number;
  downstream: number;
  evBattery: number;
  chinaExposure: number;
  riskTolerance: number;
};

type ETF = {
  ticker: string;
  name: string;
  stages: StageKey[];
  evBatteryTheme: boolean;
  chinaExposure: ChinaExposure;
  riskLevel: RiskLevel;
};

type ScoredETF = ETF & {
  score: number;
  overlapScore: number;
};
// ======================================================
// SECTION 2 — ETF Metadata (D‑2 Universe)
// ======================================================
// ======================================================
// SECTION A — Knowledge Mode Configuration + Constants
// ======================================================

const KnowledgeMode = {
  low: {
    showWeights: false,
    showOverlap: false,
    showBreakdowns: false,
    maxETFs: 3, // D1
    maxTwoBaskets: 1,
    maxThreeBaskets: 1,
    layout: "grid", // C2
  },
  medium: {
    showWeights: true,
    showOverlap: true,
    showBreakdowns: false,
    maxETFs: 5, // D1
    maxTwoBaskets: 5,
    maxThreeBaskets: 5,
    layout: "grid", // C2
  },
  high: {
    showWeights: true,
    showOverlap: true,
    showBreakdowns: true,
    maxETFs: 10, // D1
    maxTwoBaskets: 10,
    maxThreeBaskets: 10,
    layout: "grid", // C2
  },
} as const;
// ======================================================
// Default Weights for Scoring Engine
// ======================================================
export const DEFAULT_WEIGHTS: Weights = {
  upstream: 5,
  midstream: 5,
  downstream: 5,
  evBattery: 5,
  chinaExposure: 5,
  riskTolerance: 5,
};

// Allocation slider range
export const ALLOCATION_MIN = 0;
export const ALLOCATION_MAX = 100;

// Default portfolio value (user can override)
export const DEFAULT_PORTFOLIO_VALUE = 100000;
export const ETF_DATA: ETF[] = [
  // --- Rare Earths ---
  {
    ticker: "REMX",
    name: "VanEck Rare Earth/Strategic Metals",
    stages: ["exploration", "mining", "processing"],
    evBatteryTheme: false,
    chinaExposure: "high",
    riskLevel: "high",
  },

  // --- Lithium / Battery Tech ---
  {
    ticker: "LIT",
    name: "Global X Lithium & Battery Tech",
    stages: ["components", "end_products"],
    evBatteryTheme: true,
    chinaExposure: "medium",
    riskLevel: "medium",
  },
  {
    ticker: "BATT",
    name: "Amplify Lithium & Battery Technology",
    stages: ["components", "end_products"],
    evBatteryTheme: true,
    chinaExposure: "medium",
    riskLevel: "medium",
  },
  {
    ticker: "ACDC",
    name: "Global X Battery Tech & Lithium",
    stages: ["components", "end_products"],
    evBatteryTheme: true,
    chinaExposure: "medium",
    riskLevel: "medium",
  },

  // --- EV & Autonomous Vehicles ---
  {
    ticker: "DRIV",
    name: "Global X Autonomous & Electric Vehicles",
    stages: ["components", "end_products"],
    evBatteryTheme: true,
    chinaExposure: "low",
    riskLevel: "medium",
  },
  {
    ticker: "IDRV",
    name: "iShares Self-Driving EV and Tech",
    stages: ["components", "end_products"],
    evBatteryTheme: true,
    chinaExposure: "low",
    riskLevel: "medium",
  },
  {
    ticker: "KARS",
    name: "KraneShares Electric Vehicles & Future Mobility",
    stages: ["components", "end_products"],
    evBatteryTheme: true,
    chinaExposure: "high",
    riskLevel: "medium",
  },

  // --- Mining / Metals / Materials ---
  {
    ticker: "PICK",
    name: "iShares Global Metals & Mining",
    stages: ["exploration", "mining"],
    evBatteryTheme: false,
    chinaExposure: "medium",
    riskLevel: "high",
  },
  {
    ticker: "XME",
    name: "SPDR S&P Metals & Mining",
    stages: ["exploration", "mining"],
    evBatteryTheme: false,
    chinaExposure: "medium",
    riskLevel: "high",
  },
  {
    ticker: "XLB",
    name: "Materials Select Sector SPDR",
    stages: ["processing", "components"],
    evBatteryTheme: false,
    chinaExposure: "low",
    riskLevel: "medium",
  },
  {
    ticker: "FMAG",
    name: "Fidelity Magellan ETF (Materials Tilt)",
    stages: ["processing", "components"],
    evBatteryTheme: false,
    chinaExposure: "low",
    riskLevel: "medium",
  },
  {
    ticker: "GDX",
    name: "VanEck Gold Miners",
    stages: ["exploration", "mining"],
    evBatteryTheme: false,
    chinaExposure: "medium",
    riskLevel: "high",
  },
  {
    ticker: "GDXJ",
    name: "VanEck Junior Gold Miners",
    stages: ["exploration", "mining"],
    evBatteryTheme: false,
    chinaExposure: "medium",
    riskLevel: "high",
  },
  {
    ticker: "COPX",
    name: "Global X Copper Miners",
    stages: ["exploration", "mining"],
    evBatteryTheme: false,
    chinaExposure: "medium",
    riskLevel: "high",
  },
  {
    ticker: "SLX",
    name: "VanEck Steel ETF",
    stages: ["processing", "components"],
    evBatteryTheme: false,
    chinaExposure: "low",
    riskLevel: "medium",
  },
  {
    ticker: "DBB",
    name: "Invesco DB Base Metals",
    stages: ["exploration", "mining"],
    evBatteryTheme: false,
    chinaExposure: "medium",
    riskLevel: "medium",
  },

  // --- Uranium / Nuclear ---
  {
    ticker: "URA",
    name: "Global X Uranium",
    stages: ["exploration", "mining"],
    evBatteryTheme: false,
    chinaExposure: "medium",
    riskLevel: "high",
  },
  {
    ticker: "URNM",
    name: "Sprott Uranium Miners",
    stages: ["exploration", "mining"],
    evBatteryTheme: false,
    chinaExposure: "medium",
    riskLevel: "high",
  },

  // --- Clean Energy / Renewables ---
  {
    ticker: "ICLN",
    name: "iShares Global Clean Energy",
    stages: ["end_products"],
    evBatteryTheme: true,
    chinaExposure: "medium",
    riskLevel: "medium",
  },
  {
    ticker: "QCLN",
    name: "First Trust NASDAQ Clean Edge Green Energy",
    stages: ["components", "end_products"],
    evBatteryTheme: true,
    chinaExposure: "medium",
    riskLevel: "medium",
  },
  {
    ticker: "FAN",
    name: "First Trust Global Wind Energy",
    stages: ["end_products"],
    evBatteryTheme: false,
    chinaExposure: "low",
    riskLevel: "medium",
  },
  {
    ticker: "GRID",
    name: "First Trust NASDAQ Clean Edge Smart Grid",
    stages: ["components", "end_products"],
    evBatteryTheme: false,
    chinaExposure: "low",
    riskLevel: "medium",
  },

  // --- Infrastructure ---
  {
    ticker: "PAVE",
    name: "Global X U.S. Infrastructure Development",
    stages: ["end_products"],
    evBatteryTheme: false,
    chinaExposure: "low",
    riskLevel: "medium",
  },

  // --- Broad Commodities ---
  {
    ticker: "DBC",
    name: "Invesco DB Commodity Index",
    stages: ["exploration", "mining"],
    evBatteryTheme: false,
    chinaExposure: "medium",
    riskLevel: "medium",
  },
  {
    ticker: "COMT",
    name: "iShares GSCI Commodity Dynamic Roll",
    stages: ["exploration", "mining"],
    evBatteryTheme: false,
    chinaExposure: "medium",
    riskLevel: "medium",
  },
];
// ======================================================
// SECTION 3 — UI Helper Components
// ======================================================
// ======================================================
// SECTION B — Allocation System (Portfolio + Sliders)
// ======================================================

// Tracks allocation % per ETF ticker
type AllocationMap = Record<string, number>;

// Utility: clamp values between min/max
const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

// Component: Portfolio Value Input
export function PortfolioValueInput({
  portfolioValue,
  setPortfolioValue,
}: {
  portfolioValue: number;
  setPortfolioValue: (v: number) => void;
}) {
  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "8px",
        background: "#f7f7f7",
        marginBottom: "20px",
      }}
    >
      <h3 style={{ margin: 0, marginBottom: "8px" }}>Your Portfolio Value</h3>
      <input
        type="number"
        value={portfolioValue}
        onChange={(e) => setPortfolioValue(Number(e.target.value))}
        style={{
          width: "100%",
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          fontSize: "16px",
        }}
      />
    </div>
  );
}

// Component: Allocation Slider (AS3 — inside ETF card)
export function AllocationSlider({
  ticker,
  allocation,
  setAllocation,
  portfolioValue,
}: {
  ticker: string;
  allocation: number;
  setAllocation: (ticker: string, value: number) => void;
  portfolioValue: number;
}) {
  const dollarAmount = ((allocation / 100) * portfolioValue).toFixed(2);

  return (
    <div className="allocation-slider-container" style={{ marginTop: "12px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <strong>Allocation: {allocation}%</strong>
        <span>${dollarAmount}</span>
      </div>

      {/* Tap‑to‑jump wrapper */}
      <div
        style={{ width: "100%", position: "relative" }}
        onMouseDown={(e) => {
          if ((e.target as HTMLElement).tagName === "INPUT") return;
        }}
        onClick={(e) => {
          if ((e.target as HTMLElement).tagName === "INPUT") return;

          const rect = (
            e.currentTarget as HTMLDivElement
          ).getBoundingClientRect();
          const x = e.clientX - rect.left;
          const percent = x / rect.width;
          const newValue = Math.round(percent * 100);

          setAllocation(ticker, clamp(newValue, 0, 100));
        }}
      >
        <input
          type="range"
          min={ALLOCATION_MIN}
          max={ALLOCATION_MAX}
          value={allocation}
          onChange={(e) =>
            setAllocation(ticker, clamp(Number(e.target.value), 0, 100))
          }
          style={{
            width: "100%",
            position: "relative",
            zIndex: 2,
            background: "transparent",
          }}
        />
      </div>
    </div>
  );
}

// Component: Allocation Summary (total % + remaining %)
export function AllocationTotals({
  allocations,
}: {
  allocations: AllocationMap;
}) {
  const total = Object.values(allocations).reduce((a, b) => a + b, 0);
  const remaining = clamp(100 - total, 0, 100);

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "12px",
        borderRadius: "8px",
        background: "#eef2ff",
      }}
    >
      <div>
        <strong>Total allocated:</strong> {total.toFixed(1)}%
      </div>
      <div>
        <strong>Remaining:</strong> {remaining.toFixed(1)}%
      </div>
    </div>
  );
}

// ----------------------
// Weighting Editor
// ----------------------

function WeightingEditor({
  weights,
  setWeights,
}: {
  weights: Weights;
  setWeights: (w: Weights) => void;
}) {
  const update = (key: keyof Weights, value: number) => {
    setWeights({ ...weights, [key]: value });
  };

  const prettyLabel = (key: keyof Weights) => {
    switch (key) {
      case "upstream":
        return "Upstream (Exploration, Mining)";
      case "midstream":
        return "Midstream (Processing, Components)";
      case "downstream":
        return "Downstream (End Products)";
      case "evBattery":
        return "EV / Battery Theme Match";
      case "chinaExposure":
        return "Align with China Exposure Preference";
      case "riskTolerance":
        return "Match Your Risk Tolerance";
      default:
        return key;
    }
  };

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "1rem",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        marginTop: "1rem",
      }}
    >
      <h3 style={{ marginBottom: "0.5rem" }}>Advisor Weighting</h3>
      <p style={{ marginTop: 0, marginBottom: "1rem", color: "#555" }}>
        Tune how strongly each factor influences ETF recommendations.
      </p>

      {(Object.keys(weights) as (keyof Weights)[]).map((key) => (
        <div key={key} style={{ marginBottom: "1rem" }}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 14 }}>
            {prettyLabel(key)}
          </label>
          <input
            type="range"
            min={0}
            max={10}
            value={weights[key]}
            onChange={(e) => update(key, Number(e.target.value))}
            style={{ width: "100%" }}
          />
          <div style={{ fontSize: 12, color: "#666" }}>
            Weight: {weights[key]}
          </div>
        </div>
      ))}
    </div>
  );
}

// ----------------------
// Supply Chain Flowchart Selector
// ----------------------

const STAGE_LABELS: Record<StageKey, string> = {
  exploration: "Exploration",
  mining: "Mining",
  processing: "Processing",
  components: "Components",
  end_products: "End Products",
};

function FlowchartSelector({
  selected,
  setSelected,
}: {
  selected: StageKey[];
  setSelected: (s: StageKey[]) => void;
}) {
  const toggle = (stage: StageKey) => {
    if (selected.includes(stage)) {
      setSelected(selected.filter((s) => s !== stage));
    } else {
      setSelected([...selected, stage]);
    }
  };

  return (
    <div
      style={{
        background: "#ffffff",
        padding: "1rem",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        marginTop: "1rem",
      }}
    >
      <h3 style={{ marginBottom: "0.5rem" }}>Supply Chain Focus</h3>
      <p style={{ marginTop: 0, marginBottom: "1rem", color: "#555" }}>
        Select the stages of the energy transition supply chain you want
        exposure to.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "0.5rem",
        }}
      >
        {(Object.keys(STAGE_LABELS) as StageKey[]).map((stage) => (
          <button
            key={stage}
            onClick={() => toggle(stage)}
            style={{
              padding: "0.5rem",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: selected.includes(stage) ? "#2563eb" : "#f9fafb",
              color: selected.includes(stage) ? "#fff" : "#333",
              cursor: "pointer",
            }}
          >
            {STAGE_LABELS[stage]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ----------------------
// Simple Card Component
// ----------------------

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#ffffff",
        padding: "1rem",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        marginTop: "1rem",
      }}
    >
      {children}
    </div>
  );
}
// ======================================================
// SECTION 4 — Scoring, Overlap, and Basket Logic
// ======================================================
// ======================================================
// SECTION C — Full Quant Scoring Engine (H2)
// ======================================================

// ------------------------------
// Types for Quant Breakdown
// ------------------------------
export type ETFScoreBreakdown = {
  upstream: number;
  midstream: number;
  downstream: number;
  ev: number;
  china: number;
  risk: number;
  total: number;
  maxPossible: number;
  normalized: number;
};

export type BasketBreakdown = {
  baseScore: number;
  overlapMatrix: number[][];
  totalOverlap: number;
  diversification: number;
  stageCoverage: number;
  evRatio: number;
  chinaAlignment: number;
  riskBalance: number;
  finalScore: number;
};

// ------------------------------
// Helper: Stage Groups
// ------------------------------
const UPSTREAM: StageKey[] = ["exploration", "mining"];
const MIDSTREAM: StageKey[] = ["processing", "components"];
const DOWNSTREAM: StageKey[] = ["end_products"];

// ------------------------------
// ETF Breakdown (raw + weighted + normalized)
// ------------------------------
export function breakdownETFScore(
  etf: ETF,
  selectedStages: StageKey[],
  evPreference: boolean,
  chinaComfort: ChinaComfort,
  riskTolerance: RiskLevel,
  weights: Weights
): ETFScoreBreakdown {
  const hasUp = etf.stages.some((s) => UPSTREAM.includes(s));
  const hasMid = etf.stages.some((s) => MIDSTREAM.includes(s));
  const hasDown = etf.stages.some((s) => DOWNSTREAM.includes(s));

  let upstream = 0;
  let midstream = 0;
  let downstream = 0;

  if (selectedStages.some((s) => UPSTREAM.includes(s)) && hasUp) {
    upstream = weights.upstream;
  }
  if (selectedStages.some((s) => MIDSTREAM.includes(s)) && hasMid) {
    midstream = weights.midstream;
  }
  if (selectedStages.some((s) => DOWNSTREAM.includes(s)) && hasDown) {
    downstream = weights.downstream;
  }

  const ev = etf.evBatteryTheme ? weights.evBattery : 0;

  let china = 0;
  if (chinaComfort === "prefer_low" && etf.chinaExposure === "low")
    china = weights.chinaExposure;
  if (chinaComfort === "prefer_high" && etf.chinaExposure === "high")
    china = weights.chinaExposure;

  let risk = 0;
  if (riskTolerance === etf.riskLevel) risk = weights.riskTolerance;

  const total = upstream + midstream + downstream + ev + china + risk;
  const maxPossible =
    weights.upstream +
    weights.midstream +
    weights.downstream +
    weights.evBattery +
    weights.chinaExposure +
    weights.riskTolerance;

  const normalized = (total / maxPossible) * 100;

  return {
    upstream,
    midstream,
    downstream,
    ev,
    china,
    risk,
    total,
    maxPossible,
    normalized,
  };
}

// ------------------------------
// Overlap Matrix for Baskets
// ------------------------------
export function computeOverlapMatrix(etfs: ETF[]): number[][] {
  const matrix = etfs.map(() => etfs.map(() => 0));

  for (let i = 0; i < etfs.length; i++) {
    for (let j = i + 1; j < etfs.length; j++) {
      const overlap = etfs[i].stages.filter((s) =>
        etfs[j].stages.includes(s)
      ).length;
      matrix[i][j] = overlap;
      matrix[j][i] = overlap;
    }
  }

  return matrix;
}

// ------------------------------
// Basket Breakdown (H2)
// ------------------------------
export function breakdownBasket(
  etfs: ETF[],
  etfScores: Record<string, number>,
  allocations: Record<string, number>
): BasketBreakdown {
  // Base score = sum of ETF scores weighted by allocation %
  const baseScore = etfs.reduce((sum, etf) => {
    const alloc = allocations[etf.ticker] ?? 0;
    return sum + etfScores[etf.ticker] * (alloc / 100);
  }, 0);

  // Overlap matrix
  const overlapMatrix = computeOverlapMatrix(etfs);
  const totalOverlap = overlapMatrix.flat().reduce((a, b) => a + b, 0);

  // Diversification coefficient
  const diversification = 1 / (1 + totalOverlap);

  // Stage coverage
  const uniqueStages = new Set(etfs.flatMap((e) => e.stages));
  const stageCoverage = uniqueStages.size;

  // EV ratio
  const evRatio = etfs.filter((e) => e.evBatteryTheme).length / etfs.length;

  // China alignment (simple version)
  const chinaAlignment =
    etfs.filter((e) => e.chinaExposure === "low").length / etfs.length;

  // Risk balance
  const riskLevels = etfs.map((e) => e.riskLevel);
  const uniqueRiskLevels = new Set(riskLevels).size;
  const riskBalance = uniqueRiskLevels / 3; // normalize 0–1

  // Final score (quant blend)
  const finalScore =
    baseScore * diversification +
    stageCoverage * 2 +
    evRatio * 5 +
    chinaAlignment * 5 +
    riskBalance * 3;

  return {
    baseScore,
    overlapMatrix,
    totalOverlap,
    diversification,
    stageCoverage,
    evRatio,
    chinaAlignment,
    riskBalance,
    finalScore,
  };
}
// ----------------------
// Scoring Engine
// ----------------------

function scoreETF(
  etf: ETF,
  selectedStages: StageKey[],
  evPreference: boolean,
  chinaComfort: ChinaComfort,
  riskTolerance: RiskLevel,
  weights: Weights
): number {
  let score = 0;

  const upstreamStages: StageKey[] = ["exploration", "mining"];
  const midstreamStages: StageKey[] = ["processing", "components"];
  const downstreamStages: StageKey[] = ["end_products"];

  const hasUpstream = etf.stages.some((s) => upstreamStages.includes(s));
  const hasMidstream = etf.stages.some((s) => midstreamStages.includes(s));
  const hasDownstream = etf.stages.some((s) => downstreamStages.includes(s));

  if (selectedStages.some((s) => upstreamStages.includes(s)) && hasUpstream) {
    score += weights.upstream;
  }
  if (selectedStages.some((s) => midstreamStages.includes(s)) && hasMidstream) {
    score += weights.midstream;
  }
  if (
    selectedStages.some((s) => downstreamStages.includes(s)) &&
    hasDownstream
  ) {
    score += weights.downstream;
  }

  if (evPreference && etf.evBatteryTheme) {
    score += weights.evBattery;
  }

  if (chinaComfort === "prefer_low" && etf.chinaExposure === "low") {
    score += weights.chinaExposure;
  }
  if (chinaComfort === "prefer_high" && etf.chinaExposure === "high") {
    score += weights.chinaExposure;
  }

  if (riskTolerance === etf.riskLevel) {
    score += weights.riskTolerance;
  }

  return score;
}

// ----------------------
// Pairwise Overlap (for diagnostics)
// ----------------------

function computeOverlap(selected: ETF[]): Record<string, number> {
  const overlap: Record<string, number> = {};

  selected.forEach((etfA) => {
    selected.forEach((etfB) => {
      if (etfA.ticker === etfB.ticker) return;

      const sharedStages = etfA.stages.filter((s) => etfB.stages.includes(s));
      const overlapScore = sharedStages.length;

      const key = `${etfA.ticker}-${etfB.ticker}`;
      overlap[key] = overlapScore;
    });
  });

  return overlap;
}

// ----------------------
// Basket Overlap Helpers
// ----------------------

function stageOverlap(a: ETF, b: ETF): number {
  return a.stages.filter((s) => b.stages.includes(s)).length;
}

function stageOverlap3(a: ETF, b: ETF, c: ETF): number {
  return stageOverlap(a, b) + stageOverlap(a, c) + stageOverlap(b, c);
}

// ----------------------
// 2-ETF Baskets (Soft Overlap ≤ 1)
// ----------------------

function computeTwoETFCombos(etfs: ScoredETF[]): [ScoredETF, ScoredETF][] {
  const combos: [ScoredETF, ScoredETF][] = [];

  for (let i = 0; i < etfs.length; i++) {
    for (let j = i + 1; j < etfs.length; j++) {
      const A = etfs[i];
      const B = etfs[j];

      if (stageOverlap(A, B) <= 1) {
        combos.push([A, B]);
      }
    }
  }

  return combos;
}

// ----------------------
// 3-ETF Baskets (Soft Overlap ≤ 1 per pair)
// ----------------------

function computeThreeETFCombos(
  etfs: ScoredETF[]
): [ScoredETF, ScoredETF, ScoredETF][] {
  const combos: [ScoredETF, ScoredETF, ScoredETF][] = [];

  for (let i = 0; i < etfs.length; i++) {
    for (let j = i + 1; j < etfs.length; j++) {
      for (let k = j + 1; k < etfs.length; k++) {
        const A = etfs[i];
        const B = etfs[j];
        const C = etfs[k];

        if (
          stageOverlap(A, B) <= 1 &&
          stageOverlap(A, C) <= 1 &&
          stageOverlap(B, C) <= 1
        ) {
          combos.push([A, B, C]);
        }
      }
    }
  }

  return combos;
}

// ----------------------
// Basket Scoring
// ----------------------

function scoreBasket(etfs: ScoredETF[]): number {
  const base = etfs.reduce((sum, e) => sum + e.score, 0);
  const uniqueStages = new Set(etfs.flatMap((e) => e.stages)).size;
  const bonus = uniqueStages * 2;
  return base + bonus;
}

// ----------------------
// Summary Generator
// ----------------------

function generateSummary(
  topETFs: ScoredETF[],
  selectedStages: StageKey[],
  evPreference: boolean,
  chinaComfort: ChinaComfort,
  riskTolerance: RiskLevel
): string {
  if (topETFs.length === 0) {
    return "No ETFs match your criteria. Try adjusting your filters or weights.";
  }

  const stageNames = selectedStages.map((s) => STAGE_LABELS[s]).join(", ");

  return `
Your personalized ETF recommendations are based on:
• Supply chain stages: ${stageNames || "No specific stages selected"}
• EV/Battery preference: ${evPreference ? "Yes" : "No"}
• China exposure comfort: ${chinaComfort}
• Risk tolerance: ${riskTolerance}

Top ETFs:
${topETFs
  .slice(0, 5)
  .map((etf) => `• ${etf.ticker} — ${etf.name} (Score: ${etf.score})`)
  .join("\n")}
  `;
}
// ======================================================
// SECTION E — Allocation‑Weighted Summary Generator
// ======================================================

// Weighted exposure helper
function weightedAverage(values: number[], weights: number[]) {
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  if (totalWeight === 0) return 0;
  return values.reduce((sum, v, i) => sum + v * (weights[i] / totalWeight), 0);
}

// Convert risk level to numeric for weighting
const riskToNumber = {
  low: 1,
  medium: 2,
  high: 3,
};

// Convert China exposure to numeric
const chinaToNumber = {
  low: 0,
  medium: 0.5,
  high: 1,
};

// Convert EV theme to numeric
const evToNumber = (etf: ETF) => (etf.evBatteryTheme ? 1 : 0);

// Convert stage coverage to numeric
function stageCoverageScore(etf: ETF) {
  const unique = new Set(etf.stages);
  return unique.size;
}

// Main summary generator
export function generateAllocationSummary(
  etfs: ETF[],
  allocations: AllocationMap
): string {
  if (etfs.length === 0) return "No ETFs selected.";

  // Extract weights
  const allocWeights = etfs.map((e) => allocations[e.ticker] ?? 0);

  // Weighted EV exposure
  const evValues = etfs.map((e) => evToNumber(e));
  const weightedEV = weightedAverage(evValues, allocWeights);

  // Weighted China exposure
  const chinaValues = etfs.map((e) => chinaToNumber[e.chinaExposure]);
  const weightedChina = weightedAverage(chinaValues, allocWeights);

  // Weighted risk
  const riskValues = etfs.map((e) => riskToNumber[e.riskLevel]);
  const weightedRisk = weightedAverage(riskValues, allocWeights);

  // Weighted stage coverage
  const stageValues = etfs.map((e) => stageCoverageScore(e));
  const weightedStages = weightedAverage(stageValues, allocWeights);

  // Total allocation %
  const totalAlloc = allocWeights.reduce((a, b) => a + b, 0);

  // Build narrative
  return `
Your current allocation totals ${totalAlloc.toFixed(1)}%.

Based on your slider selections:

• EV/battery exposure is ${(weightedEV * 100).toFixed(0)}%.
• China exposure aligns at ${(weightedChina * 100).toFixed(0)}%.
• Risk profile is ${((weightedRisk / 3) * 100).toFixed(0)}% of maximum.
• Supply-chain coverage averages ${weightedStages.toFixed(1)} stages per ETF.

This allocation emphasizes ${
    weightedRisk > 2 ? "higher-volatility assets" : "balanced risk exposure"
  } and ${
    weightedEV > 0.5 ? "strong EV/battery alignment" : "moderate EV exposure"
  }.

Your portfolio reflects ${
    weightedChina < 0.3
      ? "low China dependency"
      : weightedChina < 0.6
      ? "moderate China exposure"
      : "high China concentration"
  }, and maintains ${
    weightedStages >= 3
      ? "broad supply-chain diversification"
      : "focused supply-chain exposure"
  }.

As you adjust allocations, this summary will update to reflect your evolving strategy.
  `;
}
// ======================================================
// Micro‑Insights Generator
// ======================================================

export function generateMicroInsights(
  etfs: ETF[],
  allocations: AllocationMap
): string[] {
  if (etfs.length === 0) return [];

  const allocWeights = etfs.map((e) => allocations[e.ticker] ?? 0);

  const evValues = etfs.map((e) => (e.evBatteryTheme ? 1 : 0));
  const chinaValues = etfs.map((e) =>
    e.chinaExposure === "low" ? 0 : e.chinaExposure === "medium" ? 0.5 : 1
  );
  const riskValues = etfs.map((e) =>
    e.riskLevel === "low" ? 1 : e.riskLevel === "medium" ? 2 : 3
  );
  const stageValues = etfs.map((e) => new Set(e.stages).size);

  const weightedEV = weightedAverage(evValues, allocWeights);
  const weightedChina = weightedAverage(chinaValues, allocWeights);
  const weightedRisk = weightedAverage(riskValues, allocWeights);
  const weightedStages = weightedAverage(stageValues, allocWeights);

  const insights: string[] = [];

  // EV
  if (weightedEV > 0.6)
    insights.push(
      "Your portfolio leans strongly toward EV and battery themes."
    );
  else if (weightedEV > 0.3)
    insights.push(
      "You have moderate EV exposure, balancing growth and stability."
    );
  else
    insights.push(
      "Your EV exposure is low, reducing thematic concentration risk."
    );

  // China
  if (weightedChina < 0.3)
    insights.push(
      "Your China exposure is low, reducing geopolitical and supply‑chain risk."
    );
  else if (weightedChina < 0.6)
    insights.push(
      "Your China exposure is moderate, offering balanced cost and risk."
    );
  else
    insights.push(
      "Your China exposure is high, increasing geopolitical sensitivity."
    );

  // Risk
  if (weightedRisk < 1.7)
    insights.push("Your risk profile is conservative, prioritizing stability.");
  else if (weightedRisk < 2.3)
    insights.push("Your risk profile is balanced across volatility levels.");
  else
    insights.push(
      "Your risk profile is aggressive, emphasizing higher‑volatility assets."
    );

  // Stage coverage
  if (weightedStages >= 3)
    insights.push(
      "Your supply‑chain coverage is broad, improving diversification."
    );
  else
    insights.push(
      "Your supply‑chain coverage is narrow, increasing concentration risk."
    );

  return insights;
}
// ======================================================
// Scenario Engine
// ======================================================

export function applyScenario(
  name: string,
  setSelectedStages: any,
  setEvPreference: any,
  setChinaComfort: any,
  setRiskTolerance: any,
  setAllocations: any,
  topETFs: ETF[]
) {
  switch (name) {
    case "growth":
      setSelectedStages(["components", "end_products"]);
      setEvPreference(true);
      setChinaComfort("medium");
      setRiskTolerance("high");
      break;

    case "riskManaged":
      setSelectedStages(["exploration", "mining", "processing"]);
      setEvPreference(false);
      setChinaComfort("low");
      setRiskTolerance("low");
      break;

    case "diversified":
      setSelectedStages(["exploration", "mining", "processing", "components"]);
      setEvPreference(false);
      setChinaComfort("medium");
      setRiskTolerance("medium");
      break;

    case "batteryMetals":
      setSelectedStages(["mining", "processing"]);
      setEvPreference(true);
      setChinaComfort("medium");
      setRiskTolerance("medium");
      break;

    case "chinaHedge":
      setSelectedStages(["exploration", "mining", "processing"]);
      setEvPreference(false);
      setChinaComfort("low");
      setRiskTolerance("medium");
      break;
  }

  // Reset allocations to 0 for clarity
  const reset: AllocationMap = {};
  topETFs.forEach((e) => (reset[e.ticker] = 0));
  setAllocations(reset);
}
// ======================================================
// SECTION D — Breakdown Components (Expandable)
// ======================================================

// ------------------------------
// ETF Breakdown Component
// ------------------------------
export function ETFBreakdown({ breakdown }: { breakdown: ETFScoreBreakdown }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: "12px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          background: "#fafafa",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        {open ? "Hide breakdown" : "Show breakdown"}
      </button>

      {open && (
        <div
          style={{
            marginTop: "10px",
            padding: "12px",
            background: "#f4f4f4",
            borderRadius: "8px",
            fontSize: "14px",
            lineHeight: "1.4",
          }}
        >
          <div>
            <strong>Upstream:</strong> {breakdown.upstream}
          </div>
          <div>
            <strong>Midstream:</strong> {breakdown.midstream}
          </div>
          <div>
            <strong>Downstream:</strong> {breakdown.downstream}
          </div>
          <div>
            <strong>EV Theme:</strong> {breakdown.ev}
          </div>
          <div>
            <strong>China Alignment:</strong> {breakdown.china}
          </div>
          <div>
            <strong>Risk Alignment:</strong> {breakdown.risk}
          </div>
          <div style={{ marginTop: "6px" }}>
            <strong>Total Score:</strong> {breakdown.total}
          </div>
          <div>
            <strong>Normalized (0–100):</strong>{" "}
            {breakdown.normalized.toFixed(1)}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------
// Basket Breakdown Component
// ------------------------------
export function BasketBreakdown({
  breakdown,
  etfs,
}: {
  breakdown: BasketBreakdown;
  etfs: ETF[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ marginTop: "12px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          background: "#fafafa",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        {open ? "Hide basket breakdown" : "Show basket breakdown"}
      </button>

      {open && (
        <div
          style={{
            marginTop: "10px",
            padding: "12px",
            background: "#eef6ff",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          <div>
            <strong>Base Score:</strong> {breakdown.baseScore.toFixed(2)}
          </div>
          <div>
            <strong>Total Overlap:</strong> {breakdown.totalOverlap}
          </div>
          <div>
            <strong>Diversification Coefficient:</strong>{" "}
            {breakdown.diversification.toFixed(3)}
          </div>
          <div>
            <strong>Stage Coverage:</strong> {breakdown.stageCoverage}
          </div>
          <div>
            <strong>EV Ratio:</strong> {breakdown.evRatio.toFixed(2)}
          </div>
          <div>
            <strong>China Alignment:</strong>{" "}
            {breakdown.chinaAlignment.toFixed(2)}
          </div>
          <div>
            <strong>Risk Balance:</strong> {breakdown.riskBalance.toFixed(2)}
          </div>
          <div>
            <strong>Final Score:</strong> {breakdown.finalScore.toFixed(2)}
          </div>

          <div style={{ marginTop: "12px" }}>
            <strong>Overlap Matrix:</strong>
            <table
              style={{
                width: "100%",
                marginTop: "6px",
                borderCollapse: "collapse",
                fontSize: "13px",
              }}
            >
              <thead>
                <tr>
                  <th></th>
                  {etfs.map((e) => (
                    <th key={e.ticker}>{e.ticker}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {breakdown.overlapMatrix.map((row, i) => (
                  <tr key={i}>
                    <td>
                      <strong>{etfs[i].ticker}</strong>
                    </td>
                    {row.map((val, j) => (
                      <td
                        key={j}
                        style={{
                          border: "1px solid #ccc",
                          padding: "4px",
                          textAlign: "center",
                        }}
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------
// Why This Basket Works (Quant Narrative)
// ------------------------------
export function WhyThisBasketWorks({
  breakdown,
  etfs,
}: {
  breakdown: BasketBreakdown;
  etfs: ETF[];
}) {
  const [open, setOpen] = useState(false);

  const narrative = `
This basket minimizes supply-chain concentration (total overlap ${
    breakdown.totalOverlap
  }),
achieves a diversification coefficient of ${breakdown.diversification.toFixed(
    3
  )},
and covers ${breakdown.stageCoverage} unique supply-chain stages.

EV exposure is ${(breakdown.evRatio * 100).toFixed(
    0
  )}%, while China alignment is
${(breakdown.chinaAlignment * 100).toFixed(0)}%.

Risk balance is strong due to a mix of risk levels across: ${etfs
    .map((e) => e.riskLevel)
    .join(", ")}.

Overall, this basket provides a well-balanced blend of upstream, midstream, and downstream
exposure with quant-verified diversification.
  `;

  return (
    <div style={{ marginTop: "12px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "6px 10px",
          borderRadius: "6px",
          border: "1px solid #ccc",
          background: "#fafafa",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        {open ? "Hide explanation" : "Why this basket works"}
      </button>

      {open && (
        <div
          style={{
            marginTop: "10px",
            padding: "12px",
            background: "#fff7e6",
            borderRadius: "8px",
            fontSize: "14px",
            whiteSpace: "pre-wrap",
            lineHeight: "1.4",
          }}
        >
          {narrative}
        </div>
      )}
    </div>
  );
}
// ======================================================
// ======================================================
// Advanced Weight Panel (High Knowledge Only)
// ======================================================

export function WeightPanel({
  weights,
  setWeights,
}: {
  weights: Weights;
  setWeights: (w: Weights) => void;
}) {
  const [open, setOpen] = useState(false);

  const update = (key: keyof Weights, value: number) => {
    setWeights({ ...weights, [key]: value });
  };

  return (
    <div
      style={{
        padding: "16px",
        marginBottom: "24px",
        borderRadius: "10px",
        background: "#fff7ed",
        border: "1px solid #f0d7b4",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          padding: "8px 12px",
          borderRadius: "6px",
          border: "1px solid #e0c9a8",
          background: "#fff3d9",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        {open ? "Hide Advanced Weights" : "Show Advanced Weights"}
      </button>

      {open && (
        <div style={{ marginTop: "16px" }}>
          {(
            [
              ["upstream", "Upstream"],
              ["midstream", "Midstream"],
              ["downstream", "Downstream"],
              ["evBattery", "EV/Battery"],
              ["chinaExposure", "China Exposure"],
              ["riskTolerance", "Risk Tolerance"],
            ] as [keyof Weights, string][]
          ).map(([key, label]) => (
            <div key={key} style={{ marginBottom: "16px" }}>
              <strong>
                {label}: {weights[key]}
              </strong>
              <input
                type="range"
                min={0}
                max={10}
                value={weights[key]}
                onChange={(e) => update(key, Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ======================================================
// SECTION F — Final App Integration
// ======================================================

export default function App() {
  // ------------------------------
  // User Inputs
  // ------------------------------
  const [selectedStages, setSelectedStages] = useState<StageKey[]>([]);
  const [evPreference, setEvPreference] = useState(false);
  const [chinaComfort, setChinaComfort] = useState<ChinaComfort>("neutral");
  const [riskTolerance, setRiskTolerance] = useState<RiskLevel>("medium");
  const [knowledge, setKnowledge] =
    useState<keyof typeof KnowledgeMode>("medium");
  const [weights, setWeights] = useState<Weights>(DEFAULT_WEIGHTS);

  // ------------------------------
  // Allocation State
  // ------------------------------
  const [portfolioValue, setPortfolioValue] = useState(DEFAULT_PORTFOLIO_VALUE);
  const [allocations, setAllocations] = useState<AllocationMap>({});

  const setAllocation = (ticker: string, value: number) => {
    setAllocations((prev) => ({ ...prev, [ticker]: value }));
  };

  // ------------------------------
  // Filter ETFs based on user inputs
  // ------------------------------
  const filteredETFs = ETF_DATA.filter((etf) => {
    if (selectedStages.length > 0) {
      const matchesStage = etf.stages.some((s) => selectedStages.includes(s));
      if (!matchesStage) return false;
    }
    if (evPreference && !etf.evBatteryTheme) return false;
    return true;
  });

  // ------------------------------
  // Score ETFs
  // ------------------------------
  const etfScores: Record<string, number> = {};
  const etfBreakdowns: Record<string, ETFScoreBreakdown> = {};

  filteredETFs.forEach((etf) => {
    const breakdown = breakdownETFScore(
      etf,
      selectedStages,
      evPreference,
      chinaComfort,
      riskTolerance,
      DEFAULT_WEIGHTS
    );
    etfBreakdowns[etf.ticker] = breakdown;
    etfScores[etf.ticker] = breakdown.total;
  });

  // ------------------------------
  // Sort ETFs by score
  // ------------------------------
  const sortedETFs = [...filteredETFs].sort(
    (a, b) => etfScores[b.ticker] - etfScores[a.ticker]
  );

  // ------------------------------
  // Limit ETFs based on knowledge mode
  // ------------------------------
  const maxETFs = KnowledgeMode[knowledge].maxETFs;
  const topETFs = sortedETFs.slice(0, maxETFs);

  // ------------------------------
  // Allocation‑Weighted Summary
  // ------------------------------
  const allocationSummary = generateAllocationSummary(topETFs, allocations);

  // ------------------------------
  // Basket Scoring (2‑ETF + 3‑ETF)
  // ------------------------------
  const twoETFCombos = [];
  const threeETFCombos = [];

  for (let i = 0; i < topETFs.length; i++) {
    for (let j = i + 1; j < topETFs.length; j++) {
      twoETFCombos.push([topETFs[i], topETFs[j]]);
      for (let k = j + 1; k < topETFs.length; k++) {
        threeETFCombos.push([topETFs[i], topETFs[j], topETFs[k]]);
      }
    }
  }

  const scoredTwo = twoETFCombos
    .map((combo) => ({
      etfs: combo,
      breakdown: breakdownBasket(combo, etfScores, allocations),
    }))
    .sort((a, b) => b.breakdown.finalScore - a.breakdown.finalScore)
    .slice(0, KnowledgeMode[knowledge].maxTwoBaskets);

  const scoredThree = threeETFCombos
    .map((combo) => ({
      etfs: combo,
      breakdown: breakdownBasket(combo, etfScores, allocations),
    }))
    .sort((a, b) => b.breakdown.finalScore - a.breakdown.finalScore)
    .slice(0, KnowledgeMode[knowledge].maxThreeBaskets);

  // ------------------------------
  // Render
  // ------------------------------
  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1>Energy Transition & Critical Minerals ETF Advisor</h1>

      {/* Knowledge Mode Selector */}
      <div style={{ marginBottom: "20px" }}>
        <label>
          <strong>Knowledge Level:</strong>
        </label>
        <select
          value={knowledge}
          onChange={(e) => setKnowledge(e.target.value as any)}
          style={{ marginLeft: "10px", padding: "6px" }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* ================================
    FILTER PANEL (Always Visible)
   ================================ */}
      <div
        style={{
          padding: "16px",
          marginBottom: "24px",
          borderRadius: "10px",
          background: "#f3f4f6",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2 style={{ marginTop: 0 }}>Filters</h2>

        {/* Stage Selection */}
        <div style={{ marginBottom: "16px" }}>
          <strong>Supply Chain Stages:</strong>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              marginTop: "8px",
            }}
          >
            {[
              { key: "exploration", label: "Exploration" },
              { key: "mining", label: "Mining" },
              { key: "processing", label: "Processing" },
              { key: "components", label: "Components" },
              { key: "end_products", label: "End Products" },
            ].map((stage) => (
              <label
                key={stage.key}
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <input
                  type="checkbox"
                  checked={selectedStages.includes(stage.key as StageKey)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStages([
                        ...selectedStages,
                        stage.key as StageKey,
                      ]);
                    } else {
                      setSelectedStages(
                        selectedStages.filter((s) => s !== stage.key)
                      );
                    }
                  }}
                />
                {stage.label}
              </label>
            ))}
          </div>
        </div>

        {/* EV Preference */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="checkbox"
              checked={evPreference}
              onChange={(e) => setEvPreference(e.target.checked)}
            />
            <strong>Prefer EV/Battery ETFs</strong>
          </label>
        </div>

        {/* China Comfort */}
        <div style={{ marginBottom: "16px" }}>
          <strong>China Exposure Preference:</strong>
          <select
            value={chinaComfort}
            onChange={(e) => setChinaComfort(e.target.value as ChinaComfort)}
            style={{ marginLeft: "10px", padding: "6px" }}
          >
            <option value="low">Prefer Low</option>
            <option value="medium">Neutral</option>
            <option value="high">Prefer High</option>
          </select>
        </div>

        {/* Risk Tolerance */}
        <div style={{ marginBottom: "16px" }}>
          <strong>Risk Tolerance:</strong>
          <select
            value={riskTolerance}
            onChange={(e) => setRiskTolerance(e.target.value as RiskLevel)}
            style={{ marginLeft: "10px", padding: "6px" }}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
      {/* Portfolio Value */}
      <PortfolioValueInput
        portfolioValue={portfolioValue}
        setPortfolioValue={setPortfolioValue}
      />
      {/* Advanced Weights (High Knowledge Only) */}
      {knowledge === "high" && (
        <WeightPanel weights={weights} setWeights={setWeights} />
      )}

      {/* ETF Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
          gap: "20px",
        }}
      >
        {topETFs.map((etf) => (
          <div
            key={etf.ticker}
            style={{
              padding: "16px",
              borderRadius: "10px",
              border: "1px solid #ddd",
              background: "#fff",
            }}
          >
            <h3 style={{ marginTop: 0 }}>
              {etf.ticker} — {etf.name}
            </h3>

            <div>
              <strong>Score:</strong> {etfScores[etf.ticker]}
            </div>

            {/* Breakdown (only in high knowledge) */}
            {KnowledgeMode[knowledge].showBreakdowns && (
              <ETFBreakdown breakdown={etfBreakdowns[etf.ticker]} />
            )}

            {/* Allocation Slider */}
            <AllocationSlider
              ticker={etf.ticker}
              allocation={allocations[etf.ticker] ?? 0}
              setAllocation={setAllocation}
              portfolioValue={portfolioValue}
            />
          </div>
        ))}
      </div>

      {/* Allocation Totals */}
      <AllocationTotals allocations={allocations} />

      {/* Summary */}
      <div
        style={{
          marginTop: "30px",
          padding: "16px",
          background: "#f9f9f9",
          borderRadius: "10px",
        }}
      >
        <h2>Portfolio Summary</h2>
        <pre style={{ whiteSpace: "pre-wrap" }}>{allocationSummary}</pre>
        {/* Micro‑Insights */}
        <div style={{ marginTop: "16px" }}>
          <h3>What This Means for You</h3>
          <ul>
            {generateMicroInsights(topETFs, allocations).map((insight, i) => (
              <li key={i}>{insight}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Basket Recommendations */}
      <h2 style={{ marginTop: "40px" }}>Top Basket Recommendations</h2>

      {/* 2‑ETF Baskets */}
      {scoredTwo.map(({ etfs, breakdown }, idx) => (
        <div
          key={idx}
          style={{
            marginTop: "20px",
            padding: "16px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            background: "#fff",
          }}
        >
          <h3>{etfs.map((e) => e.ticker).join(" + ")}</h3>
          <div>
            <strong>Score:</strong> {breakdown.finalScore.toFixed(2)}
          </div>

          {KnowledgeMode[knowledge].showBreakdowns && (
            <>
              <BasketBreakdown breakdown={breakdown} etfs={etfs} />
              <WhyThisBasketWorks breakdown={breakdown} etfs={etfs} />
            </>
          )}
        </div>
      ))}

      {/* 3‑ETF Baskets */}
      {scoredThree.map(({ etfs, breakdown }, idx) => (
        <div
          key={idx}
          style={{
            marginTop: "20px",
            padding: "16px",
            borderRadius: "10px",
            border: "1px solid #ddd",
            background: "#fff",
          }}
        >
          <h3>{etfs.map((e) => e.ticker).join(" + ")}</h3>
          <div>
            <strong>Score:</strong> {breakdown.finalScore.toFixed(2)}
          </div>

          {KnowledgeMode[knowledge].showBreakdowns && (
            <>
              <BasketBreakdown breakdown={breakdown} etfs={etfs} />
              <WhyThisBasketWorks breakdown={breakdown} etfs={etfs} />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
