import { keyframes } from '@emotion/react';
import { Box, LinearProgress, Typography } from '@mui/material';
import { green } from '@mui/material/colors';
import { useEffect, useState } from 'react';

interface LinearProgressWithLabelProps {
  value: number;
  suffix?: string;
}

// Wiggle keyframes
const wiggle = keyframes`
  0%, 100% {
    transform: rotate(0deg) scale(1);
  }
  20% {
    transform: rotate(-1deg) scale(1.02);
  }
  40% {
    transform: rotate(1deg) scale(1.02);
  }
  60% {
    transform: rotate(-3deg) scale(1.04);
  }
  80% {
    transform: rotate(3deg) scale(1.05);
  }
`;

export const LinearProgressWithLabel = ({ value, suffix }: LinearProgressWithLabelProps) => {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (value === 100) {
      setAnimate(true);
      const timer = setTimeout(() => setAnimate(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
      <Box sx={{ width: '100%', mr: 1 }} flex="1 1 auto">
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            position: 'relative',
            height: 10,
            borderRadius: 5,
            backgroundColor: '#f0f0f0',
            animation: animate ? `${wiggle} 0.6s ease-in-out` : undefined,
            overflowY: 'visible',
            '& .MuiLinearProgress-bar': {
              backgroundColor: value === 100 ? green[700] : 'primary.main',
              position: 'absolute',
              left: 0,
              top: 0,
              width: '100%',
              height: '100%',
              borderRadius: 5,
              transformOrigin: 'center center'
            }
          }}
        />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" color="text.secondary">
          {`${Math.round(value)}%${suffix ? ` ${suffix}` : ''}`}
        </Typography>
      </Box>
    </Box>
  );
};
