import { Theme } from '@mui/material';
import LinearProgress from '@mui/material/LinearProgress';
import { withStyles } from '@mui/styles';

const BorderLinearProgress = withStyles((theme: Theme) => ({
  root: {
    height: 6,
    borderRadius: 3
  },
  colorPrimary: {
    backgroundColor: theme.palette.grey[theme.palette.mode === 'light' ? 300 : 700]
  },
  bar: {
    borderRadius: 3,
    backgroundColor: '#1976D2'
  }
}))(LinearProgress);

export default BorderLinearProgress;
