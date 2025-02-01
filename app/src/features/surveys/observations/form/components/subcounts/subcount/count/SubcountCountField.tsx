import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';

export interface ISubcountCountFieldProps {
  formikFieldName: string;
  displayHeader?: boolean;
}

/**
 * Subcount Count Field component.
 *
 * @param {ISubcountCountFieldProps} props
 * @return {*}
 */
export const SubcountCountField = (props: ISubcountCountFieldProps) => {
  const { formikFieldName, displayHeader } = props;

  const subcountCountFieldName = `${formikFieldName}.subcount`;

  return (
    <>
      {displayHeader === true && (
        <Typography fontWeight={700} textTransform="uppercase" variant="body2" my={2}>
          Count
        </Typography>
      )}
      <CustomTextField label="Subcount" name={subcountCountFieldName} other={{ type: 'number' }} />
    </>
  );
};
