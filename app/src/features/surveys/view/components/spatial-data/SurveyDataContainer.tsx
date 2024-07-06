import { mdiEye, mdiPaw, mdiWifiMarker } from '@mdi/js';
import Paper from '@mui/material/Paper';
import { useObservationsContext, useTaxonomyContext } from 'hooks/useContext';
import { isEqual } from 'lodash-es';
import { useEffect, useState } from 'react';
import { SurveyDataAnimal } from './components/animal/SurveyDataAnimal';
import { SurveyDataObservation } from './components/observation/SurveyDataObservation';
import SurveySpatialToolbar, { SurveySpatialDatasetViewEnum } from './components/SurveySpatialToolbar';
import { SurveyDataTelemetry } from './components/telemetry/SurveyDataTelemetry';

/**
 * Container component for displaying survey spatial data.
 * It includes a toolbar to switch between different dataset views
 * (observations, animals, telemetry) and fetches and catches necessary taxonomic data.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const SurveyDataContainer = (): JSX.Element => {
  const [activeView, setActiveView] = useState<SurveySpatialDatasetViewEnum>(SurveySpatialDatasetViewEnum.OBSERVATIONS);

  const observationsContext = useObservationsContext();
  const taxonomyContext = useTaxonomyContext();

  // Fetch and cache all taxonomic data required for the observations.
  useEffect(() => {
    const cacheTaxonomicData = async () => {
      if (observationsContext.observationsDataLoader.data) {
        // Fetch all unique ITIS TSNs from observations to retrieve taxonomic names
        const taxonomicIds = [
          ...new Set(observationsContext.observationsDataLoader.data.surveyObservations.map((item) => item.itis_tsn))
        ].filter((tsn): tsn is number => tsn !== null);

        await taxonomyContext.cacheSpeciesTaxonomyByIds(taxonomicIds);
      }
    };

    cacheTaxonomicData();
    // Should not re-run this effect on `taxonomyContext` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observationsContext.observationsDataLoader.data]);

  return (
    <Paper>
      {/* Toolbar for switching between different dataset views */}
      <SurveySpatialToolbar
        activeView={activeView}
        views={[
          {
            label: 'Observations',
            value: SurveySpatialDatasetViewEnum.OBSERVATIONS,
            icon: mdiEye,
            isLoading: false
          },
          {
            label: 'Animals',
            value: SurveySpatialDatasetViewEnum.ANIMALS,
            icon: mdiPaw,
            isLoading: false
          },
          {
            label: 'Telemetry',
            value: SurveySpatialDatasetViewEnum.TELEMETRY,
            icon: mdiWifiMarker,
            isLoading: false
          }
        ]}
        updateDatasetView={setActiveView}
      />

      {/* Display the corresponding dataset view based on the selected active view */}
      {isEqual(SurveySpatialDatasetViewEnum.OBSERVATIONS, activeView) && <SurveyDataObservation />}
      {isEqual(SurveySpatialDatasetViewEnum.TELEMETRY, activeView) && <SurveyDataTelemetry />}
      {isEqual(SurveySpatialDatasetViewEnum.ANIMALS, activeView) && <SurveyDataAnimal />}
    </Paper>
  );
};
