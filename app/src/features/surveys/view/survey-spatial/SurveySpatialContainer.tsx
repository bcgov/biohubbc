import { mdiEye, mdiPaw, mdiPineTree, mdiWifiMarker } from '@mdi/js';
import Box from '@mui/material/Box';
import { MultiSelectToggleButtonGroup } from 'components/toggle/MultiSelectToggleButtonGroup';
import { SurveySpatialDatasetViewEnum } from 'features/surveys/view/survey-spatial/components/SurveySpatialToolbar';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext, useTaxonomyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo, useState } from 'react';
import { ApiPaginationRequestOptions } from 'types/misc';
import SurveyMap from '../SurveyMap';
import { useSamplingSiteStaticLayer } from './components/map/useSamplingSiteStaticLayer';
import { useStudyAreaStaticLayer } from './components/map/useStudyAreaStaticLayer';

/**
 * Container component for displaying survey spatial data.
 * It includes a toolbar to switch between different dataset views
 * (observations, animals, telemetry) and fetches and catches necessary taxonomic data.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const SurveySpatialContainer = (): JSX.Element => {
  const surveyContext = useSurveyContext();
  const taxonomyContext = useTaxonomyContext();
  const biohubApi = useBiohubApi();

  const observationsDataLoader = useDataLoader((pagination?: ApiPaginationRequestOptions) =>
    biohubApi.observation.getFlattenedObservationRecords(surveyContext.surveyId, pagination)
  );

  const [activeViews, setActiveViews] = useState<Set<SurveySpatialDatasetViewEnum>>(
    new Set([SurveySpatialDatasetViewEnum.OBSERVATIONS])
  );

  const studyAreaStaticLayer = useStudyAreaStaticLayer();
  const samplingSiteStaticLayer = useSamplingSiteStaticLayer();

  const staticLayers = useMemo(
    () => [studyAreaStaticLayer, samplingSiteStaticLayer],
    [samplingSiteStaticLayer, studyAreaStaticLayer]
  );

  useEffect(() => {
    observationsDataLoader.load();
  }, [observationsDataLoader]);

  useEffect(() => {
    const cacheTaxonomicData = async () => {
      if (observationsDataLoader.data) {
        const taxonomicIds = [
          ...new Set(observationsDataLoader.data.surveyObservations.map((item) => item.itis_tsn))
        ].filter((tsn): tsn is number => tsn !== null);

        if (!taxonomicIds.length) {
          return;
        }

        await taxonomyContext.cacheSpeciesTaxonomyByIds(taxonomicIds);
      }
    };

    cacheTaxonomicData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observationsDataLoader.data]);

  return (
    <>
      <Box p={2}>
        <MultiSelectToggleButtonGroup
          activeViews={activeViews}
          onViewChange={setActiveViews}
          orientation="horizontal"
          views={[
            { value: SurveySpatialDatasetViewEnum.OBSERVATIONS, label: 'Observations', icon: mdiEye },
            { value: SurveySpatialDatasetViewEnum.ANIMALS, label: 'Animals', icon: mdiPaw },
            { value: SurveySpatialDatasetViewEnum.TELEMETRY, label: 'Telemetry', icon: mdiWifiMarker },
            { value: SurveySpatialDatasetViewEnum.HABITAT_FEATURES, label: 'Habitat Features', icon: mdiPineTree }
          ]}
        />
      </Box>
      <Box height="100%">
        <SurveyMap staticLayers={staticLayers} />
      </Box>
    </>
  );
};
