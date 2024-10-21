import { Divider } from '@mui/material';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { Formik, FormikProps } from 'formik';
import { ICreateEditAnimalRequest, ICritterCollectionUnitResponse } from 'interfaces/useCritterApi.interface';
import yup from 'utils/YupSchema';
import { EcologicalUnitsForm } from './ecological-units/EcologicalUnitsForm';
import { AnimalGeneralInformationForm } from './general-information/AnimalGeneralInformationForm';

export interface IAnimalFormProps {
  /**
   * The Formik ref object.
   *
   * @type {React.RefObject<FormikProps<ICreateEditAnimalRequest>>}
   * @memberof IAnimalFormProps
   */
  formikRef: React.RefObject<FormikProps<ICreateEditAnimalRequest>>;
  /**
   * The initial data to populate the form with.
   *
   * @type {ICreateEditAnimalRequest}
   * @memberof IAnimalFormProps
   */
  initialAnimalData: ICreateEditAnimalRequest;
  /**
   * Callback to handle form submission.
   *
   * @memberof IAnimalFormProps
   */
  handleSubmit: (formikData: ICreateEditAnimalRequest) => void;
  /**
   * Flag to determine if the form is in edit mode. Defaults to false if not provided.
   *
   * @type {boolean}
   * @memberof IAnimalFormProps
   */
  isEdit?: boolean;
}

const AnimalFormYupSchema = yup.object({
  nickname: yup.string().trim().min(1, 'Nickname is required').required('Nickname is required'),
  species: yup
    .object()
    .shape({
      scientificName: yup.string().required('Species is required').min(1),
      commonNames: yup.array(yup.string()).nullable(),
      tsn: yup.number().required('Species is required').min(1),
      rank: yup.string().nullable(),
      kingdom: yup.string().nullable()
    })
    .default(undefined)
    .nullable()
    .required('Species is required'),
  critter_comment: yup.string().nullable(),
  sex_qualitative_option_id: yup.string().nullable(),
  ecological_units: yup.array(
    yup
      .object()
      .shape({
        collection_category_id: yup
          .string()
          .test('is-unique-ecological-unit', 'Ecological unit must be unique', function (collection_category_id) {
            const formValues = this.options.context;

            if (!formValues?.ecological_units?.length) {
              return true;
            }

            return (
              formValues.ecological_units.filter(
                (ecologicalUnit: ICritterCollectionUnitResponse) =>
                  ecologicalUnit.collection_category_id === collection_category_id
              ).length <= 1
            );
          })
          .default(null)
          .nullable(),
        collection_unit_id: yup.string().when('collection_category_id', {
          is: (collection_category_id: string | null) => collection_category_id !== null,
          then: yup.string().nullable().required('Ecological unit is required'),
          otherwise: yup.string().nullable()
        })
      })
      .nullable()
  ),
  wildlife_health_id: yup.string().nullable()
});

/**
 * Returns the Formik form for creating and editing animals
 *
 * @param {IAnimalFormProps} props
 * @return {*}
 */
export const AnimalFormContainer = (props: IAnimalFormProps) => {
  const { initialAnimalData, handleSubmit, formikRef, isEdit } = props;

  return (
    <Formik
      innerRef={formikRef}
      enableReinitialize={true}
      initialValues={initialAnimalData}
      validationSchema={AnimalFormYupSchema}
      validateOnBlur={false}
      validateOnChange={false}
      onSubmit={handleSubmit}>
      <Stack gap={5}>
        <FormikErrorSnackbar />
        <HorizontalSplitFormComponent
          title="General Information"
          summary="Enter information to identify the animal"
          component={<AnimalGeneralInformationForm isEdit={isEdit} />}
        />
        <HorizontalSplitFormComponent
          title="Ecological Units"
          summary="Enter ecological units that the animal belongs to"
          component={<EcologicalUnitsForm />}
        />
        <Divider />
      </Stack>
    </Formik>
  );
};
