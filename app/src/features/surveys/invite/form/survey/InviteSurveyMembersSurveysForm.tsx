import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import { SURVEY_ROLE } from 'constants/roles';
import { useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useMemo } from 'react';

export const InviteSurveyMembersSurveyForm = () => {
  const { values, setFieldValue } = useFormikContext<any>();
  const biohubApi = useBiohubApi();
  const surveysDataLoader = useDataLoader(() =>
    biohubApi.survey.findSurveys(undefined, { survey_roles: [SURVEY_ROLE.ADMIN] })
  );

  useEffect(() => {
    surveysDataLoader.load();
  }, [surveysDataLoader]);

  const surveyOptions = useMemo(() => {
    const surveys = surveysDataLoader.data?.surveys || [];
    return surveys.map((survey) => ({
      value: survey.survey_id,
      label: survey.name
    }));
  }, [surveysDataLoader.data?.surveys]);

  return (
    <Autocomplete
      multiple
      id="selectedSurveys"
      options={surveyOptions}
      getOptionLabel={(option) => option.label}
      value={surveyOptions.filter((option) => (values.selectedSurveys as number[]).includes(option.value))}
      onChange={(_, newValue) =>
        setFieldValue(
          'selectedSurveys',
          newValue.map((option) => option.value)
        )
      }
      renderInput={(params) => (
        <TextField {...params} label="Select Surveys" placeholder="Search and select surveys" required />
      )}
      disableCloseOnSelect
    />
  );
};
