import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Asset, PositionType, MarketDataSource } from '../backend';

export function useAddPosition() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      asset,
      positionType,
      amount,
    }: {
      asset: Asset;
      positionType: PositionType;
      amount: number;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addPosition(asset, positionType, amount);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positions'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
    },
  });
}

export function useGetAllPositions() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['positions'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllPositions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPortfolio() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['portfolio'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getAggregatedPortfolio();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetRiskMetrics() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['risk-metrics'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getRiskMetrics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetYieldMetrics() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ['yield-metrics'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getYieldMetrics();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSetMarketDataSource() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (source: MarketDataSource) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.setMarketDataSource(source);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-data-source'] });
    },
  });
}
