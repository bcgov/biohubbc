import { SkeletonMap } from 'components/loading/SkeletonLoaders';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import StaticLayers, { IStaticLayer } from 'components/map/components/StaticLayers';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { ALL_OF_BC_BOUNDARY, MAP_DEFAULT_CENTER } from 'constants/spatial';
import { Feature } from 'geojson';
import { IGetSampleLocationDetails } from 'interfaces/useSurveyApi.interface';
import { LatLngBoundsExpression } from 'leaflet';
import { useMemo } from 'react';
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
   * /**
   * The colour of the layer
   */
  layerColors?: {
    color: string;
    fillColor: string;
  };
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

interface ISamplingSiteInsetMapProps {
  sampleSites: IGetSampleLocationDetails[];
  isLoading: boolean;
  colour?: string;
}

const SamplingSiteInsetMap = (props: ISamplingSiteInsetMapProps) => {
  let { colour } = props;

  if (!colour) {
    colour = '#3897eb';
  }
  const bounds: LatLngBoundsExpression | undefined = useMemo(() => {
    const sampleSiteFeatures: Feature[] = props.sampleSites.map((site) => site.geojson);

    if (sampleSiteFeatures.length > 0) {
      return calculateUpdatedMapBounds(sampleSiteFeatures);
    } else {
      return calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY]);
    }
  }, [props.sampleSites]);

  const staticLayers: IStaticLayer[] = [
    {
      layerName: 'Sample Sites',
      layerColors: { color: colour, fillColor: colour },
      features: props.sampleSites.map((sampleSite, index) => {
        return {
          key: `${sampleSite.survey_sample_site_id}-${index}`,
          geoJSON: sampleSite.geojson
        };
      })
    }
  ];

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
          <LayersControl>
            <BaseLayerControls />
            <StaticLayers layers={staticLayers} />
          </LayersControl>
        </LeafletMapContainer>
      )}
    </>
  );
};

export default SamplingSiteInsetMap;
