import { mdiCalendar, mdiChevronDown } from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { grey } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useAnimalPageContext } from 'hooks/useContext';
import { getFormattedDate } from 'utils/Utils';
import CaptureCardDetails from './CaptureCardDetails';

const AnimalCaptureCardContainer = () => {
  const { critterDataLoader } = useAnimalPageContext();

  if (!critterDataLoader.data) {
    return <CircularProgress size={40} />;
  }

  const captures = critterDataLoader.data.captures;

  console.log(captures)
  return (
    <Stack>
      {captures.map((capture) => {
        const [captureDate, captureTime] = capture.capture_timestamp.split(' ');

        return (
          <Accordion
            disableGutters
            square
            elevation={0}
            sx={{
              borderRadius: '5px',
              border: 'none',
              outline: 'none',
              '& .MuiAccordion-root::before': {
                border: 'none',
                outline: 'none',
                position: 'none'
              }
            }}>
            <AccordionSummary
              expandIcon={<Icon path={mdiChevronDown} size={1} />}
              aria-controls="panel1bh-content"
              sx={{
                flex: '1 1 auto',
                mr: 1,
                height: 55,
                overflow: 'hidden',
                border: 0,
                '& .MuiAccordionSummary-content': {
                  flex: '1 1 auto',
                  py: 0,
                  pl: 0,
                  overflow: 'hidden',
                  whiteSpace: 'nowrap'
                }
              }}>
              <Stack direction="row" gap={0.5}>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.25, mr: 1 }}>
                  <Icon size={0.8} color={grey[400]} title="Capture date" path={mdiCalendar} />
                </Box>
                <Typography fontWeight={700}>
                  {getFormattedDate(DATE_FORMAT.MediumDateFormat, captureDate)}&nbsp;
                </Typography>
                <Typography color="textSecondary">{captureTime}</Typography>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <CaptureCardDetails capture={capture} />
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );
};

export default AnimalCaptureCardContainer;
