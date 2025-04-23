import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

/**
 * Project details content for a project.
 *
 * @return {*}
 */
const CollectionAbout = () => {
  return (
    <Box>
      <Toolbar>
        <Typography variant="h4" component="h2" flex="1 1 auto">
          Collection Details
        </Typography>
      </Toolbar>
    </Box>
  );
};

export default CollectionAbout;
