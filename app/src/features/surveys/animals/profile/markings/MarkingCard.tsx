import { mdiDotsVertical } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import startCase from 'lodash-es/startCase';

interface IMarkingCardProps {
  editable: boolean;
  primary_colour_label?: string;
  secondary_colour_label?: string;
  identifier: string | number | null;
  comment: string | null;
  marking_type_label: string;
  marking_body_location_label: string;
  handleMarkingMenuClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

/**
 * Card for displaying information about markings on the animal form
 *
 * @param {IMarkingCardProps} props
 * @return {*}
 */
export const MarkingCard = (props: IMarkingCardProps) => {
  const {
    editable,
    primary_colour_label,
    secondary_colour_label,
    comment,
    identifier,
    marking_body_location_label,
    marking_type_label,
    handleMarkingMenuClick
  } = props;

  return (
    <Paper variant="outlined" sx={{ px: 3, py: 2, bgcolor: grey[100] }}>
      <Box position="relative" display="flex">
        <Typography component="dd" fontWeight={700}>
          {startCase(marking_type_label)}
        </Typography>
        {editable && (
          <IconButton
            edge="end"
            onClick={handleMarkingMenuClick}
            aria-label="marking-card"
            sx={{ position: 'absolute', right: '0' }}>
            <Icon path={mdiDotsVertical} size={1}></Icon>
          </IconButton>
        )}
      </Box>
      <Typography component="dd" variant="body2" sx={{ whiteSpace: 'normal', overflowWrap: 'break-word', my: 1 }}>
        {comment}
      </Typography>
      <Stack direction="row" spacing={2} m={0}>
        <Box>
          <Typography component="dt" variant="body2" color="textSecondary">
            Position
          </Typography>
          <Typography component="dd" variant="body2">
            {marking_body_location_label}
          </Typography>
        </Box>
        {identifier && (
          <Box>
            <Typography component="dt" variant="body2" color="textSecondary">
              Identifier
            </Typography>
            <Typography component="dd" variant="body2">
              {identifier}
            </Typography>
          </Box>
        )}
        {primary_colour_label && (
          <Box>
            <Typography component="dt" variant="body2" color="textSecondary">
              Primary colour
            </Typography>
            <Typography component="dd" variant="body2">
              {primary_colour_label}
            </Typography>
          </Box>
        )}
        {secondary_colour_label && (
          <Box>
            <Typography component="dt" variant="body2" color="textSecondary">
              Secondary colour
            </Typography>
            <Typography component="dd" variant="body2">
              {secondary_colour_label}
            </Typography>
          </Box>
        )}
      </Stack>
    </Paper>
  );
};
