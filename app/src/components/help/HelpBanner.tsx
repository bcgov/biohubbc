import { mdiHelpCircleOutline } from '@mdi/js';
import Icon from '@mdi/react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PropsWithChildren, useState } from 'react';

interface IHelpBannerProps {
  title: string;
  children: React.ReactNode; // Define children as ReactNode
}

/**
 * Returns an expandable accordion component for displaying helper text
 * @param props
 * @returns
 */
export const HelpBanner = (props: PropsWithChildren<IHelpBannerProps>) => {
  const { children, title } = props;
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Accordion expanded={isExpanded} variant="outlined" disableGutters onChange={handleToggle} sx={{ p: 1 }}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel-content" id="panel-header">
        <Stack gap={1} direction="row">
          <Icon path={mdiHelpCircleOutline} size={1} />
          <Typography variant="h5">{title}</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};
