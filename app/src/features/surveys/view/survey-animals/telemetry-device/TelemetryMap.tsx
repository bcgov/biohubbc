import { Box, Paper, Typography } from '@mui/material';
import AdditionalLayers from 'components/map/components/AdditionalLayers';
import BaseLayerControls from 'components/map/components/BaseLayerControls';
import { SetMapBounds } from 'components/map/components/Bounds';
import { MapBaseCss } from 'components/map/styles/MapBaseCss';
import { MAP_DEFAULT_CENTER, MAP_DEFAULT_ZOOM } from 'constants/spatial';
import { Feature } from 'geojson';
import L, { LatLng } from 'leaflet';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { GeoJSON, LayersControl, MapContainer as LeafletMapContainer } from 'react-leaflet';
import { uuidToColor } from 'utils/Utils';
import { v4 } from 'uuid';
import { IAnimalDeployment, ITelemetryPointCollection } from './device';

interface ITelemetryMapProps {
  telemetryData?: ITelemetryPointCollection;
  deploymentData?: IAnimalDeployment[];
}

type ColourDeployment = IAnimalDeployment & { colour: string; fillColour: string };

interface ILegend {
  hasData: boolean;
  colourMap: ColourDeployment[];
}

const Legend = ({ hasData, colourMap }: ILegend) => {
  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leaflet-bar">
        <Paper sx={{ padding: 2, gap: 1 }}>
          {hasData ? (
            colourMap.map((deploymentAndColour) => (
              <Box key={deploymentAndColour.deployment_id} display={'flex'} flexDirection={'row'} alignItems={'center'}>
                <Box
                  sx={{
                    marginRight: 1,
                    backgroundColor: deploymentAndColour.colour,
                    borderColor: 'black',
                    borderStyle: 'solid',
                    borderWidth: '1px',
                    height: '16px',
                    width: '16px'
                  }}
                />
                <Typography>{`Device ID: ${deploymentAndColour.device_id}, deployed from ${moment(
                  deploymentAndColour.attachment_start
                ).format('DD-MM-YYYY')} to ${
                  deploymentAndColour.attachment_end
                    ? moment(deploymentAndColour.attachment_end).format('DD-MM-YYYY')
                    : 'indefinite'
                }`}</Typography>
              </Box>
            ))
          ) : (
            <Typography>{`No telemetry available for this animal's deployment(s).`}</Typography>
          )}
        </Paper>
      </div>
    </div>
  );
};

const TelemetryMap = ({ deploymentData, telemetryData }: ITelemetryMapProps): JSX.Element => {
  const [legendColours, setLegendColours] = useState<ColourDeployment[]>([]);

  const features = useMemo(() => {
    const featureCollections = telemetryData;
    if (!featureCollections || !deploymentData) {
      return [];
    }
    const result: Feature[] = [];
    const colourMap: Record<string, string> = {};
    const fillColourMap: Record<string, string> = {};
    const legendColours: ColourDeployment[] = [];
    deploymentData.forEach((deployment) => {
      const { fillColor, outlineColor } = uuidToColor(deployment.deployment_id);
      fillColourMap[deployment.deployment_id] = fillColor;
      colourMap[deployment.deployment_id] = outlineColor;
      legendColours.push({ ...deployment, colour: fillColor, fillColour: outlineColor });
    });
    setLegendColours(legendColours);
    for (const featureCollection of Object.values(featureCollections)) {
      for (const feature of featureCollection.features) {
        if (!feature.properties) {
          feature.properties = {};
        }
        feature.properties.colour = colourMap[feature.properties.deployment_id];
        feature.properties.fillColour = fillColourMap[feature.properties.deployment_id];
        result.push(feature);
      }
    }
    result.sort((a, b) => a.geometry.type.localeCompare(b.geometry.type));
    return result;
  }, [telemetryData, deploymentData]);

  const mapBounds = useMemo(() => {
    const bounds = new L.LatLngBounds([]);
    telemetryData?.points.features.forEach((feature) => {
      if (feature.geometry.type === 'Point') {
        const [lon, lat] = feature.geometry.coordinates;
        if (lon > -140 && lon < -110 && lat > 45 && lat < 60) {
          //We filter points that are clearly bad values out of the map bounds so that we don't wind up too zoomed out due to one wrong point.
          //These values are still present on the map if you move around though.
          bounds.extend([lat, lon]);
        }
      }
    });
    if (bounds.isValid()) {
      return bounds;
    } else {
      return undefined;
    }
  }, [telemetryData?.points.features]);

  const point = (feature: Feature, latlng: LatLng) => {
    return new L.CircleMarker(latlng, { radius: 5, fillOpacity: 1 });
  };

  return (
    <LeafletMapContainer
      id={`view-animal-telemetry-map`}
      style={{ height: '100%' }}
      scrollWheelZoom={true}
      zoom={MAP_DEFAULT_ZOOM}
      center={MAP_DEFAULT_CENTER}>
      <MapBaseCss />
      <SetMapBounds bounds={mapBounds} />
      <AdditionalLayers
        layers={[
          ...features.map((feature) => (
            <GeoJSON
              pointToLayer={point}
              style={{ weight: 2, color: feature.properties?.colour, fillColor: feature.properties?.fillColour }}
              key={v4()}
              data={feature}></GeoJSON>
          )),
          <Legend key={'view-animal-telemetry-map-legend'} hasData={features.length > 0} colourMap={legendColours} />
        ]}
      />
      <LayersControl position="bottomright">
        <BaseLayerControls />
      </LayersControl>
    </LeafletMapContainer>
  );
};

export default TelemetryMap;
