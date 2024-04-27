import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import { IconButton } from '@mui/material';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useAnimalPageContext } from 'hooks/useContext';
import AnimalProfile from './AnimalProfile';

const AnimalProfileContainer = () => {

  const {setSelectedAnimal } = useAnimalPageContext();

  return (
    <Paper component={Stack} flexDirection="column" flex="1 1 auto" height="100%">
      <Toolbar
        disableGutters
        sx={{
          pl: 2,
          pr: 3
        }}>
        <Typography
          sx={{
            flexGrow: '1',
            fontSize: '1.125rem',
            fontWeight: 700
          }}>
          Profile &zwnj;
          {/* <Typography sx={{ fontWeight: '400' }} component="span" variant="inherit" color="textSecondary">
            ({animalPageContext.observationCount})
          </Typography> */}
        </Typography>

        <Stack flexDirection="row" alignItems="center" gap={1} whiteSpace="nowrap">
          <IconButton
            onClick={() => {
              setSelectedAnimal(null);
            }}>
            <Icon path={mdiClose} size={1} />
          </IconButton>
        </Stack>
      </Toolbar>

      <Divider flexItem></Divider>

      <Box display="flex" flexDirection="column" flex="1 1 auto" overflow="auto" height="100%">
        <AnimalProfile />
      </Box>
    </Paper>
  );
};

export default AnimalProfileContainer;
