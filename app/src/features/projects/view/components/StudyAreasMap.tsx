import { blue, green, orange, red, yellow } from '@mui/material/colors';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import StaticLayers from 'components/map/components/StaticLayers';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { ALL_OF_BC_BOUNDARY, MAP_DEFAULT_CENTER } from 'constants/spatial';
import { ProjectContext } from 'contexts/projectContext';
import { LatLngBoundsExpression } from 'leaflet';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';

const StudyAreasMap = () => {
  // // const observationsContext = useContext(ObservationsContext);
  // const projectContext = useContext(projectContext);
  const projectContext = useContext(ProjectContext);

  const surveys = projectContext.surveysListDataLoader?.data || []; //  ?.map((item) => item.surveyData.locations) || [];

  const { studyAreaFeatures, surveysLocations } = useMemo(() => {
    const studyAreaFeatures = surveys.flatMap((item) =>
      item.surveyData.locations.flatMap((location) => location.geojson)
    );

    const surveysLocations = surveys.map((item) => ({
      survey_id: item.surveyData.survey_id,
      geoJSON: item.surveyData.locations.flatMap((location) => location.geojson)
    }));

    return { studyAreaFeatures, surveysLocations };
  }, [projectContext.surveysListDataLoader.data]);

  const getDefaultMapBounds = useCallback((): LatLngBoundsExpression | undefined => {
    return calculateUpdatedMapBounds([...studyAreaFeatures]);
  }, [studyAreaFeatures]);

  // set default bounds to encompass all of BC
  const [bounds, setBounds] = useState<LatLngBoundsExpression | undefined>(
    calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY])
  );

  const zoomToBoundaryExtent = useCallback(() => {
    setBounds(getDefaultMapBounds());
  }, [getDefaultMapBounds]);

  useEffect(() => {
    // Once all data loaders have finished loading it will zoom the map to include all features
    if (!projectContext.surveysListDataLoader.isLoading) {
      zoomToBoundaryExtent();
    }
  }, [projectContext.surveysListDataLoader.isLoading, zoomToBoundaryExtent]);

  useEffect(() => {
    // Once all data loaders have finished loading it will zoom the map to include all features
    if (!projectContext.surveysListDataLoader.isLoading) {
      // zoomToBoundaryExtent();
    }
  }, [
    projectContext.surveysListDataLoader.isLoading
    // zoomToBoundaryExtent
  ]);

  const staticLayerColors = [blue, red, green, orange, yellow];

  return (
    <>
      <LeafletMapContainer
        data-testid="leaflet-survey_study_areas_map"
        id="survey_study_areas_map"
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
            layers={surveysLocations.map((feature, index) => ({
              layerColors: {
                color: staticLayerColors[Number(feature.survey_id) || index][700],
                fillColor: staticLayerColors[Number(feature.survey_id) || index][400]
              },
              layerName: String(feature.survey_id),
              features: feature.geoJSON.map((item) => ({
                geoJSON: item,
                tooltip: <span>Survey {feature.survey_id}</span>
              }))
            }))}
          />
        </LayersControl>
      </LeafletMapContainer>
    </>
  );
};

export default StudyAreasMap;
