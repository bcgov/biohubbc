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
    {Array(props.numberOfLines ?? 4)
      .fill(null)
      .map(() => (
        <Box
          key={v4()}
          sx={{
            display: 'flex',
            gap: '16px',
            py: 1.5,
            px: 2,
            height: '56px',
            background: '#fff',
            borderTop: '1px solid ' + grey[300]
          }}>
          <Skeleton sx={{ flex: '1 1 auto' }} />
        </Box>
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
      p: 1,
      background: '#fff'
    }}>
    <Paper elevation={0}>
      {Array(props.numberOfLines ?? 4)
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
    gap={2}
    sx={{
      py: 1.5,
      px: 2,
      height: 56,
      overflow: 'hidden',
      '&:not(:last-of-type)': {
        borderBottom: '1px solid ' + grey[300]
      },
      '& .MuiSkeleton-root:not(:first-of-type)': {
        flex: '1 1 auto'
      }
    }}>
    <Skeleton width={20} sx={{ flex: '0 0 auto' }} />
    <Skeleton />
    <Skeleton />
    <Skeleton />
    <Skeleton />
    <Skeleton />
    <Skeleton />
    <Skeleton />
  </Stack>
);

export { SkeletonList, SkeletonRow, SkeletonTable };
