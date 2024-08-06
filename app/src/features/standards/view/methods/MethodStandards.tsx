import { Skeleton, Stack, TextField } from '@mui/material';
import Box from '@mui/material/Box';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { debounce } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';
import { MethodStandardsResults } from './MethodStandardsResults';

/**
 *
 * Returns information about method lookup options
 *
 * @returns
 */

export const MethodStandards = () => {
  const biohubApi = useBiohubApi();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const methodDataLoader = useDataLoader((keyword?: string) => biohubApi.standards.getMethodStandards(keyword));

  const debouncedRefresh = useMemo(
    () =>
      debounce((value: string) => {
        methodDataLoader.refresh(value);
      }, 500),
    []
  );

  useEffect(() => {
    methodDataLoader.load();
  }, [methodDataLoader]);

  return (
    <>
      <TextField
        name="name"
        label="Method name"
        key="method-name-search"
        value={searchTerm}
        fullWidth
        onChange={(event) => {
          const value = event.currentTarget.value;
          setSearchTerm(value);
          debouncedRefresh(value);
        }}
      />
      <Box my={2}>
        {methodDataLoader.data ? (
          <MethodStandardsResults data={methodDataLoader.data} />
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
