import { mdiDotsVertical } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface IMarkingCardProps {
  primary_colour_label?: string;
  secondary_colour_label?: string;
  identifier: string | number | null;
  comment: string | null;
  marking_type_label: string;
  marking_body_location_label: string;
  handleMarkingMenuClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

/**
 * Card for displaying information about markings on the animal capture form
 *
 * @returns
 */
const MarkingCard = (props: IMarkingCardProps) => {
  const {
    primary_colour_label,
    secondary_colour_label,
    comment,
    identifier,
    marking_body_location_label,
    marking_type_label,
    handleMarkingMenuClick
  } = props;

  return (
    <Stack component={Card} sx={{ px: 3, py: 2, mb: 2, bgcolor: grey[100] }} flex="1 1 auto" spacing={1}>
      <Box justifyContent="space-between" display="flex">
        <Typography fontWeight={700}>{identifier}</Typography>
        <IconButton edge="end" onClick={handleMarkingMenuClick} aria-label="marking-card">
          <Icon path={mdiDotsVertical} size={1}></Icon>
        </IconButton>
      </Box>
      <Stack direction="row" spacing={2}>
        <Box>
          <Typography component="dt" variant="body2" fontWeight={500} color="textSecondary">
            Type
          </Typography>
          <Typography component="dd" variant="body2">
            {marking_type_label}
          </Typography>
        </Box>
        <Box>
          <Typography component="dt" variant="body2" fontWeight={500} color="textSecondary">
            Position
          </Typography>
          <Typography component="dd" variant="body2">
            {marking_body_location_label}
          </Typography>
        </Box>
        {primary_colour_label && (
          <Box>
            <Typography component="dt" variant="body2" fontWeight={500} color="textSecondary">
              Primary colour
            </Typography>
            <Typography component="dd" variant="body2">
              {primary_colour_label}
            </Typography>
          </Box>
        )}
        {secondary_colour_label && (
          <Box>
            <Typography component="dt" variant="body2" fontWeight={500} color="textSecondary">
              Secondary colour
            </Typography>
            <Typography component="dd" variant="body2">
              {secondary_colour_label}
            </Typography>
          </Box>
        )}
      </Stack>
      {comment && (
        <Box>
          <Typography component="dt" variant="body2" fontWeight={500} color="textSecondary">
            Comment
          </Typography>
          <Typography component="dd" variant="body2" sx={{ whiteSpace: 'normal', overflowWrap: 'break-word' }}>
            {comment}
          </Typography>
        </Box>
      )}
    </Stack>
  );
};

export default MarkingCard;
