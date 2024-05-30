import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { MarkingCard } from 'features/surveys/animals/profile/markings/MarkingCard';
import { IMarkingResponse } from 'interfaces/useCritterApi.interface';

interface IMarkingDetailsProps {
  markings: IMarkingResponse[];
}

/**
 * Generic component to display animal marking details.
 *
 * @param {IMarkingDetailsProps} props
 * @return {*}
 */
export const MarkingDetails = (props: IMarkingDetailsProps) => {
  const { markings } = props;

  if (!markings?.length) {
    return null;
  }

  return (
    <Box>
      <Typography color="textSecondary" fontWeight={700} fontSize="0.75rem" sx={{ textTransform: 'uppercase' }}>
        Markings
      </Typography>
      <Box maxHeight="600px" sx={{ overflowY: 'auto', pr: 1, pb: 1 }}>
        {markings.map((marking, index) => (
          <Box mt={1} key={`${marking.marking_id}-${index}`}>
            <MarkingCard
              editable={false}
              identifier={marking.identifier}
              marking_type_label={marking.marking_type}
              primary_colour_label={marking.primary_colour ?? ''}
              secondary_colour_label={marking.secondary_colour ?? ''}
              marking_body_location_label={marking.body_location}
              comment={marking.comment}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
};
