import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IManualTelemetry, IVendorTelemetry, useTelemetryApi } from 'hooks/useTelemetryApi';
import { createContext, PropsWithChildren } from 'react';

export type ITelemetryDataContext = {
  telemetryDataLoader: DataLoader<[ids: string[]], IManualTelemetry[], unknown>;
  vendorTelemetryDataLoader: DataLoader<[ids: string[]], IVendorTelemetry[], unknown>;
};

export const TelemetryDataContext = createContext<ITelemetryDataContext>({
  telemetryDataLoader: {} as DataLoader<[ids: string[]], IManualTelemetry[], unknown>,
  vendorTelemetryDataLoader: {} as DataLoader<[ids: string[]], IVendorTelemetry[], unknown>
});

export const TelemetryDataContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  // const { projectId, surveyId } = useContext(SurveyContext);
  const telemetryApi = useTelemetryApi();

  const telemetryDataLoader = useDataLoader(telemetryApi.getManualTelemetry);
  const vendorTelemetryDataLoader = useDataLoader(telemetryApi.getVendorTelemetry);

  // telemetryDataLoader.load();

  const telemetryDataContext: ITelemetryDataContext = {
    telemetryDataLoader,
    vendorTelemetryDataLoader
  };

  return <TelemetryDataContext.Provider value={telemetryDataContext}>{props.children}</TelemetryDataContext.Provider>;
};
