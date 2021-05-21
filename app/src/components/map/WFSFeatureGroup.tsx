import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Feature } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useIsMounted from 'hooks/useIsMounted';
import throttle from 'lodash-es/throttle';
import React, { useCallback, useEffect, useState } from 'react';
import { FeatureGroup, GeoJSON, Popup, useMap, useMapEvents } from 'react-leaflet';

const useStyles = makeStyles(() => ({
  actionButton: {
    minWidth: '6rem',
    '& + button': {
      marginLeft: '0.5rem'
    }
  }
}));

export interface IWFSParams {
  url?: string;
  version?: string;
  srsName?: string;
  request?: string;
  outputFormat?: string;
  bboxSrsName?: string;
}

export const defaultWFSParams: IWFSParams = {
  url: 'https://openmaps.gov.bc.ca/geo/pub/wfs',
  version: '1.3.0',
  srsName: 'epsg:4326',
  request: 'GetFeature',
  outputFormat: 'json',
  bboxSrsName: 'epsg:4326'
};

export interface IWFSFeatureGroupProps {
  name: string;
  typeName: string;
  minZoom?: number;
  wfsParams?: IWFSParams;
  onSelectGeometry?: (geometry: Feature) => void;
}

/**
 * Construct a WFS url to fetch layer information.
 *
 * @param {string} typeName layer name
 * @param {string} bbox bounding box string
 * @param {IWFSParams} [wfsParams=defaultWFSParams] wfs url parameters. Will use defaults specified in
 * `defaultWFSParams` for any properties not provided.
 * @return {*}
 */
export const buildWFSURL = (typeName: string, bbox: string, wfsParams: IWFSParams = defaultWFSParams) => {
  const params = { ...defaultWFSParams, ...wfsParams };

  return `${params.url}?service=WFS&&version=${params.version}&request=${params.request}&typeName=${typeName}&outputFormat=${params.outputFormat}&srsName=${params.srsName}&bbox=${bbox},${params.bboxSrsName}`;
};

const FeaturePopup: React.FC<{ feature: Feature; onSelectGeometry?: (geometry: Feature) => void }> = (props) => {
  const { feature, onSelectGeometry } = props;

  const classes = useStyles();

  const popupItems: JSX.Element[] = [];

  Object.entries(feature.properties as object).forEach(([key, value], index) => {
    popupItems.push(<div key={`popup-${feature?.properties?.OBJECTID}-${index}`}>{`${key}: ${value}`}</div>);
  });

  return (
    <Popup key={`popup-${feature?.properties?.OBJECTID}`} keepInView={false} autoPan={false}>
      <Box p={1}>
        {popupItems}
        <Box mt={1}>
          {onSelectGeometry && (
            <Button
              color="primary"
              variant="contained"
              className={classes.actionButton}
              onClick={() => onSelectGeometry?.(feature)}
              data-testid="add_boundary">
              Add Boundary
            </Button>
          )}
        </Box>
      </Box>
    </Popup>
  );
};

/**
 * Used to render a layer with features from a WFS (Web Feature Service).
 *
 * Note: Specifically coded and tested against the BC Gov Map Services
 * - See: https://www2.gov.bc.ca/gov/content/data/geographic-data-services/web-based-mapping/map-services
 * - See: https://catalogue.data.gov.bc.ca/dataset?download_audience=Public&res_format=wms
 *
 * @param {*} props
 * @return {*}
 */
const WFSFeatureGroup: React.FC<IWFSFeatureGroupProps> = (props) => {
  const map = useMap();

  const biohubApi = useBiohubApi();

  const isMounted = useIsMounted();

  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [features, setFeatures] = useState<Feature[]>();
  const [bounds, setBounds] = useState<any>(null);

  const throttledSetBounds = useCallback(
    throttle((bounds) => {
      if (!isMounted) {
        return;
      }

      setBounds(bounds);
    }, 300),
    []
  );

  useMapEvents({
    overlayadd: (event) => {
      if (!isMounted()) {
        return;
      }

      if (event.name !== props.name) {
        return;
      }

      if (!isEnabled) {
        setIsEnabled(true);
      }

      throttledSetBounds(map.getBounds());
    },
    overlayremove: (event) => {
      if (!isMounted()) {
        return;
      }

      if (event.name !== props.name) {
        return;
      }

      if (isEnabled) {
        setIsEnabled(false);
      }

      setFeatures([]);
    },
    moveend: () => {
      if (!isMounted()) {
        return;
      }

      if (!isEnabled) {
        return;
      }
      throttledSetBounds(map.getBounds());
    },
    zoomend: () => {
      if (!isMounted()) {
        return;
      }

      if (!isEnabled) {
        return;
      }

      throttledSetBounds(map.getBounds());
    }
  });

  const throttledGetFeatures = useCallback(
    throttle(async (typeName: string, bbox: string, wfsParams?: IWFSParams) => {
      const url = buildWFSURL(typeName, bbox, wfsParams);

      const data = await biohubApi.external.get(url).catch(/* catch and ignore errors */);

      return data.features;
    }, 300),
    []
  );

  const updateFeatures = useCallback(async () => {
    if (!isMounted()) {
      return;
    }

    if (!isEnabled) {
      return;
    }

    const zoom = map.getZoom();

    if (props?.minZoom && zoom < props?.minZoom) {
      // Don't load features when zoomed too far out, as it may load too many features to handle
      return;
    }

    if (!bounds) {
      return;
    }

    const features = await throttledGetFeatures(
      props.typeName,
      bounds.toBBoxString(),
      props.wfsParams
    )?.catch(/* catch and ignore errors */);

    setFeatures(features);
  }, [map, throttledGetFeatures, bounds, isMounted, props, isEnabled]);

  useEffect(() => {
    if (!isMounted()) {
      return;
    }

    if (!isEnabled) {
      return;
    }

    if (!bounds) {
      return;
    }

    updateFeatures();
  }, [bounds, updateFeatures, isMounted, isEnabled]);

  return (
    <FeatureGroup>
      {features &&
        features?.map((feature) => {
          return (
            <GeoJSON data={feature} key={`feature-${feature?.properties?.OBJECTID}`}>
              <FeaturePopup feature={feature} onSelectGeometry={props.onSelectGeometry} />
            </GeoJSON>
          );
        })}
    </FeatureGroup>
  );
};

export default WFSFeatureGroup;
