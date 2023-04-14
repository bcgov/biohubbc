import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetUserProjectParticipantResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback } from 'react';
import { useParams } from 'react-router';

export interface IProjectAuthStateContext {
  getProjectParticipant: () => IGetUserProjectParticipantResponse['participant'];
  hasProjectRole: (validProjectRoles?: string[]) => boolean;
  getProjectId: () => number;
  hasLoadedParticipantInfo: boolean;
}

export const ProjectAuthStateContext = React.createContext<IProjectAuthStateContext>({
  getProjectParticipant: () => null,
  hasProjectRole: (validProjectRoles?: string[]) => false,
  getProjectId: () => -1,
  hasLoadedParticipantInfo: false
});

export const ProjectAuthStateContextProvider: React.FC = (props) => {
  const biohubApi = useBiohubApi();
  const urlParams = useParams();
  
  const participantDataLoader = useDataLoader((projectId: number) => biohubApi.project.getUserProjectParticipant(projectId))

  const getProjectId = useCallback(() => {
    return Number(urlParams['id']);
  }, [urlParams]);

  const getProjectParticipant = () => {
    return participantDataLoader.data?.participant || null;
  }

  const hasProjectRole = (validProjectRoles?: string[]) => {
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

  React.useEffect(() => {
    participantDataLoader.refresh(getProjectId());
  }, [getProjectId]);

  return (
    <ProjectAuthStateContext.Provider
      value={{
        hasProjectRole,
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
