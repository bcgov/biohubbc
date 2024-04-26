import { mdiImport } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useAnimalPageContext } from 'hooks/useContext';

const AnimalCapturesToolbar = () => {
  const { critterDataLoader } = useAnimalPageContext();

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
          ({critterDataLoader.data?.captures.length ?? 0})
        </Typography>
      </Typography>
      <Box display="flex">
        <Button
          variant="contained"
          color="primary"
          startIcon={<Icon path={mdiImport} size={1} />}
          // onClick={() => setOpen(true)}
        >
          Import
        </Button>
      </Box>
    </Toolbar>
  );
};

export default AnimalCapturesToolbar;
