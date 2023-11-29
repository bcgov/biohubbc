import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IManualTelemetry, useTelemetryApi } from 'hooks/useTelemetryApi';
import { createContext, PropsWithChildren } from 'react';

export type ITelemetryContext = {
  telemetryDataLoader: DataLoader<[], IManualTelemetry[], unknown>;
  vendorTelemetryDataLoader: DataLoader<[], IManualTelemetry[], unknown>;
};

export const TelemetryDataContext = createContext<ITelemetryContext>({
  telemetryDataLoader: {} as DataLoader<never, IManualTelemetry[], unknown>,
  vendorTelemetryDataLoader: {} as DataLoader<never, IManualTelemetry[], unknown>
});

export const TelemetryContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  // const { projectId, surveyId } = useContext(SurveyContext);
  const telemetryApi = useTelemetryApi();

  const telemetryDataLoader = useDataLoader(() => telemetryApi.getManualTelemetry());
  const vendorTelemetryDataLoader = useDataLoader(() => telemetryApi.getVendorTelemetry());

  telemetryDataLoader.load();

  const telemetryContext: ITelemetryContext = {
    telemetryDataLoader,
    vendorTelemetryDataLoader
  };

  return <TelemetryDataContext.Provider value={telemetryContext}>{props.children}</TelemetryDataContext.Provider>;
};
