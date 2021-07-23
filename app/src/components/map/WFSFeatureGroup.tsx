import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Feature } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useIsMounted from 'hooks/useIsMounted';
import throttle from 'lodash-es/throttle';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FeatureGroup, GeoJSON, Popup, Tooltip, useMap, useMapEvents } from 'react-leaflet';

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
  existingGeometry?: Feature[];
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

const FeaturePopup: React.FC<{
  layerName: string;
  feature: Feature;
  existingGeometry?: Feature[];
  onSelectGeometry?: (geometry: Feature) => void;
}> = (props) => {
  const { layerName, feature, existingGeometry, onSelectGeometry } = props;

  const classes = useStyles();
  const popupRef = useRef(null);

  const popupItems: JSX.Element[] = [];

  let tooltipText: string = '';

  if (feature && feature.properties) {
    if (layerName === 'Parks - Regional') {
      tooltipText = feature.properties.REGION_NAME;

      popupItems.push(<div key={`${feature.id}-region`}>{`Region Name: ${feature.properties.REGION_NAME}`}</div>);
      popupItems.push(
        <div key={`${feature.id}-area`}>{`Region Area: ${(feature.properties.FEATURE_AREA_SQM / 10000).toFixed(
          0
        )} ha`}</div>
      );
    }

    if (layerName === 'Wildlife Management Units') {
      tooltipText = `${feature.properties.REGION_RESPONSIBLE_NAME} - ${feature.properties.GAME_MANAGEMENT_ZONE_NAME}`;

      popupItems.push(
        <div key={`${feature.id}-region`}>{`Region Name: ${feature.properties.REGION_RESPONSIBLE_NAME}`}</div>
      );
      popupItems.push(
        <div key={`${feature.id}-zone`}>{`Management Zone: ${feature.properties.GAME_MANAGEMENT_ZONE_NAME}`}</div>
      );
      popupItems.push(
        <div key={`${feature.id}-area`}>{`Region Area: ${(feature.properties.FEATURE_AREA_SQM / 10000).toFixed(
          0
        )} ha`}</div>
      );
    }

    if (layerName === 'Parks - Section') {
      tooltipText = `${feature.properties.REGION_NAME} - ${feature.properties.SECTION_NAME}`;

      popupItems.push(<div key={`${feature.id}-region`}>{`Region Name: ${feature.properties.REGION_NAME}`}</div>);
      popupItems.push(<div key={`${feature.id}-section`}>{`Section Name: ${feature.properties.SECTION_NAME}`}</div>);
      popupItems.push(
        <div key={`${feature.id}-area`}>{`Region Area: ${(feature.properties.FEATURE_AREA_SQM / 10000).toFixed(
          0
        )} ha`}</div>
      );
    }
  }

  const closePopupDialog = () => {
    //@ts-ignore
    popupRef.current._closeButton.click();
  };

  return (
    <>
      <Tooltip direction="top">{tooltipText}</Tooltip>
      <Popup ref={popupRef} key={`popup-${feature?.properties?.OBJECTID}`} keepInView={false} autoPan={false}>
        <Box p={1}>
          <Box pb={2}>{popupItems}</Box>
          {onSelectGeometry && (
            <Box mt={1}>
              <Button
                color="primary"
                variant="contained"
                className={classes.actionButton}
                onClick={() => {
                  if (
                    existingGeometry &&
                    existingGeometry.filter(
                      (geo: Feature) => geo?.properties?.OBJECTID === feature?.properties?.OBJECTID
                    ).length === 0
                  ) {
                    onSelectGeometry?.(feature);
                    closePopupDialog();
                  }
                }}
                data-testid="add_boundary">
                Add Boundary
              </Button>
              <Button color="primary" variant="outlined" className={classes.actionButton} onClick={closePopupDialog}>
                Cancel
              </Button>
            </Box>
          )}
        </Box>
      </Popup>
    </>
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

  const [features, setFeatures] = useState<Feature[]>();
  const [bounds, setBounds] = useState<any>(null);

  const throttledSetBounds = useCallback(
    throttle((newBounds) => {
      if (!isMounted) {
        return;
      }

      setBounds(newBounds);
    }, 300),
    []
  );

  useMapEvents({
    moveend: () => {
      if (!isMounted()) {
        return;
      }

      throttledSetBounds(map.getBounds());
    },
    zoomend: () => {
      if (!isMounted()) {
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

    const zoom = map.getZoom();

    if (props?.minZoom && zoom < props?.minZoom) {
      // Don't load features when zoomed too far out, as it may load too many features to handle
      return;
    }

    const myBounds = bounds || map.getBounds();

    if (!myBounds) {
      return;
    }

    const newFeatures = await throttledGetFeatures(
      props.typeName,
      myBounds.toBBoxString(),
      props.wfsParams
    )?.catch(/* catch and ignore errors */);

    setFeatures(newFeatures);
  }, [map, throttledGetFeatures, bounds, isMounted, props]);

  useEffect(() => {
    if (!isMounted()) {
      return;
    }

    updateFeatures();
  }, [updateFeatures, isMounted]);

  return (
    <FeatureGroup>
      {features &&
        features?.map((feature) => {
          return (
            <GeoJSON data={feature} key={`feature-${feature?.properties?.OBJECTID}`}>
              <FeaturePopup
                layerName={props.name}
                feature={feature}
                existingGeometry={props.existingGeometry}
                onSelectGeometry={props.onSelectGeometry}
              />
            </GeoJSON>
          );
        })}
    </FeatureGroup>
  );
};

export default WFSFeatureGroup;
