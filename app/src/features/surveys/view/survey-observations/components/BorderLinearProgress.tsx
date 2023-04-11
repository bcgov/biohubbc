import LinearProgress from '@material-ui/core/LinearProgress';
import { createStyles, Theme, withStyles } from '@material-ui/core/styles';

const BorderLinearProgress = withStyles((theme: Theme) =>
  createStyles({
    root: {
      height: 6,
      borderRadius: 3
    },
    colorPrimary: {
      backgroundColor: theme.palette.grey[theme.palette.type === 'light' ? 300 : 700]
    },
    bar: {
      borderRadius: 3,
      backgroundColor: '#1976D2'
    }
  })
)(LinearProgress);

export default BorderLinearProgress;
