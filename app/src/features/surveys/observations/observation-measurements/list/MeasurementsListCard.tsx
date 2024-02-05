import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Measurement } from 'hooks/cb_api/useLookupApi';

export interface IMeasurementsListCardProps {
  measurement: Measurement;
  onRemove: () => void;
}

export const MeasurementsListCard = (props: IMeasurementsListCardProps) => {
  const { onRemove } = props;

  return (
    <Card
      variant="outlined"
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        background: grey[100]
      }}>
      <Box>
        <Box>
          <Typography variant="body2" color="textSecondary">
            {props.measurement.scientificName} ({props.measurement.commonName})
          </Typography>
        </Box>
        <Box>
          <Typography variant="body1" color="textPrimary">
            {props.measurement.measurementName}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" color="textPrimary">
            {props.measurement.measurementDescription}
          </Typography>
        </Box>
        <Box>
          <IconButton data-testid="delete-author-icon" aria-label="remove author" onClick={onRemove}>
            <Icon path={mdiTrashCanOutline} size={1} />
          </IconButton>
        </Box>
      </Box>
    </Card>
  );
};
