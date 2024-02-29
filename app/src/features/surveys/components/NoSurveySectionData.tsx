import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

interface NoSurveySectionDataProps {
  text: string;
}

const NoSurveySectionData = ({ text }: NoSurveySectionDataProps) => {
  return (
    <Stack alignItems="center" justifyContent="center" p={2} minHeight="66px">
      <Typography component="span" color="textSecondary" variant="body2" data-testid="no-summary-section-data">
        {text}
      </Typography>
    </Stack>
  );
};

export default NoSurveySectionData;
