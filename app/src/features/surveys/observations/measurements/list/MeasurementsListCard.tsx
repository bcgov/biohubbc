import { mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CBMeasurementType } from 'interfaces/useCritterApi.interface';

export interface IMeasurementsListCardProps {
  /**
   * The measurement to display.
   *
   * @type {CBMeasurementType}
   * @memberof IMeasurementsListCardProps
   */
  measurement: CBMeasurementType;
  /**
   * Callback fired on remove.
   *
   * @memberof IMeasurementsListCardProps
   */
  onRemove: () => void;
}

/**
 * Renders a single measurement card.
 *
 * @param {IMeasurementsListCardProps} props
 * @return {*}
 */
export const MeasurementsListCard = (props: IMeasurementsListCardProps) => {
  const { onRemove } = props;

  return (
    <Card
      component={Stack}
      variant="outlined"
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
      p={2}
      sx={{
        background: grey[100]
      }}
      data-testid="measurements-list-item">
      <Stack gap={0.75} mt={-0.25}>
        <Box>
          <Typography variant="body2">
            <em>{props.measurement.itis_tsn}</em>
          </Typography>
          {/* <Typography variant="body2">
            {props.measurement.commonNames ? (
              <>
                <span>{props.measurement.commonNames}</span>&nbsp;
                <span>
                  (<em>{props.measurement.scientificName}</em>)
                </span>
              </>
            ) : (
              <em>{props.measurement.scientificName}</em>
            )}
          </Typography> */}
        </Box>
        <Box>
          <Typography component="div" variant="body1" fontWeight={700}>
            {props.measurement.measurement_name}
          </Typography>
          <Typography
            component="div"
            variant="subtitle2"
            color="textSecondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: '2',
              WebkitBoxOrient: 'vertical',
              maxWidth: '80ch',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
            {props.measurement.measurement_desc}
          </Typography>
        </Box>
      </Stack>
      <Box>
        <IconButton data-testid="delete-author-icon" aria-label="remove author" onClick={onRemove}>
          <Icon path={mdiTrashCanOutline} size={1} />
        </IconButton>
      </Box>
    </Card>
  );
};
