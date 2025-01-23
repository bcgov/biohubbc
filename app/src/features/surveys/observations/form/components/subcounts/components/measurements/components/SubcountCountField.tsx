import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';

export interface ISubcountCountFieldProps {
  formikPrefixPath: string;
  displayHeader?: boolean;
}

/**
 * Subcount Count Field component.
 *
 * @param {ISubcountCountFieldProps} props
 * @return {*}
 */
export const SubcountCountField = (props: ISubcountCountFieldProps) => {
  const { formikPrefixPath, displayHeader } = props;

  const formikFieldName = formikPrefixPath ? `${formikPrefixPath}.count` : 'count';

  return (
    <>
      {displayHeader === true && (
        <Typography fontWeight={700} textTransform="uppercase" variant="body2" my={2}>
          Count
        </Typography>
      )}
      <CustomTextField label="Subcount" name={formikFieldName} other={{ type: 'number' }} />
    </>
  );
};
