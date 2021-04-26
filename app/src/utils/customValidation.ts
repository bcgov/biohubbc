import { FormikErrors } from 'formik';

export const validateFormFieldsAndReportCompletion = async (
  values: any,
  validateForm: (values?: any) => Promise<FormikErrors<any>>,
  setFormsComplete: (formsComplete: boolean[]) => void,
  formFieldIndex: number
) => {
  const validationResult = await validateForm(values);
  let isValid = false;

  if (validationResult && Object.keys(validationResult).length === 0 && validationResult.constructor === Object) {
    isValid = true;
  }

  //@ts-ignore
  setFormsComplete((currentFormsComplete: boolean[]) => {
    let newFormsCompleteState = [...currentFormsComplete];

    newFormsCompleteState[formFieldIndex] = isValid;

    return newFormsCompleteState;
  });
};
