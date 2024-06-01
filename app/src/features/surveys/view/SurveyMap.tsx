import { SkeletonMap } from 'components/loading/SkeletonLoaders';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import StaticLayers, { IStaticLayer } from 'components/map/components/StaticLayers';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { ALL_OF_BC_BOUNDARY, MAP_DEFAULT_CENTER } from 'constants/spatial';
import { SurveyContext } from 'contexts/surveyContext';
import { Feature } from 'geojson';
import { LatLngBoundsExpression } from 'leaflet';
import { useContext, useMemo } from 'react';
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
   * The colour of the layer
   */
  layerColors?: {
    color: string;
    fillColor: string;
    opacity?: number;
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

interface ISurveyMapProps {
  staticLayers: IStaticLayer[];
  supplementaryLayers: ISurveyMapSupplementaryLayer[];
  isLoading: boolean;
}

const SurveyMap = (props: ISurveyMapProps) => {
  const surveyContext = useContext(SurveyContext);

  const studyAreaLocations = useMemo(
    () => surveyContext.surveyDataLoader.data?.surveyData.locations ?? [],
    [surveyContext.surveyDataLoader.data]
  );

  const sampleSites = useMemo(
    () => surveyContext.sampleSiteDataLoader.data?.sampleSites ?? [],
    [surveyContext.sampleSiteDataLoader.data]
  );

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
          <LayersControl position="topright">
            <BaseLayerControls />
            <StaticLayers layers={props.staticLayers} />
          </LayersControl>
        </LeafletMapContainer>
      )}
    </>
  );
};

export default SurveyMap;
