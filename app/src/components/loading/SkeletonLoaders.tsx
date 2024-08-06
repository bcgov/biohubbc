import { mdiMapSearchOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';

export interface IMultipleSkeletonProps {
  numberOfLines?: number;
}

const SkeletonList = (props: IMultipleSkeletonProps) => (
  <>
    {Array.from(Array(props.numberOfLines ?? 3).keys()).map((key: number) => (
      <Stack
        key={key}
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

const SkeletonListStack = (props: IMultipleSkeletonProps) => (
  <>
    {Array.from(Array(props.numberOfLines ?? 3).keys()).map((key: number) => (
      <Stack
        key={key}
        flexDirection="column"
        justifyContent="center"
        px={2}
        py={1.2}
        height={70}
        sx={{
          background: '#fff',
          borderBottom: '1px solid ' + grey[300],
          '& *': {
            fontSize: '0.875rem'
          }
        }}>
        <Skeleton variant="text" />
        <Skeleton variant="text" width="50%" />
      </Stack>
    ))}
  </>
);

const SkeletonHorizontalStack = (props: IMultipleSkeletonProps) => (
  <Stack direction="row" spacing={1} flex="1 1 auto">
    {Array.from(Array(props.numberOfLines ?? 3).keys()).map((key: number) => (
      <Skeleton key={key} sx={{ flex: '0.1 0 auto' }} />
    ))}
  </Stack>
);

const SkeletonTable = (props: IMultipleSkeletonProps) => (
  <Box>
    <Paper elevation={0}>
      {Array.from(Array(props.numberOfLines ?? 3).keys()).map((key: number) => (
        <SkeletonRow key={key} />
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

const SkeletonMap = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      '& svg': {
        color: grey[300]
      }
    }}>
    <Box sx={{ position: 'absolute', margin: 'auto' }}>
      <Icon path={mdiMapSearchOutline} size={2} />
    </Box>
    <Skeleton variant="rectangular" sx={{ width: '100%', height: '200px' }} />
  </Box>
);

export { SkeletonHorizontalStack, SkeletonList, SkeletonListStack, SkeletonMap, SkeletonRow, SkeletonTable };
