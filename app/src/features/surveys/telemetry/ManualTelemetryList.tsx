import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';

export interface ManualTelemetryListProps {}

const ManualTelemetryList = () => {
  const surveyContext = useContext(SurveyContext);

  if (!surveyContext.surveyDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <Box display="flex" flexDirection="column" height="100%">
      <Toolbar
        sx={{
          flex: '0 0 auto'
        }}>
        <Typography
          sx={{
            flexGrow: '1',
            fontSize: '1.125rem',
            fontWeight: 700
          }}>
          Deployments
        </Typography>
        <Button
          sx={{
            mr: -1
          }}
          variant="contained"
          color="primary"
          component={RouterLink}
          to={''}
          startIcon={<Icon path={mdiPlus} size={1} />}>
          Add
        </Button>
      </Toolbar>
      <Box position="relative" display="flex" flex="1 1 auto" overflow="hidden">
        <List
          disablePadding
          sx={{
            '& .MuiListItemText-primary': {
              fontSize: '0.9rem'
            }
          }}>
          <ListItem
            disableGutters
            sx={{
              display: 'block',
              py: 0
            }}>
            Woot
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default ManualTelemetryList;
