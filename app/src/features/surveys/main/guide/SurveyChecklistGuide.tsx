import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { ACTIVE_VIEW_VALUE } from '../SurveyPage';

interface SurveyChecklistGuideProps {
  activeView: ACTIVE_VIEW_VALUE | null;
}

export const SurveyChecklistGuide = (props: SurveyChecklistGuideProps) => {
  const { activeView } = props;

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Guide</Typography>
      </Box>

      <Box width="300px" flexShrink={0}>
        <Typography>{activeView}</Typography>
      </Box>
    </>
  );
};
