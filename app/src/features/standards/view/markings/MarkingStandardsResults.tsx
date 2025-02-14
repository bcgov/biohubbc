import { blueGrey, grey } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';

interface IMarkingStandardsResultsProps {
  data?: {
    markingTypes: { marking_type_id: string; name: string; description?: string }[];
    markingColours: { colour_id: string; colour: string }[];
  };
}

/**
 * Component to display marking standards results
 *
 * @return {*}
 */
export const MarkingStandardsResults = (props: IMarkingStandardsResultsProps) => {
  const { data } = props;

  if (!data || !(data.markingTypes.length || data.markingColours.length)) {
    // No data to display
    return null;
  }

  return (
    <Stack gap={2}>
      {data.markingTypes.map((type) => (
        <AccordionStandardCard
          key={type.marking_type_id}
          label={type.name}
          subtitle={type.description || ''}
          colour={grey[100]}
        />
      ))}
      {data.markingColours.map((colour) => (
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
