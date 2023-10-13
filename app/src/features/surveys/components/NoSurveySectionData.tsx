import Paper, { PaperProps } from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface NoSurveySectionDataProps {
  text: string;
  paperVariant?: PaperProps['variant'];
}

const NoSurveySectionData = ({ text, paperVariant }: NoSurveySectionDataProps) => {
  return (
    <>
      <Paper
        variant={paperVariant}
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '66px',
          p: 2
        }}>
        <Typography component="span" color="textSecondary" variant="body2" data-testid="no-summary-section-data">
          {text}
        </Typography>
      </Paper>
    </>
  );
};

export default NoSurveySectionData;
