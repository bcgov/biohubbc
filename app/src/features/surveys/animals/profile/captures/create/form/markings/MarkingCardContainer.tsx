import Card from '@mui/material/Card';
import Collapse from '@mui/material/Collapse';
import grey from '@mui/material/colors/grey';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useFormikContext } from 'formik';
import { ICreateCaptureRequest } from 'interfaces/useCritterApi.interface';
import { TransitionGroup } from 'react-transition-group';

const MarkingCardContainer = () => {
  const { values } = useFormikContext<ICreateCaptureRequest>();

  return (
    <Stack gap={3}>
      <TransitionGroup>
        {values.markings.map((marking, index) => (
          <Collapse in>
            <Card key={`${marking.marking_type_id}-${index}`} sx={{ px: 3, py: 2, mb: 2, bgcolor: grey[100] }}>
              <Typography fontWeight={700}>
                {marking.marking_type_id}&nbsp;
                <Typography component="span" color="textSecondary">
                  {marking.taxon_marking_body_location_id}
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
