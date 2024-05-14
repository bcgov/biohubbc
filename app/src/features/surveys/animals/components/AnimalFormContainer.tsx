import { Divider } from '@mui/material';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { Formik, FormikProps } from 'formik';
import { ICreateEditAnimalRequest } from 'interfaces/useCritterApi.interface';
import yup from 'utils/YupSchema';
import { EcologicalUnitsForm } from './ecological-units/EcologicalUnitsForm';
import { AnimalGeneralInformationForm } from './general-information/AnimalGeneralInformationForm';

export interface IAnimalFormProps {
  initialAnimalData: ICreateEditAnimalRequest;
  handleSubmit: (formikData: ICreateEditAnimalRequest) => void;
  formikRef: React.RefObject<FormikProps<ICreateEditAnimalRequest>>;
}

const AnimalFormYupSchema = yup.object({
  nickname: yup.string().min(3, 'Nickname must be at least 3 letters').required('Nickname is required'),
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
  ecological_units: yup.array(yup.object({ value: yup.string(), ecological_collection_category_id: yup.string() })),
  wildlife_health_id: yup.string().nullable()
});

/**
 * Returns the Formik form for creating and editing animals
 *
 * @param {IAnimalFormProps} props
 * @return {*}
 */
export const AnimalFormContainer = (props: IAnimalFormProps) => {
  const { initialAnimalData, handleSubmit, formikRef } = props;

  return (
    <Formik
      enableReinitialize
      innerRef={formikRef}
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
          component={<AnimalGeneralInformationForm />}
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
