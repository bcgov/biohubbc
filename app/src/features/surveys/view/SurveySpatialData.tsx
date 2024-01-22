import { Box, Paper } from '@mui/material';
import { ObservationsContext } from 'contexts/observationsContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TaxonomyContext } from 'contexts/taxonomyContext';
import { TelemetryDataContext } from 'contexts/telemetryDataContext';
import dayjs from 'dayjs';
import { Position } from 'geojson';
import { useContext, useEffect, useMemo, useState } from 'react';
import { INonEditableGeometries } from 'utils/mapUtils';
import NoSurveySectionData from '../components/NoSurveySectionData';
import { ICritterDeployment } from '../telemetry/ManualTelemetryList';
import SurveyMapToolBar, { SurveySpatialDataLayout, SurveySpatialDataSet } from './components/SurveyMapToolBar';
import SurveyMap from './SurveyMap';
import SurveySpatialDataTable from './SurveySpatialDataTable';

const SurveySpatialData = () => {
  const observationsContext = useContext(ObservationsContext);
  const telemetryContext = useContext(TelemetryDataContext);
  const taxonomyContext = useContext(TaxonomyContext);
  const surveyContext = useContext(SurveyContext);

  useEffect(() => {
    surveyContext.deploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    surveyContext.critterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
  }, []);

  useEffect(() => {
    if (surveyContext.deploymentDataLoader.data) {
      const deploymentIds = surveyContext.deploymentDataLoader.data.map((item) => item.deployment_id);
      telemetryContext.telemetryDataLoader.load(deploymentIds);
    }
  }, [surveyContext.deploymentDataLoader.data]);

  // Fetch/ Cache all taxonomic data for the observations
  useEffect(() => {
    const cacheTaxonomicData = async () => {
      if (observationsContext.observationsDataLoader.data) {
        // fetch all unique wldtaxonomic_units_id's from observations to find taxonomic names
        const taxonomicIds = [
          ...new Set(
            observationsContext.observationsDataLoader.data.surveyObservations.map((item) => item.wldtaxonomic_units_id)
          )
        ];
        await taxonomyContext.cacheSpeciesTaxonomyByIds(taxonomicIds);
      }
    };

    cacheTaxonomicData();
  }, [observationsContext.observationsDataLoader.data]);

  const flattenedCritterDeployments: ICritterDeployment[] = useMemo(() => {
    const data: ICritterDeployment[] = [];
    // combine all critter and deployments into a flat list
    surveyContext.deploymentDataLoader.data?.forEach((deployment) => {
      const critter = surveyContext.critterDataLoader.data?.find(
        (critter) => critter.critter_id === deployment.critter_id
      );
      if (critter) {
        data.push({ critter, deployment });
      }
    });
    return data;
  }, [surveyContext.critterDataLoader.data, surveyContext.deploymentDataLoader.data]);

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

  const observationPoints: INonEditableGeometries[] = useMemo(() => {
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

  const [mapPoints, setMapPoints] = useState<INonEditableGeometries[]>(observationPoints);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [tableRows, setTableRows] = useState<string[][]>([]);

  // TODO: this needs to be saved between page visits
  // const [layout, setLayout] = useState<SurveySpatialDataLayout>(SurveySpatialDataLayout.MAP);

  const updateDataSet = (data: SurveySpatialDataSet) => {
    switch (data) {
      case SurveySpatialDataSet.OBSERVATIONS:
        setMapPoints(observationPoints);
        setTableHeaders(['Species', 'Count', 'Date', 'Time', 'Lat', 'Long']);
        setTableRows(
          observationsContext.observationsDataLoader.data?.surveyObservations.map((item) => [
            `${taxonomyContext.getCachedSpeciesTaxonomyById(item.wldtaxonomic_units_id)?.label}`,
            `${item.count}`,
            `${dayjs(item.observation_date).format('YYYY-MM-DD')}`,
            `${dayjs(item.observation_date).format('HH:mm:ss')}`,
            `${item.latitude}`,
            `${item.longitude}`
          ]) || []
        );
        break;
      case SurveySpatialDataSet.TELEMETRY:
        setMapPoints(telemetryPoints);
        setTableHeaders(['Alias', 'Device ID', 'Start', 'End']);
        setTableRows(
          flattenedCritterDeployments.map((item) => {
            return [
              `${item.critter.animal_id}`,
              `${item.deployment.device_id}`,
              `${dayjs(item.deployment.attachment_start).format('YYYY-MM-DD')}`,
              `${dayjs(item.deployment.attachment_end).format('YYYY-MM-DD')}`
            ];
          })
        );
        break;
      case SurveySpatialDataSet.MARKED_ANIMALS:
        setMapPoints([]);
        setTableHeaders(['Deployment ID', 'Device ID', 'Date', 'Time', 'Lat', 'Long']);
        setTableRows([]);
        break;
      default:
        setMapPoints([]);
        setTableHeaders([]);
        setTableRows([]);
        break;
    }
  };

  const updateLayout = (data: SurveySpatialDataLayout) => {
    console.log(`Layout: ${data}`);
    // setLayout(data);
  };

  return (
    <Paper>
      <SurveyMapToolBar updateDataSet={updateDataSet} updateLayout={updateLayout} />

      <Box height={{ sm: 400, md: 600 }} position="relative">
        <SurveyMap mapPoints={mapPoints} />
      </Box>
      <Box p={1}>
        {tableRows.length > 0 ? (
          <SurveySpatialDataTable tableHeaders={tableHeaders} tableRows={tableRows} />
        ) : (
          <NoSurveySectionData text="No data available" paperVariant="outlined" />
        )}
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
