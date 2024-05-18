import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

interface IAnimalMortalityToolbarProps {
  onAddAnimalMortality: () => void;
}

/**
 * Toolbar for actions affecting an animal's Mortality, ie. add a new Mortality
 *
 * @returns
 */
const AnimalMortalityToolbar = (props: IAnimalMortalityToolbarProps) => {
  const { onAddAnimalMortality } = props;

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
      <Box display="flex">
        <Button
          variant="outlined"
          color="error"
          onClick={onAddAnimalMortality}
          startIcon={<Icon path={mdiPlus} size={1} />}>
          Report Mortality
        </Button>
      </Box>
    </Toolbar>
  );
};

export default AnimalMortalityToolbar;
