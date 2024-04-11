import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, Collapse, Paper, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useState } from 'react';

interface IMeasurementStandardCard {
  label: string;
  description?: string;
  unit?: string;
}

const MeasurementStandardCard = (props: IMeasurementStandardCard) => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <Paper
      sx={{ bgcolor: grey[100], px: 3, py: 2, cursor: 'pointer' }}
      elevation={0}
      onClick={() => setIsCollapsed(!isCollapsed)}>
      <Box display="flex" justifyContent="space-between" flex="1 1 auto" alignItems="center">
        <Typography
          variant="h5"
          sx={{
            '&::first-letter': {
              textTransform: 'capitalize'
            }
          }}>
          {props.label}
        </Typography>
        <Icon path={isCollapsed ? mdiChevronDown : mdiChevronUp} size={1} />
      </Box>
      <Collapse in={!isCollapsed}>
        <Box my={2}>
          <Typography variant="body1" color="textSecondary">
            {props.description ? props.description : 'No description'}
          </Typography>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default MeasurementStandardCard;
