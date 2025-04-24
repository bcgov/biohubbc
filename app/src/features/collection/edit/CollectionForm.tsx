import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import FormikErrorSnackbar from 'components/alert/FormikErrorSnackbar';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { CodesContext } from 'contexts/codesContext';
import { Formik, FormikProps } from 'formik';
import { ICreateCollectionRequest, IUpdateCollectionRequest } from 'interfaces/useCollectionApi.interface';
import { useContext } from 'react';
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
  description: yup.string().max(3000, 'Description cannot exceed 3000 characters.').nullable(),
  participants: yup.array(yup.object({ system_user_id: yup.number() })).min(1, 'There must be at least one participant')
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

  const codesContext = useContext(CodesContext);
  const codes = codesContext.codesDataLoader.data;

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
          component={<ParticipantsCollectionForm roles={codes?.collection_roles ?? []} />}
        />

        <Divider />
      </Stack>
    </Formik>
  );
};

export default CollectionForm;
