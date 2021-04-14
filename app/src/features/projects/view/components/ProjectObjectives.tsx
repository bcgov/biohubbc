import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { ErrorDialog, IErrorDialogProps } from 'components/dialog/ErrorDialog';
import ReadMoreField from 'components/fields/ReadMoreField';
import { EditObjectivesI18N } from 'constants/i18n';
import {
  IProjectObjectivesForm,
  ProjectObjectivesFormInitialValues,
  ProjectObjectivesFormYupSchema
} from 'features/projects/components/ProjectObjectivesForm';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectForUpdateResponseObjectives,
  IGetProjectForViewResponse,
  UPDATE_GET_ENTITIES
} from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import ProjectStepComponents from 'utils/ProjectStepComponents';

export interface IProjectObjectivesProps {
  projectForViewData: IGetProjectForViewResponse;
  codes: IGetAllCodeSetsResponse;
  refresh: () => void;
}

/**
 * Project objectives content for a project.
 *
 * @return {*}
 */
const ProjectObjectives: React.FC<IProjectObjectivesProps> = (props) => {
  const {
    projectForViewData: { objectives, id },
    codes
  } = props;

  const biohubApi = useBiohubApi();

  const [errorDialogProps, setErrorDialogProps] = useState<IErrorDialogProps>({
    dialogTitle: EditObjectivesI18N.editErrorTitle,
    dialogText: EditObjectivesI18N.editErrorText,
    open: false,
    onClose: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    },
    onOk: () => {
      setErrorDialogProps({ ...errorDialogProps, open: false });
    }
  });

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    setErrorDialogProps({ ...errorDialogProps, ...textDialogProps, open: true });
  };

  const [openEditDialog, setOpenEditDialog] = useState(false);

  const [objectivesDataForUpdate, setObjectivesDataForUpdate] = useState<IGetProjectForUpdateResponseObjectives>(
    null as any
  );
  const [objectivesFormData, setObjectivesFormData] = useState<IProjectObjectivesForm>(
    ProjectObjectivesFormInitialValues
  );

  const handleDialogEditOpen = async () => {
    let objectivesResponseData;

    try {
      const response = await biohubApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.objectives]);

      if (!response?.objectives) {
        showErrorDialog({ open: true });
        return;
      }

      objectivesResponseData = response.objectives;
    } catch (error) {
      const apiError = new APIError(error);
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    }

    setObjectivesDataForUpdate(objectivesResponseData);

    setObjectivesFormData({
      objectives: objectivesResponseData.objectives,
      caveats: objectivesResponseData.caveats
    });

    setOpenEditDialog(true);
  };

  const handleDialogEditSave = async (values: IProjectObjectivesForm) => {
    const projectData = {
      objectives: { ...values, revision_count: objectivesDataForUpdate.revision_count }
    };

    try {
      await biohubApi.project.updateProject(id, projectData);
    } catch (error) {
      const apiError = new APIError(error);
      showErrorDialog({ dialogText: apiError.message, open: true });
      return;
    } finally {
      setOpenEditDialog(false);
    }

    props.refresh();
  };

  return (
    <>
      <EditDialog
        dialogTitle={EditObjectivesI18N.editTitle}
        open={openEditDialog}
        component={{
          element: <ProjectStepComponents component="ProjectObjectives" codes={codes} />,
          initialValues: objectivesFormData,
          validationSchema: ProjectObjectivesFormYupSchema
        }}
        onCancel={() => setOpenEditDialog(false)}
        onSave={handleDialogEditSave}
      />
      <ErrorDialog {...errorDialogProps} />
      <Box mb={5}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} height="2rem">
          <Typography variant="h3">Objectives</Typography>
          <Button
            className="editButtonSmall"
            onClick={() => handleDialogEditOpen()}
            title="Edit Project Objectives"
            aria-label="Edit Project Objectives"
            startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
            EDIT
          </Button>
        </Box>
        <ReadMoreField text={objectives.objectives} maxCharLength={850} />
      </Box>

      {objectives.caveats && (
        <>
          <Divider></Divider>
          <Box mt={4}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} height="2rem">
              <Typography variant="h3">Caveats</Typography>
            </Box>
            <ReadMoreField text={objectives.caveats} maxCharLength={850} />
          </Box>
        </>
      )}
    </>
  );
};

export default ProjectObjectives;
