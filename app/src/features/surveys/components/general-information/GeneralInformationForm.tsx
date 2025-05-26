import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import yup from 'utils/YupSchema';
import { SurveyPermitFormYupSchema } from '../permit/SurveyPermitForm';

export interface IGeneralInformationForm {
  survey_details: {
    survey_name: string;
    start_date: string;
    end_date: string;
    progress_id: number;
    survey_types: number[];
    revision_count: number;
  };
  permit: {
    permits: {
      permit_id?: number;
      permit_number: string;
      permit_type: string;
    }[];
  };
}

export const GeneralInformationInitialValues: IGeneralInformationForm = {
  survey_details: {
    survey_name: '',
    start_date: '',
    end_date: '',
    progress_id: null as unknown as number,
    survey_types: [],
    revision_count: 0
  },
  permit: {
    permits: []
  }
};

export const GeneralInformationYupSchema = () => {
  return yup
    .object()
    .shape({
      survey_details: yup.object().shape({
        survey_name: yup.string().required('Survey Name is Required'),
        start_date: yup.string().isValidDateString().required('Start Date is Required'),
        end_date: yup.string().nullable().isValidDateString(),
        progress_id: yup
          .number()
          .min(1, 'Survey Progress is Required')
          .required('Survey Progress is Required')
          .nullable(),
        survey_types: yup
          .array(yup.number())
          .min(1, 'One or more data types are required')
          .required('One or more data types are required')
      })
    })
    .concat(SurveyPermitFormYupSchema);
};

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const GeneralInformationForm = () => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <CustomTextField
          name="survey_details.survey_name"
          label="Survey Name"
          // helpText={`A descriptive names that mentions species, regions, and objectives will make it easier to find this Survey.`}
          maxLength={200}
          other={{
            required: true
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <StartEndDateFields
          startName="survey_details.start_date"
          endName="survey_details.end_date"
          startRequired={true}
          endRequired={false}
        />
      </Grid>
    </Grid>
  );
};

export default GeneralInformationForm;
