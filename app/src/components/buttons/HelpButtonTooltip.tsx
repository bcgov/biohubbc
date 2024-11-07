import { mdiHelpCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import { ReactNode } from 'react';

interface HelpButtonTooltipProps {
  content: string;
  children?: ReactNode;
  iconSx?: object;
}

/**
 * A help button with hoverable tooltip.
 * Optionally can wrap children to render the tooltip inline.
 *
 * @param {HelpButtonTooltipProps}
 * @return {*}
 */
//TODO: Update positioning of the tooltip to be more dynamic (Add Animal form)
const HelpButtonTooltip = ({ content, children, iconSx }: HelpButtonTooltipProps) => {
  return (
    <Box
      sx={{
        '& input': {
          // pr: 7,
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        },
        '& .MuiSelect-select': {
          pr: '80px !important',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        },
        '& .MuiSelect-icon': {
          right: '52px'
        }
      }}>
      {children}
      <Tooltip
        arrow
        title={content}
        placement={'right-start'}
        TransitionComponent={Zoom}
        PopperProps={{
          sx: {
            '& .MuiTooltip-tooltip': {
              px: 2,
              fontSize: '0.875rem',
              background: '#38598A'
            },
            '& .MuiTooltip-arrow::before': {
              background: '#38598A'
            }
          }
        }}>
        <IconButton
          sx={{
            color: '#38598A',
            p: 0,
            mb: '15px',
            ...iconSx
          }}>
          <Icon path={mdiHelpCircleOutline} size={1} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default HelpButtonTooltip;
