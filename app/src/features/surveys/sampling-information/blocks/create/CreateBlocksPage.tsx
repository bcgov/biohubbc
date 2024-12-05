import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CreateBlockI18N } from 'constants/i18n';
import { Formik, FormikProps } from 'formik';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext, useProjectContext, useSurveyContext } from 'hooks/useContext';
import { SKIP_CONFIRMATION_DIALOG, useUnsavedChangesDialog } from 'hooks/useUnsavedChangesDialog';
import { ICreateBlocksRequest } from 'interfaces/useSamplingSiteApi.interface';
import { useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import SamplingSiteHeader from '../../sites/components/SamplingSiteHeader';
import BlocksForm, { BlocksFormYupSchema } from '../form/BlocksForm';
import { IBlockData } from '../form/map/BlocksMapForm';

/**
 * Interface for the form data used in the Create Sampling Site form.
 *
 * @export
 * @interface ICreateBlockFormData
 */
export interface ICreateBlockFormData {
  blocks: IBlockData[];
}

/**
 * Renders the body content of the Sampling Site page.
 *
 * @return {*}
 */
export const CreateBlocksPage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const formikRef = useRef<FormikProps<ICreateBlockFormData>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { locationChangeInterceptor } = useUnsavedChangesDialog();

  if (!surveyContext.surveyDataLoader.data || !projectContext.projectDataLoader.data) {
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

  const handleSubmit = async (values: ICreateBlockFormData) => {
    try {
      setIsSubmitting(true);

      const { blocks, ...otherValues } = values;

      const data: ICreateBlocksRequest = {
        ...otherValues,
        blocks: blocks.map((method) => ({
          survey_block_id: method.survey_block_id,
          name: method.name,
          description: method.description
        }))
      };

      await biohubApi.survey.createBlocks(surveyContext.projectId, surveyContext.surveyId, data);

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
        initialValues={{
          blocks: []
        }}
        validationSchema={BlocksFormYupSchema}
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
            title="Add Sampling Site Clusters"
            breadcrumb="Add Sampling Site Clusters"
          />
          <Box display="flex" flex="1 1 auto">
            <BlocksForm isSubmitting={isSubmitting} />
          </Box>
        </Box>
      </Formik>
    </>
  );
};
