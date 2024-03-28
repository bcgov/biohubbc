import { mdiBroadcast, mdiEye } from '@mdi/js';
import { Box, Paper } from '@mui/material';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TelemetryDataContext } from 'contexts/telemetryDataContext';
import dayjs from 'dayjs';
import { Position } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useObservationsContext, useTaxonomyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { ITelemetry } from 'hooks/useTelemetryApi';
import { ISimpleCritterWithInternalId } from 'interfaces/useSurveyApi.interface';
import { useContext, useEffect, useMemo, useState } from 'react';
import { IAnimalDeployment } from '../../survey-animals/telemetry-device/device';
import SurveyMap, { ISurveyMapPoint, ISurveyMapPointMetadata, ISurveyMapSupplementaryLayer } from '../../SurveyMap';
import SurveySpatialObservationDataTable from './SurveySpatialObservationDataTable';
import SurveySpatialTelemetryDataTable from './SurveySpatialTelemetryDataTable';
import SurveySpatialToolbar, { SurveySpatialDatasetViewEnum } from './SurveySpatialToolbar';

const SurveySpatialData = () => {
  const [activeView, setActiveView] = useState<SurveySpatialDatasetViewEnum>(SurveySpatialDatasetViewEnum.OBSERVATIONS);

  const observationsContext = useObservationsContext();
  const telemetryContext = useContext(TelemetryDataContext);
  const taxonomyContext = useTaxonomyContext();
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
    // Should not re-run this effect on `telemetryContext.telemetryDataLoader.refresh` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyContext.deploymentDataLoader.data]);

  // Fetch/cache all taxonomic data for the observations
  useEffect(() => {
    const cacheTaxonomicData = async () => {
      if (observationsContext.observationsDataLoader.data) {
        // fetch all unique itis_tsn's from observations to find taxonomic names
        const taxonomicIds = [
          ...new Set(observationsContext.observationsDataLoader.data.surveyObservations.map((item) => item.itis_tsn))
        ].filter((tsn): tsn is number => tsn !== null);
        await taxonomyContext.cacheSpeciesTaxonomyByIds(taxonomicIds);
      }
    };

    cacheTaxonomicData();
    // Should not re-run this effect on `taxonomyContext` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observationsContext.observationsDataLoader.data]);

  /**
   * Because Telemetry data is client-side paginated, we can collect all spatial points from
   * traversing the array of telemetry data.
   */
  const telemetryPoints: ISurveyMapPoint[] = useMemo(() => {
    const deployments: IAnimalDeployment[] = surveyContext.deploymentDataLoader.data ?? [];
    const critters: ISimpleCritterWithInternalId[] = surveyContext.critterDataLoader.data ?? [];
    const telemetry: ITelemetry[] = telemetryContext.telemetryDataLoader.data ?? [];

    return (
      telemetry
        .filter((telemetry) => telemetry.latitude !== undefined && telemetry.longitude !== undefined)

        // Combine all critter and deployments data into a flat list
        .reduce(
          (
            acc: { deployment: IAnimalDeployment; critter: ISimpleCritterWithInternalId; telemetry: ITelemetry }[],
            telemetry: ITelemetry
          ) => {
            const deployment = deployments.find(
              (animalDeployment) => animalDeployment.deployment_id === telemetry.deployment_id
            );
            const critter = critters.find((detailedCritter) => detailedCritter.critter_id === deployment?.critter_id);
            if (critter && deployment) {
              acc.push({ deployment, critter, telemetry });
            }

            return acc;
          },
          []
        )
        .map(({ telemetry, deployment, critter }) => {
          return {
            feature: {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Point',
                coordinates: [telemetry.longitude, telemetry.latitude] as Position
              }
            },
            key: `telemetry-${telemetry.telemetry_manual_id}`,
            onLoadMetadata: async (): Promise<ISurveyMapPointMetadata[]> => {
              return Promise.resolve([
                { label: 'Device ID', value: String(deployment.device_id) },
                { label: 'Alias', value: critter.animal_id ?? '' },
                {
                  label: 'Location',
                  value: [telemetry.latitude, telemetry.longitude]
                    .filter((coord): coord is number => coord !== null)
                    .map((coord) => coord.toFixed(6))
                    .join(', ')
                },
                { label: 'Date', value: dayjs(telemetry.acquisition_date).toISOString() }
              ]);
            }
          };
        })
    );
  }, [
    surveyContext.critterDataLoader.data,
    surveyContext.deploymentDataLoader.data,
    telemetryContext.telemetryDataLoader.data
  ]);

  /**
   * Because Observations data is server-side paginated, we must collect all spatial points from
   * a dedicated endpoint.
   */
  const observationPoints: ISurveyMapPoint[] = useMemo(() => {
    return (observationsGeometryDataLoader.data?.surveyObservationsGeometry ?? []).map((observation) => {
      const point: ISurveyMapPoint = {
        feature: {
          type: 'Feature',
          properties: {},
          geometry: observation.geometry
        },
        key: `observation-${observation.survey_observation_id}`,
        onLoadMetadata: async (): Promise<ISurveyMapPointMetadata[]> => {
          const response = await biohubApi.observation.getObservationRecord(
            projectId,
            surveyId,
            observation.survey_observation_id
          );

          return [
            { label: 'Taxon ID', value: String(response.itis_tsn) },
            { label: 'Count', value: String(response.count) },
            {
              label: 'Location',
              value: [response.latitude, response.longitude]
                .filter((coord): coord is number => coord !== null)
                .map((coord) => coord.toFixed(6))
                .join(', ')
            },
            { label: 'Date', value: dayjs(`${response.observation_date} ${response.observation_time}`).toISOString() }
          ];
        }
      };

      return point;
    });
  }, [biohubApi.observation, observationsGeometryDataLoader.data?.surveyObservationsGeometry, projectId, surveyId]);

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

  const supplementaryLayers: ISurveyMapSupplementaryLayer[] = useMemo(() => {
    switch (activeView) {
      case SurveySpatialDatasetViewEnum.OBSERVATIONS:
        return [
          {
            layerName: 'Observations',
            popupRecordTitle: 'Observation Record',
            mapPoints: observationPoints
          }
        ];
      case SurveySpatialDatasetViewEnum.TELEMETRY:
        return [
          {
            layerName: 'Telemetry',
            popupRecordTitle: 'Telemetry Record',
            mapPoints: telemetryPoints
          }
        ];
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
        <SurveyMap supplementaryLayers={supplementaryLayers} isLoading={isLoading} />
      </Box>
      <Box p={2} position="relative">
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
