import { Feature } from 'geojson';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import useIsMounted from 'hooks/useIsMounted';
import throttle from 'lodash-es/throttle';
import React, { useCallback, useEffect, useState } from 'react';
import { FeatureGroup, GeoJSON, useMap, useMapEvents } from 'react-leaflet';
import WFSFeaturePopup, { WFSFeatureKeyHandler, WFSFeaturePopupContentHandler } from './WFSFeaturePopup';

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
  typeName: string;
  minZoom?: number;
  wfsParams?: IWFSParams;
  featureKeyHandler: WFSFeatureKeyHandler;
  popupContentHandler: WFSFeaturePopupContentHandler;
  existingGeometry?: Feature[];
  onSelectGeometry?: (geometry: Feature) => void;
}

/**
 * Construct a WFS url to fetch layer information based on a bounding box.
 *
 * @param {string} typeName layer name
 * @param {string} bbox bounding box string
 * @param {IWFSParams} [wfsParams=defaultWFSParams] wfs url parameters. Will use defaults specified in
 * `defaultWFSParams` for any properties not provided.
 * @return {*}
 */
export const buildWFSURLByBoundingBox = (typeName: string, bbox: string, wfsParams: IWFSParams = defaultWFSParams) => {
  const params = { ...defaultWFSParams, ...wfsParams };

  return `${params.url}?service=WFS&&version=${params.version}&request=${params.request}&typeName=${typeName}&outputFormat=${params.outputFormat}&srsName=${params.srsName}&bbox=${bbox},${params.bboxSrsName}`;
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
  const restorationTrackerApi = useRestorationTrackerApi();
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
      const url = buildWFSURLByBoundingBox(typeName, bbox, wfsParams);

      const data = await restorationTrackerApi.external.get(url).catch(/* catch and ignore errors */);

      return data.features;
    }, 300),
    []
  );

  const updateFeatures = useCallback(async () => {
    if (!isMounted()) {
      return;
    }

    const zoom = map.getZoom();

    /*
      When zoomed too far out, as it may load too many features to handle so auto-adjust zoom level

      Only do this on initial load before any features have been loaded on map, because after that we want
      other zoom levels to work as well
    */
    if (props?.minZoom && zoom < props?.minZoom && !features) {
      map.setZoom(props.minZoom);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <GeoJSON data={feature} key={`feature-${props.featureKeyHandler(feature)}`}>
              <WFSFeaturePopup
                feature={feature}
                featureKeyHandler={props.featureKeyHandler}
                popupContentHandler={props.popupContentHandler}
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
