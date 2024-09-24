import Box from '@mui/material/Box';
import { blueGrey, grey } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { IMethodStandard } from 'interfaces/useStandardsApi.interface';
import { AccordionStandardCard } from '../components/AccordionStandardCard';

interface ISpeciesStandardsResultsProps {
  data?: IMethodStandard[];
}

/**
 * Component to display methods standards results
 *
 * @return {*}
 */
export const MethodStandardsResults = (props: ISpeciesStandardsResultsProps) => {
  const { data } = props;

  if (!data || !data.length) {
    // No data to display
    return (
      <Box minHeight="250px" display="flex" alignItems="center" justifyContent="center">
        <NoDataOverlay subtitle="No matching records were found" />
      </Box>
    );
  }

  return (
    <Stack gap={2}>
      {data.map((method) => (
        <AccordionStandardCard
          key={method.method_lookup_id}
          colour={grey[100]}
          label={method.name}
          subtitle={method.description}>
          <Stack gap={2} my={2}>
            {method.attributes.qualitative.map((attribute) => (
              <AccordionStandardCard
                key={attribute.name}
                colour={grey[200]}
                label={attribute.name}
                subtitle={attribute.description}>
                <Stack gap={2} my={2}>
                  {attribute.options.map((option) => (
                    <AccordionStandardCard
                      key={option.name}
                      label={option.name}
                      subtitle={option.description}
                      colour={grey[300]}
                    />
                  ))}
                </Stack>
              </AccordionStandardCard>
            ))}
            {method.attributes.quantitative.map((attribute) => (
              <AccordionStandardCard
                key={attribute.name}
                colour={grey[200]}
                label={attribute.name}
                subtitle={attribute.description}
                ornament={<ColouredRectangleChip label={attribute.unit} colour={blueGrey} />}
              />
            ))}
          </Stack>
        </AccordionStandardCard>
      ))}
    </Stack>
  );
};

export default MethodStandardsResults;
