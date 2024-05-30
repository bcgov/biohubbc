import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import CustomTextField from 'components/fields/CustomTextField';
import MultiAutocompleteFieldVariableSize from 'components/fields/MultiAutocompleteFieldVariableSize';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import { useCodesContext } from 'hooks/useContext';

export interface IProjectAdvancedFilters {
  project_programs: number[];
  start_date: string;
  end_date: string;
  keyword: string;
  project_name: string;
  agency_id: number;
  agency_project_id: string;
  system_user_id: number;
  itis_tsns: number[];
}

export const ProjectAdvancedFiltersInitialValues: IProjectAdvancedFilters = {
  project_programs: [],
  start_date: '',
  end_date: '',
  keyword: '',
  project_name: '',
  agency_id: '' as unknown as number,
  system_user_id: '' as unknown as number,
  agency_project_id: '',
  itis_tsns: []
};

/**
 * Project - Advanced filters
 *
 * @return {*}
 */
const ProjectAdvancedFilters = () => {
  const formikProps = useFormikContext<IProjectAdvancedFilters>();

  const codesContext = useCodesContext();

  if (!codesContext.codesDataLoader.data) {
    return <></>;
  }

  return (
    <Stack direction="row" gap={1}>
      <CustomTextField name="project_name" label="Project Name" />
      <FormControl fullWidth variant="outlined" required={false}>
        <MultiAutocompleteFieldVariableSize
          id={'project_programs'}
          label={'Project Programs'}
          options={
            codesContext.codesDataLoader.data?.program?.map((item) => {
              return { value: item.id, label: item.name };
            }) ?? []
          }
        />
      </FormControl>

      <StartEndDateFields
        formikProps={formikProps}
        startName="start_date"
        endName="end_date"
        startRequired={false}
        endRequired={false}
      />
    </Stack>
  );
};

export default ProjectAdvancedFilters;
