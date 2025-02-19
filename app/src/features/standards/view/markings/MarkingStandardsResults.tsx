import { blueGrey, grey } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { IMarkingsStandards } from 'interfaces/useStandardsApi.interface';

interface IMarkingStandardsResultsProps {
  standards: IMarkingsStandards
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
      {standards.types.map((type) => (
        <AccordionStandardCard
          key={type.marking_type_id}
          label={type.name}
          subtitle={type.description || ''}
          colour={grey[100]}
        />
      ))}
      {standards.colours.map((colour) => (
        <AccordionStandardCard
          key={colour.colour_id}
          label={colour.colour}
          colour={grey[100]}>
          <Stack gap={2} my={2}>
            <ColouredRectangleChip label={colour.colour} colour={blueGrey} />
          </Stack>
        </AccordionStandardCard>
      ))}
    </Stack>
  );
};
