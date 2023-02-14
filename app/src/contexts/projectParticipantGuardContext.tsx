import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetUserProjectParticipantResponse } from 'interfaces/useProjectApi.interface';
import React, { useCallback, useState } from 'react';
import { useParams } from 'react-router';

export interface IProjectParticipantGuard {
  participant: IGetUserProjectParticipantResponse['participant'] | null;
  projectId: number;
  isReady: boolean;
}

export const ProjectParticipantGuardContext = React.createContext<IProjectParticipantGuard>({
  participant: null,
  projectId: -1,
  isReady: false
});

export const ProjectParticipantGuardContextProvider: React.FC = (props) => {
  const biohubApi = useBiohubApi();
  const [participant, setParticipant] = useState<IGetUserProjectParticipantResponse['participant'] | null>(null);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const urlParams = useParams();

  const projectId: string | number | undefined = urlParams['id'];

  const fetchProjectParticipant = useCallback(async () => {
    try {
      setIsReady(false);
      setIsLoading(true);

      const response = await biohubApi.project.getUserProjectParticipant(urlParams['id']);
      setParticipant(response.participant);
    } catch (error) {
      setParticipant(null);
    } finally {
      setIsReady(true);
      setIsLoading(false);
    }
  }, [biohubApi.project.getUserProjectParticipant, urlParams])

  React.useEffect(() => {
    if (!isLoading) {
      fetchProjectParticipant();
    }
  }, [urlParams]);

  return (
    <ProjectParticipantGuardContext.Provider
      value={{
        participant,
        projectId: Number(projectId),
        isReady
      }}>
      {props.children}
    </ProjectParticipantGuardContext.Provider>
  );
};
