import { Box, Paper } from '@mui/material';
import { ObservationsContext } from 'contexts/observationsContext';
import { Position } from 'geojson';
import { useContext, useMemo, useState } from 'react';
import { INonEditableGeometries } from 'utils/mapUtils';
import NoSurveySectionData from '../components/NoSurveySectionData';
import SurveyMapToolBar, { SurveyMapDataSet } from './components/SurveyMapToolBar';
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

  const updateDataSet = (data: SurveyMapDataSet) => {
    console.log(`DataSet: ${data}`);
    switch (data) {
      case SurveyMapDataSet.OBSERVATIONS:
        setMapPoints(surveyObservations);
        break;
      case SurveyMapDataSet.TELEMETRY:
        setMapPoints([]);
        break;
      case SurveyMapDataSet.MARKED_ANIMALS:
        setMapPoints([]);
        break;

      default:
        setMapPoints([]);
        break;
    }
  };

  return (
    <Paper elevation={0}>
      <SurveyMapToolBar updateDataSet={updateDataSet} updateLayout={(layout) => {}} />
      <Box position="relative" height={{ sm: 400, md: 600 }}>
        <SurveyMap mapPoints={mapPoints} />
      </Box>
      <Box>
        <Box p={3}>
          <NoSurveySectionData text="No data available" paperVariant="outlined" />
        </Box>
      </Box>
    </Paper>
  );
};

export default SurveySpatialData;
