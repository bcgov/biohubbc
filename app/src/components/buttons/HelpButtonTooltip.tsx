import { mdiHelpCircle } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Box, IconButton, Tooltip, Zoom } from '@mui/material';
import React, { ReactNode } from 'react';

interface HelpButtonTooltipProps {
  content: string;
  children?: ReactNode;
}

/**
 * A help button with hoverable tooltip.
 * Optionally can wrap children to render the tooltip inline.
 *
 * @param {HelpButtonTooltipProps}
 * @return {*}
 */

const HelpButtonTooltip = ({ content, children }: HelpButtonTooltipProps) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {children}
      <Tooltip
        title={content}
        placement={'right-start'}
        TransitionComponent={Zoom}
        PopperProps={{
          sx: {
            '& .MuiTooltip-tooltip': {
              backgroundColor: 'white',
              color: 'text.primary',
              fontSize: 14,
              elevation: 10,
              padding: 2,
              boxShadow: 3
            }
          }
        }}>
        <IconButton>
          <Icon path={mdiHelpCircle} size={0.8} />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default HelpButtonTooltip;
