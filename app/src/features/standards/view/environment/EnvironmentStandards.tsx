import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { debounce } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import { EnvironmentStandardsResults } from './EnvironmentStandardsResults';

/**
 * Returns environmental variable lookup values for the standards page
 *
 * @returns
 */
export const EnvironmentStandards = () => {
  const biohubApi = useBiohubApi();

  const [searchTerm, setSearchTerm] = useState<string>('');

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
        value={searchTerm}
        fullWidth
        onChange={(event) => {
          const value = event.currentTarget.value;
          setSearchTerm(value);
          debouncedRefresh(value);
        }}
      />
      <Box mt={2}>
        {environmentsDataLoader.data ? (
          <EnvironmentStandardsResults data={environmentsDataLoader.data} />
        ) : (
          <Stack gap={1}>
            {[...Array(10)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height="60px" />
            ))}
          </Stack>
        )}
      </Box>
    </>
  );
};
