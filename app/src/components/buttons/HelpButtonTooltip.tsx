import { mdiHelpCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Box, IconButton, Tooltip, Zoom } from '@mui/material';
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
        position: 'relative',
        '& input': {
          pr: 7,
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
              py: 1.5,
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
            position: 'absolute',
            top: '8px',
            right: '8px',
            color: '#38598A',
            ...iconSx
          }}>
          <Icon path={mdiHelpCircleOutline} size={1} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default HelpButtonTooltip;
