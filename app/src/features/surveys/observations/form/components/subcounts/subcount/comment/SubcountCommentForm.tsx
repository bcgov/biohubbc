import CustomTextField from 'components/fields/CustomTextField';

export interface ISubcountCommentFormProps {
  formikFieldName: string;
}

/**
 * Form component for the observation subcount comment.
 *
 * @param {ISubcountCommentFormProps} props
 * @return {*}
 */
export const SubcountCommentForm = (props: ISubcountCommentFormProps) => {
  const { formikFieldName } = props;

  const subcountCommentFieldName = formikFieldName ? `${formikFieldName}.comment` : 'comment';

  return (
    <CustomTextField
      name={subcountCommentFieldName}
      label="Comment"
      other={{
        multiline: true,
        rows: 2
      }}
    />
  );
};
