import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader, { DataLoader } from 'hooks/useDataLoader';
import { IGetUserProjectParticipantResponse } from 'interfaces/useProjectApi.interface';
import React from 'react';
import { useParams } from 'react-router';

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
  const urlParams = useParams();

  const participantDataLoader = useDataLoader((projectId: number) => biohubApi.project.getUserProjectParticipant(projectId))

  React.useEffect(() => {
    participantDataLoader.refresh(Number(urlParams['id']));
  }, [urlParams]);

  return (
    <ProjectParticipantContext.Provider
      value={{
        participantDataLoader,
        projectId: urlParams['id']
      }}>
      {props.children}
    </ProjectParticipantContext.Provider>
  );
};
