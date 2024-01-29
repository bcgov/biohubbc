import { mdiBroadcast, mdiEye } from '@mdi/js';
import { Box, Paper } from '@mui/material';
import { CodesContext } from 'contexts/codesContext';
import { ObservationsContext } from 'contexts/observationsContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TaxonomyContext } from 'contexts/taxonomyContext';
import { TelemetryDataContext } from 'contexts/telemetryDataContext';
import { Position } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useContext, useEffect, useMemo, useState } from 'react';
import { INonEditableGeometries } from 'utils/mapUtils';
import SurveySpatialToolbar, { SurveySpatialDatasetViewEnum } from './components/SurveyMapToolbar';
import SurveyMap from './SurveyMap';
import SurveySpatialObservationDataTable from './SurveySpatialObservationDataTable';
import SurveySpatialTelemetryDataTable from './SurveySpatialTelemetryDataTable';

const SurveySpatialData = () => {
  const [activeView, setActiveView] = useState<SurveySpatialDatasetViewEnum>(SurveySpatialDatasetViewEnum.OBSERVATIONS);

  const observationsContext = useContext(ObservationsContext);
  const telemetryContext = useContext(TelemetryDataContext);
  const taxonomyContext = useContext(TaxonomyContext);
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);
  const { projectId, surveyId } = useContext(SurveyContext);

  const biohubApi = useBiohubApi();

  const observationsGeometryDataLoader = useDataLoader(() =>
    biohubApi.observation.getObservationsGeometry(projectId, surveyId)
  );

  observationsGeometryDataLoader.load();

  // TODO is this actually needed?
  useEffect(() => {
    codesContext.codesDataLoader.load();
    surveyContext.deploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    surveyContext.critterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    observationsContext.observationsDataLoader.refresh();
  }, []);

  useEffect(() => {
    if (surveyContext.deploymentDataLoader.data) {
      const deploymentIds = surveyContext.deploymentDataLoader.data.map((item) => item.deployment_id);
      telemetryContext.telemetryDataLoader.refresh(deploymentIds);
    }
  }, [surveyContext.deploymentDataLoader.data]);

  // Fetch/cache all taxonomic data for the observations
  useEffect(() => {
    const cacheTaxonomicData = async () => {
      if (observationsContext.observationsDataLoader.data) {
        // fetch all unique wldtaxonomic_units_id's from observations to find taxonomic names
        const taxonomicIds = [
          ...new Set(
            observationsContext.observationsDataLoader.data.surveyObservations.map((item) => item.wldtaxonomic_units_id)
          )
        ];
        await taxonomyContext.cacheSpeciesTaxonomyByIds(taxonomicIds);
      }
    };

    cacheTaxonomicData();
  }, [observationsContext.observationsDataLoader.data]);

  const telemetryPoints: INonEditableGeometries[] = useMemo(() => {
    const telemetryData = telemetryContext.telemetryDataLoader.data;
    if (!telemetryData) {
      return [];
    }

    return telemetryData
      .filter((telemetry) => telemetry.latitude !== undefined && telemetry.longitude !== undefined)
      .map((telemetry) => {
        return {
          feature: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [telemetry.longitude, telemetry.latitude] as Position
            }
          },
          popupComponent: undefined
        };
      });
  }, [telemetryContext.telemetryDataLoader.data]);

  const observationPoints: INonEditableGeometries[] = useMemo(() => {
    return (observationsGeometryDataLoader.data?.surveyObservationsGeometry ?? []).map((observation) => {
      return {
        feature: {
          type: 'Feature',
          properties: {},
          geometry: observation.geometry
        },
        popupComponent: undefined
      };
    });
  }, [observationsGeometryDataLoader.data]);

  let isLoading = false;
  if (activeView === SurveySpatialDatasetViewEnum.OBSERVATIONS) {
    isLoading =
      codesContext.codesDataLoader.isLoading ||
      surveyContext.sampleSiteDataLoader.isLoading ||
      observationsContext.observationsDataLoader.isLoading;
  }

  if (activeView === SurveySpatialDatasetViewEnum.TELEMETRY) {
    isLoading =
      codesContext.codesDataLoader.isLoading ||
      surveyContext.deploymentDataLoader.isLoading ||
      surveyContext.critterDataLoader.isLoading;
  }

  let mapPoints: INonEditableGeometries[] = [];
  switch (activeView) {
    case SurveySpatialDatasetViewEnum.OBSERVATIONS:
      mapPoints = observationPoints;
      break;
    case SurveySpatialDatasetViewEnum.TELEMETRY:
      mapPoints = telemetryPoints;
      break;
    case SurveySpatialDatasetViewEnum.MARKED_ANIMALS:
      mapPoints = [];
      break;
    default:
      break;
  }

  return (
    <Paper>
      <SurveySpatialToolbar
        activeView={activeView}
        views={[
          {
            label: `Observations (${
              observationsGeometryDataLoader.data?.supplementaryObservationData?.observationCount ?? 0
            })`,
            value: SurveySpatialDatasetViewEnum.OBSERVATIONS,
            icon: mdiEye,
            isLoading: false
          },
          {
            label: `Telemetry (${telemetryPoints.length})`,
            value: SurveySpatialDatasetViewEnum.TELEMETRY,
            icon: mdiBroadcast,
            isLoading: false
          }
        ]}
        updateDatasetView={setActiveView}
      />

      <Box height={{ sm: 300, md: 500 }} position="relative">
        <SurveyMap mapPoints={mapPoints} isLoading={isLoading} />
      </Box>
      <Box py={1} px={2} position="relative">
        {activeView === SurveySpatialDatasetViewEnum.OBSERVATIONS && (
          <SurveySpatialObservationDataTable isLoading={isLoading} />
        )}

        {activeView === SurveySpatialDatasetViewEnum.TELEMETRY && (
          <SurveySpatialTelemetryDataTable isLoading={isLoading} />
        )}
      </Box>
    </Paper>
  );
};

export default SurveySpatialData;
