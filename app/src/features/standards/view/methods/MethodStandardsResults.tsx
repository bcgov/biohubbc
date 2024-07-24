import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface ISpeciesStandardsResultsProps {
  data?: any; // Change to IGetMethodStandardsResults or similar when it exists
  isLoading: boolean;
}

/**
 * Component to display methods standards results
 *
 * @return {*}
 */
export const MethodStandardsResults = (props: ISpeciesStandardsResultsProps) => {
  const { data, isLoading } = props;

  return (
    <>
      <Box justifyContent="space-between" display="flex">
        <Typography color="textSecondary">{data}</Typography>
        <Typography>Loading: {isLoading}</Typography>
      </Box>
    </>
  );
};
