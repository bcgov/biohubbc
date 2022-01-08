import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import { mdiPencilOutline } from '@mdi/js';
import Icon from '@mdi/react';
import EditDialog from 'components/dialog/EditDialog';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import ReadMoreField from 'components/fields/ReadMoreField';
import { H3ButtonToolbar } from 'components/toolbar/ActionToolbars';
import { EditObjectivesI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import {
  IProjectObjectivesForm,
  ProjectObjectivesFormInitialValues,
  ProjectObjectivesFormYupSchema
} from 'features/projects/components/ProjectObjectivesForm';
import { APIError } from 'hooks/api/useAxios';
import { useRestorationTrackerApi } from 'hooks/useRestorationTrackerApi';
import { IGetAllCodeSetsResponse } from 'interfaces/useCodesApi.interface';
import {
  IGetProjectForUpdateResponseObjectives,
  IGetProjectForViewResponse,
  UPDATE_GET_ENTITIES
} from 'interfaces/useProjectApi.interface';
import React, { useContext, useState } from 'react';
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

  const restorationTrackerApi = useRestorationTrackerApi();

  const dialogContext = useContext(DialogContext);

  const defaultErrorDialogProps = {
    dialogTitle: EditObjectivesI18N.editErrorTitle,
    dialogText: EditObjectivesI18N.editErrorText,
    open: false,
    onClose: () => {
      dialogContext.setErrorDialog({ open: false });
    },
    onOk: () => {
      dialogContext.setErrorDialog({ open: false });
    }
  };

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({ ...defaultErrorDialogProps, ...textDialogProps, open: true });
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
      const response = await restorationTrackerApi.project.getProjectForUpdate(id, [UPDATE_GET_ENTITIES.objectives]);

      if (!response?.objectives) {
        showErrorDialog({ open: true });
        return;
      }

      objectivesResponseData = response.objectives;
    } catch (error) {
      const apiError = error as APIError;
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
      await restorationTrackerApi.project.updateProject(id, projectData);
    } catch (error) {
      const apiError = error as APIError;
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
      <Box>
        <H3ButtonToolbar
          label="Objectives"
          buttonLabel="Edit"
          buttonTitle="Edit Project Objectives"
          buttonStartIcon={<Icon path={mdiPencilOutline} size={0.875} />}
          buttonOnClick={() => handleDialogEditOpen()}
          toolbarProps={{ disableGutters: true }}
        />
        <Divider></Divider>
        <Box mt={2}>
          <ReadMoreField text={objectives.objectives} maxCharLength={850} />
          {objectives.caveats && <ReadMoreField text={objectives.caveats} maxCharLength={850} />}
        </Box>
      </Box>
    </>
  );
};

export default ProjectObjectives;
