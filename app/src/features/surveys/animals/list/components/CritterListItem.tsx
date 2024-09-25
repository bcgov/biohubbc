import { mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ISurveyCritter } from 'contexts/animalPageContext';
import { ICritterSimpleResponse } from 'interfaces/useCritterApi.interface';
import { ScientificNameTypography } from '../../components/ScientificNameTypography';

interface ICritterListItemProps {
  critter: ICritterSimpleResponse;
  isSelectedAnimal: boolean;
  onAnimalClick: (critter: ICritterSimpleResponse) => void;
  isCheckboxSelected: boolean;
  onCheckboxClick: (critterId: number) => void;
  onMenuClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, critter: ISurveyCritter) => void;
}

/**
 * Component for displaying a critter list item.
 *
 * @param {ICritterListItemProps} props
 * @return {*}
 */
export const CritterListItem = (props: ICritterListItemProps) => {
  const { critter, isSelectedAnimal, onAnimalClick, isCheckboxSelected, onCheckboxClick, onMenuClick } = props;

  return (
    <Stack
      key={critter.critterbase_critter_id}
      direction="row"
      display="flex"
      alignItems="center"
      overflow="hidden"
      flex="1 1 auto"
      justifyItems="space-between"
      sx={{
        m: 0.5,
        borderRadius: '5px',
        bgcolor: isSelectedAnimal ? grey[100] : undefined
      }}>
      <Checkbox
        sx={{ mr: 0.5 }}
        checked={isCheckboxSelected}
        onClick={(event) => {
          event.stopPropagation();
          onCheckboxClick(critter.critter_id);
        }}
        inputProps={{ 'aria-label': 'controlled' }}
      />
      <Button
        onClick={() => onAnimalClick(critter)}
        sx={{
          flex: '1 1 auto',
          '&.MuiButtonBase-root:hover': {
            bgcolor: 'transparent'
          },
          outline: 'none !important'
        }}>
        <Stack
          flexDirection="row"
          alignItems="flex-start"
          sx={{
            px: 1.25,
            flex: '1 1 auto',
            maxWidth: '100%'
          }}>
          <Typography
            sx={{
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              textAlign: 'left',
              flex: '0.9',
              mt: 1
            }}>
            <Typography
              component="span"
              variant="body2"
              textAlign="left"
              sx={{
                mr: 1,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                display: 'block',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                textAlign: 'left',
                width: '90%'
              }}>
              {critter.animal_id}
            </Typography>
            <ScientificNameTypography
              variant="body2"
              component="span"
              name={critter.itis_scientific_name}
              sx={{
                mr: 1,
                whiteSpace: 'nowrap',
                display: 'block',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                textAlign: 'left',
                width: '85%',
                color: `${grey[600]} !important`
              }}
            />
          </Typography>
        </Stack>
      </Button>
      <IconButton
        onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) =>
          onMenuClick(event, {
            critterbase_critter_id: critter.critterbase_critter_id,
            critter_id: critter.critter_id
          })
        }
        aria-label="animal-settings">
        <Icon path={mdiDotsVertical} size={1} />
      </IconButton>
    </Stack>
  );
};
