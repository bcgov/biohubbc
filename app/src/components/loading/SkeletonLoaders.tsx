import { mdiMapSearchOutline } from '@mdi/js';
import Icon from '@mdi/react';
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

const SkeletonListStack = (props: IMultipleSkeletonProps) => (
  <>
    {Array(props.numberOfLines ?? 3)
      .fill(null)
      .map(() => (
        <Stack
          key={v4()}
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

const SkeletonMap = () => (
  <Box
    sx={{
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      zIndex: 1001,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#fff',
      '& svg': {
        color: grey[300]
      }
    }}>
    <Skeleton
      variant="rectangular"
      width="100%"
      height="100%"
      sx={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
      }}
    />
    <Icon path={mdiMapSearchOutline} size={2} />
  </Box>
);

export { SkeletonList, SkeletonListStack, SkeletonRow, SkeletonTable, SkeletonMap };
