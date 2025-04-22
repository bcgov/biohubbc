import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { ACTIVE_VIEW_VALUE } from '../SurveyPage';

interface SurveyChecklistGuideProps {
  activeView: ACTIVE_VIEW_VALUE | null;
  onClose: () => void;
}

export const SurveyChecklistGuide = (props: SurveyChecklistGuideProps) => {
  const { activeView, onClose } = props;

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Guide</Typography>

        <IconButton color="primary" onClick={onClose}>
          <Icon path={mdiClose} size={1} />
        </IconButton>
      </Box>

      <Box flexShrink={0}>
        <Typography>{activeView}</Typography>
      </Box>
    </>
  );
};
