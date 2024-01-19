import { Box, Paper } from '@mui/material';
import { ObservationsContext } from 'contexts/observationsContext';
import { Position } from 'geojson';
import { useContext, useMemo, useState } from 'react';
import { INonEditableGeometries } from 'utils/mapUtils';
import NoSurveySectionData from '../components/NoSurveySectionData';
import SurveyMapToolBar, { SurveySpatialDataLayout, SurveySpatialDataSet } from './components/SurveyMapToolBar';
import SurveyMap from './SurveyMap';

const SurveySpatialData = () => {
  const observationsContext = useContext(ObservationsContext);

  const surveyObservations: INonEditableGeometries[] = useMemo(() => {
    const observations = observationsContext.observationsDataLoader.data?.surveyObservations;

    if (!observations) {
      return [];
    }

    return observations
      .filter((observation) => observation.latitude !== undefined && observation.longitude !== undefined)
      .map((observation) => {
        return {
          feature: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [observation.longitude, observation.latitude] as Position
            }
          },
          popupComponent: undefined
        };
      });
  }, [observationsContext.observationsDataLoader.data]);

  const [mapPoints, setMapPoints] = useState<INonEditableGeometries[]>(surveyObservations);

  // TODO: this needs to be saved between page visits
  const [layout, setLayout] = useState<SurveySpatialDataLayout>(SurveySpatialDataLayout.MAP);

  const updateDataSet = (data: SurveySpatialDataSet) => {
    console.log(`DataSet: ${data}`);
    switch (data) {
      case SurveySpatialDataSet.OBSERVATIONS:
        setMapPoints(surveyObservations);
        break;
      case SurveySpatialDataSet.TELEMETRY:
        setMapPoints([]);
        break;
      case SurveySpatialDataSet.MARKED_ANIMALS:
        setMapPoints([]);
        break;

      default:
        setMapPoints([]);
        break;
    }
  };

  const updateLayout = (data: SurveySpatialDataLayout) => {
    console.log(`Layout: ${data}`);
    setLayout(data);
  };

  return (
    <Paper elevation={0}>
      <SurveyMapToolBar updateDataSet={updateDataSet} updateLayout={updateLayout} />

      {layout === SurveySpatialDataLayout.MAP && (
        <Box position="relative" height={{ sm: 400, md: 600 }}>
          <SurveyMap mapPoints={mapPoints} />
        </Box>
      )}

      {layout === SurveySpatialDataLayout.TABLE && (
        <Box p={3}>
          <NoSurveySectionData text="No data available" paperVariant="outlined" />
        </Box>
      )}

      {layout === SurveySpatialDataLayout.SPLIT && (
        <Box sx={{ display: 'flex' }}>
          <Box>
            <Box p={3}>
              <NoSurveySectionData text="No data available" paperVariant="outlined" />
            </Box>
          </Box>
          <Box height={{ sm: 400, md: 600 }}>
            <SurveyMap mapPoints={mapPoints} />
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default SurveySpatialData;
