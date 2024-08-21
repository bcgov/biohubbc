import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { debounce } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import { EnvironmentStandardsResults } from './EnvironmentStandardsResults';

/**
 * Returns environmental variable lookup values for the standards page
 *
 * @returns
 */
export const EnvironmentStandards = () => {
  const biohubApi = useBiohubApi();

  const environmentsDataLoader = useDataLoader((keyword?: string) =>
    biohubApi.standards.getEnvironmentStandards(keyword)
  );

  const debouncedRefresh = useMemo(
    () =>
      debounce((value: string) => {
        environmentsDataLoader.refresh(value);
      }, 500),
    []
  );

  useEffect(() => {
    environmentsDataLoader.load();
  }, [environmentsDataLoader]);

  return (
    <>
      <TextField
        name="name"
        label="Environmental variable name"
        key="environments-name-search"
        fullWidth
        onChange={(event) => {
          const value = event.currentTarget.value;
          debouncedRefresh(value);
        }}
      />
      <Box my={2}>
        {environmentsDataLoader.data ? (
          <EnvironmentStandardsResults data={environmentsDataLoader.data} />
        ) : (
          <Stack gap={1}>
            <Skeleton variant="rectangular" height="60px" />
            <Skeleton variant="rectangular" height="60px" />
            <Skeleton variant="rectangular" height="60px" />
            <Skeleton variant="rectangular" height="60px" />
            <Skeleton variant="rectangular" height="60px" />
            <Skeleton variant="rectangular" height="60px" />
          </Stack>
        )}
      </Box>
    </>
  );
};
