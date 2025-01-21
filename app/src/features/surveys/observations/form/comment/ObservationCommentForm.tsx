import { mdiPlus } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import CustomTextField from 'components/fields/CustomTextField';
import { useState } from 'react';

export interface IObservationCommentFormProps {
  formikSectionName: string;
}

/**
 * Returns form controls for adding comments to the observation
 *
 * @template FormikValuesType
 * @return {*}
 */
export const ObservationCommentForm = (props: IObservationCommentFormProps) => {
  const { formikSectionName } = props;

  const [showComment, setShowComment] = useState(false);

  return (
    <>
      {showComment ? (
        <CustomTextField
          name={`${formikSectionName}.comment`}
          label="Comment"
          maxLength={200}
          other={{
            multiline: true,
            rows: 4
          }}
        />
      ) : (
        <Button
          color="primary"
          variant="outlined"
          startIcon={<Icon path={mdiPlus} size={1} />}
          aria-label="add comment"
          onClick={() => setShowComment(true)}>
          Add Comment
        </Button>
      )}
    </>
  );
};
