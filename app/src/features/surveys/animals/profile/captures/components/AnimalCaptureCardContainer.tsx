import { mdiChevronDown, mdiMapMarkerOutline } from '@mdi/js';
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

  return (
    <>
      {captures.map((capture) => {
        const [captureDate, captureTime] = capture.capture_timestamp.split(' ');

        return (
          <Accordion
            disableGutters
            sx={{
              border: 'none',
              outline: 'none',
              '&.MuiAccordion-root:before': {
                display: 'none'
              }
            }}>
            <AccordionSummary
              expandIcon={<Icon path={mdiChevronDown} size={1} />}
              aria-controls="panel1bh-content"
              sx={{
                flex: '1 1 auto',
                mr: 1,
                py: 2,
                minHeight: 55,
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
              <Stack direction="row" gap={0.5} display="flex" alignItems="center">
                <Typography fontWeight={700}>
                  {getFormattedDate(DATE_FORMAT.MediumDateTimeFormat, captureDate)}&nbsp;
                </Typography>
                <Typography color="textSecondary">{captureTime}</Typography>
                <Box display="flex" alignItems="flex-end">
                  <Box sx={{ display: 'flex', alignItems: 'center', mr: 0.5 }}>
                    <Icon size={0.8} color={grey[400]} title="Capture location" path={mdiMapMarkerOutline} />
                  </Box>
                  <Typography color="textSecondary" variant="body2">
                    {capture.capture_location.longitude},&nbsp;
                    {capture.capture_location.latitude}
                  </Typography>
                </Box>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <CaptureCardDetails capture={capture} />
            </AccordionDetails>
          </Accordion>
        );
      })}
    </>
  );
};

export default AnimalCaptureCardContainer;
