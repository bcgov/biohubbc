import { mdiCheckboxMultipleBlankOutline, mdiInformationOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import green from '@mui/material/colors/green';
import grey from '@mui/material/colors/grey';
import red from '@mui/material/colors/red';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { useDialogContext } from 'hooks/useContext';
import { useCopyToClipboard } from 'hooks/useCopyToClipboard';
import { ICritterDetailedResponse } from 'interfaces/useCritterApi.interface';
import { setMessageSnackbar } from 'utils/Utils';
import { ScientificNameTypography } from '../../../components/ScientificNameTypography';
import { AnimalAttributeItem } from './AnimalAttributeItem';

interface IAnimalProfileHeaderProps {
  critter: ICritterDetailedResponse;
}

/**
 * Returns header component for an animal's profile, displayed after selecting an animal
 *
 * @param {IAnimalProfileHeaderProps} props
 * @return {*}
 */
export const AnimalProfileHeader = (props: IAnimalProfileHeaderProps) => {
  const { critter } = props;

  const dialogContext = useDialogContext();

  const { copyToClipboard } = useCopyToClipboard();

  return (
    <>
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
        <Stack direction="row" spacing={2} sx={{ mr: 2, alignItems: 'center' }}>
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
              if (!critter.critter_id) {
                return;
              }

              copyToClipboard(critter.critter_id, () =>
                setMessageSnackbar('Unique ID copied to clipboard', dialogContext)
              ).catch((error) => {
                console.error('Could not copy text: ', error);
              });
            }}>
            <Icon color={grey[600]} path={mdiCheckboxMultipleBlankOutline} size={0.75} />
          </IconButton>
        </Typography>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" gap={3} flex="1 1 auto">
        {critter.wlh_id && (
          <Box>
            <Typography component="dt" variant="body2" fontWeight={500} color="textSecondary">
              Wildlife Health ID
            </Typography>
            <Typography component="dd" variant="body2">
              {critter.wlh_id}
            </Typography>
          </Box>
        )}
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
    </>
  );
};
