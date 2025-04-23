import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { Formik, FormikProps } from 'formik';
import { ICreateCollectionRequest, IUpdateCollectionRequest } from 'interfaces/useCollectionApi.interface';
import yup from 'utils/YupSchema';
import GeneralInformationCollectionForm from './general/GeneralInformationCollectionForm';
import ParticipantsCollectionForm from './participants/ParticipantsCollectionForm';

interface ICollectionForm<InitialValuesType extends IUpdateCollectionRequest | ICreateCollectionRequest> {
  initialCollectionData: InitialValuesType;
  handleSubmit: (formikData: InitialValuesType) => void;
  formikRef: React.RefObject<FormikProps<InitialValuesType>>;
}

const validationCollectionYupSchema = yup.object().shape({
  name: yup.string().required('Name is required'),
  description: yup.string().required('Description is required').max(3000, 'Description cannot exceed 3000 characters.'),
  participants: yup.array(yup.object({ system_user_id: yup.number() }))
});

/**
 * Form for creating a new collection.
 *
 * @return {*}
 */
const CollectionForm = <InitialValuesType extends IUpdateCollectionRequest | ICreateCollectionRequest>(
  props: ICollectionForm<InitialValuesType>
) => {
  const { formikRef } = props;

  const handleSubmit = async (formikData: InitialValuesType) => {
    props.handleSubmit(formikData);
  };

  return (
    <Formik
      innerRef={formikRef}
      initialValues={props.initialCollectionData}
      validationSchema={validationCollectionYupSchema}
      validateOnBlur={false}
      validateOnChange={false}
      enableReinitialize={true}
      onSubmit={handleSubmit}>
      <Stack gap={5}>
        <FormikErrorSnackbar />
        <HorizontalSplitFormComponent
          title="General Information"
          summary="Enter a name and description for the collection."
          component={<GeneralInformationCollectionForm />}
        />

        <Divider />
        <HorizontalSplitFormComponent
          title="Members"
          summary="Invite people to the collection, giving read-only access to Surveys in the collection."
          component={<ParticipantsCollectionForm roles={[]} />}
        />

        <Divider />
      </Stack>
    </Formik>
  );
};

export default CollectionForm;
