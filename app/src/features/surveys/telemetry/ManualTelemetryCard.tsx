import { mdiCalendarRange, mdiChevronDown, mdiDotsVertical } from '@mdi/js';
import Icon from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { default as dayjs } from 'dayjs';
export interface ManualTelemetryCardProps {
  device_id: number;
  name: string; // should be animal alias
  start_date: string;
  end_date?: string;

  onMenu: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: number) => void;
}

const ManualTelemetryCard = (props: ManualTelemetryCardProps) => {
  return (
    <Accordion
      disableGutters
      square
      sx={{
        boxShadow: 'none',
        borderBottom: '1px solid' + grey[300],
        '&:before': {
          display: 'none'
        }
      }}>
      <Box display="flex" alignItems="center" overflow="hidden">
        <AccordionSummary
          expandIcon={<Icon path={mdiChevronDown} size={1} />}
          sx={{
            flex: '1 1 auto',
            py: 0,
            pr: 8.5,
            pl: 2,
            height: 70,
            overflow: 'hidden',
            '& .MuiAccordionSummary-content': {
              flex: '1 1 auto',
              py: 0,
              pl: 0,
              overflow: 'hidden',
              whiteSpace: 'nowrap'
            }
          }}>
          <Box>
            <Typography variant="body2" fontWeight="bold" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {props.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Device ID: {props.device_id}
            </Typography>
          </Box>
        </AccordionSummary>
        <IconButton
          sx={{ position: 'absolute', right: '24px' }}
          edge="end"
          onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => props.onMenu(event, props.device_id)}
          aria-label="settings">
          <Icon path={mdiDotsVertical} size={1} />
        </IconButton>
      </Box>
      <AccordionDetails
        sx={{
          pt: 0,
          px: 2
        }}>
        <Box display={'flex'}>
          <Icon path={mdiCalendarRange} size={0.75} />
          <Typography ml={1} variant="body2" component={'div'} color={'inherit'}>
            {dayjs(props.start_date).format('YYYY-MM-DD')}{' '}
            {props.end_date ? '- ' + dayjs(props.end_date).format('YYYY-MM-DD') : ''}
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default ManualTelemetryCard;
