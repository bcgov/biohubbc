import { Skeleton } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Box, Stack, Theme } from '@mui/system';
import { SkeletonMap } from 'components/loading/SkeletonLoaders';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { ALL_OF_BC_BOUNDARY, MAP_DEFAULT_CENTER } from 'constants/spatial';
import { Feature } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import { useMemo, useState } from 'react';
import { GeoJSON, LayersControl, MapContainer as LeafletMapContainer, Popup } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { coloredPoint } from 'utils/mapUtils';

export interface ISurveyMapPointMetadata {
  label: string;
  value: string;
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
  onLoad: () => Promise<ISurveyMapPointMetadata[]>;
  /**
   * Optional link that renders a button to view/manage/edit the data
   * that the geometry belongs to
   */
  link?: string;
}

interface ISurveyMapProps {
  mapPoints: ISurveyMapPoint[];
  isLoading: boolean;
}

const useStyles = makeStyles((theme: Theme) => ({
  popup: {
    '& a': {
      color: theme.palette.primary.contrastText
    }
  }
}));

// TODO: need a way to pass in the map dimensions depending on the screen size
const SurveyMap = (props: ISurveyMapProps) => {
  const classes = useStyles();
  const [mapPointMetadata, setMapPointMetadata] = useState<Record<string, ISurveyMapPointMetadata[]>>({});

  const bounds: LatLngBoundsExpression | undefined = useMemo(() => {
    if (props.mapPoints.length > 0) {
      return calculateUpdatedMapBounds(props.mapPoints.map((item) => item.feature));
    } else {
      return calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]);
    }
  }, [props.mapPoints]);

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

          {props.mapPoints?.map((mapPoint: ISurveyMapPoint, index: number) => {
            const { key } = mapPoint;
            const isLoading = !mapPointMetadata[key];

            return (
              <GeoJSON
                key={key}
                data={mapPoint.feature}
                pointToLayer={(_, latlng) => coloredPoint({ latlng, fillColor: '#1f7dff', borderColor: '#ffffff' })}
                onEachFeature={(feature, layer) => {
                  layer.on({
                    popupopen: () => {
                      mapPoint.onLoad().then((metadata) => {
                        setMapPointMetadata((prev) => ({ ...prev, [key]: metadata }));
                      });
                    }
                  });
                }}>
                <Popup className={classes.popup}>
                  <Box>
                    {isLoading ? (
                      <Stack>
                        <Skeleton width="100px" />
                        <Skeleton width="100px" />
                        <Skeleton width="100px" />
                      </Stack>
                    ) : (
                      <Stack gap={1}>
                        <table>
                          {mapPointMetadata[key].map((metadata) => (
                            <tr>
                              <td>
                                <strong>{metadata.label}:</strong>
                              </td>
                              <td>{metadata.value}</td>
                            </tr>
                          ))}
                        </table>
                      </Stack>
                    )}
                  </Box>
                </Popup>
              </GeoJSON>
            );
          })}

          <LayersControl position="topright">
            <BaseLayerControls />
          </LayersControl>
        </LeafletMapContainer>
      )}
    </>
  );
};

export default SurveyMap;
