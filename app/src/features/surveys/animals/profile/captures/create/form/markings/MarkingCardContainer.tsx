import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import { ICreateCaptureRequest } from 'interfaces/useCritterApi.interface';
import { TransitionGroup } from 'react-transition-group';

/**
 * Card for displaying information about markings on the animal capture form
 *
 * @returns
 */
const MarkingCardContainer = () => {
  const { values } = useFormikContext<ICreateCaptureRequest>();
  const critterbaseApi = useCritterbaseApi()

  // const codes

  return (
    <Stack gap={3}>
      <TransitionGroup>
        {values.markings.map((marking, index) => (
          <Collapse in key={`${marking.marking_type_id}-${index}`}>
            <Card sx={{ px: 3, py: 2, mb: 2, bgcolor: grey[100] }}>
              <Typography fontWeight={700}>
                {marking.identifier}
                <Typography component="span" color="textSecondary">
                  {marking.primary_colour_id}&nbsp;{marking.secondary_colour_id}
                </Typography>
              </Typography>
              <Typography color="textSecondary">{marking.comment}</Typography>
            </Card>
          </Collapse>
        ))}
      </TransitionGroup>
    </Stack>
  );
};

export default MarkingCardContainer;
