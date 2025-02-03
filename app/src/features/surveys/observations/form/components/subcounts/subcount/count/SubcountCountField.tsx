import Typography from '@mui/material/Typography';
import HelpButtonStack from 'components/buttons/HelpButtonStack';
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
        <HelpButtonStack
          sx={{ my: 0.5 }}
          helpText="
            Count is the number of individuals with a specific set of characteristics. If you have multiple counts, they should add up to the total number of individuals in the
            observation.">
          <Typography fontWeight={700} textTransform="uppercase" variant="body2">
            Count
          </Typography>
        </HelpButtonStack>
      )}
      <CustomTextField label="Subcount" name={subcountCountFieldName} other={{ type: 'number' }} />
    </>
  );
};
