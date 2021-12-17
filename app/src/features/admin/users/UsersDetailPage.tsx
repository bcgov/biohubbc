import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { IErrorDialogProps } from '../../../components/dialog/ErrorDialog';
import { IYesNoDialogProps } from '../../../components/dialog/YesNoDialog';
import { DialogContext, ISnackbarProps } from '../../../contexts/dialogContext';
import { useBiohubApi } from '../../../hooks/useBioHubApi';
import { IGetProjectParticipantsResponse } from '../../../interfaces/useProjectApi.interface';
import { IGetUserResponse } from '../../../interfaces/useUserApi.interface';
import UsersDetailHeader from './UsersDetailHeader';
import UsersDetailProjects from './UsersDetailProjects';
import CircularProgress from '@material-ui/core/CircularProgress';

export type IShowSnackBar = (textDialogProps?: Partial<ISnackbarProps>) => void;

export type IOpenYesNoDialog = (yesNoDialogProps?: Partial<IYesNoDialogProps>) => void;

export type IOpenErrorDialog = (errorDialogProps?: Partial<IErrorDialogProps>) => void;

export type ICheckForProjectLead = (
  projectParticipants: IGetProjectParticipantsResponse,
  projectParticipationId: number
) => boolean;

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

  const [selectedUser, setSelectedUser] = useState<IGetUserResponse>(userDetails);

  const getUser = async () => {
    var id = window.location.pathname.replace(/^\D+/g, '');
    const user = await biohubApi.user.getUserById(Number(id));
    setSelectedUser(user);
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

  if(selectedUser === undefined){
    return <CircularProgress className="pageProgress" size={40} />;
  }

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
