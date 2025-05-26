import { mdiCog } from '@mdi/js';
import { Icon } from '@mdi/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import HelpButtonDialog from 'components/buttons/HelpButtonDialog';
import { SurveyRoleRouteGuard } from 'components/security/RouteGuards';
import { SURVEY_ROLE, SYSTEM_ROLE } from 'constants/roles';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { useEffect, useMemo } from 'react';
import { useHistory } from 'react-router';
import { ApiPaginationRequestOptions } from 'types/misc';
import { useSamplingSiteStaticLayer } from '../../../view/survey-spatial/components/map/useSamplingSiteStaticLayer';
import { useStudyAreaStaticLayer } from '../../../view/survey-spatial/components/map/useStudyAreaStaticLayer';
import { SurveySpatialHabitatFeature } from './SurveySpatialHabitatFeature';

/**
 * Container component for displaying survey spatial data.
 * It includes a toolbar to switch between different dataset views
 * (habitatFeatures, animals, telemetry) and fetches and catches necessary taxonomic data.
 *
 * @returns {JSX.Element} The rendered component.
 */
export const SurveySpatialHabitatFeatures = (): JSX.Element => {
  const surveyContext = useSurveyContext();

  const history = useHistory();

  const biohubApi = useBiohubApi();

  const habitatFeaturesDataLoader = useDataLoader((pagination?: ApiPaginationRequestOptions) =>
    biohubApi.habitatFeature.getSurveyHabitatFeaturesWithSupplementaryData(surveyContext.surveyId, pagination)
  );

  const studyAreaStaticLayer = useStudyAreaStaticLayer();
  const samplingSiteStaticLayer = useSamplingSiteStaticLayer();

  const staticLayers = useMemo(
    () => [studyAreaStaticLayer, samplingSiteStaticLayer],
    [samplingSiteStaticLayer, studyAreaStaticLayer]
  );

  useEffect(() => {
    // Load the habitatFeatures data
    habitatFeaturesDataLoader.load();
  }, [habitatFeaturesDataLoader]);

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
          Habitat Features
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
              onClick={() => history.push(`/admin/surveys/${surveyContext.surveyId}/habitat-features`)}
              startIcon={<Icon path={mdiCog} size={0.75}></Icon>}>
              Manage
            </Button>
          </SurveyRoleRouteGuard>
        </Stack>
      </Toolbar>

      <SurveySpatialHabitatFeature staticLayers={staticLayers} />
    </>
  );
};
