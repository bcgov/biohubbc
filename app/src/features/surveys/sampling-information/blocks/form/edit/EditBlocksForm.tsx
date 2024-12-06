import LoadingButton from '@mui/lab/LoadingButton/LoadingButton';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import HorizontalSplitFormComponent from 'components/fields/HorizontalSplitFormComponent';
import { useFormikContext } from 'formik';
import { useSurveyContext } from 'hooks/useContext';
import { useHistory } from 'react-router';
import yup from 'utils/YupSchema';
import { IEditBlockFormData } from '../../edit/EditBlockPage';
import EditBlocksMapForm from './EditBlocksMapForm';

export const EditBlockFormYupSchema = yup.object({
  block: yup.object({
    survey_block_id: yup.number().required('Survey block ID is required'),
    name: yup.string().required('Name is required'),
    description: yup.string().nullable(),
    geojson: yup.object().nullable()
  })
});

interface IEditBlocksFormProps {
  isSubmitting: boolean;
}

/**
 * Renders block edit form.
 *
 * @param {IEditBlocksFormProps} props
 * @returns {*}
 */
const EditBlocksForm = (props: IEditBlocksFormProps) => {
  const { isSubmitting } = props;

  const history = useHistory();
  const { submitForm } = useFormikContext<IEditBlockFormData>();

  const surveyContext = useSurveyContext();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 5 }}>
        <HorizontalSplitFormComponent title="Cluster" summary="Import or draw to edit the location of the cluster">
          <EditBlocksMapForm />
        </HorizontalSplitFormComponent>

        <Divider sx={{ my: 5 }} />

        <Stack gap={5}>
          <Stack flexDirection="row" alignItems="center" justifyContent="flex-end" gap={1}>
            <LoadingButton
              type="submit"
              variant="contained"
              color="primary"
              loading={isSubmitting}
              onClick={() => {
                submitForm();
              }}>
              Save and Exit
            </LoadingButton>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                history.push(`/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`);
              }}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};

export default EditBlocksForm;
