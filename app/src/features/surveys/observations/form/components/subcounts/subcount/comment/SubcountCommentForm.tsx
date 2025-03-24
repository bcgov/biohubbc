import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';

export interface ISubcountCommentFormProps {
  formikFieldName: string;
  displayHeader?: boolean;
}

/**
 * Form component for the observation subcount comment.
 *
 * @param {ISubcountCommentFormProps} props
 * @return {*}
 */
export const SubcountCommentForm = (props: ISubcountCommentFormProps) => {
  const { displayHeader, formikFieldName } = props;

  const subcountCommentFieldName = formikFieldName ? `${formikFieldName}.comment` : 'comment';

  return (
    <>
      {displayHeader === true && (
        <Typography fontWeight={700} textTransform="uppercase" variant="body2" my={1.75}>
          Comment
        </Typography>
      )}
      <CustomTextField name={subcountCommentFieldName} label="Comment" />
    </>
  );
};
