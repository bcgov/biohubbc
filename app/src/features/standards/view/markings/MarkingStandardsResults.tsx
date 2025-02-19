import { grey } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { IMarkingsStandards } from 'interfaces/useStandardsApi.interface';

interface IMarkingStandardsResultsProps {
  standards: IMarkingsStandards;
}

/**
 * Component to display marking standards results
 *
 * @return {*}
 */
export const MarkingStandardsResults = (props: IMarkingStandardsResultsProps) => {
  const { standards } = props;

  if (!standards || !(standards.types.length || standards.colours.length)) {
    // No standards to display
    return null;
  }

  return (
    <Stack gap={2}>
      {/* Accordion for Marking Types */}
      {standards.types.length > 0 && (
        <AccordionStandardCard label="Marking Types" colour={grey[100]}>
          <Stack gap={2} my={2}>
            {standards.types.map((type) => (
              <AccordionStandardCard key={type.name} label={type.description} colour={grey[200]} />
            ))}
          </Stack>
        </AccordionStandardCard>
      )}

      {/* Accordion for Marking Colours */}
      {standards.colours.length > 0 && (
        <AccordionStandardCard label="Marking Colours" colour={grey[100]}>
          <Stack gap={2} my={2}>
            {standards.colours.map((colour) => (
              <AccordionStandardCard key={colour.colour} label={colour.colour} colour={grey[200]} />
            ))}
          </Stack>
        </AccordionStandardCard>
      )}
    </Stack>
  );
};
