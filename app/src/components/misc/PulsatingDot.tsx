import { Color } from '@mui/material';
import Box from '@mui/material/Box';
import { useEffect, useState } from 'react';

interface IPulsatingDotProps {
  color: Color;
  /**
   * Width and height in px format, eg. '16px'
   */
  size: string;
  /**
   * Disables the pulsating effect
   */
  off?: boolean;
  /**
   * Time in milliseconds after which to disable the animation
   */
  time?: number;
}

/**
 * PulsatingDot component displays a dot with a pulsating effect around it.
 *
 * @param props IPulsatingDotProps
 * @returns JSX.Element
 */
export const PulsatingDot = (props: IPulsatingDotProps): JSX.Element => {
  const { color, size, off, time } = props;

  const [isTimeReached, setIsTimeReached] = useState<boolean>(false);

  useEffect(() => {
    if (!off && time) {
      const timer = setTimeout(() => {
        setIsTimeReached(true);
      }, time);

      return () => clearTimeout(timer); // Cleanup timer on component unmount
    }
  }, [off, time]);

  // Styles for the pulsating animation
  const sx =
    off || isTimeReached
      ? {} // If off is true, or max time has been reached, turn off animation
      : {
          position: 'absolute',
          height: size,
          width: size,
          borderRadius: '50%',
          backgroundColor: color[400],
          animation: 'pulse-animation 2s cubic-bezier(0, 0, 0.2, 1) infinite',
          '@keyframes pulse-animation': {
            '0%': {
              transform: 'scale(1)',
              opacity: 0.7
            },
            '100%': {
              transform: 'scale(4)',
              opacity: 0
            }
          }
        };

  return (
    <Box position="absolute" bgcolor={color[300]} borderRadius="50%" height={size} width={size}>
      <Box sx={sx} />
    </Box>
  );
};
