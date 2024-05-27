import { mdiDotsVertical, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

interface IAnimalMortalityToolbarProps {
  onAddAnimalMortality: () => void;
  isDeceased: boolean;
}

/**
 * Toolbar for actions affecting an animal's Mortality, ie. add a new Mortality
 *
 * @param {IAnimalMortalityToolbarProps} props
 * @return {*}
 */
const AnimalMortalityToolbar = (props: IAnimalMortalityToolbarProps) => {
  const { onAddAnimalMortality, isDeceased } = props;

  return (
    <Toolbar
      disableGutters
      sx={{
        px: 2
      }}>
      <Typography
        data-testid="map-control-title"
        component="div"
        fontWeight="700"
        sx={{
          flex: '1 1 auto'
        }}>
        Mortality
      </Typography>
      {isDeceased ? (
        <IconButton onClick={onAddAnimalMortality}>
          <Icon path={mdiDotsVertical} size={1} />
        </IconButton>
      ) : (
        <Box display="flex">
          <Button
            variant="outlined"
            color="error"
            onClick={onAddAnimalMortality}
            startIcon={<Icon path={mdiPlus} size={1} />}>
            Report Mortality
          </Button>
        </Box>
      )}
    </Toolbar>
  );
};

export default AnimalMortalityToolbar;
