import { mdiChevronDown, mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, IconButton } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';

export interface ManualTelemetryCardProps {
  device_id: number;
  name: string;
  details: string;
  // openMenu: () => void;
  // onEdit: () => void;
  // onDelete: () => void;
  onMenu: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: number) => void;
}

const ManualTelemetryCard = (props: ManualTelemetryCardProps) => {
  return (
    <Accordion
      sx={{
        boxShadow: 'none'
      }}>
      <Box display="flex" overflow="hidden" alignItems="center" pr={1.5} height={55}>
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
        <IconButton
          onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => props.onMenu(event, props.device_id)}
          aria-label="settings">
          <Icon path={mdiDotsVertical} size={1}></Icon>
        </IconButton>
      </Box>
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
