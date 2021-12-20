import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useBiohubApi } from '../../../hooks/useBioHubApi';
import { IGetProjectParticipantsResponse } from '../../../interfaces/useProjectApi.interface';
import { IGetUserResponse } from '../../../interfaces/useUserApi.interface';
import UsersDetailHeader from './UsersDetailHeader';
import UsersDetailProjects from './UsersDetailProjects';

export type ICheckForProjectLead = (
  projectParticipants: IGetProjectParticipantsResponse,
  projectParticipationId: number
) => boolean;

/**
 * Page to display user details.
 *
 * @return {*}
 */
const UsersDetailPage: React.FC = (props) => {
  const urlParams = useParams();
  const biohubApi = useBiohubApi();

  const [selectedUser, setSelectedUser] = useState<IGetUserResponse | null>(null);

  const getUser = async () => {
    var id = urlParams['id'];
    const user = await biohubApi.user.getUserById(Number(id));
    setSelectedUser(user);
  };

  useEffect(() => {
    if (selectedUser) {
      return;
    }

    getUser();
  }, [getUser, selectedUser]);

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

  if (!selectedUser) {
    return <CircularProgress className="pageProgress" size={40} />;
  }

  return (
    <>
      <UsersDetailHeader userDetails={selectedUser} checkForProjectLead={checkForProjectLead} />

      <Container maxWidth="xl">
        <Box my={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} lg={12}>
              <Box>
                <UsersDetailProjects userDetails={selectedUser} checkForProjectLead={checkForProjectLead} />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </>
  );
};

export default UsersDetailPage;
