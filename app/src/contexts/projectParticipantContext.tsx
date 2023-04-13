import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IGetUserProjectParticipantResponse } from 'interfaces/useProjectApi.interface';
import React, { useContext } from 'react';
import { ProjectContext } from './projectContext';

export interface IProjectParticipantContext {
  participantDataLoader: DataLoader<[projectId: number], IGetUserProjectParticipantResponse, unknown>;
  projectId: string | number | undefined;
}

export const ProjectParticipantContext = React.createContext<IProjectParticipantContext>({
  participantDataLoader: {} as DataLoader<[projectId: number], IGetUserProjectParticipantResponse, unknown>,
  projectId: -1
});

export const ProjectParticipantContextProvider: React.FC = (props) => {
  const biohubApi = useBiohubApi();
  const projectContext = useContext(ProjectContext);
  
  const participantDataLoader = useDataLoader((projectId: number) => biohubApi.project.getUserProjectParticipant(projectId))
  const { projectId } = projectContext;

  React.useEffect(() => {
    participantDataLoader.refresh(projectId);
  }, [projectId]);

  return (
    <ProjectParticipantContext.Provider
      value={{
        participantDataLoader,
        projectId
      }}>
      {props.children}
    </ProjectParticipantContext.Provider>
  );
};
