import Box from '@mui/material/Box';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext, useTelemetryDataContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { ITelemetry } from 'hooks/useTelemetryApi';
import { ICaptureResponse } from 'interfaces/useCritterApi.interface';
import { IGetSurveyObservationsGeometryResponse } from 'interfaces/useObservationApi.interface';
import { useEffect } from 'react';
import { SurveySpatialDatasetViewEnum } from './SurveySpatialToolbar';
import SurveyDataMap from './map/SurveyDataMap';
import SurveyDataTable from './table/SurveyDataTable';

interface ISurveyDataMapTableContainerProps {
  activeView: SurveySpatialDatasetViewEnum;
}

export const SurveyDataMapTableContainer = (props: ISurveyDataMapTableContainerProps) => {
  const { activeView } = props;

  const surveyContext = useSurveyContext();
  const telemetryContext = useTelemetryDataContext();

  const { surveyId, projectId } = surveyContext;

  const biohubApi = useBiohubApi();

  // OBSERVATIONS
  const observationsGeometryDataLoader = useDataLoader(() =>
    biohubApi.observation.getObservationsGeometry(projectId, surveyId)
  );

  // TELEMETRY
  const deploymentIds = surveyContext.deploymentDataLoader.data?.map((item) => item.deployment_id) ?? [];

  // ANIMALS
  const animalsDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCritters(projectId, surveyId));

  useEffect(() => {
    if (activeView === SurveySpatialDatasetViewEnum.OBSERVATIONS) {
      observationsGeometryDataLoader.load();
    }
    if (activeView === SurveySpatialDatasetViewEnum.TELEMETRY) {
      telemetryContext.telemetryDataLoader.refresh(deploymentIds);
    }
    if (activeView === SurveySpatialDatasetViewEnum.ANIMALS) {
      animalsDataLoader.load();
    }
  }, [activeView]);

  const isLoading =
    animalsDataLoader.isLoading ||
    telemetryContext.telemetryDataLoader.isLoading ||
    observationsGeometryDataLoader.isLoading;


  // DATA
  const captures: ICaptureResponse[] = []; //animalsDataLoader.data?.map((animal) => animal.captures) ?? [];
  const observations: IGetSurveyObservationsGeometryResponse | undefined = observationsGeometryDataLoader.data;
  const telemetry: ITelemetry[] = telemetryContext.telemetryDataLoader.data ?? [];

  return (
    <>
      {/* MAP */}
      <Box height={{ sm: 300, md: 500 }} position="relative">
        <SurveyDataMap
          activeView={activeView}
          captures={captures}
          observations={observations?.surveyObservationsGeometry ?? []}
          telemetry={telemetry}
        />
      </Box>

      {/* DATA TABLE */}
      <Box p={2} position="relative">
        <SurveyDataTable activeView={activeView} isLoading={isLoading} />
      </Box>
    </>
  );
};
