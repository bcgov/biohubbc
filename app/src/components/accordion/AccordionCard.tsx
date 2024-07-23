import { mdiChevronDown, mdiDotsVertical } from '@mdi/js';
import { Icon } from '@mdi/react';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';

interface IAccordionCardProps {
  /**
   * The content to display in the non-collapsible portion of the card.
   */
  summaryContent: JSX.Element;
  /**
   * The content to display in the collapsible portion of the card, when expanded.
   */
  detailsContent: JSX.Element;
  /**
   * Callback for when the menu button is clicked.
   * If not provided, the menu button will not be rendered.
   */
  onMenuClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  /**
   * Icon to display in the menu button.
   * Defaults to three vertical dots.
   */
  menuIcon?: JSX.Element;
  /**
   * If true, the accordion will be expanded by default.
   */
  expanded?: boolean;
}

/**
 * General purpose accordion card component.
 *
 * @param {IAccordionCardProps} props
 * @return {*}
 */
export const AccordionCard = (props: IAccordionCardProps) => {
  const { summaryContent, detailsContent, onMenuClick, menuIcon, expanded } = props;

  return (
    <Accordion
      component={Paper}
      variant="outlined"
      disableGutters
      expanded={expanded}
      sx={{
        borderRadius: 0,
        boxShadow: 'none',
        px: 1,
        '&:before': {
          display: 'none'
        }
      }}>
      <Box display="flex" alignItems="center">
        <AccordionSummary
          expandIcon={<Icon path={mdiChevronDown} size={1} />}
          aria-controls="panel1bh-content"
          sx={{
            flex: '1 1 auto',
            mr: 1,
            pr: 8.5,
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
          {summaryContent}
        </AccordionSummary>
        {onMenuClick && (
          <IconButton
            sx={{ position: 'absolute', right: '24px' }}
            edge="end"
            onClick={onMenuClick}
            aria-label="accordion-settings-menu">
            {menuIcon || <Icon path={mdiDotsVertical} size={1} />}
          </IconButton>
        )}
      </Box>
      <AccordionDetails>{detailsContent}</AccordionDetails>
    </Accordion>
  );
};
