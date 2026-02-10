import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Position {
    id: bigint;
    asset: Asset;
    createdAt: Time;
    positionType: PositionType;
    amount: number;
}
export type Time = bigint;
export interface ScenarioStep {
    timestamp: Time;
    priceChangePct: number;
    interestAccrued: number;
}
export interface EducationalGuidance {
    parameterSuggestions: string;
    riskAnalysis: string;
    learningResources: Array<string>;
}
export interface RiskMetrics {
    collateralRatio: number;
    healthFactor: number;
    priceSensitivity: number;
    liquidationThreshold: number;
}
export interface Asset {
    id: string;
    name: string;
    interestRate: number;
    priceUSD: number;
    liquidationThreshold: number;
    symbol: string;
}
export interface YieldMetrics {
    apr: number;
    apy: number;
    depositInterest: number;
    borrowInterest: number;
    netYield: number;
}
export interface MarketDataSource {
    protocol: Protocol;
    isLive: boolean;
}
export interface PortfolioTotals {
    netValue: number;
    healthFactor: number;
    liquidationPrice: number;
    totalBorrows: number;
    totalDeposits: number;
}
export enum PositionType {
    borrow = "borrow",
    deposit = "deposit"
}
export enum Protocol {
    aave = "aave",
    compound = "compound"
}
export interface backendInterface {
    addPosition(asset: Asset, positionType: PositionType, amount: number): Promise<void>;
    addScenarioStep(priceChangePct: number, interestAccrued: number): Promise<void>;
    getAggregatedPortfolio(): Promise<PortfolioTotals>;
    getAllPositions(): Promise<Array<Position>>;
    getEducationalGuidance(): Promise<EducationalGuidance>;
    getMarketDataSource(): Promise<MarketDataSource>;
    getRiskMetrics(): Promise<RiskMetrics>;
    getScenarioHistory(): Promise<Array<ScenarioStep>>;
    getYieldMetrics(): Promise<YieldMetrics>;
    setMarketDataSource(source: MarketDataSource): Promise<void>;
}
