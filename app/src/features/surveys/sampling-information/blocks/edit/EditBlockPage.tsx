import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateBlockI18N } from 'constants/i18n';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { IEditBlock } from 'interfaces/useBlockApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory, useParams } from 'react-router';
import SamplingSiteHeader from '../../sites/components/SamplingSiteHeader';
import EditBlocksForm, { EditBlockFormYupSchema } from '../form/edit/EditBlocksForm';

/**
 * Interface for the form data used in the Create Sampling Site form.
 *
 * @export
 * @interface IEditBlockFormData
 */
export interface IEditBlockFormData {
  block: IEditBlock;
}

/**
 * Renders the page for editing a single survey block
 *
 * @return {*}
 */
export const EditBlockPage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const urlParams: Record<string, string | number | undefined> = useParams();
  const surveyBlockId = Number(urlParams['survey_block_id']);

  const formikRef = useRef<FormikProps<IEditBlockFormData>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const blocksDataLoader = useDataLoader((surveyBlockId: number) =>
    biohubApi.block.getSurveyBlockById(surveyContext.projectId, surveyContext.surveyId, surveyBlockId)
  );

  useEffect(() => {
    blocksDataLoader.load(surveyBlockId);
  }, [surveyBlockId, blocksDataLoader]);

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data || !blocksDataLoader.data) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  const showCreateErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: CreateBlockI18N.createErrorTitle,
      dialogText: CreateBlockI18N.createErrorText,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps,
      open: true
    });
  };

  const handleSubmit = async (values: IEditBlockFormData) => {
    try {
      setIsSubmitting(true);

      const data: IEditBlock = {
        survey_block_id: values.block.survey_block_id,
        geojson: values.block.geojson,
        name: values.block.name,
        description: values.block.description
      };

      await biohubApi.block.updateBlock(surveyContext.projectId, surveyContext.surveyId, data);

      // create complete, navigate back to observations page
      history.push(
        `/admin/projects/${surveyContext.projectId}/surveys/${surveyContext.surveyId}/sampling`,
        SKIP_CONFIRMATION_DIALOG
      );
    } catch (error) {
      showCreateErrorDialog({
        dialogTitle: CreateBlockI18N.createErrorTitle,
        dialogText: CreateBlockI18N.createErrorText,
        dialogError: (error as APIError).message,
        dialogErrorDetails: (error as APIError)?.errors
      });
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Prompt when={true} message={locationChangeInterceptor} />
      <Formik
        innerRef={formikRef}
        initialValues={{ block: { ...blocksDataLoader.data, uuid: blocksDataLoader.data.geojson?.id as string } }}
        validationSchema={EditBlockFormYupSchema}
        validateOnBlur={true}
        validateOnChange={false}
        onSubmit={handleSubmit}>
        <Box display="flex" flexDirection="column">
          <SamplingSiteHeader
            project_id={surveyContext.projectId}
            survey_id={surveyContext.surveyId}
            survey_name={surveyContext.surveyDataLoader.data.surveyData.survey_details.survey_name}
            project_name={projectContext.projectDataLoader.data.projectData.project.project_name}
            is_submitting={isSubmitting}
            title="Edit Sampling Site Cluster"
            breadcrumb="Edit Sampling Site Cluster"
          />
          <Box display="flex" flex="1 1 auto">
            <EditBlocksForm isSubmitting={isSubmitting} />
          </Box>
        </Box>
      </Formik>
    </>
  );
};
