import { mdiChevronDown } from '@mdi/js';
import Icon from '@mdi/react';
import Typography from '@mui/material/Typography';
import { IErrorDialogProps } from 'components/dialog/ErrorDialog';
import { CustomMenuButton } from 'components/toolbar/ActionToolbars';
import { ProjectParticipantsI18N } from 'constants/i18n';
import { DialogContext } from 'contexts/dialogContext';
import { APIError } from 'hooks/api/useAxios';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { CodeSet } from 'interfaces/useCodesApi.interface';
import { IGetProjectParticipant } from 'interfaces/useProjectApi.interface';
import React, { useContext } from 'react';

export interface IChangeProjectRoleMenuProps {
  participant: IGetProjectParticipant;
  projectRoleCodes: CodeSet;
  refresh: () => void;
}

const ProjectParticipantsRoleMenu: React.FC<IChangeProjectRoleMenuProps> = (props) => {
  const { participant, projectRoleCodes, refresh } = props;

  const dialogContext = useContext(DialogContext);
  const biohubApi = useBiohubApi();

  const showErrorDialog = (textDialogProps?: Partial<IErrorDialogProps>) => {
    dialogContext.setErrorDialog({
      dialogTitle: ProjectParticipantsI18N.updateParticipantRoleErrorTitle,
      dialogText: ProjectParticipantsI18N.updateParticipantRoleErrorText,
      open: true,
      onClose: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      onOk: () => {
        dialogContext.setErrorDialog({ open: false });
      },
      ...textDialogProps
    });
  };

  const handleChangeUserPermissionsClick = (item: IGetProjectParticipant, newRole: string, newRoleId: number) => {
    dialogContext.setYesNoDialog({
      dialogTitle: 'Change Project Role?',
      dialogContent: (
        <Typography variant="body1" color="textSecondary">
          Change user <strong>{item.user_identifier}</strong>'s role to <strong>{newRole}</strong>?
        </Typography>
      ),
      yesButtonLabel: 'Change Role',
      noButtonLabel: 'Cancel',
      yesButtonProps: { color: 'primary' },
      open: true,
      onClose: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onNo: () => {
        dialogContext.setYesNoDialog({ open: false });
      },
      onYes: () => {
        changeProjectParticipantRole(item, newRole, newRoleId);
        dialogContext.setYesNoDialog({ open: false });
      }
    });
  };

  const changeProjectParticipantRole = async (item: IGetProjectParticipant, newRole: string, newRoleId: number) => {
    if (!item?.project_participation_id) {
      return;
    }

    try {
      const status = await biohubApi.projectParticipants.updateProjectParticipantRole(
        item.project_id,
        item.project_participation_id,
        newRoleId
      );

      if (!status) {
        showErrorDialog();
        return;
      }

      dialogContext.setSnackbar({
        open: true,
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

  return (
    <CustomMenuButton
      buttonLabel={participant.project_role_names[0] || ''}
      buttonTitle={'Change Project Role'}
      buttonProps={{ variant: 'outlined', size: 'small' }}
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
