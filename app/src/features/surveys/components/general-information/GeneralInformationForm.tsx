import Grid from '@mui/material/Grid';
import CustomTextField from 'components/fields/CustomTextField';
import SelectWithSubtextField, { ISelectWithSubtextFieldOption } from 'components/fields/SelectWithSubtext';
import StartEndDateFields from 'components/fields/StartEndDateFields';
import { useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';
import { SurveyPermitFormYupSchema } from '../../SurveyPermitForm';

export const AddPermitFormInitialValues = {
  permits: [
    {
      permit_number: '',
      permit_type: ''
    }
  ]
};

export const AddPermitsFormYupSchema = yup.object().shape({
  permits: yup.array().of(
    yup.object().shape({
      permit_number: yup.string().required('Permit number is required'),
      permit_type: yup.string().required('Permit type is required')
    })
  )
});

export interface IGeneralInformationForm {
  survey_details: {
    survey_name: string;
    start_date: string;
    end_date: string;
    progress_id: number | null;
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
    progress_id: null,
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
          .nullable()
      })
    })
    .concat(SurveyPermitFormYupSchema);
};

export interface IGeneralInformationFormProps {
  progress: ISelectWithSubtextFieldOption[];
}

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const GeneralInformationForm: React.FC<IGeneralInformationFormProps> = (props) => {
  const formikProps = useFormikContext<IGeneralInformationForm>();

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <CustomTextField
          name="survey_details.survey_name"
          label="Survey Name"
          maxLength={200}
          other={{
            required: true
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <SelectWithSubtextField
          id={'survey_details.progress_id'}
          name={'survey_details.progress_id'}
          label={'Progress'}
          options={props.progress}
          required={true}
        />
      </Grid>
      <Grid item xs={12}>
        <StartEndDateFields
          formikProps={formikProps}
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
