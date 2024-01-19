import { mdiRefresh } from '@mdi/js';
import Icon from '@mdi/react';
import { Button, IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import FullScreenScrollingEventHandler from 'components/map/components/FullScreenScrollingEventHandler';
import StaticLayers from 'components/map/components/StaticLayers';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { ALL_OF_BC_BOUNDARY, MAP_DEFAULT_CENTER } from 'constants/spatial';
import { ObservationsContext } from 'contexts/observationsContext';
import { SurveyContext } from 'contexts/surveyContext';
import { Feature, Position } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { LatLngBoundsExpression } from 'leaflet';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { GeoJSON, LayersControl, MapContainer as LeafletMapContainer, Popup } from 'react-leaflet';
import { Link as RouterLink } from 'react-router-dom';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { coloredPoint, INonEditableGeometries } from 'utils/mapUtils';
import { v4 as uuidv4 } from 'uuid';

const ObservationsMap = () => {
  const biohubApi = useBiohubApi();
  const observationsContext = useContext(ObservationsContext);
  const surveyContext = useContext(SurveyContext);
  const [speciesNames, setSpeciesNames] = useState<{ id: string; label: string }[]>([]);

  const handleGetSpecies = useCallback(
    async (taxonomic_ids: number[]) => {
      const response = await biohubApi.taxonomy.getSpeciesFromIds(taxonomic_ids);

      setSpeciesNames(response.searchResponse);
    },
    [biohubApi.taxonomy]
  );

  const speciesIds = useMemo(() => {
    const observations = observationsContext.observationsDataLoader.data?.surveyObservations;

    if (!observations) {
      return [];
    }

    return observations.map((observation) => observation.wldtaxonomic_units_id);
  }, [observationsContext.observationsDataLoader.data]);

  useEffect(() => {
    handleGetSpecies(speciesIds);
  }, [handleGetSpecies, speciesIds]);

  const handleCheckSpeciesName = useMemo(
    (id: number) => {
      const speciesName = speciesNames.find((item) => Number(item.id) === id);

      return speciesName ? speciesName.label : '';
    },
    [speciesNames]
  );

  const surveyObservations: INonEditableGeometries[] = useMemo(() => {
    const observations = observationsContext.observationsDataLoader.data?.surveyObservations;

    if (!observations) {
      return [];
    }

    return observations
      .filter((observation) => observation.latitude !== undefined && observation.longitude !== undefined)
      .map((observation, index) => {
        const link = observation.survey_observation_id
          ? `observations/#view-${observation.survey_observation_id}`
          : 'observations';

        return {
          feature: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [observation.longitude, observation.latitude] as Position
            }
          },
          popupComponent: (
            <Popup>
              <div>{(speciesNames.length && handleCheckSpeciesName(observation.wldtaxonomic_units_id)) || ''}</div>
              <Button component={RouterLink} to={link}>
                View Observation
              </Button>
            </Popup>
          )
        };
      });
  }, [observationsContext.observationsDataLoader.data, handleCheckSpeciesName, speciesNames]);

  const studyAreaFeatures: { geojson: Feature; name: string }[] = useMemo(() => {
    const locations = surveyContext.surveyDataLoader.data?.surveyData.locations;
    if (!locations) {
      return [];
    }

    return locations.flatMap((item) => {
      return item.geojson.map((geojson) => {
        return {
          geojson,
          name: item.name
        };
      });
    });
  }, [surveyContext.surveyDataLoader.data]);

  const sampleSiteFeatures: { geojson: Feature; name: string }[] = useMemo(() => {
    const sites = surveyContext.sampleSiteDataLoader.data?.sampleSites;
    if (!sites) {
      return [];
    }
    return sites.map((item) => {
      return {
        geojson: item.geojson,
        name: item.name
      };
    });
  }, [surveyContext.sampleSiteDataLoader.data]);

  const getDefaultMapBounds = useCallback((): LatLngBoundsExpression | undefined => {
    const features = surveyObservations.map((observation) => observation.feature);

    const studyAreaFeaturesGeoJSON = studyAreaFeatures.map((item) => item.geojson);
    const sampleSiteFeaturesGeoJSON = sampleSiteFeatures.map((item) => item.geojson);

    return calculateUpdatedMapBounds([...features, ...studyAreaFeaturesGeoJSON, ...sampleSiteFeaturesGeoJSON]);
  }, [surveyObservations, studyAreaFeatures, sampleSiteFeatures]);

  // set default bounds to encompass all of BC
  const [bounds, setBounds] = useState<LatLngBoundsExpression | undefined>(
    calculateUpdatedMapBounds([ALL_OF_BC_BOUNDARY])
  );

  const zoomToBoundaryExtent = useCallback(() => {
    setBounds(getDefaultMapBounds());
  }, [getDefaultMapBounds]);

  useEffect(() => {
    // Once all data loaders have finished loading it will zoom the map to include all features
    if (
      !surveyContext.surveyDataLoader.isLoading &&
      !surveyContext.sampleSiteDataLoader.isLoading &&
      !observationsContext.observationsDataLoader.isLoading
    ) {
      zoomToBoundaryExtent();
    }
  }, [
    observationsContext.observationsDataLoader.isLoading,
    surveyContext.sampleSiteDataLoader.isLoading,
    surveyContext.surveyDataLoader.isLoading,
    zoomToBoundaryExtent
  ]);

  return (
    <>
      <LeafletMapContainer
        data-testid="leaflet-survey_observations_map"
        id="survey_observations_map"
        center={MAP_DEFAULT_CENTER}
        scrollWheelZoom={false}
        fullscreenControl={true}
        style={{ height: '100%' }}>
        <MapBaseCss />
        <FullScreenScrollingEventHandler bounds={bounds} scrollWheelZoom={false} />
        <SetMapBounds bounds={bounds} />

        {surveyObservations?.map((nonEditableGeo: INonEditableGeometries) => (
          <GeoJSON
            key={uuidv4()}
            data={nonEditableGeo.feature}
            pointToLayer={(_, latlng) => coloredPoint({ latlng, fillColor: '#1f7dff', borderColor: '#ffffff' })}>
            {nonEditableGeo.popupComponent}
          </GeoJSON>
        ))}
        <LayersControl position="bottomright">
          <BaseLayerControls />
          <StaticLayers
            layers={[
              {
                layerName: 'Study Area',
                features: studyAreaFeatures.map((feature) => ({
                  geoJSON: feature.geojson,
                  tooltip: <span>Study Area: {feature.name}</span>
                }))
              },
              {
                layerName: 'Sample Sites',
                layerColors: { color: '#1f7dff', fillColor: '#1f7dff' },
                features: sampleSiteFeatures.map((feature) => ({
                  geoJSON: feature.geojson,
                  tooltip: <span>Sampling Site: {feature.name}</span>
                }))
              }
            ]}
          />
        </LayersControl>
      </LeafletMapContainer>
      {(surveyObservations.length > 0 || studyAreaFeatures.length > 0 || sampleSiteFeatures.length > 0) && (
        <Box position="absolute" top="126px" left="10px" zIndex="1000" display="none">
          <IconButton
            sx={{
              padding: '3px',
              borderRadius: '4px',
              background: '#ffffff',
              color: '#000000',
              border: '2px solid rgba(0,0,0,0.2)',
              backgroundClip: 'padding-box',
              '&:hover': {
                backgroundColor: '#eeeeee'
              }
            }}
            aria-label="zoom to initial extent"
            title="Zoom to initial extent"
            onClick={() => zoomToBoundaryExtent()}>
            <Icon size={1} path={mdiRefresh} />
          </IconButton>
        </Box>
      )}
    </>
  );
};

export default ObservationsMap;
