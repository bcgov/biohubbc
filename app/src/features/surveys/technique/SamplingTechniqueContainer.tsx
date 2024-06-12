import { mdiArrowTopRight, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { SkeletonList } from 'components/loading/SkeletonLoaders';
import { useCodesContext, useSurveyContext } from 'hooks/useContext';
import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { SamplingTechniqueCardContainer } from './components/SamplingTechniqueCardContainer';

/**
 * Renders a list of techniques.
 *
 * @return {*}
 */
const SamplingSiteTechniqueContainer = () => {
  const surveyContext = useSurveyContext();
  const codesContext = useCodesContext();
  // const biohubApi = useBiohubApi();

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  useEffect(() => {
    surveyContext.techniqueDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const techniqueDataLoaderData = surveyContext.techniqueDataLoader.data;

  const techniqueCount = techniqueDataLoaderData?.count ?? 0;
  const techniques = techniqueDataLoaderData?.techniques ?? [];

  return (
    <>
      <Stack
        flexDirection="column"
        height="100%"
        sx={{
          overflow: 'hidden'
        }}>
        <Toolbar
          disableGutters
          sx={{
            flex: '0 0 auto',
            pr: 3,
            pl: 2
          }}>
          <Typography variant="h3" component="h2" flexGrow={1}>
            Techniques &zwnj;
            <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
              ({techniqueCount})
            </Typography>
          </Typography>
          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to={'technique/create'}
            startIcon={<Icon path={mdiPlus} size={0.8} />}>
            Add
          </Button>
        </Toolbar>
        {surveyContext.techniqueDataLoader.isLoading || codesContext.codesDataLoader.isLoading ? (
          <SkeletonList />
        ) : (
          <Stack height="100%" position="relative" sx={{ overflowY: 'auto' }}>
            <Divider flexItem></Divider>
            <Box flex="1 1 auto">
              {/* Display text if the technique data loader has no items in it */}
              {!techniqueCount && (
                <Box
                  height="250px"
                  justifyContent="center"
                  alignItems="center"
                  display="flex"
                  bgcolor={grey[100]}
                  position="relative">
                  {/* <Box component="img" src={datagridOverlayImage} position="absolute" width="700px" /> */}
                  <Box justifyContent="center" display="flex" flexDirection="column">
                    <Typography mb={1} variant="h4" color="textSecondary" textAlign="center">
                      Add a technique&nbsp;
                      <Icon path={mdiArrowTopRight} size={1} />
                    </Typography>
                    <Typography color="textSecondary" textAlign="center" maxWidth="80ch">
                      Techniques describe how you collected data. You can apply your techniques to sampling sites,
                      during which you'll also create sampling periods that describe when a technique was conducted.
                    </Typography>
                  </Box>
                </Box>
              )}

              <SamplingTechniqueCardContainer techniques={techniques} />
            </Box>
          </Stack>
        )}
      </Stack>
    </>
  );
};

export default SamplingSiteTechniqueContainer;
