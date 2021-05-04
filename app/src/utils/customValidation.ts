import { FormikErrors } from 'formik';

export const validateFormFieldsAndReportCompletion = async (
  values: any,
  validateForm: (values?: any) => Promise<FormikErrors<any>>
) => {
  const validationResult = await validateForm(values);

  if (validationResult && Object.keys(validationResult).length === 0 && validationResult.constructor === Object) {
    return true;
  }

  return false;
};
