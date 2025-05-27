import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Box from '@mui/system/Box';
import { ComponentSwitch } from 'components/misc/ComponentSwitch';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { useSearchParams } from 'hooks/useSearchParams';
import { SidebarLayout } from 'layouts/SidebarLayout';
import { useEffect } from 'react';
import { SurveyManagePageEnum, SurveyManagePageHeader } from '../components/SurveyManagePageHeader';
import { AnimalViewToggle } from './sidebar/AnimalViewToggle';
import { SurveyAnimalsTab } from './tabs/SurveyAnimalsTab';

const ACTIVE_VIEW_KEY = 'v';

export enum ANIMAL_ACTIVE_VIEW_VALUE {
  animals = 'animals',
  captures = 'captures',
  mortalities = 'mortalities',
  markings = 'markings',
  measurements = 'measurements'
}

const DEFAULT_VIEW = ANIMAL_ACTIVE_VIEW_VALUE.animals;

/**
 * Returns the page for managing Animals
 *
 * @return {*}
 */
export const SurveyAnimalPage = () => {
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const codesContext = useCodesContext();

  const crittersDataLoader = useDataLoader(() => biohubApi.survey.getSurveyCritters(surveyContext.surveyId));
  const { searchParams, setSearchParams } = useSearchParams<{ [ACTIVE_VIEW_KEY]: ANIMAL_ACTIVE_VIEW_VALUE }>();
  const activeView = searchParams.get(ACTIVE_VIEW_KEY) as ANIMAL_ACTIVE_VIEW_VALUE;

  useEffect(() => {
    codesContext.codesDataLoader.load();
    if (!searchParams.get(ACTIVE_VIEW_KEY)) {
      setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, DEFAULT_VIEW));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codesContext.codesDataLoader]);

  useEffect(() => {
    crittersDataLoader.load();
  }, [crittersDataLoader]);

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    // <Stack
    //   position="relative"
    //   height="100%"
    //   flex="1 1 auto"
    //   overflow="hidden"
    //   p={0}
    //   m={0}
    //   sx={{
    //     '& .MuiContainer-root': {
    //       maxWidth: 'none'
    //     }
    //   }}>
    //   <SurveyManagePageHeader
    //     page={SurveyManagePageEnum.ANIMALS}
    //     survey_id={surveyContext.surveyId}
    //     survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
    //   />
    //   <Stack direction="row" gap={1} sx={{ flex: '1 1 auto', p: 1, mr: 1 }}>
    //     <Box minWidth="400px" maxWidth="30%">
    //       <AnimalListContainer />
    //     </Box>
    //     <Box flex="1 1 auto" height="100%">
    //       {animalPageContext.selectedAnimal ? (
    //         <AnimalProfileContainer />
    //       ) : (
    //         <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    //           <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    //             <Typography variant="h5" component="h2">
    //               Animal Overview
    //             </Typography>
    //             <Button
    //               component={RouterLink}
    //               to={`/admin/surveys/${surveyContext.surveyId}/animals/captures`}
    //               variant="contained"
    //               color="primary"
    //               aria-label="Manage Captures"
    //               startIcon={<Icon path={mdiPlus} size={0.75} />}>
    //               Add Captures
    //             </Button>
    //           </Toolbar>
    //           <Divider flexItem />
    //           <Box flex="1 1 auto">
    //             <SurveySpatialAnimal />
    //           </Box>
    //         </Paper>
    //       )}
    //     </Box>
    //   </Stack>
    // </Stack>
    <Stack
      position="relative"
      height="100%"
      flex="1 1 auto"
      overflow="hidden"
      p={0}
      m={0}
      sx={{
        '& .MuiContainer-root': {
          maxWidth: 'none'
        }
      }}>
      <SurveyManagePageHeader
        survey_id={surveyContext.surveyId}
        page={SurveyManagePageEnum.ANIMALS}
        survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
      />
      <Stack direction="row" gap={1} sx={{ flex: '1 1 auto', p: 1, mr: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0, height: '100%' }}>
          <SidebarLayout
            sidebar={
              <Box p={2}>
                <AnimalViewToggle
                  activeView={activeView}
                  setActiveView={(v) => setSearchParams(searchParams.set(ACTIVE_VIEW_KEY, v, { replace: true }))}
                />
              </Box>
            }>
            <ComponentSwitch
              switch={activeView}
              components={{
                [ANIMAL_ACTIVE_VIEW_VALUE.animals]: <SurveyAnimalsTab />
              }}
            />
          </SidebarLayout>
        </Box>
      </Stack>
    </Stack>
  );
};
