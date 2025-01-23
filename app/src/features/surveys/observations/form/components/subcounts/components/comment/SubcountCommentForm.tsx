import CustomTextField from 'components/fields/CustomTextField';

export interface ISubcountCommentFormProps {
  formikPrefixPath: string;
}

/**
 * Form component for the observation subcount comment.
 *
 * @param {ISubcountCommentFormProps} props
 * @return {*}
 */
export const SubcountCommentForm = (props: ISubcountCommentFormProps) => {
  const { formikPrefixPath } = props;

  const formikFieldName = formikPrefixPath ? `${formikPrefixPath}.comment` : 'comment';

  return (
    <CustomTextField
      name={formikFieldName}
      label="Comment"
      other={{
        multiline: true,
        rows: 2
      }}
    />
  );
};
