import { mdiCog } from '@mdi/js';
import { Icon } from '@mdi/react';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { SurveyRoleRouteGuard } from 'components/security/RouteGuards';
import { SURVEY_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { SurveySpatialObservation } from 'features/surveys/view/survey-spatial/components/observation/SurveySpatialObservation';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext, useTaxonomyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';
import { ApiPaginationRequestOptions } from 'types/misc';
import { useSamplingSiteStaticLayer } from '../../../view/survey-spatial/components/map/useSamplingSiteStaticLayer';
import { useStudyAreaStaticLayer } from '../../../view/survey-spatial/components/map/useStudyAreaStaticLayer';

/**
 * Container component for displaying survey spatial data.
 * It includes a toolbar to switch between different dataset views
 * (observations, animals, telemetry) and fetches and catches necessary taxonomic data.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const SurveySpatialObservations = (): JSX.Element => {
  const surveyContext = useSurveyContext();
  const taxonomyContext = useTaxonomyContext();

  const history = useHistory();

  const biohubApi = useBiohubApi();

  const observationsDataLoader = useDataLoader((pagination?: ApiPaginationRequestOptions) =>
    biohubApi.observation.getFlattenedObservationRecords(surveyContext.surveyId, pagination)
  );

  const studyAreaStaticLayer = useStudyAreaStaticLayer();
  const samplingSiteStaticLayer = useSamplingSiteStaticLayer();

  const staticLayers = useMemo(
    () => [studyAreaStaticLayer, samplingSiteStaticLayer],
    [samplingSiteStaticLayer, studyAreaStaticLayer]
  );

  useEffect(() => {
    // Load the observations data
    observationsDataLoader.load();
  }, [observationsDataLoader]);

  // Fetch and cache all taxonomic data required for the observations.
  useEffect(() => {
    const cacheTaxonomicData = async () => {
      if (observationsDataLoader.data) {
        // Fetch all unique ITIS TSNs from observations to retrieve taxonomic names
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
    // Should not re-run this effect on `taxonomyContext` changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [observationsDataLoader.data]);

  return (
    <>
      <Toolbar
        disableGutters
        sx={{
          flex: '0 0 auto',
          pr: 3,
          pl: 3
        }}>
        <Typography variant="h2" flex="1 1 auto">
          Observations
        </Typography>
        <Stack gap={1} direction="row">
          <HelpButtonDialog markdownType={MarkdownTypeNameEnum.SURVEY_DATA} />
          <SurveyRoleRouteGuard
            validSurveyRoles={[SURVEY_ROLE.ADMIN, SURVEY_ROLE.EDITOR]}
            validSystemRoles={[SYSTEM_ROLE.SYSTEM_ADMIN, SYSTEM_ROLE.DATA_ADMINISTRATOR]}>
            <Button
              variant="contained"
              color="primary"
              aria-label="Manage Survey Data"
              onClick={() => history.push(`/admin/surveys/${surveyContext.surveyId}/observations`)}
              startIcon={<Icon path={mdiCog} size={0.75}></Icon>}>
              Manage
            </Button>
          </SurveyRoleRouteGuard>
        </Stack>
      </Toolbar>

      <Divider />

      <SurveySpatialObservation staticLayers={staticLayers} />
    </>
  );
};
