import Box from '@mui/material/Box';
import assert from 'assert';
import InferredLocationDetails, { IInferredLayers } from 'components/boundary/InferredLocationDetails';
import { IMarkerLayer } from 'components/map/components/MarkerCluster';
import { IStaticLayer } from 'components/map/components/StaticLayers';
import MapContainer from 'components/map/MapContainer';
import { SurveyContext } from 'contexts/surveyContext';
import { Feature } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import useDataLoaderError from 'hooks/useDataLoaderError';
import { LatLngBoundsExpression } from 'leaflet';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { calculateUpdatedMapBounds } from 'utils/mapBoundaryUploadHelpers';
import { parseSpatialDataByType } from 'utils/spatial-utils';

/**
 * View survey - Study area section
 *
 * @return {*}
 */
const SurveyStudyArea = () => {
  const biohubApi = useBiohubApi();

  const surveyContext = useContext(SurveyContext);

  // Survey data must be loaded by the parent before this component is rendered
  assert(surveyContext.surveyDataLoader.data);

  const occurrence_submission_id =
    surveyContext.observationDataLoader.data?.surveyObservationData.occurrence_submission_id;

  const [markerLayers, setMarkerLayers] = useState<IMarkerLayer[]>([]);
  const [staticLayers, setStaticLayers] = useState<IStaticLayer[]>([]);

  const surveyLocations = surveyContext.surveyDataLoader.data?.surveyData?.locations;
  const surveyLocation = surveyLocations[0] || null;
  const surveyGeometry = useMemo(() => surveyLocation?.geojson || [], [surveyLocation]);

  const [bounds, setBounds] = useState<LatLngBoundsExpression | undefined>(undefined);
  const [nonEditableGeometries, setNonEditableGeometries] = useState<any[]>([]);
  const [inferredLayersInfo, setInferredLayersInfo] = useState<IInferredLayers>({
    parks: [],
    nrm: [],
    env: [],
    wmu: []
  });

  const mapDataLoader = useDataLoader((projectId: number, occurrenceSubmissionId: number) =>
    biohubApi.observation.getOccurrencesForView(projectId, occurrenceSubmissionId)
  );
  useDataLoaderError(mapDataLoader, () => {
    return {
      dialogTitle: 'Error Loading Map Data',
      dialogText:
        'An error has occurred while attempting to load map data, please try again. If the error persists, please contact your system administrator.'
    };
  });

  useEffect(() => {
    if (mapDataLoader.data) {
      const result = parseSpatialDataByType(mapDataLoader.data);

      setMarkerLayers(result.markerLayers);
      setStaticLayers(result.staticLayers);
    }
  }, [mapDataLoader.data]);

  useEffect(() => {
    if (occurrence_submission_id) {
      mapDataLoader.load(surveyContext.projectId, occurrence_submission_id);
    }
  }, [mapDataLoader, occurrence_submission_id, surveyContext.projectId]);

  const zoomToBoundaryExtent = useCallback(() => {
    setBounds(calculateUpdatedMapBounds(surveyGeometry));
  }, [surveyGeometry]);

  useEffect(() => {
    const nonEditableGeometriesResult = surveyGeometry.map((geom: Feature) => {
      return { feature: geom };
    });

    if (nonEditableGeometriesResult.length) {
      setNonEditableGeometries(nonEditableGeometriesResult);
    }

    zoomToBoundaryExtent();
  }, [surveyGeometry, occurrence_submission_id, setNonEditableGeometries, zoomToBoundaryExtent]);

  return (
    <>
      <Box>
        <Box height={500} position="relative" sx={{ display: 'none' }}>
          <MemoizedMapContainer
            mapId="survey_study_area_map"
            bounds={bounds}
            nonEditableGeometries={nonEditableGeometries}
            setInferredLayersInfo={setInferredLayersInfo}
            markerLayers={markerLayers}
            staticLayers={staticLayers}
          />
        </Box>
      </Box>

      <Box component="dl">
        <InferredLocationDetails layers={inferredLayersInfo} />
      </Box>
    </>
  );
};

/**
 * Memoized wrapper of `MapContainer` to ensure the map only re-renders if specificF props change.
 *
 * @return {*}
 */
const MemoizedMapContainer = React.memo(MapContainer, (prevProps, nextProps) => {
  return (
    prevProps.nonEditableGeometries === nextProps.nonEditableGeometries &&
    prevProps.bounds === nextProps.bounds &&
    prevProps.markerLayers === nextProps.markerLayers &&
    prevProps.staticLayers === nextProps.staticLayers
  );
});

export default SurveyStudyArea;
