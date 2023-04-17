import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { IGetUserProjectParticipantResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useContext, useMemo } from 'react';
import { matchPath, useLocation } from 'react-router';
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
  const participantDataLoader = useDataLoader((projectId: number) =>
    biohubApi.project.getUserProjectParticipant(projectId)
  );
  const { keycloakWrapper } = useContext(AuthStateContext);

  const location = useLocation();
  const match = matchPath(location.pathname, {
    path: '/admin/projects/:id',
    exact: false,
    strict: false
  });

  const projectId: string | number | null = match?.params['id'];

  const getProjectId = useCallback(() => {
    return Number(projectId);
  }, [projectId]);

  const getProjectParticipant = useCallback(() => {
    return participantDataLoader.data?.participant || null;
  }, [participantDataLoader.data]);

  const hasProjectRole = useCallback(
    (validProjectRoles?: string[]): boolean => {
      if (!validProjectRoles || !validProjectRoles.length) {
        return true;
      }

      const participant = getProjectParticipant();

      if (!participant) {
        return false;
      }

      return (
        participant?.project_id === getProjectId() &&
        participant?.project_role_names.some((roleName) => validProjectRoles.includes(roleName))
      );
    },
    [getProjectId, getProjectParticipant]
  );

  const hasSystemRole = useCallback(
    (validSystemRoles?: string[]): boolean => {
      if (!validSystemRoles || !validSystemRoles.length) {
        return true;
      }

      return !!keycloakWrapper && keycloakWrapper.hasSystemRole(validSystemRoles);
    },
    [keycloakWrapper]
  );

  React.useEffect(() => {
    // If perceived projectId does not differ from the currently loaded participant, skip refresh
    if (!projectId || projectId === participantDataLoader.data?.participant?.project_id) {
      return;
    }

    participantDataLoader.refresh(getProjectId());
  }, [getProjectId]);

  const projectAuthStateContext: IProjectAuthStateContext = useMemo(
    () => ({
      hasProjectRole,
      hasSystemRole,
      getProjectParticipant,
      getProjectId,
      hasLoadedParticipantInfo:
        participantDataLoader.isReady ||
        Boolean(
          participantDataLoader.data?.participant &&
            participantDataLoader.data?.participant?.project_id === getProjectId()
        )
    }),
    [
      hasProjectRole,
      hasSystemRole,
      getProjectParticipant,
      getProjectId,
      participantDataLoader.isReady,
      participantDataLoader.data
    ]
  );

  return (
    <ProjectAuthStateContext.Provider value={projectAuthStateContext}>
      {props.children}
    </ProjectAuthStateContext.Provider>
  );
};
