import { Skeleton, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Box, Stack, Theme } from '@mui/system';
import { SkeletonMap } from 'components/loading/SkeletonLoaders';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import StaticLayers, { IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { ALL_OF_BC_BOUNDARY, MAP_DEFAULT_CENTER } from 'constants/spatial';
import { SurveyContext } from 'contexts/surveyContext';
import { Feature } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import { useContext, useMemo, useState } from 'react';
import { LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';

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

const SurveyMap = (props: ISurveyMapProps) => {
  const classes = useStyles();
  const [mapPointMetadata, setMapPointMetadata] = useState<Record<string, ISurveyMapPointMetadata[]>>({});

  const surveyContext = useContext(SurveyContext);

  const studyAreaFeatures: Feature[] = useMemo(() => {
    const locations = surveyContext.surveyDataLoader.data?.surveyData.locations;
    if (!locations) {
      return [];
    }

    return locations.flatMap((item) => item.geojson);
  }, [surveyContext.surveyDataLoader.data]);

  const sampleSiteFeatures: Feature[] = useMemo(() => {
    const sites = surveyContext.sampleSiteDataLoader.data?.sampleSites;
    if (!sites) {
      return [];
    }

    return sites.map((item) => item.geojson);
  }, [surveyContext.sampleSiteDataLoader.data]);

  const bounds: LatLngBoundsExpression | undefined = useMemo(() => {
    // TODO the sampling sites and study areas will be included in the bounds calculation
    const allMapPoints = props.supplementaryLayers.reduce((acc: ISurveyMapPoint[], layer) => {
      return acc.concat(layer.mapPoints)
    }, []);

    if (allMapPoints.length > 0) {
      return calculateUpdatedMapBounds(allMapPoints.map((item) => item.feature));
    } else {
      return calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]);
    }
  }, [props.supplementaryLayers]);

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
          <StaticLayers
            layers={[
              {
                layerName: 'Study Area',
                features: studyAreaFeatures.map((feature) => {
                  return {
                    geoJSON: feature,
                    tooltip: <span>Study Area</span>
                  }
                })
              },
              {
                layerName: 'Sample Sites',
                layerColors: { color: '#1f7dff', fillColor: '#1f7dff' },
                features: sampleSiteFeatures.map((feature) => ({
                  geoJSON: feature,
                  tooltip: <span>Sample Site</span>
                }))
              },
              ...props.supplementaryLayers.map((supplementaryLayer) => {
                return {
                  layerName: supplementaryLayer.layerName,
                  layerColors: { fillColor: '#1f7dff', color: '#FFFFFF' },
                  features: supplementaryLayer.mapPoints.map((mapPoint: ISurveyMapPoint, index: number): IStaticLayerFeature => {
                    const { key } = mapPoint;
                    const isLoading = !mapPointMetadata[key];
        
                    return {
                      key,
                      geoJSON: mapPoint.feature,
                      GeoJSONProps: {
                        onEachFeature: (feature, layer) => {
                          layer.on({
                            popupopen: () => {
                              if (mapPointMetadata[key]) {
                                return;
                              }

                              mapPoint.onLoadMetadata().then((metadata) => {
                                setMapPointMetadata((prev) => ({ ...prev, [key]: metadata }));
                              });
                            }
                          });
                        },
                      },
                      PopupProps: { className: classes.popup },
                      popup: (
                      
                        <Box>
                          {isLoading ? (
                            <Stack>
                              <Skeleton width="100px" />
                              <Skeleton width="100px" />
                              <Skeleton width="100px" />
                            </Stack>
                          ) : (
                            <Stack gap={1}>
                              <Typography variant='body1'><strong>{supplementaryLayer.popupRecordTitle}</strong></Typography>
                              <table>
                                {mapPointMetadata[key].map((metadata) => (
                                  <tr>
                                    <td>
                                        {metadata.label}:
                                    </td>
                                    <td>
                                      <strong>
                                        {metadata.value}
                                      </strong>
                                      </td>
                                  </tr>
                                ))}
                              </table>
                            </Stack>
                          )}
                        </Box>
                      )
                    }
                  })
                }
              })
            ]}
          />
        </LayersControl>
        </LeafletMapContainer>
      )}
    </>
  );
};

export default SurveyMap;
