import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { ITelemetry, useTelemetryApi } from 'hooks/useTelemetryApi';
import { createContext, PropsWithChildren } from 'react';

export type ITelemetryDataContext = {
  telemetryDataLoader: DataLoader<[ids: string[]], ITelemetry[], unknown>;
};

export const TelemetryDataContext = createContext<ITelemetryDataContext>({
  telemetryDataLoader: {} as DataLoader<[ids: string[]], ITelemetry[], unknown>
});

export const TelemetryDataContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  // const { projectId, surveyId } = useContext(SurveyContext);
  const telemetryApi = useTelemetryApi();

  const telemetryDataLoader = useDataLoader(telemetryApi.getAllTelemetry);

  // telemetryDataLoader.load();

  const telemetryDataContext: ITelemetryDataContext = {
    telemetryDataLoader
  };

  return <TelemetryDataContext.Provider value={telemetryDataContext}>{props.children}</TelemetryDataContext.Provider>;
};
