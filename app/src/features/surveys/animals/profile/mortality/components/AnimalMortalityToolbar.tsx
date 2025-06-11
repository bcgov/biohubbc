import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

interface IAnimalMortalityToolbarProps {
  mortalityCount: number;
  onAddAnimalMortality: () => void;
}

/**
 * Toolbar for actions affecting an animal's Mortality, ie. add a new Mortality
 *
 * @param {IAnimalMortalityToolbarProps} props
 * @return {*}
 */
export const AnimalMortalityToolbar = (props: IAnimalMortalityToolbarProps) => {
  const { mortalityCount, onAddAnimalMortality } = props;

  return (
    <Toolbar disableGutters>
      <Typography
        data-testid="map-control-title"
        component="div"
        sx={{
          pl: 1,
          flex: '1 1 auto',
          fontWeight: '700',
          fontSize: '1.25rem'
        }}>
        Mortality
      </Typography>
      {mortalityCount === 0 && (
        <Box display="flex">
          <Button
            variant="contained"
            color="primary"
            onClick={onAddAnimalMortality}
            startIcon={<Icon path={mdiPlus} size={1} />}>
            Add Mortality
          </Button>
        </Box>
      )}
    </Toolbar>
  );
};
