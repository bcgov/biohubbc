import { Paper, Typography } from '@mui/material';
import { grey } from '@mui/material/colors';

interface IMarkingBodyLocationStandardCard {
  label: string;
}

const MarkingBodyLocationStandardCard = (props: IMarkingBodyLocationStandardCard) => {
  return (
    <Paper sx={{ bgcolor: grey[100], px: 3, py: 2 }} elevation={0}>
      <Typography
        variant="h5"
        sx={{
          '&::first-letter': {
            textTransform: 'capitalize'
          }
        }}>
        {props.label}
      </Typography>
    </Paper>
  );
};

export default MarkingBodyLocationStandardCard;
