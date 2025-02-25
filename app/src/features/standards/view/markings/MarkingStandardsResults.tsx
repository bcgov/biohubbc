import * as muiColour from '@mui/material/colors';
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
  if (!props.standards || !(props.standards.types.length || props.standards.colours.length)) {
    // No props.standards to display
    return null;
  }

  return (
    <Stack gap={2}>
      {/* Accordion for Marking Types */}
      {props.standards.types.length > 0 && (
        <AccordionStandardCard label="Marking Types" colour={muiColour.grey[100]}>
          <Stack gap={2} my={2}>
            {props.standards.types.map((type) => (
              <AccordionStandardCard key={type.name} label={type.name} colour={muiColour.grey[200]} />
            ))}
          </Stack>
        </AccordionStandardCard>
      )}

      {/* Accordion for Marking Colours */}
      {props.standards.colours.length > 0 && (
        <AccordionStandardCard label="Marking Colours" colour={muiColour.grey[100]}>
          <Stack gap={2} my={2}>
            {props.standards.colours.map((colour) => (
              <AccordionStandardCard
                key={colour.colour}
                // Fall back to colour name if no description
                label={colour.description ?? colour.colour}
                colour={muiColour[colour.colour.toLowerCase()]?.[100] ?? muiColour.grey[200]}
              />
            ))}
          </Stack>
        </AccordionStandardCard>
      )}
    </Stack>
  );
};
