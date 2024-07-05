import { mdiEye, mdiPaw, mdiWifiMarker } from '@mdi/js';
import Paper from '@mui/material/Paper';
import { useObservationsContext, useSurveyContext, useTaxonomyContext } from 'hooks/useContext';
import { useEffect, useState } from 'react';
import { SurveyDataMapTableContainer } from './components/SurveyDataMapTableContainer';
import SurveySpatialToolbar, { SurveySpatialDatasetViewEnum } from './components/SurveySpatialToolbar';

/**
 * Returns the container of survey spatial data
 *
 * @returns
 *
 */
export const SurveyDataContainer = () => {
  const [activeView, setActiveView] = useState<SurveySpatialDatasetViewEnum>(SurveySpatialDatasetViewEnum.OBSERVATIONS);

  const surveyContext = useSurveyContext();
  const observationsContext = useObservationsContext();
  const taxonomyContext = useTaxonomyContext();

  // Fetch/cache all taxonomic data for the observations
  useEffect(() => {
    const cacheTaxonomicData = async () => {
      if (observationsContext.observationsDataLoader.data) {
        // fetch all unique itis_tsn's from observations to find taxonomic names
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
      {/* Toolbar for changing which data is displayed */}
      <SurveySpatialToolbar
        activeView={activeView}
        views={[
          {
            label: `Observations`,
            value: SurveySpatialDatasetViewEnum.OBSERVATIONS,
            icon: mdiEye,
            isLoading: false
          },
          {
            label: `Animals (${surveyContext.critterDataLoader.data?.length ?? 0})`,
            value: SurveySpatialDatasetViewEnum.ANIMALS,
            icon: mdiPaw,
            isLoading: false
          },
          {
            label: `Telemetry`,
            value: SurveySpatialDatasetViewEnum.TELEMETRY,
            icon: mdiWifiMarker,
            isLoading: false
          }
        ]}
        updateDatasetView={setActiveView}
      />

      {/* Map and data table */}
      <SurveyDataMapTableContainer activeView={activeView} />
    </Paper>
  );
};
