import { mdiHelpCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';
import { useState } from 'react';

interface HelpButtonTooltipProps {
  content: string;
  iconSx?: object;
}

/**
 * A help button with hoverable tooltip.
 * Optionally can wrap children to render the tooltip inline.
 *
 * @param {HelpButtonTooltipProps}
 * @return {*}
 */
const HelpButtonTooltip = ({ content, iconSx }: HelpButtonTooltipProps) => {
  const [renderTooltip, setRenderTooltip] = useState(false);

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      {/* Tooltip should always be there, but only show when hovering */}
      <Tooltip
        arrow
        title={content}
        placement="right-start"
        open={renderTooltip}
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
        {/* IconButton is always displayed */}
        <IconButton
          onMouseEnter={() => setRenderTooltip(true)}
          onMouseLeave={() => setRenderTooltip(false)}
          sx={{
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
