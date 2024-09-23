import { blueGrey, grey } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { IEnvironmentStandards } from 'interfaces/useStandardsApi.interface';

interface ISpeciesStandardsResultsProps {
  data?: IEnvironmentStandards;
}

/**
 * Component to display environments standards results
 *
 * @return {*}
 */
export const EnvironmentStandardsResults = (props: ISpeciesStandardsResultsProps) => {
  const { data } = props;

  if (!data) {
    // No data to display, return null
    return null;
  }

  return (
    <Stack gap={2}>
      {data.quantitative.map((environment) => (
        <AccordionStandardCard
          key={environment.name}
          label={environment.name}
          subtitle={environment.description}
          ornament={<ColouredRectangleChip label={environment.unit} colour={blueGrey} />}
          colour={grey[100]}
        />
      ))}
      {data.qualitative.map((environment) => (
        <AccordionStandardCard
          key={environment.name}
          label={environment.name}
          subtitle={environment.description}
          colour={grey[100]}>
          <Stack gap={2} my={2}>
            {environment.options.map((option) => (
              <AccordionStandardCard
                key={option.name}
                label={option.name}
                subtitle={option.description}
                colour={grey[200]}
                disableCollapse
              />
            ))}
          </Stack>
        </AccordionStandardCard>
      ))}
    </Stack>
  );
};
