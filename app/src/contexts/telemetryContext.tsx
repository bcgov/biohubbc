import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { useTelemetryApi } from 'hooks/useTelemetryApi';
import { createContext, PropsWithChildren } from 'react';

export type ITelemetryContext = {
  telemetryDataLoader: DataLoader<[], {}, unknown>;
};

export const TelemetryContext = createContext<ITelemetryContext>({
  telemetryDataLoader: {} as DataLoader<never, {}, unknown>
});

export const TelemetryContextProvider = (props: PropsWithChildren<Record<never, any>>) => {
  // const { projectId, surveyId } = useContext(SurveyContext);
  const telemetryApi = useTelemetryApi();

  const telemetryDataLoader = useDataLoader(() => telemetryApi.getManualTelemetry());

  telemetryDataLoader.load();

  const telemetryContext: ITelemetryContext = {
    telemetryDataLoader
  };

  return <TelemetryContext.Provider value={telemetryContext}>{props.children}</TelemetryContext.Provider>;
};
