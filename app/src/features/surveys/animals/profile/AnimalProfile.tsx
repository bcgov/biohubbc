import { mdiCheckboxMultipleBlankOutline, mdiInformationOutline, mdiPlusBoxOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { Divider, IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey, red } from '@mui/material/colors';
import green from '@mui/material/colors/green';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { useAnimalPageContext, useDialogContext } from 'hooks/useContext';
import { setMessageSnackbar } from 'utils/Utils';
import AnimalAttributeItem from './AnimalAttributeItem';
import AnimalCaptureContainer from './captures/AnimalCaptureContainer';
import ScientificNameTypography from './ScientificNameTypography';

/**
 * Component for displaying an animal's details within the Manage Animals page
 *
 * @returns
 */
const AnimalProfile = () => {
  const animalPageContext = useAnimalPageContext();
  const dialogContext = useDialogContext();

  const critterDataLoader = animalPageContext.critterDataLoader;

  const handleCopy = (text: string) => {
    if (!text) {
      return;
    }
    navigator.clipboard
      .writeText(text)
      .then(() => {
        // Show snackbar for successful deletion
        setMessageSnackbar('Unique ID copied to clipboard', dialogContext);
      })
      .catch((error) => {
        console.error('Could not copy text: ', error);
      });
  };

  const critter = critterDataLoader.data;

  if (!critter || critterDataLoader.isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%" flex="1 1 auto">
        <CircularProgress size={40} sx={{ flex: '1 1 auto', position: 'absolute' }} />
      </Box>
    );
  }

  return (
    <Stack spacing={1.5} flexDirection="column" height="100%" maxWidth="100%">
      <Paper sx={{ p: 2, flex: '1 1 auto', maxWidth: '100%', width: '100%' }}>
        <Typography
          variant="h2"
          sx={{
            pb: 1,
            display: 'block',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            maxWidth: '100%'
          }}>
          {critter.animal_id}
        </Typography>
        <Box display="flex" justifyContent="space-between">
          <Stack direction="row" spacing={2}>
            <AnimalAttributeItem
              text={
                <ScientificNameTypography
                  variant="body2"
                  component="span"
                  color="textSecondary"
                  name={critter.itis_scientific_name}
                />
              }
              startIcon={mdiInformationOutline}
            />
            {critter.wlh_id && <AnimalAttributeItem text={critter.wlh_id} startIcon={mdiPlusBoxOutline} />}
            <Box mt={1}>
              <ColouredRectangleChip
                label={critter.mortality.length ? 'Deceased' : 'Alive'}
                colour={critter.mortality.length ? red : green}
              />
            </Box>
          </Stack>
          <Typography variant="body2" color="textSecondary">
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700 }} component="span">
              Unique ID:&nbsp;
            </Typography>
            {critter.critter_id}
            <IconButton
              sx={{ borderRadius: '5px', p: 0.5, ml: 0.5 }}
              onClick={() => {
                handleCopy(critter?.critter_id ?? '');
              }}>
              <Icon color={grey[600]} path={mdiCheckboxMultipleBlankOutline} size={0.75} />
            </IconButton>
          </Typography>
        </Box>
        <Divider sx={{ my: 2 }} />
        <Stack direction="row" gap={3} flex="1 1 auto">
          <Box>
            <Typography component="dt" variant="body2" fontWeight={500} color="textSecondary">
              Sex
            </Typography>
            <Typography component="dd" variant="body2">
              {critter.sex}
            </Typography>
          </Box>
          {critter.collection_units.map((unit, index) => (
            <Box key={`${unit.collection_category_id}-${index}`}>
              <Typography component="dt" variant="body2" fontWeight={500} color="textSecondary">
                {unit.category_name}
              </Typography>
              <Typography component="dd" variant="body2">
                {unit.unit_name}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
      <Paper>
        <AnimalCaptureContainer />
      </Paper>
    </Stack>
  );
};

export default AnimalProfile;
