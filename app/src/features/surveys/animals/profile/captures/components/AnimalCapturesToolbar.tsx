import { mdiFileDocumentPlusOutline, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useSurveyContext } from 'hooks/useContext';
import { Link as RouterLink } from 'react-router-dom';

interface ICapturesToolbarProps {
  capturesCount: number;
  onAddAnimalCapture: () => void;
}

/**
 * Toolbar for actions affecting an animal's captures, ie. add a new capture
 *
 * @param {ICapturesToolbarProps} props
 * @returns {*}
 */
export const AnimalCapturesToolbar = (props: ICapturesToolbarProps) => {
  const { capturesCount, onAddAnimalCapture } = props;

  const surveyContext = useSurveyContext();

  return (
    <Toolbar
      disableGutters
      sx={{
        px: 2
      }}>
      <Typography
        data-testid="map-control-title"
        component="div"
        fontWeight="700"
        sx={{
          flex: '1 1 auto'
        }}>
        Captures
        <Typography component="span" color="textSecondary" sx={{ ml: 0.5, flex: '1 1 auto' }}>
          ({capturesCount})
        </Typography>
      </Typography>
      <Box display="flex">
        <Button
          variant="contained"
          color="primary"
          onClick={onAddAnimalCapture}
          startIcon={<Icon path={mdiPlus} size={1} />}
          sx={{ mr: 0.2, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
          Add Capture
        </Button>
        <Button
          variant="contained"
          color="primary"
          component={RouterLink}
          to={`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/animals/captures`}
          startIcon={<Icon path={mdiFileDocumentPlusOutline} size={1} />}
          sx={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, '& .MuiButton-startIcon': { mx: 0 } }}
        />
      </Box>
    </Toolbar>
  );
};
