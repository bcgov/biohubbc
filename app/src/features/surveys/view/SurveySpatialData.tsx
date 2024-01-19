import { Box, Paper } from '@mui/material';
import { ObservationsContext } from 'contexts/observationsContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TelemetryDataContext } from 'contexts/telemetryDataContext';
import { Position } from 'geojson';
import { useContext, useEffect, useMemo, useState } from 'react';
import { INonEditableGeometries } from 'utils/mapUtils';
import SurveyMapToolBar, { SurveySpatialDataLayout, SurveySpatialDataSet } from './components/SurveyMapToolBar';
import SurveyMap from './SurveyMap';
import SurveySpatialDataTable from './SurveySpatialDataTable';

const SurveySpatialData = () => {
  const observationsContext = useContext(ObservationsContext);
  const telemetryContext = useContext(TelemetryDataContext);
  const surveyContext = useContext(SurveyContext);

  //TODO: is this the cleanest way to do this? because this feels gross
  useEffect(() => {
    surveyContext.deploymentDataLoader.load(surveyContext.projectId, surveyContext.surveyId).then(() => {
      if (surveyContext.deploymentDataLoader.data) {
        const deploymentIds = surveyContext.deploymentDataLoader.data.map((item) => item.deployment_id);
        telemetryContext.telemetryDataLoader.load(deploymentIds);
      }
    });
  }, []);

  const telemetryPoints: INonEditableGeometries[] = useMemo(() => {
    const telemetryData = telemetryContext.telemetryDataLoader.data;
    if (!telemetryData) {
      return [];
    }

    return telemetryData
      .filter((telemetry) => telemetry.latitude !== undefined && telemetry.longitude !== undefined)
      .map((telemetry) => {
        return {
          feature: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'Point',
              coordinates: [telemetry.longitude, telemetry.latitude] as Position
            }
          },
          popupComponent: undefined
        };
      });
  }, [telemetryContext.telemetryDataLoader.data]);

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
  const [tableData, setTableData] = useState<any[]>(
    observationsContext.observationsDataLoader.data?.surveyObservations || []
  );

  // TODO: this needs to be saved between page visits
  // const [layout, setLayout] = useState<SurveySpatialDataLayout>(SurveySpatialDataLayout.MAP);

  const updateDataSet = (data: SurveySpatialDataSet) => {
    console.log(`DataSet: ${data}`);
    switch (data) {
      case SurveySpatialDataSet.OBSERVATIONS:
        setMapPoints(surveyObservations);
        setTableData(observationsContext.observationsDataLoader.data?.surveyObservations || []);
        break;
      case SurveySpatialDataSet.TELEMETRY:
        setMapPoints(telemetryPoints);
        setTableData(telemetryContext.telemetryDataLoader.data || []);
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
    // setLayout(data);
  };

  return (
    <Paper elevation={0}>
      <SurveyMapToolBar updateDataSet={updateDataSet} updateLayout={updateLayout} />

      <Box height={{ sm: 400, md: 600 }}>
        <SurveyMap mapPoints={mapPoints} />
      </Box>
      <Box p={3}>
        <SurveySpatialDataTable tableData={tableData} />
        {/* <NoSurveySectionData text="No data available" paperVariant="outlined" /> */}
      </Box>

      {/* {layout === SurveySpatialDataLayout.MAP && (
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
      )} */}
    </Paper>
  );
};

export default SurveySpatialData;
