import { mdiCardTextOutline, mdiInformationOutline, mdiPlusBoxOutline } from '@mdi/js';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { red } from '@mui/material/colors';
import green from '@mui/material/colors/green';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { useAnimalPageContext } from 'hooks/useContext';
import AnimalAttributeItem from './AnimalAttributeItem';
import AnimalCaptureContainer from './captures/AnimalCaptureContainer';
import ScientificNameTypography from './ScientificNameTypography';

const AnimalProfile = () => {
  const animalPageContext = useAnimalPageContext();

  const critterDataLoader = animalPageContext.critterDataLoader;

  const critter = critterDataLoader.data;

  if (!critter || critterDataLoader.isLoading) {
    return (
      <Box flex="1 1 auto" display="flex" justifyContent="center" alignItems="center">
        <CircularProgress size={40} sx={{ flex: '1 1 auto', position: 'absolute' }} />
      </Box>
    );
  }

  return (
    <>
      <Paper sx={{ p: 3, flex: '1 1 auto', maxWidth: '100%', width: '100%' }}>
        <Typography
          variant="h2"
          sx={{
            pb: 2,
            display: 'block',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            maxWidth: '100%',
          }}>
          {critter.animal_id}
        </Typography>
        <Stack direction="row" spacing={2}>
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
