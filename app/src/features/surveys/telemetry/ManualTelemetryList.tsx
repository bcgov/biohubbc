import { mdiChevronDown, mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { SurveyContext } from 'contexts/surveyContext';
import { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';

// export interface ManualTelemetryListProps {}

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
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            overflowY: 'auto',
            p: 1,
            background: grey[100]
          }}>
          <Accordion
            key={`butts`}
            sx={{
              boxShadow: 'none'
            }}>
            <AccordionSummary
              expandIcon={<Icon path={mdiChevronDown} size={1} />}
              sx={{
                flex: '1 1 auto',
                overflow: 'hidden',
                py: 0.25,
                pr: 1.5,
                pl: 2,
                gap: '24px',
                '& .MuiAccordionSummary-content': {
                  flex: '1 1 auto',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }
              }}>
              <Typography
                sx={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  typography: 'body2',
                  fontWeight: 700,
                  fontSize: '0.9rem'
                }}>
                Deployment Name
              </Typography>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                pt: 0,
                px: 2
              }}>
              Look at all these details son
            </AccordionDetails>
          </Accordion>
        </Box>
      </Box>
    </Box>
  );
};

export default ManualTelemetryList;
