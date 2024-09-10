import AlertBar from 'components/alert/AlertBar';
import { useFormikContext } from 'formik';
import { ICreateSurveyRequest, IEditSurveyRequest } from 'interfaces/useSurveyApi.interface';
import get from 'lodash-es/get';

/**
 * Renders an alert if formik has an error for the 'species.focal_species' field.
 *
 * @return {*}
 */
export const FocalSpeciesAlert = () => {
  const { errors } = useFormikContext<ICreateSurveyRequest | IEditSurveyRequest>();

  const errorText = get(errors, 'species.focal_species');

  if (!errorText) {
    return null;
  }

  if (typeof errorText !== 'string') {
    return null;
  }

  return <AlertBar severity="error" variant="outlined" title="Focal Species missing" text={errorText} />;
};
