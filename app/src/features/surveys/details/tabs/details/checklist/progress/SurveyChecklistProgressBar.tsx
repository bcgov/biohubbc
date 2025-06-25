import { Box, LinearProgress, Typography } from '@mui/material';

interface LinearProgressWithLabelProps {
  value: number;
  suffix?: string;
}

export const LinearProgressWithLabel = ({ value, suffix }: LinearProgressWithLabelProps) => {
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
            '& .MuiLinearProgress-bar': {
              backgroundColor: 'primary.main',
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
