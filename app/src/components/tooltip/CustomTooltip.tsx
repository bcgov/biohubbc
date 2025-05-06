import { Tooltip } from '@mui/material';
import { isValidElement, PropsWithChildren } from 'react';

interface ICustomTooltipProps {
  tooltip: string;
}

/**
 * Wraps any content and shows a tooltip on hover.
 * Accepts strings, fragments, or full elements.
 */
export const CustomTooltip = (props: PropsWithChildren<ICustomTooltipProps>) => {
  const { tooltip, children } = props;

  // Ensure children is always a valid React element
  const wrappedChildren = isValidElement(children) ? children : <span>{children}</span>;

  return (
    <Tooltip
      title={tooltip}
      placement="right"
      arrow
      slotProps={{
        tooltip: {
          sx: {
            bgcolor: 'grey.900',
            color: 'white',
            fontSize: '0.875rem',
            px: 1.5,
            py: 1,
            borderRadius: 1,
            boxShadow: 3
          }
        },
        arrow: {
          sx: {
            color: 'grey.900'
          }
        }
      }}>
      {wrappedChildren}
    </Tooltip>
  );
};
