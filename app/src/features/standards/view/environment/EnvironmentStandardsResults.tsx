import { grey } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { IEnvironmentStandards } from 'interfaces/useStandardsApi.interface';

interface ISpeciesStandardsResultsProps {
  data: IEnvironmentStandards;
  isLoading?: boolean;
}

/**
 * Component to display environments standards results
 *
 * @return {*}
 */
export const EnvironmentStandardsResults = (props: ISpeciesStandardsResultsProps) => {
  const { data } = props;

  return (
    <>
      <Stack gap={2}>
        {data.quantitative.map((environment) => (
          <AccordionStandardCard label={environment.name} subtitle={environment.description} colour={grey[200]} />
        ))}
        {data.qualitative.map((environment) => (
          <AccordionStandardCard label={environment.name} subtitle={environment.description} colour={grey[200]} />
        ))}
      </Stack>
    </>
  );
};
