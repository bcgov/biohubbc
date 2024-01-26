import { mdiBroadcast, mdiEye } from '@mdi/js';
import { Box, Paper } from '@mui/material';
import { CodesContext } from 'contexts/codesContext';
import { ObservationsContext } from 'contexts/observationsContext';
import { SurveyContext } from 'contexts/surveyContext';
import { TaxonomyContext } from 'contexts/taxonomyContext';
import { TelemetryDataContext } from 'contexts/telemetryDataContext';
import { Position } from 'geojson';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useContext, useEffect, useMemo, useState } from 'react';
import { INonEditableGeometries } from 'utils/mapUtils';
import SurveyMapToolBar, { SurveySpatialDataLayout, SurveySpatialDataSet } from './components/SurveyMapToolBar';
import SurveyMap from './SurveyMap';
import SurveySpatialObservationDataTable from './SurveySpatialObservationDataTable';
import SurveySpatialTelemetryDataTable from './SurveySpatialTelemetryDataTable';

const SurveySpatialData = () => {
  const observationsContext = useContext(ObservationsContext);
  const telemetryContext = useContext(TelemetryDataContext);
  const taxonomyContext = useContext(TaxonomyContext);
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);

  const biohubApi = useBiohubApi();
  const { projectId, surveyId } = useContext(SurveyContext);

  const _test__observationsGeometry = useDataLoader(() =>
    biohubApi.observation.getObservationsGeometry(projectId, surveyId)
  );
  _test__observationsGeometry.load();

  //TODO: look into adding this to the query param
  const [currentTab, setCurrentTab] = useState<SurveySpatialDataSet>(SurveySpatialDataSet.OBSERVATIONS);

  useEffect(() => {
    codesContext.codesDataLoader.load();
    surveyContext.deploymentDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    surveyContext.critterDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    surveyContext.sampleSiteDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    observationsContext.observationsDataLoader.refresh();
  }, []);

  useEffect(() => {
    if (surveyContext.deploymentDataLoader.data) {
      const deploymentIds = surveyContext.deploymentDataLoader.data.map((item) => item.deployment_id);
      telemetryContext.telemetryDataLoader.refresh(deploymentIds);
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

  // TODO: this needs to be saved between page visits
  // const [layout, setLayout] = useState<SurveySpatialDataLayout>(SurveySpatialDataLayout.MAP);

  const isLoading = () => {
    let isLoading = false;
    if (currentTab === SurveySpatialDataSet.OBSERVATIONS) {
      isLoading =
        codesContext.codesDataLoader.isLoading ||
        surveyContext.sampleSiteDataLoader.isLoading ||
        observationsContext.observationsDataLoader.isLoading;
    }

    if (currentTab === SurveySpatialDataSet.TELEMETRY) {
      isLoading =
        codesContext.codesDataLoader.isLoading ||
        surveyContext.deploymentDataLoader.isLoading ||
        surveyContext.critterDataLoader.isLoading;
    }

    return isLoading;
  };

  const updateDataSet = (data: SurveySpatialDataSet) => {
    setCurrentTab(data);
  };

  const updateLayout = (data: SurveySpatialDataLayout) => {
    console.log(`Layout: ${data}`);
    // setLayout(data);
  };

  let mapPoints: INonEditableGeometries[] = [];
  switch (currentTab) {
    case SurveySpatialDataSet.OBSERVATIONS:
      mapPoints = observationPoints;
      break;
    case SurveySpatialDataSet.TELEMETRY:
      mapPoints = telemetryPoints;
      break;
    case SurveySpatialDataSet.MARKED_ANIMALS:
      mapPoints = [];
      break;
    default:
      mapPoints = [];
      break;
  }

  return (
    <Paper>
      <SurveyMapToolBar
        currentTab={currentTab}
        toggleButtons={[
          {
            label: `Observations (${observationPoints.length})`,
            value: SurveySpatialDataSet.OBSERVATIONS,
            icon: mdiEye,
            isLoading: false
          },
          {
            label: `Telemetry (${telemetryPoints.length})`,
            value: SurveySpatialDataSet.TELEMETRY,
            icon: mdiBroadcast,
            isLoading: false
          }
        ]}
        updateDataSet={updateDataSet}
        updateLayout={updateLayout}
      />

      <Box height={{ sm: 300, md: 500 }} position="relative">
        <SurveyMap mapPoints={mapPoints} isLoading={isLoading()} />
      </Box>
      <Box py={1} px={2} position="relative">
        {currentTab === SurveySpatialDataSet.OBSERVATIONS && (
          <SurveySpatialObservationDataTable isLoading={isLoading()} />
        )}

        {currentTab === SurveySpatialDataSet.TELEMETRY && <SurveySpatialTelemetryDataTable isLoading={isLoading()} />}
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
