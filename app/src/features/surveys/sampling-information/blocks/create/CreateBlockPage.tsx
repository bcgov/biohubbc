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
import { ICreateBlock, ICreateBlocksRequest } from 'interfaces/useBlockApi.interface';
import { useEffect, useRef, useState } from 'react';
import { Prompt, useHistory } from 'react-router';
import SamplingSiteHeader from '../../sites/components/SamplingSiteHeader';
import CreateBlocksForm, { CreateBlocksFormYupSchema } from '../form/create/CreateBlocksForm';

/**
 * Interface for the form data used in the Create Sampling Site form.
 *
 * @export
 * @interface ICreateBlockFormData
 */
export interface ICreateBlockFormData {
  blocks: ICreateBlock[];
}

/**
 * Renders the page for adding one or more survey blocks
 *
 * @return {*}
 */
export const CreateBlockPage = () => {
  const history = useHistory();
  const biohubApi = useBiohubApi();

  const surveyContext = useSurveyContext();
  const projectContext = useProjectContext();
  const dialogContext = useDialogContext();

  const formikRef = useRef<FormikProps<ICreateBlockFormData>>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch blocks to determine the number of blocks in the survey,
  // used for generating unique names of new clusters (eg. "Cluster 1", "Cluster 2", etc.)
  const blocksDataLoader = useDataLoader(() =>
    biohubApi.block.getSurveyBlocks(surveyContext.projectId, surveyContext.surveyId)
  );

  useEffect(() => {
    blocksDataLoader.load();
  }, [blocksDataLoader]);

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
        blocks: blocks.map((block) => ({
          survey_block_id: block.survey_block_id,
          geojson: block.geojson,
          name: block.name,
          description: block.description
        }))
      };

      await biohubApi.block.createBlocks(surveyContext.projectId, surveyContext.surveyId, data);

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
        validationSchema={CreateBlocksFormYupSchema}
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
            title="Add Sampling Site Cluster"
            breadcrumb="Add Sampling Site Cluster"
          />
          <Box display="flex" flex="1 1 auto">
            <CreateBlocksForm isSubmitting={isSubmitting} clusterCount={blocksDataLoader.data?.blocks.length ?? 0} />
          </Box>
        </Box>
      </Formik>
    </>
  );
};
