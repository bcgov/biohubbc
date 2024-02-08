import { Skeleton, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Box, Stack, Theme } from '@mui/system';
import { SkeletonMap } from 'components/loading/SkeletonLoaders';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import StaticLayers, { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { ALL_OF_BC_BOUNDARY, MAP_DEFAULT_CENTER } from 'constants/spatial';
import { CodesContext } from 'contexts/codesContext';
import { SurveyContext } from 'contexts/surveyContext';
import { Feature } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import { useContext, useMemo, useState } from 'react';
import { LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { getCodesName } from 'utils/Utils';

export interface ISurveyMapPointMetadata {
  label: string;
  value: string;
}

export interface ISurveyMapSupplementaryLayer {
  /**
   * The name of the layer
   */
  layerName: string;
  /**
   * The array of map points
   */
  mapPoints: ISurveyMapPoint[];
  /**
   * The title of the feature type displayed in the popup
   */
  popupRecordTitle: string;
}

export interface ISurveyMapPoint {
  /**
   * Unique key for the point
   */
  key: string;
  /**
   * The geometric feature to display
   */
  feature: Feature;

  /**
   * Callback to fetch metadata, which is fired when the geometry's popup
   * is opened
   */
  onLoadMetadata: () => Promise<ISurveyMapPointMetadata[]>;
  /**
   * Optional link that renders a button to view/manage/edit the data
   * that the geometry belongs to
   */
  link?: string;
}

interface ISurveyMapProps {
  supplementaryLayers: ISurveyMapSupplementaryLayer[];
  isLoading: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  popup: {
    '& a': {
      color: theme.palette.primary.contrastText
    },
    '& p': {
      margin: 0
    }
  }
}));

interface ISurveyMapPopupProps {
  isLoading: boolean;
  title: string;
  metadata: ISurveyMapPointMetadata[];
}

const SurveyMapPopup = (props: ISurveyMapPopupProps) => {
  return (
    <Box>
      {props.isLoading ? (
        <Box position="absolute" top="0" left="0" right="0" sx={{ opacity: 1 }}>
          <Typography
            component="div"
            variant="body2"
            fontWeight={700}
            sx={{
              pr: 3,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
            <Skeleton></Skeleton>
          </Typography>
          <Box mt={1} mb={0}>
            <Stack flexDirection="row" alignItems="flex-start" gap={1} sx={{ typography: 'body2' }}>
              <Skeleton width="80px" />
              <Skeleton sx={{ flex: '1 1 auto' }} />
            </Stack>
            <Stack flexDirection="row" alignItems="flex-start" gap={1} sx={{ typography: 'body2' }}>
              <Skeleton width="80px" />
              <Skeleton sx={{ flex: '1 1 auto' }} />
            </Stack>
          </Box>
        </Box>
      ) : (
        <Box>
          <Typography
            component="div"
            variant="body2"
            fontWeight={700}
            sx={{
              pr: 4,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              textTransform: 'uppercase'
            }}>
            {props.title}
          </Typography>
          <Box component="dl" mt={1} mb={0}>
            {props.metadata.map((metadata) => (
              <Stack
                key={`${metadata.label}-${metadata.value}`}
                flexDirection="row"
                alignItems="flex-start"
                gap={1}
                sx={{ typography: 'body2' }}>
                <Box component="dt" width={80} flex="0 0 auto" sx={{ color: 'text.secondary' }}>
                  {metadata.label}:
                </Box>
                <Box component="dd" m={0} minWidth={100}>
                  {metadata.value}
                </Box>
              </Stack>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

const SurveyMap = (props: ISurveyMapProps) => {
  const classes = useStyles();
  const [mapPointMetadata, setMapPointMetadata] = useState<Record<string, ISurveyMapPointMetadata[]>>({});

  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);

  const studyAreaLocations = surveyContext.surveyDataLoader.data?.surveyData.locations ?? [];
  const sampleSites = surveyContext.sampleSiteDataLoader.data?.sampleSites ?? [];

  const bounds: LatLngBoundsExpression | undefined = useMemo(() => {
    const allMapFeatures: Feature[] = [
      ...props.supplementaryLayers.flatMap((supplementaryLayer) =>
        supplementaryLayer.mapPoints.map((mapPoint) => mapPoint.feature)
      ),
      ...studyAreaLocations.flatMap((location) => location.geojson),
      ...sampleSites.map((sampleSite) => sampleSite.geojson)
    ];

    if (allMapFeatures.length > 0) {
      return calculateUpdatedMapBounds(allMapFeatures);
    } else {
      return calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]);
    }
  }, [props.supplementaryLayers, studyAreaLocations, sampleSites]);

  const staticLayers: IStaticLayer[] = [
    {
      layerName: 'Study Areas',
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
            )
          };
        });
      })
    },
    {
      layerName: 'Sample Sites',
      layerColors: { color: '#1f7dff', fillColor: '#1f7dff' },
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
          )
        };
      })
    },
    ...props.supplementaryLayers.map((supplementaryLayer) => {
      return {
        layerName: supplementaryLayer.layerName,
        layerColors: { fillColor: '#1f7dff', color: '#FFFFFF' },
        features: supplementaryLayer.mapPoints.map((mapPoint: ISurveyMapPoint, index: number): IStaticLayerFeature => {
          const isLoading = !mapPointMetadata[mapPoint.key];

          return {
            key: mapPoint.key,
            geoJSON: mapPoint.feature,
            GeoJSONProps: {
              onEachFeature: (feature, layer) => {
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
            PopupProps: { className: classes.popup },
            popup: (
              <SurveyMapPopup
                isLoading={isLoading}
                title={supplementaryLayer.popupRecordTitle}
                metadata={mapPointMetadata[mapPoint.key]}
              />
            )
          };
        })
      };
    })
  ];

  // console.log('staticlayers:', staticLayers)

  return (
    <>
      {props.isLoading ? (
        <SkeletonMap />
      ) : (
        <LeafletMapContainer
          data-testid="leaflet-survey-map"
          id="survey-map"
          center={MAP_DEFAULT_CENTER}
          scrollWheelZoom={false}
          fullscreenControl={true}
          style={{ height: '100%' }}>
          <MapBaseCss />
          <FullScreenScrollingEventHandler bounds={bounds} scrollWheelZoom={false} />
          <SetMapBounds bounds={bounds} />
          <LayersControl position="bottomright">
            <BaseLayerControls />
            <StaticLayers layers={staticLayers} />
          </LayersControl>
        </LeafletMapContainer>
      )}
    </>
  );
};

export default SurveyMap;
