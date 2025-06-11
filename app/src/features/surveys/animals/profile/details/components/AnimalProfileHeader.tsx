import { mdiInformationOutline, mdiPencil } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import green from '@mui/material/colors/green';
import red from '@mui/material/colors/red';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { useDialogContext, useSurveyContext } from 'hooks/useContext';
import { useCopyToClipboard } from 'hooks/useCopyToClipboard';
import { ICritterDetailedResponse } from 'interfaces/useCritterApi.interface';
import { useHistory } from 'react-router';
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
  const history = useHistory();
  const { copyToClipboard } = useCopyToClipboard();
  const { surveyId } = useSurveyContext();

  const handleAnimalEdit = () => {
    history.push(`/admin/surveys/${surveyId}/animals/${critter.critter_id}/edit`);
  };

  return (
    <>
      <Typography
        variant="h2"
        sx={{
          px: 2,
          pt: 2,
          pb: 1,
          display: 'block',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          maxWidth: '100%'
        }}>
        {critter.animal_id}
      </Typography>
      <Box display="flex" justifyContent="space-between" px={2}>
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
        <Button
          variant="outlined"
          color="primary"
          startIcon={<Icon path={mdiPencil} size={1} />}
          sx={{ height: 36, alignSelf: 'center' }}
          onClick={handleAnimalEdit}>
          Edit
        </Button>
      </Box>
      <Divider sx={{ my: 2 }} />
      <Stack direction="row" gap={3} flex="1 1 auto">
        {critter.sex && (
          <Box>
            <Typography component="dt" variant="body2" fontWeight={500} color="textSecondary">
              Sex
            </Typography>
            <Typography component="dd" variant="body2">
              {critter.sex.label}
            </Typography>
          </Box>
        )}
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
