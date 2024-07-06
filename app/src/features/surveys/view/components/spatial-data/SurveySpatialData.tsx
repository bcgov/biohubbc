import { mdiBroadcast, mdiEye } from '@mdi/js';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/spatial';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TelemetryDataContext } from 'contexts/telemetryDataContext';
import dayjs from 'dayjs';
import { Position } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useObservationsContext, useTaxonomyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import { IAllTelemetry } from 'interfaces/useTelemetryApi.interface';
import { useContext, useEffect, useMemo, useState } from 'react';
import { getCodesName, getFormattedDate } from 'utils/Utils';
import SurveyMap, { ISurveyMapPoint, ISurveyMapPointMetadata, ISurveyMapSupplementaryLayer } from '../../SurveyMap';
import SurveyMapPopup from '../../SurveyMapPopup';
import SurveyMapTooltip from '../../SurveyMapTooltip';
import { IAnimalDeployment } from '../../survey-animals/telemetry-device/device';
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

  const [mapPointMetadata, setMapPointMetadata] = useState<Record<string, ISurveyMapPointMetadata[]>>({});

  const studyAreaLocations = useMemo(
    () => surveyContext.surveyDataLoader.data?.surveyData.locations ?? [],
    [surveyContext.surveyDataLoader.data]
  );

  const sampleSites = useMemo(
    () => surveyContext.sampleSiteDataLoader.data?.sampleSites ?? [],
    [surveyContext.sampleSiteDataLoader.data]
  );

  useEffect(() => {
    if (surveyContext.deploymentDataLoader.data) {
      const deploymentIds = surveyContext.deploymentDataLoader.data.map((item) => item.bctw_deployment_id);
      if (deploymentIds.length) {
        telemetryContext.telemetryDataLoader.refresh(deploymentIds);
      }
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
    const critters: ICritterSimpleResponse[] = surveyContext.critterDataLoader.data ?? [];
    const telemetry: IAllTelemetry[] = telemetryContext.telemetryDataLoader.data ?? [];

    return (
      telemetry
        .filter((telemetry) => telemetry.latitude !== undefined && telemetry.longitude !== undefined)

        // Combine all critter and deployments data into a flat list
        .reduce(
          (
            acc: { deployment: IAnimalDeployment; critter: ICritterSimpleResponse; telemetry: IAllTelemetry }[],
            telemetry: IAllTelemetry
          ) => {
            const deployment = deployments.find(
              (animalDeployment) => animalDeployment.bctw_deployment_id === telemetry.deployment_id
            );
            const critter = critters.find(
              (detailedCritter) => detailedCritter.critterbase_critter_id === deployment?.critterbase_critter_id
            );
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
            key: `telemetry-${telemetry.id}`,
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
              label: 'Coords',
              value: [response.latitude, response.longitude]
                .filter((coord): coord is number => coord !== null)
                .map((coord) => coord.toFixed(6))
                .join(', ')
            },
            {
              label: 'Date',
              value: getFormattedDate(
                response.observation_time ? DATE_FORMAT.ShortMediumDateTimeFormat : DATE_FORMAT.ShortMediumDateFormat,
                `${response.observation_date} ${response.observation_time}`
              )
            }
          ];
        }
      };

      return point;
    });
  }, [biohubApi.observation, observationsGeometryDataLoader.data?.surveyObservationsGeometry, projectId, surveyId]);

  let isLoading = false;
  if (activeView === SurveySpatialDatasetViewEnum.OBSERVATIONS) {
    isLoading =
      codesContext.codesDataLoader.isLoading ??
      surveyContext.sampleSiteDataLoader.isLoading ??
      observationsContext.observationsDataLoader.isLoading;
  }

  if (activeView === SurveySpatialDatasetViewEnum.TELEMETRY) {
    isLoading =
      codesContext.codesDataLoader.isLoading ??
      surveyContext.deploymentDataLoader.isLoading ??
      surveyContext.critterDataLoader.isLoading;
  }

  const supplementaryLayers: ISurveyMapSupplementaryLayer[] = useMemo(() => {
    switch (activeView) {
      case SurveySpatialDatasetViewEnum.OBSERVATIONS:
        return [
          {
            layerName: 'Observations',
            layerColors: {
              fillColor: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR,
              color: SURVEY_MAP_LAYER_COLOURS.OBSERVATIONS_COLOUR
            },
            popupRecordTitle: 'Observation Record',
            mapPoints: observationPoints
          }
        ];
      case SurveySpatialDatasetViewEnum.TELEMETRY:
        return [
          {
            layerName: 'Telemetry',
            layerColors: {
              fillColor: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR,
              color: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR,
              opacity: 0.5
            },
            popupRecordTitle: 'Telemetry Record',
            mapPoints: telemetryPoints
          }
        ];
      case SurveySpatialDatasetViewEnum.MARKED_ANIMALS:
      default:
        return [];
    }
  }, [activeView, observationPoints, telemetryPoints]);

  const staticLayers: IStaticLayer[] = [
    {
      layerName: 'Study Areas',
      layerColors: {
        color: SURVEY_MAP_LAYER_COLOURS.STUDY_AREA_COLOUR,
        fillColor: SURVEY_MAP_LAYER_COLOURS.STUDY_AREA_COLOUR
      },
      features: studyAreaLocations.flatMap((location) => {
        return location.geojson.map((feature, index) => {
          return {
            key: `${location.survey_location_id}-${index}`,
            geoJSON: feature,
            popup: (
              <SurveyMapPopup
                title={'Study Area'}
                metadata={[{ label: 'Name', value: location.name }]}
                isLoading={false}
              />
            ),
            tooltip: <SurveyMapTooltip label="Study Area" />
          };
        });
      })
    },
    {
      layerName: 'Sample Sites',
      layerColors: {
        color: SURVEY_MAP_LAYER_COLOURS.SAMPLING_SITE_COLOUR,
        fillColor: SURVEY_MAP_LAYER_COLOURS.SAMPLING_SITE_COLOUR
      },
      features: sampleSites.map((sampleSite, index) => {
        return {
          key: `${sampleSite.survey_sample_site_id}-${index}`,
          geoJSON: sampleSite.geojson,
          popup: (
            <SurveyMapPopup
              isLoading={false}
              title="Sampling Site"
              metadata={[
                {
                  label: 'Methods',
                  value: (sampleSite.sample_methods ?? [])
                    .map(
                      (method) =>
                        getCodesName(codesContext.codesDataLoader.data, 'sample_methods', method.method_lookup_id) ?? ''
                    )
                    .filter(Boolean)
                    .join(', ')
                }
              ]}
            />
          ),
          tooltip: <SurveyMapTooltip label={'Sampling Site'} />
        };
      })
    },
    ...supplementaryLayers.map((supplementaryLayer) => {
      return {
        layerName: supplementaryLayer.layerName,
        layerColors: {
          fillColor: supplementaryLayer.layerColors?.fillColor ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
          color: supplementaryLayer.layerColors?.color ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
          fillOpacity: supplementaryLayer.layerColors?.opacity ?? 1
        },
        features: supplementaryLayer.mapPoints.map((mapPoint: ISurveyMapPoint): IStaticLayerFeature => {
          const isLoading = !mapPointMetadata[mapPoint.key];

          return {
            key: mapPoint.key,
            geoJSON: mapPoint.feature,
            GeoJSONProps: {
              onEachFeature: (_, layer) => {
                layer.on({
                  popupopen: () => {
                    if (mapPointMetadata[mapPoint.key]) {
                      return;
                    }
                    mapPoint.onLoadMetadata().then((metadata) => {
                      setMapPointMetadata((prev) => ({ ...prev, [mapPoint.key]: metadata }));
                    });
                  }
                });
              }
            },
            popup: (
              <SurveyMapPopup
                isLoading={isLoading}
                title={supplementaryLayer.popupRecordTitle}
                metadata={mapPointMetadata[mapPoint.key]}
              />
            ),
            tooltip: <SurveyMapTooltip label="Observation" />
          };
        })
      };
    })
  ];

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
        <SurveyMap staticLayers={staticLayers} supplementaryLayers={supplementaryLayers} isLoading={isLoading} />
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
