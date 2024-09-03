import { mdiEye, mdiPaw, mdiWifiMarker } from '@mdi/js';
import Paper from '@mui/material/Paper';
import { TelemetryDataContextProvider } from 'contexts/telemetryDataContext';
import { SurveySpatialAnimal } from 'features/surveys/view/survey-spatial/components/animal/SurveySpatialAnimal';
import { SurveySpatialObservation } from 'features/surveys/view/survey-spatial/components/observation/SurveySpatialObservation';
import {
  SurveySpatialDatasetViewEnum,
  SurveySpatialToolbar
} from 'features/surveys/view/survey-spatial/components/SurveySpatialToolbar';
import { SurveySpatialTelemetry } from 'features/surveys/view/survey-spatial/components/telemetry/SurveySpatialTelemetry';
import { useObservationsContext, useTaxonomyContext } from 'hooks/useContext';
import { isEqual } from 'lodash-es';
import { useEffect, useState } from 'react';

/**
 * Container component for displaying survey spatial data.
 * It includes a toolbar to switch between different dataset views
 * (observations, animals, telemetry) and fetches and catches necessary taxonomic data.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const SurveySpatialContainer = (): JSX.Element => {
  const observationsContext = useObservationsContext();
  const taxonomyContext = useTaxonomyContext();

  const [activeView, setActiveView] = useState<SurveySpatialDatasetViewEnum>(SurveySpatialDatasetViewEnum.OBSERVATIONS);

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
        setActiveView={setActiveView}
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
      />

      {/* Display the corresponding dataset view based on the selected active view */}
      {isEqual(SurveySpatialDatasetViewEnum.OBSERVATIONS, activeView) && <SurveySpatialObservation />}
      {isEqual(SurveySpatialDatasetViewEnum.TELEMETRY, activeView) && (
        <TelemetryDataContextProvider>
          <SurveySpatialTelemetry />
        </TelemetryDataContextProvider>
      )}
      {isEqual(SurveySpatialDatasetViewEnum.ANIMALS, activeView) && <SurveySpatialAnimal />}
    </Paper>
  );
};
