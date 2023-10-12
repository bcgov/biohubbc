import { Box, Paper, Typography } from '@mui/material';
import MapContainer from 'components/map/MapContainer';
import { SurveyContext } from 'contexts/surveyContext';
import { Feature } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import L, { LatLng } from 'leaflet';
import moment from 'moment';
import { useContext, useMemo, useState } from 'react';
import { GeoJSON } from 'react-leaflet';
import { uuidToColor } from 'utils/Utils';
import { v4 } from 'uuid';
import { IAnimalDeployment } from './device';

interface ITelemetryMapProps {
  surveyCritterId: number;
  deploymentData: IAnimalDeployment[];
  startDate?: string;
  endDate?: string;
}

type ColourDeployment = IAnimalDeployment & { colour: string };

interface ILegend {
  hasData: boolean;
  colourMap: ColourDeployment[];
  loadingData?: boolean;
}

const Legend = ({ hasData, colourMap, loadingData }: ILegend) => {
  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leaflet-bar">
        <Paper sx={{ padding: 2 }}>
          {hasData ? (
            colourMap.map((a, i) => (
              <Box
                key={a.deployment_id}
                display={'flex'}
                flexDirection={'row'}
                alignItems={'center'}
                marginTop={i > 0 ? 1 : 0} /*<- Any better way to do this? */
              >
                <Box sx={{ marginRight: 1, backgroundColor: a.colour, height: '16px', width: '16px' }} />
                <Typography>{`Device ID: ${a.device_id}, deployed from ${moment(a.attachment_start).format(
                  'DD-MM-YYYY'
                )} to ${a.attachment_end ? moment(a.attachment_end).format('DD-MM-YYYY') : 'indefinite'}`}</Typography>
              </Box>
            ))
          ) : (
            <Typography>
              {loadingData ? `Loading...` : `No telemetry available for this animal's deployment(s).`}
            </Typography>
          )}
        </Paper>
      </div>
    </div>
  );
};

const TelemetryMap = ({ surveyCritterId, deploymentData, startDate, endDate }: ITelemetryMapProps): JSX.Element => {
  const { projectId, surveyId } = useContext(SurveyContext);
  const bhApi = useBiohubApi();
  const [legendColours, setLegendColours] = useState<ColourDeployment[]>([]);
  const { load, data, isLoading } = useDataLoader(() => {
    const start = startDate ?? '1970-01-01';
    const end = endDate ?? new Date().toISOString();
    return bhApi.survey.getCritterTelemetry(projectId, surveyId, surveyCritterId, start, end);
  });

  load();

  const features = useMemo(() => {
    const featureCollections = data;
    if (!featureCollections || !deploymentData) {
      return [];
    }
    const result: Feature[] = [];
    const colourMap: Record<string, string> = { unknown: 'grey' };
    const legendColours: ColourDeployment[] = [];
    deploymentData.forEach((deployment) => {
      const { fillColor } = uuidToColor(deployment.deployment_id);
      colourMap[deployment.deployment_id] = fillColor;
      legendColours.push({ ...deployment, colour: fillColor });
    });
    setLegendColours(legendColours);
    for (const featureCollection of Object.values(featureCollections)) {
      for (const feature of featureCollection.features) {
        if (!feature.properties) {
          feature.properties = {};
        }
        feature.properties.colour = colourMap[feature.properties.deployment_id];
        result.push(feature);
      }
    }
    return result;
  }, [data, deploymentData]);

  const mapBounds = useMemo(() => {
    const bounds = new L.LatLngBounds([]);
    data?.points.features.forEach((a) => {
      if (a.geometry.type === 'Point') {
        const lat = a.geometry.coordinates[1];
        const lon = a.geometry.coordinates[0];
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
  }, [data?.points.features]);

  const point = (feature: Feature, latlng: LatLng) => {
    return new L.CircleMarker(latlng, { radius: 5, fillOpacity: 1 });
  };

  return (
    <MapContainer
      mapId={`view-animal-telemetry-map`}
      scrollWheelZoom={true}
      bounds={mapBounds}
      additionalLayers={[
        ...features.map((a) => (
          <GeoJSON pointToLayer={point} style={{ color: a.properties?.colour }} key={v4()} data={a}></GeoJSON>
        )),
        <Legend loadingData={isLoading} hasData={features.length > 0} colourMap={legendColours} />
      ]}
    />
  );
};

export default TelemetryMap;
