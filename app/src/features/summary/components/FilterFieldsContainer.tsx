import grey from '@mui/material/colors/grey';
import Grid from '@mui/material/Grid';
import { useFormikContext } from 'formik';
import { useDeepCompareEffect } from 'hooks/useDeepCompareEffect';
import { debounce } from 'lodash-es';
import { PropsWithChildren, ReactElement, useMemo } from 'react';

interface ISearchFiltersProps {
  fields: ReactElement[];
}

/**
 * A component that wraps/renders the provided filter fields and triggers a form submit on change.
 *
 * @template FormikValues
 * @param {PropsWithChildren<ISearchFiltersProps>} props
 * @return {*}
 */
export const FilterFieldsContainer = <FormikValues extends Record<string, string>>(
  props: PropsWithChildren<ISearchFiltersProps>
) => {
  const { fields } = props;

  const { values, submitForm } = useFormikContext<FormikValues>();

  const debouncedSubmitForm = useMemo(() => debounce(submitForm, 500), [submitForm]);

  useDeepCompareEffect(() => {
    debouncedSubmitForm();
  }, [submitForm, values]);

  return (
    <Grid
      container
      direction="row"
      flexWrap="wrap"
      rowGap={2}
      columnGap={1}
      sx={{
        '& fieldset': { border: 'none' }
      }}>
      {fields.map((field, index) => (
        <Grid
          item
          key={`search-filters-${field.key ?? index}`}
          sx={{
            '& .MuiOutlinedInput-root': { background: '#fff' },
            '& .MuiInputLabel-root': { ml: -0.75, px: 1, background: '#fff' },
            minWidth: '200px',
            flex: '1 1 200px',
            border: `1px solid ${grey[400]}`,
            borderRadius: '4px'
          }}>
          {field}
        </Grid>
      ))}
    </Grid>
  );
};
