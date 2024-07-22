import { mdiArrowTopRight } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Typography from '@mui/material/Typography';

export const NoTechniquesOverlay = () => {
  return (
    <Box
      height="250px"
      justifyContent="center"
      alignItems="center"
      display="flex"
      bgcolor={grey[100]}
      position="relative">
      <Box justifyContent="center" display="flex" flexDirection="column">
        <Typography mb={1} variant="h4" color="textSecondary" textAlign="center">
          Add a technique&nbsp;
          <Icon path={mdiArrowTopRight} size={1} />
        </Typography>
        <Typography color="textSecondary" textAlign="center" maxWidth="80ch">
          Techniques describe how you collected data. You can apply your techniques to sampling sites, during which
          you'll also create sampling periods that describe when a technique was conducted.
        </Typography>
      </Box>
    </Box>
  );
};
