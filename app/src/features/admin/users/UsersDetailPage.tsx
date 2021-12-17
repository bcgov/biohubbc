import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import { IYesNoDialogProps } from '../../../components/dialog/YesNoDialog';
import { IErrorDialogProps } from '../../../components/dialog/ErrorDialog';
import { DialogContext, ISnackbarProps } from '../../../contexts/dialogContext';
import UsersDetailHeader from './UsersDetailHeader';
import UsersDetailProjects from './UsersDetailProjects';
import { IGetUserResponse } from '../../../interfaces/useUserApi.interface';
import { IGetProjectParticipantsResponse } from '../../../interfaces/useProjectApi.interface';
import { IShowSnackBar, IOpenErrorDialog, IOpenYesNoDialog, ICheckForProjectLead } from './UserDetailFunctionTypes';
import { useBiohubApi } from '../../../hooks/useBioHubApi';
import React, { useCallback, useEffect, useState, useContext } from 'react';

export interface IUsersHeaderProps {
  history: any;
}

/**
 * Page to display user details.
 *
 * @return {*}
 */
const UsersDetailPage: React.FC<IUsersHeaderProps> = (props) => {
  const { history } = props;
  const biohubApi = useBiohubApi();
  let userDetails = history?.location?.state;

  const dialogContext = useContext(DialogContext);

  let temp: IGetUserResponse = {
    id: 1,
    user_record_end_date: '',
    user_identifier: '',
    role_names: ['']
  };

  const [selectedUser, setSelectedUser] = useState<IGetUserResponse>(userDetails !== undefined ? userDetails : temp);

  const getUser = async () => {
    var id = window.location.pathname.replace(/^\D+/g, '');
    const user = await biohubApi.user.getUserById(Number(id));
    console.log(JSON.stringify(user));
    setSelectedUser(user);
    return user;
  };

  useEffect(() => {
    getUser();
  }, []);

  const showSnackBar: IShowSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => {
    dialogContext.setSnackbar({ ...textDialogProps, open: true });
  };

  const defaultErrorDialogProps: Partial<IErrorDialogProps> = {
    onClose: () => dialogContext.setErrorDialog({ open: false }),
    onOk: () => dialogContext.setErrorDialog({ open: false })
  };

  const defaultYesNoDialogProps: Partial<IYesNoDialogProps> = {
    onClose: () => dialogContext.setYesNoDialog({ open: false }),
    onNo: () => dialogContext.setYesNoDialog({ open: false })
  };

  const openYesNoDialog: IOpenYesNoDialog = (yesNoDialogProps?: Partial<IYesNoDialogProps>) => {
    dialogContext.setYesNoDialog({
      ...defaultYesNoDialogProps,
      ...yesNoDialogProps,
      open: true
    });
  };

  const openErrorDialog: IOpenErrorDialog = useCallback(
    (errorDialogProps?: Partial<IErrorDialogProps>) => {
      dialogContext.setErrorDialog({
        ...defaultErrorDialogProps,
        ...errorDialogProps,
        open: true
      });
    },
    [defaultErrorDialogProps, dialogContext]
  );

  const checkForProjectLead: ICheckForProjectLead = (
    projectParticipants: IGetProjectParticipantsResponse,
    projectParticipationId: number
  ): boolean => {
    for (const participant of projectParticipants.participants) {
      if (participant.project_participation_id !== projectParticipationId && participant.project_role_id === 1) {
        return true;
      }
    }
    return false;
  };

  return (
    <>
      <UsersDetailHeader
        userDetails={selectedUser}
        showSnackBar={showSnackBar}
        openYesNoDialog={openYesNoDialog}
        openErrorDialog={openErrorDialog}
        checkForProjectLead={checkForProjectLead}
      />

      <Container maxWidth="xl">
        <Box my={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={12}>
              <Box>
                <UsersDetailProjects
                  userDetails={selectedUser}
                  showSnackBar={showSnackBar}
                  openYesNoDialog={openYesNoDialog}
                  openErrorDialog={openErrorDialog}
                  checkForProjectLead={checkForProjectLead}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default UsersDetailPage;
