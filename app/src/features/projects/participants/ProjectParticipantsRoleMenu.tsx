import Typography from '@material-ui/core/Typography';
import { mdiChevronDown } from '@mdi/js';
import Icon from '@mdi/react';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CustomMenuButton } from 'components/toolbar/ActionToolbars';
import { ProjectParticipantsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { CodeSet } from 'interfaces/useCodesApi.interface';
import { IGetProjectParticipantsResponseArrayItem } from 'interfaces/useProjectApi.interface';
import React, { useContext } from 'react';

export interface IChangeProjectRoleMenuProps {
  participant: IGetProjectParticipantsResponseArrayItem;
  projectRoleCodes: CodeSet;
  refresh: () => void;
}

const ProjectParticipantsRoleMenu: React.FC<IChangeProjectRoleMenuProps> = (props) => {
  const { participant, projectRoleCodes, refresh } = props;

  const dialogContext = useContext(DialogContext);
  const biohubApi = useBiohubApi();

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.showErrorDialog({
      dialogTitle: ProjectParticipantsI18N.updateParticipantRoleErrorTitle,
      dialogText: ProjectParticipantsI18N.updateParticipantRoleErrorText,
      onClose: () => dialogContext.hideDialog(),
      ...textDialogProps
    });
  };

  const handleChangeUserPermissionsClick = (
    item: IGetProjectParticipantsResponseArrayItem,
    newRole: string,
    newRoleId: number
  ) => {
    dialogContext.showYesNoDialog({
      dialogTitle: 'Change Project Role?',
      dialogContent: (
        <Typography variant="body1" color="textSecondary">
          Change user <strong>{item.user_identifier}</strong>'s role to <strong>{newRole}</strong>?
        </Typography>
      ),
      yesButtonLabel: 'Change Role',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'primary' },
      onClose: () => dialogContext.hideDialog(),
      onNo: () => dialogContext.hideDialog(),
      onYes: () => {
        changeProjectParticipantRole(item, newRole, newRoleId);
        dialogContext.hideDialog();
      }
    });
  };

  const changeProjectParticipantRole = async (
    item: IGetProjectParticipantsResponseArrayItem,
    newRole: string,
    newRoleId: number
  ) => {
    if (!item?.project_participation_id) {
      return;
    }

    try {
      const status = await biohubApi.project.updateProjectParticipantRole(
        item.project_id,
        item.project_participation_id,
        newRoleId
      );

      if (!status) {
        showErrorDialog();
        return;
      }

      dialogContext.showSnackbar({
        snackbarMessage: (
          <Typography variant="body2" component="div">
            User <strong>{item.user_identifier}</strong>'s role changed to <strong>{newRole}</strong>.
          </Typography>
        )
      });

      refresh();
    } catch (error) {
      const apiError = error as APIError;
      showErrorDialog({ dialogError: apiError.message, dialogErrorDetails: apiError.errors });
    }
  };

  const currentProjectRoleName = projectRoleCodes.find((item) => item.id === participant.project_role_id)?.name;

  return (
    <CustomMenuButton
      buttonLabel={currentProjectRoleName}
      buttonTitle={'Change Project Role'}
      buttonProps={{ variant: 'outlined', size: 'small', color: 'default' }}
      menuItems={projectRoleCodes.map((roleCode) => {
        return {
          menuLabel: roleCode.name,
          menuOnClick: () => handleChangeUserPermissionsClick(participant, roleCode.name, roleCode.id)
        };
      })}
      buttonEndIcon={<Icon path={mdiChevronDown} size={0.8} />}
    />
  );
};

export default ProjectParticipantsRoleMenu;
