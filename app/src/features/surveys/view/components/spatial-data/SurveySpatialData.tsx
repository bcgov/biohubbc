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
import SurveyMap, { ISurveyMapPoint, ISurveyMapPointMetadata } from '../../SurveyMap';
import SurveySpatialObservationDataTable from './SurveySpatialObservationDataTable';
import SurveySpatialTelemetryDataTable from './SurveySpatialTelemetryDataTable';
import SurveySpatialToolbar, { SurveySpatialDatasetViewEnum } from './SurveySpatialToolbar';

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

  /**
   * Because Telemetry data is client-side paginated, we can collect all spatial points from
   * traversing the array of telemetry data.
   */
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

  /**
   * Because Observations data is server-side paginated, we must collect all spatial points from
   * a dedicated endpoint.
   */
  const observationPoints: ISurveyMapPoint[] = useMemo(() => {
    return (observationsGeometryDataLoader.data?.surveyObservationsGeometry ?? []).map((observation) => {
      const link = `observations/#view-${observation.survey_observation_id}`;

      const point: ISurveyMapPoint = {
        feature: {
          type: 'Feature',
          properties: {},
          geometry: observation.geometry
        },
        key: `observation-${observation.survey_observation_id}`,
        link,
        onLoad: async (): Promise<ISurveyMapPointMetadata[]> => {
          const response = await biohubApi.observation.getObservationRecord(
            projectId,
            surveyId,
            observation.survey_observation_id
          );

          return [
            { label: 'Taxon ID', value: String(response.wldtaxonomic_units_id) },
            { label: 'Count', value: String(response.count) }
          ];
        }
      };

      return point;
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

  const mapPoints: ISurveyMapPoint[] = useMemo(() => {
    switch (activeView) {
      case SurveySpatialDatasetViewEnum.OBSERVATIONS:
        return observationPoints;
      case SurveySpatialDatasetViewEnum.TELEMETRY:
      // return telemetryPoints; // TODO
      case SurveySpatialDatasetViewEnum.MARKED_ANIMALS:
      default:
        return [];
    }
  }, [activeView, observationPoints, telemetryPoints]);

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
