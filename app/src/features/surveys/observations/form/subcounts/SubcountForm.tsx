import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { useState } from 'react';
import { ObservationEnvironmentForm } from './environments/ObservationEnvironmentForm';
import { ObservationMeasurementForm } from './measurements/ObservationMeasurementForm';

const SubcountForm = () => {
  const [showComment, setShowComment] = useState<boolean>(false);
  return (
    <>
      <Box mb={3}>
        <AutocompleteField id="sign" name="sign" required label={'Sign'} options={[]} />
      </Box>

      <Box mb={3}>
        <ObservationMeasurementForm />
      </Box>

      <Box mb={3}>
        <ObservationEnvironmentForm />
      </Box>

      <Box mb={3}>
        <Typography component="legend">Comment</Typography>

        {showComment ? (
          <CustomTextField
            name="comment"
            label="Comment"
            maxLength={250}
            other={{ multiline: true, placeholder: 'Maximum 250 characters', rows: 3 }}
          />
        ) : (
          <Button
            color="primary"
            variant="outlined"
            startIcon={<Icon path={mdiPlus} size={1} />}
            aria-label="add marking"
            onClick={() => {
              setShowComment(true);
            }}>
            Add Comment
          </Button>
        )}
      </Box>
    </>
  );
};

export default SubcountForm;
