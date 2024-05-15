import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface IMarkingCardProps {
  primary_colour_label?: string;
  secondary_colour_label?: string;
  identifier?: string | number | null;
  comment?: string;
  marking_type_label: string;
  marking_body_location_label: string;
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
    marking_type_label
  } = props;

  return (
    <Collapse in>
      <Card sx={{ px: 3, py: 2, mb: 2, bgcolor: grey[100] }}>
        <Stack spacing={1} direction="row" alignItems='center'>
          <Typography fontWeight={700}>{identifier}</Typography>
          <Typography color="textSecondary" variant='body2'>
            {marking_type_label} on {marking_body_location_label}
          </Typography>
        </Stack>
        <Stack
          spacing={1}
          direction="row"
          justifyContent="start"
          sx={{ '& .MuiTypography-root': { fontSize: '0.9rem' } }}>
          <Typography color="textSecondary">{primary_colour_label}</Typography>
          <Typography color="textSecondary">{secondary_colour_label}</Typography>
        </Stack>
        <Typography sx={{ fontSize: '0.9rem' }} color="textSecondary">
          {comment}
        </Typography>
      </Card>
    </Collapse>
  );
};

export default MarkingCard;
