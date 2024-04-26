import { mdiCardTextOutline, mdiInformationOutline, mdiPlusBoxOutline } from '@mdi/js';
import CircularProgress from '@mui/material/CircularProgress';
import { red } from '@mui/material/colors';
import green from '@mui/material/colors/green';
import grey from '@mui/material/colors/grey';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { useAnimalPageContext } from 'hooks/useContext';
import AnimalAttributeItem from './AnimalAttributeItem';
import AnimalCapturesContainer from './captures/AnimalCapturesContainer';
import ScientificNameTypography from './ScientificNameTypography';

const AnimalProfile = () => {
  const animalPageContext = useAnimalPageContext();

  const critterDataLoader = animalPageContext.critterDataLoader;

  const critter = critterDataLoader.data;

  if (!critter || critterDataLoader.isLoading) {
    return <CircularProgress size={40} />;
  }

  return (
    <Stack p={2} bgcolor={grey[100]} spacing={2} overflow="auto" height='100%'>
      <Paper sx={{ p: 3 }} variant="outlined">
        <Typography variant="h2" mb={1}>
          {critter.animal_id}&nbsp;
        </Typography>
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
            label={critter.mortality.length ? 'Alive' : 'Deceased'}
            colour={critter.mortality.length ? green : red}
          />
        </Stack>
      </Paper>
      <AnimalCapturesContainer />
    </Stack>
  );
};

export default AnimalProfile;
