import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteField';
import React from 'react';
import yup from 'utils/YupSchema';
import SurveyPermitForm from '../SurveyPermitForm';

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
  permit: {
    permits: {
      permit_id?: number;
      permit_number: string;
      permit_type: string;
    }[];
  };
}

export const GeneralInformationInitialValues: IGeneralInformationForm = {
  permit: {
    permits: []
  }
};

// export const GeneralInformationYupSchema = (customYupRules?: any) => {
//   return yup
//     .object()
//     .shape({
//       survey_details: yup.object().shape({
//         survey_name: yup.string().required('Survey Name is Required'),
//         start_date: customYupRules?.start_date || yup.string().isValidDateString().required('Start Date is Required'),
//         end_date:
//           customYupRules?.end_date || yup.string().isValidDateString().isEndDateSameOrAfterStartDate('start_date'),
//         survey_types: yup
//           .array(yup.number())
//           .min(1, 'One or more Types are required')
//           .required('One or more Types are required')
//       }),
//       species: yup.object().shape({
//         focal_species: yup.array().min(1, 'You must specify a focal species').required('Required'),
//         ancillary_species: yup.array().isUniqueFocalAncillarySpecies('Focal and Ancillary species must be unique')
//       })
//     })
//     .concat(SurveyPermitFormYupSchema);
// };

export interface IPermitsFormProps {
  type: IMultiAutocompleteFieldOption[];
}

/**
 * Create survey - general information fields
 *
 * @return {*}
 */
const PermitsForm: React.FC<IPermitsFormProps> = () => {

  return (
    <Box component="fieldset">
      <Typography component="legend" variant="h5">
        Permits
      </Typography>
      <Box>
        <SurveyPermitForm />
      </Box>
    </Box>
  );
};

export default PermitsForm;
