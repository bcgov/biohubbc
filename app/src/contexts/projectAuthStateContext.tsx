import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetUserProjectParticipantResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useContext } from 'react';
import { useParams } from 'react-router';
import { AuthStateContext } from './authStateContext';

export interface IProjectAuthStateContext {
  getProjectParticipant: () => IGetUserProjectParticipantResponse['participant'];
  hasProjectRole: (validProjectRoles?: string[]) => boolean;
  hasSystemRole: (validSystemRoles?: string[]) => boolean;
  getProjectId: () => number;
  hasLoadedParticipantInfo: boolean;
}

export const ProjectAuthStateContext = React.createContext<IProjectAuthStateContext>({
  getProjectParticipant: () => null,
  hasProjectRole: () => false,
  hasSystemRole: () => false,
  getProjectId: () => -1,
  hasLoadedParticipantInfo: false
});

export const ProjectAuthStateContextProvider: React.FC = (props) => {
  const biohubApi = useBiohubApi();
  const urlParams = useParams();
  const { keycloakWrapper } = useContext(AuthStateContext);
  
  const participantDataLoader = useDataLoader((projectId: number) => biohubApi.project.getUserProjectParticipant(projectId))

  const getProjectId = useCallback(() => {
    return Number(urlParams['id']);
  }, [urlParams]);

  const getProjectParticipant = () => {
    return participantDataLoader.data?.participant || null;
  }

  const hasProjectRole = (validProjectRoles?: string[]): boolean => {
    if (!validProjectRoles || !validProjectRoles.length) {
      return true;
    }

    const participant = getProjectParticipant();
    const projectId = getProjectId();

    if (!participant) {
      return false;
    }

    return participant?.project_id === projectId
      && participant?.project_role_names.some((roleName) => validProjectRoles.includes(roleName));
  };

  const hasSystemRole = (validSystemRoles?: string[]): boolean => {
    if (!validSystemRoles || !validSystemRoles.length) {
      return true;
    }

    return !!keycloakWrapper && keycloakWrapper.hasSystemRole(validSystemRoles);
  }

  React.useEffect(() => {
    participantDataLoader.refresh(getProjectId());
  }, [getProjectId]);

  return (
    <ProjectAuthStateContext.Provider
      value={{
        hasProjectRole,
        hasSystemRole,
        getProjectParticipant,
        getProjectId,
        hasLoadedParticipantInfo: participantDataLoader.isReady || Boolean(
          participantDataLoader.data?.participant && participantDataLoader.data?.participant?.project_id === getProjectId()
        ),
      }}>
      {props.children}
    </ProjectAuthStateContext.Provider>
  );
};
