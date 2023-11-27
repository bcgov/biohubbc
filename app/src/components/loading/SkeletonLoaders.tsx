import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import { v4 } from 'uuid';

export interface IMultipleSkeletonProps {
  isLoading: boolean;
  timeout?: number;
  numberOfLines?: number;
}

const SkeletonList = (props: IMultipleSkeletonProps) => {
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
                key={v4().toString()}
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

const GridTableRowSkeleton = (props: IMultipleSkeletonProps) => {
  return (
    <Fade in={props.isLoading} timeout={props.timeout ?? 1000}>
      <Box display="flex" flexDirection="column">
        {Array(props.numberOfLines ?? 15)
          .fill(null)
          .map(() => (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.75,
                height: 60,
                background: '#fff',
                borderBottom: '1px solid ' + grey[300],
                '& * ': {
                  transform: 'none !important'
                }
              }}>
              <Skeleton height={22} width={22} />
              <Box
                sx={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'center',
                  px: 4,
                  flex: '1'
                }}>
                <Skeleton height={22} sx={{ flex: '1' }} />
                <Skeleton height={22} sx={{ flex: '2' }} />
                <Skeleton height={22} sx={{ flex: '3' }} />
                <Skeleton height={22} sx={{ flex: '1' }} />
              </Box>
              <Skeleton height={40} width={40} variant="circular" />
            </Box>
          ))}
      </Box>
    </Fade>
  );
};

export { SkeletonList, GridTableRowSkeleton };
