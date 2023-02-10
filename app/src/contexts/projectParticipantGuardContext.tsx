import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetUserProjectParticipantResponse } from 'interfaces/useProjectApi.interface';
import React, { useRef } from 'react';
import { useParams } from 'react-router';

export interface IProjectParticipantGuard {
  participant: IGetUserProjectParticipantResponse['participant'] | null;
  projectId: number;
  isLoading: boolean;
}

export const ProjectParticipantGuardContext = React.createContext<IProjectParticipantGuard>({
  participant: null,
  projectId: -1,
  isLoading: false
});

export const ProjectParticipantGuardContextProvider: React.FC = (props) => {
  const biohubApi = useBiohubApi();
  const [participant, setParticipant] = React.useState<IGetUserProjectParticipantResponse['participant'] | null>(null);
  const isLoading = useRef<boolean>(false);
  const urlParams = useParams();

  const projectId = Number(urlParams['id']);
  console.log({ projectId })

  React.useEffect(() => {
    if (!projectId || isLoading.current) {
      return;
    }

    isLoading.current = true;

    biohubApi.project.getUserProjectParticipant(projectId)
      .then((response) => setParticipant(response.participant))
      .catch((_error) => setParticipant(null))
      .finally(() => {
        isLoading.current = false;
      });
  }, [projectId]);

  return (
    <ProjectParticipantGuardContext.Provider
      value={{
        participant,
        projectId,
        isLoading: isLoading.current
      }}>
      {props.children}
    </ProjectParticipantGuardContext.Provider>
  );
};
