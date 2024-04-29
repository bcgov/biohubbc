import { mdiCardTextOutline, mdiInformationOutline, mdiPlus, mdiPlusBoxOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { red } from '@mui/material/colors';
import green from '@mui/material/colors/green';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { useAnimalPageContext, useSurveyContext } from 'hooks/useContext';
import { Link as RouterLink } from 'react-router-dom';
import AnimalAttributeItem from './AnimalAttributeItem';
import AnimalCaptureContainer from './captures/AnimalCaptureContainer';
import ScientificNameTypography from './ScientificNameTypography';

const AnimalProfile = () => {
  const animalPageContext = useAnimalPageContext();

  const critterDataLoader = animalPageContext.critterDataLoader;

  const critter = critterDataLoader.data;

  const { projectId, surveyId } = useSurveyContext();

  if (!critter || critterDataLoader.isLoading) {
    return (
      <Box flex="1 1 auto" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress size={40} sx={{ flex: '1 1 auto', position: 'absolute' }} />
      </Box>
    );
  }

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="h2" mb={1}>
            {critter.animal_id}&nbsp;
          </Typography>
          <Button
            variant="outlined"
            color="error"
            component={RouterLink}
            to={`/admin/projects/${projectId}/surveys/${surveyId}/animals/${animalPageContext.selectedAnimal?.survey_critter_id}/mortality/create`}
            startIcon={<Icon path={mdiPlus} size={1} />}
            disabled={animalPageContext.isDisabled}>
            Report Mortality
          </Button>
        </Box>
        <Stack direction="row" spacing={2} display="flex">
          <AnimalAttributeItem
            text={
              <ScientificNameTypography
                variant="body1"
                component="span"
                color="textSecondary"
                name={critter.itis_scientific_name}
              />
            }
            startIcon={mdiInformationOutline}
          />
          {critter.wlh_id && <AnimalAttributeItem text={critter.wlh_id} startIcon={mdiPlusBoxOutline} />}
          {critter.sex && <AnimalAttributeItem text={critter.sex} startIcon={mdiCardTextOutline} />}
          <ColouredRectangleChip
            label={critter.mortality.length ? 'Deceased' : 'Alive'}
            colour={critter.mortality.length ? red : green}
          />
        </Stack>
      </Paper>
      <Paper>
        <AnimalCaptureContainer />
      </Paper>
    </>
  );
};

export default AnimalProfile;
