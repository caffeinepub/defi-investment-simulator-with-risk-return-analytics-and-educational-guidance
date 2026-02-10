import Array "mo:core/Array";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Map "mo:core/Map";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Time "mo:core/Time";

actor {
  var isUsingLiveData = false;

  public type Protocol = {
    #aave;
    #compound;
  };

  public type PositionType = {
    #deposit;
    #borrow;
  };

  public type ScenarioStep = {
    timestamp : Time.Time;
    priceChangePct : Float;
    interestAccrued : Float;
  };

  public type Asset = {
    id : Text;
    name : Text;
    symbol : Text;
    priceUSD : Float;
    interestRate : Float;
    liquidationThreshold : Float;
  };

  public type Position = {
    id : Nat;
    asset : Asset;
    positionType : PositionType;
    amount : Float;
    createdAt : Time.Time;
  };

  public type PortfolioTotals = {
    totalDeposits : Float;
    totalBorrows : Float;
    netValue : Float;
    healthFactor : Float;
    liquidationPrice : Float;
  };

  public type RiskMetrics = {
    collateralRatio : Float;
    liquidationThreshold : Float;
    priceSensitivity : Float;
    healthFactor : Float;
  };

  public type YieldMetrics = {
    depositInterest : Float;
    borrowInterest : Float;
    netYield : Float;
    apr : Float;
    apy : Float;
  };

  public type EducationalGuidance = {
    riskAnalysis : Text;
    parameterSuggestions : Text;
    learningResources : [Text];
  };

  public type MarketDataSource = {
    isLive : Bool;
    protocol : Protocol;
  };

  let positions = Map.empty<Nat, Position>();
  let history = List.empty<ScenarioStep>();

  var positionCounter = 0;

  let marketData : Map.Map<Protocol, [Asset]> = Map.empty();

  module PortfolioTotals {
    public func compare(t1 : PortfolioTotals, t2 : PortfolioTotals) : Order.Order {
      Float.compare(t1.netValue, t2.netValue);
    };
  };

  module ScenarioStep {
    public func compare(s1 : ScenarioStep, s2 : ScenarioStep) : Order.Order {
      Int.compare(s1.timestamp, s2.timestamp);
    };
  };

  public shared ({ caller }) func addPosition(asset : Asset, positionType : PositionType, amount : Float) : async () {
    let newPosition : Position = {
      id = positionCounter;
      asset;
      positionType;
      amount;
      createdAt = Time.now();
    };

    positions.add(positionCounter, newPosition);
    positionCounter += 1;
  };

  public shared ({ caller }) func addScenarioStep(priceChangePct : Float, interestAccrued : Float) : async () {
    let step : ScenarioStep = {
      timestamp = Time.now();
      priceChangePct;
      interestAccrued;
    };
    history.add(step);
  };

  public query ({ caller }) func getRiskMetrics() : async RiskMetrics {
    let totalDeposits = positions.values().map(func(pos) { if (pos.positionType == #deposit) { pos.amount } else { 0.0 } }).foldLeft(0.0, Float.add);
    let totalBorrows = positions.values().map(func(pos) { if (pos.positionType == #borrow) { pos.amount } else { 0.0 } }).foldLeft(0.0, Float.add);

    let collateralRatio = if (totalBorrows > 0.0) {
      totalDeposits / totalBorrows;
    } else {
      0.0;
    };

    let liquidationThreshold = 0.8;
    let priceSensitivity = 0.05;
    let healthFactor = if (totalBorrows > 0.0) { collateralRatio / liquidationThreshold } else {
      1.0;
    };

    {
      collateralRatio;
      liquidationThreshold;
      priceSensitivity;
      healthFactor;
    };
  };

  public query ({ caller }) func getYieldMetrics() : async YieldMetrics {
    let depositInterest = positions.values().map(func(pos) { if (pos.positionType == #deposit) { pos.amount * pos.asset.interestRate } else { 0.0 } }).foldLeft(0.0, Float.add);
    let borrowInterest = positions.values().map(func(pos) { if (pos.positionType == #borrow) { pos.amount * pos.asset.interestRate } else { 0.0 } }).foldLeft(0.0, Float.add);

    let netYield = depositInterest - borrowInterest;
    let apr = netYield * 100.0;
    let apy = (1.0 + netYield) ** 365.0 - 1.0;

    {
      depositInterest;
      borrowInterest;
      netYield;
      apr;
      apy;
    };
  };

  public query ({ caller }) func getEducationalGuidance() : async EducationalGuidance {
    {
      riskAnalysis = "Your portfolio is primarily composed of stablecoins, making it relatively safe but with lower returns. Consider diversifying.";
      parameterSuggestions = "Try reducing your borrow ratio to avoid potential liquidation and take advantage of variable interest rates.";
      learningResources = [
        "https://www.consensys.net/blog/aave-yield-vault/",
        "https://medium.com/protocolthoughts/defi-risk-management-guide",
      ];
    };
  };

  public shared ({ caller }) func setMarketDataSource(source : MarketDataSource) : async () {
    isUsingLiveData := source.isLive;
  };

  public query ({ caller }) func getMarketDataSource() : async MarketDataSource {
    {
      isLive = isUsingLiveData;
      protocol = #aave;
    };
  };

  public query ({ caller }) func getAllPositions() : async [Position] {
    positions.values().toArray();
  };

  public query ({ caller }) func getScenarioHistory() : async [ScenarioStep] {
    history.toArray().sort();
  };

  public query ({ caller }) func getAggregatedPortfolio() : async PortfolioTotals {
    let totalDeposits = positions.values().map(func(pos) { if (pos.positionType == #deposit) { pos.amount } else { 0.0 } }).foldLeft(0.0, Float.add);
    let totalBorrows = positions.values().map(func(pos) { if (pos.positionType == #borrow) { pos.amount } else { 0.0 } }).foldLeft(0.0, Float.add);
    let netValue = totalDeposits - totalBorrows;

    let healthFactor = if (totalBorrows > 0.0) { totalDeposits / totalBorrows } else { 1.0 };
    let liquidationPrice = if (totalDeposits > 0.0) { totalBorrows / totalDeposits } else { 0.0 };

    {
      totalDeposits;
      totalBorrows;
      netValue;
      healthFactor;
      liquidationPrice;
    };
  };
};
