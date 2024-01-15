import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import { v4 } from 'uuid';

export interface IMultipleSkeletonProps {
  numberOfLines?: number;
}

const SkeletonList = (props: IMultipleSkeletonProps) => (
  <>
    {Array(props.numberOfLines ?? 3)
      .fill(null)
      .map(() => (
        <Stack
          key={v4()}
          flexDirection="row"
          alignItems="center"
          gap={2}
          sx={{
            px: 2,
            height: '56px',
            background: '#fff',
            borderBottom: '1px solid ' + grey[300],
            '& .MuiSkeleton-root:not(:first-of-type)': {
              flex: '1 1 auto'
            },
            '& *': {
              fontSize: '0.875rem'
            }
          }}>
          <Skeleton variant="text" width={20} height={20} />
          <Skeleton variant="text" />
        </Stack>
      ))}
  </>
);

const SkeletonTable = (props: IMultipleSkeletonProps) => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: '999',
      background: '#fff',
      borderRadius: '4px'
    }}>
    <Paper elevation={0}>
      {Array(props.numberOfLines ?? 3)
        .fill(null)
        .map(() => (
          <SkeletonRow key={v4()} />
        ))}
    </Paper>
  </Box>
);

const SkeletonRow = () => (
  <Stack
    flexDirection="row"
    alignItems="center"
    gap={2}
    sx={{
      px: 2,
      height: '56px',
      overflow: 'hidden',
      borderBottom: '1px solid ' + grey[300],
      '& .MuiSkeleton-root:not(:first-of-type)': {
        flex: '1 1 auto'
      },
      '& *': {
        fontSize: '0.875rem'
      }
    }}>
    <Skeleton variant="text" width={20} height={20} />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
    <Skeleton variant="text" />
  </Stack>
);

export { SkeletonList, SkeletonRow, SkeletonTable };
