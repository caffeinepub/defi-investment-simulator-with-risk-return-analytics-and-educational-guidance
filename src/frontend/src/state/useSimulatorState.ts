import { create } from 'zustand';
import { Position, ScenarioConfig, SimulationResult, RiskResult, ReturnResult } from '../simulation/types';
import { runSimulation } from '../simulation/engine';
import { calculateRiskMetrics } from '../simulation/risk';
import { calculateReturns } from '../simulation/returns';
import { Protocol } from '../backend';

interface SimulatorState {
  // Inputs
  positions: Position[];
  selectedProtocol: Protocol;
  isLiveData: boolean;
  timeframeDays: number;
  priceShockPct: number;

  // Outputs
  simulationResult: SimulationResult | null;
  riskResult: RiskResult | null;
  returnResult: ReturnResult | null;

  // Actions
  addPosition: (position: Omit<Position, 'id' | 'createdAt'>) => void;
  removePosition: (id: string) => void;
  updatePosition: (id: string, updates: Partial<Position>) => void;
  setProtocol: (protocol: Protocol) => void;
  setDataSource: (isLive: boolean) => void;
  setTimeframe: (days: number) => void;
  setPriceShock: (pct: number) => void;
  runSimulation: () => void;
  clearPositions: () => void;
}

let positionCounter = 0;

export const useSimulatorState = create<SimulatorState>((set, get) => ({
  // Initial state
  positions: [],
  selectedProtocol: Protocol.aave,
  isLiveData: false,
  timeframeDays: 30,
  priceShockPct: 0,
  simulationResult: null,
  riskResult: null,
  returnResult: null,

  // Actions
  addPosition: (position) => {
    const newPosition: Position = {
      ...position,
      id: `pos-${positionCounter++}`,
      createdAt: Date.now(),
    };
    set((state) => ({
      positions: [...state.positions, newPosition],
    }));
  },

  removePosition: (id) => {
    set((state) => ({
      positions: state.positions.filter((p) => p.id !== id),
    }));
  },

  updatePosition: (id, updates) => {
    set((state) => ({
      positions: state.positions.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  },

  setProtocol: (protocol) => {
    set({ selectedProtocol: protocol });
  },

  setDataSource: (isLive) => {
    set({ isLiveData: isLive });
  },

  setTimeframe: (days) => {
    set({ timeframeDays: days });
  },

  setPriceShock: (pct) => {
    // Coerce invalid inputs to safe defaults and clamp to range
    let safePct = typeof pct === 'number' && !isNaN(pct) ? pct : 0;
    safePct = Math.max(-50, Math.min(50, safePct));
    
    set({ priceShockPct: safePct });
    
    // Recalculate risk with new price shock
    const state = get();
    if (state.positions.length > 0) {
      const riskResult = calculateRiskMetrics(state.positions, safePct);
      set({ riskResult });
    }
  },

  runSimulation: () => {
    const state = get();
    if (state.positions.length === 0) return;

    const config: ScenarioConfig = {
      timeframeDays: state.timeframeDays,
      priceShockPct: state.priceShockPct,
    };

    const simulationResult = runSimulation(state.positions, config);
    const riskResult = calculateRiskMetrics(state.positions, state.priceShockPct);
    const returnResult = calculateReturns(state.positions, state.timeframeDays);

    set({
      simulationResult,
      riskResult,
      returnResult,
    });
  },

  clearPositions: () => {
    set({
      positions: [],
      simulationResult: null,
      riskResult: null,
      returnResult: null,
    });
  },
}));
