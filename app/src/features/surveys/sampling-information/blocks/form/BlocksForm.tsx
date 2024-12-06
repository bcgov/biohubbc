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
import { ICreateBlockFormData } from '../create/CreateBlocksPage';
import BlocksMapForm from './map/BlocksMapForm';

export const BlocksFormYupSchema = yup.object({
  blocks: yup
    .array(
      yup.object({
        survey_block_id: yup.number().nullable(),
        name: yup.string().required('Name is required'),
        description: yup.string().nullable(),
        geojson: yup.object().required('A location is required')
      })
    )
    .min(1, 'At least one block is required')
    .required('Blocks are required')
});

interface IBlocksFormProps {
  isSubmitting: boolean;
}

/**
 * Renders sampling site create form.
 *
 * @param {IBlocksFormProps} props
 * @returns {*}
 */
const BlocksForm = (props: IBlocksFormProps) => {
  const { isSubmitting } = props;

  const history = useHistory();
  const { submitForm } = useFormikContext<ICreateBlockFormData>();

  const surveyContext = useSurveyContext();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 5 }}>
        <HorizontalSplitFormComponent title="Clusters" summary="Import or draw clusters">
          <BlocksMapForm />
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

export default BlocksForm;
