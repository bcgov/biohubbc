import Box from '@mui/material/Box';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

export const LinearProgressWithLabel = (
  props: LinearProgressProps & { value: number; suffix?: string; hideLabel?: boolean }
) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flex: '1 1 auto' }}>
      <Tooltip title={`You're ${Math.round(props.value)}% done`} followCursor>
        <Box sx={{ width: '100%', mr: 1 }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
      </Tooltip>
      {!props.hideLabel && (
        <Box sx={{ minWidth: 60, flexShrink: 0 }}>
          <Typography variant="body2" color="text.secondary" noWrap>
            {props.suffix ? `${Math.round(props.value)}% ${props.suffix}` : `${Math.round(props.value)}%`}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
