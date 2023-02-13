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
  console.log({ projectId, participant, isReady: isReady });

  const fetchProjectParticipant = useCallback(async () => {

    try {
      const response = await biohubApi.project.getUserProjectParticipant(urlParams['id']);
      if (!response.participant) {
        return;
      }
  
      setParticipant(response.participant);
    } catch (error) {
      setParticipant(null);
    } finally {
      setIsReady(true);
      setIsLoading(false);
    }
  }, [biohubApi.project, urlParams])

  React.useEffect(() => {
    console.log([isLoading, participant, fetchProjectParticipant])

    if (!isLoading && !participant) {
      fetchProjectParticipant();
      setIsLoading(true);
      setIsReady(false);
    }
  }, [isLoading, participant, fetchProjectParticipant]);

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
