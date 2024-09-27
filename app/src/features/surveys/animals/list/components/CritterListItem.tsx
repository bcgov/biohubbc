import { mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import { ListItemIcon } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
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
  const { critter, onAnimalClick, isSelectedAnimal, isCheckboxSelected, onCheckboxClick, onMenuClick } = props;

  return (
    <ListItem
      sx={{
        backgroundColor: isSelectedAnimal ? grey[100] : undefined,
        '&:hover': {
          backgroundColor: grey[100]
        }
      }}
      secondaryAction={
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
      }>
      <ListItemIcon>
        <Checkbox
          edge="start"
          checked={isCheckboxSelected}
          onClick={(event) => {
            event.stopPropagation();
            onCheckboxClick(critter.critter_id);
          }}
          inputProps={{ 'aria-label': 'controlled' }}
        />
      </ListItemIcon>
      <ListItemButton
        onClick={() => onAnimalClick(critter)}
        sx={{
          paddingLeft: '0px',
          '&.MuiButtonBase-root:hover': {
            bgcolor: 'transparent'
          },
          outline: 'none !important'
        }}>
        <Stack flexDirection="row" alignItems="flex-start" sx={{ flex: '1 1 auto' }}>
          <Typography sx={{ flex: '1 1 auto' }}>
            <Typography
              component="span"
              variant="body2"
              textAlign="left"
              sx={{
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
      </ListItemButton>
    </ListItem>
  );
};
