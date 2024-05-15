import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

interface IAnimalCapturesToolbarProps {
  capturesCount: number;
  createCaptureRoute: string;
}

/**
 * Toolbar for actions affecting an animal's captures, ie. add a new capture
 *
 * @returns
 */
const AnimalCapturesToolbar = (props: IAnimalCapturesToolbarProps) => {
  const { capturesCount, createCaptureRoute } = props;

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
        Captures
        <Typography component="span" color="textSecondary" sx={{ ml: 0.5, flex: '1 1 auto' }}>
          ({capturesCount})
        </Typography>
      </Typography>
      <Box display="flex">
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to={createCaptureRoute}
          startIcon={<Icon path={mdiPlus} size={1} />}>
          Add
        </Button>
      </Box>
    </Toolbar>
  );
};

export default AnimalCapturesToolbar;
