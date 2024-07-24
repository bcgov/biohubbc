import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 *
 * This component will handle the data request, then pass the data to its children components.
 *
 * @returns
 */
export const MethodStandards = () => {
  // TODO: Fetch information about methods, like below
  //
  // const biohubApi = useBiohubApi()
  // const methodsDataLoader = useDataLoader(() => ...)
  // useEffect(() => {methodsDataLoader.load()})

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 'lighter' }}>
        Data Capture & Methodologies Placeholder
      </Typography>
      <Typography variant="body2">
        This is a placeholder for future functionality related to Data Capture & Methodologies API calls, where ever
        that might come from (technique_attribute_quantitativ etc)
      </Typography>
    </Box>
  );
};
