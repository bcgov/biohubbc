import { mdiChevronDown } from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';

export interface ManualTelemetryCardProps {
  name: string;
  details: string;
}
const ManualTelemetryCard = (props: ManualTelemetryCardProps) => {
  return (
    <Accordion
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
          {props.name}
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          pt: 0,
          px: 2
        }}>
        {props.details}
      </AccordionDetails>
    </Accordion>
  );
};

export default ManualTelemetryCard;
