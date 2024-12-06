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
import { ICreateBlockFormData } from '../../create/CreateBlockPage';
import BlocksMapForm from './CreateBlocksMapForm';

export const BlocksFormYupSchema = yup.object({
  blocks: yup
    .array(
      yup.object({
        survey_block_id: yup.number().nullable(),
        name: yup.string().required('Name is required'),
        description: yup.string().nullable(),
        geojson: yup.object().nullable()
      })
    )
    .min(1, 'At least one block is required')
    .required('Blocks are required')
    .test('unique-names', 'Blocks must have unique names', (blocks) => {
      if (!blocks || !blocks.length) {
        return true;
      }
      const names = blocks.map((block) => block.name);
      return new Set(names).size === names.length;
    })
});

interface ICreateBlocksFormProps {
  isSubmitting: boolean;
  clusterCount?: number;
}

/**
 * Renders block create form.
 *
 * @param {ICreateBlocksFormProps} props
 * @returns {*}
 */
const CreateBlocksForm = (props: ICreateBlocksFormProps) => {
  const { isSubmitting, clusterCount } = props;

  const history = useHistory();
  const { submitForm } = useFormikContext<ICreateBlockFormData>();

  const surveyContext = useSurveyContext();

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Paper sx={{ p: 5 }}>
        <HorizontalSplitFormComponent title="Clusters" summary="Import or draw clusters">
          <BlocksMapForm clusterCount={clusterCount} />
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

export default CreateBlocksForm;
