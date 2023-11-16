import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';

export interface ISkeletonListProps {
  isLoading: boolean;
  timeout?: number;
  numberOfLines?: number;
}

const SkeletonList = (props: ISkeletonListProps) => {
  return (
    <Fade in={props.isLoading} timeout={props.timeout ?? 1000}>
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          p: 1,
          background: grey[100],
          zIndex: 2
        }}>
        <Paper elevation={0} sx={{ overflow: 'hidden' }}>
          {/* create an array of X items to build multiple skeleton components*/}
          {Array(props.numberOfLines ?? 10)
            .fill(null)
            .map(() => (
              <Box
                sx={{
                  display: 'flex',
                  gap: '16px',
                  py: 1.5,
                  px: 2,
                  height: '52px',
                  background: '#fff',
                  borderBottom: '1px solid ' + grey[300]
                }}>
                <Skeleton sx={{ flex: '1 1 auto' }} />
              </Box>
            ))}
        </Paper>
      </Box>
    </Fade>
  );
};

export default SkeletonList;
