import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { IAllTelemetry } from 'interfaces/useTelemetryApi.interface';
import { createContext, PropsWithChildren } from 'react';

export type IAllTelemetryDataContext = {
  telemetryDataLoader: DataLoader<[ids: string[]], IAllTelemetry[], unknown>;
};

export const TelemetryDataContext = createContext<IAllTelemetryDataContext>({
  telemetryDataLoader: {} as DataLoader<[ids: string[]], IAllTelemetry[], unknown>
});

export const TelemetryDataContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  const telemetryApi = useTelemetryApi();

  const telemetryDataLoader = useDataLoader(telemetryApi.getAllTelemetryByDeploymentIds);

  const telemetryDataContext: IAllTelemetryDataContext = {
    telemetryDataLoader
  };

  return <TelemetryDataContext.Provider value={telemetryDataContext}>{props.children}</TelemetryDataContext.Provider>;
};
