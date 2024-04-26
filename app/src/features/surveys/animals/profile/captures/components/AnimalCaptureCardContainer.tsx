import { mdiChevronDown } from '@mdi/js';
import Icon from '@mdi/react';
import { AccordionDetails, Typography } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useAnimalPageContext } from 'hooks/useContext';

const AnimalCaptureCardContainer = () => {
  const { critterDataLoader } = useAnimalPageContext();

  if (!critterDataLoader.data) {
    return <CircularProgress size={40} />;
  }

  //   const captures = critterDataLoader.data.captures;

  const captures = [
    { capture_id: 1, capture_timestamp: '10:10', release_timestamp: '10:20', capture_comment: 'Lorem ipsum' }
  ];

  return (
    <Stack>
      {captures.map((capture) => (
        <Accordion disableGutters square>
          <AccordionSummary
            expandIcon={<Icon path={mdiChevronDown} size={1} />}
            aria-controls="panel1bh-content"
            sx={{
              flex: '1 1 auto',
              mr: 1,
              height: 55,
              overflow: 'hidden',
              '& .MuiAccordionSummary-content': {
                flex: '1 1 auto',
                py: 0,
                pl: 0,
                overflow: 'hidden',
                whiteSpace: 'nowrap'
              }
            }}>
            {capture.capture_id}
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="textSecondary">
              {capture.capture_comment}
            </Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Stack>
  );
};

export default AnimalCaptureCardContainer;
