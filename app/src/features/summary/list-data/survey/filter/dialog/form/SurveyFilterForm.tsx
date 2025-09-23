import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CustomTextField from 'components/fields/CustomTextField';
import { SystemUserAutocompleteField } from 'components/fields/SystemUserAutocompleteField';
import SpeciesAutocompleteField from 'components/species/components/SpeciesAutocompleteField';
import { useFormikContext } from 'formik';
import { IPostSurveyFilter } from 'interfaces/useFilterApi.interface';
import { ISystemUser } from 'interfaces/useUserApi.interface';

/**
 * Form for adding a survey to multiple collections
 *
 * NOTE: On naming conventions, SurveyFilterForm is from the perspective of a survey (adding one survey to multiple collections).
 * Whereas FilterSurveyForm is from the perspective of a collection (adding multiple surveys to one collection)
 *
 * @returns {*}
 */
const SurveyFilterForm = () => {
  const { setFieldValue, values, errors } = useFormikContext<IPostSurveyFilter>();

  const handleAddUser = (user: ISystemUser) => {
    setFieldValue(`conditions.system_user`, {
      system_user_id: user.system_user_id,
      display_name: user.display_name
    });
  };

  return (
    <form>
      <Stack display="flex" flexDirection="column" gap={5}>
        <Stack gap={2}>
          <CustomTextField name="name" label="Name" />
          <CustomTextField name="description" label="Description" other={{ multiline: true, rows: 2 }} />
        </Stack>
        <Stack gap={2}>
          <Typography fontWeight={700}>Conditions</Typography>
          {errors.conditions && typeof errors.conditions === 'string' && (
            <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>
              <AlertTitle>Missing Conditions</AlertTitle>
              {errors.conditions}
            </Alert>
          )}
          <CustomTextField name="conditions.keyword" label="Keyword" />
          <SpeciesAutocompleteField
            formikFieldName="conditions.itis_tsn"
            label="Species"
            placeholder="Search by taxon"
            handleSpecies={(value) => {
              if (value?.tsn) {
                setFieldValue('conditions.itis_tsn', value.tsn);
              }
            }}
            handleClear={() => {
              setFieldValue('conditions.itis_tsn', undefined);
            }}
            key="survey-tsn-filter"
          />
          <SystemUserAutocompleteField
            formikFieldName="conditions.system_user_id"
            label="User"
            placeholder="Search by user"
            helpText={`Only active users who have requested access to the Species Inventory Management System before can be invited`}
            selectedUsers={values.conditions.system_user_id ? [values.conditions.system_user_id] : []}
            clearOnSelect
            onSelect={(value) => {
              if (value) {
                handleAddUser(value);
              }
            }}
            key="project-user-filter"
          />
        </Stack>
      </Stack>
    </form>
  );
};

export default SurveyFilterForm;
