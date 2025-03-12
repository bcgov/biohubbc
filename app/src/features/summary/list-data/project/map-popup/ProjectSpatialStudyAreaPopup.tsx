import { TeamMemberAvatar } from 'features/projects/view/components/TeamMemberAvatar';
import { SurveyMapPopup } from 'features/surveys/view/SurveyMapPopup';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useMemo } from 'react';
import { Popup } from 'react-leaflet';

import { useHistory } from 'react-router';
import { getRandomHexColor } from 'utils/Utils';

interface IProjectSpatialStudyAreaPopupProps {
  projectId: number;
}

/**
 * Returns information about a project with an action button for opening the project
 *
 * @param {IProjectSpatialStudyAreaPopupProps} props
 * @returns {*}
 */
export const ProjectSpatialStudyAreaPopup = (props: IProjectSpatialStudyAreaPopupProps) => {
  const { projectId } = props;

  const biohubApi = useBiohubApi();
  const history = useHistory();

  const projectDataLoader = useDataLoader(() => biohubApi.project.getProjectForView(projectId));

  const popupMetadata = useMemo(() => {
    if (!projectDataLoader.data) {
      return [];
    }

    return [
      { label: 'Project', value: projectDataLoader.data.projectData.project.project_name },
      {
        label: 'Members',
        value: projectDataLoader.data.projectData.participants.map((participant) => (
          <TeamMemberAvatar
            key={participant.system_user_id}
            tooltip={participant.display_name}
            label={participant.display_name
              .split(',')
              .map((name) => name.trim().slice(0, 1).toUpperCase())
              .reverse()
              .join('')}
            color={getRandomHexColor(participant.system_user_id)}
          />
        ))
      }
    ];
  }, [projectDataLoader.data]);

  return (
    <Popup
      keepInView={false}
      closeButton={true}
      autoPan={true}
      maxWidth={450}
      eventHandlers={{
        add: async () => {
          projectDataLoader.load();
        }
      }}>
      <SurveyMapPopup
        isLoading={projectDataLoader.isLoading}
        title="Project Details"
        metadata={popupMetadata}
        key={`project-popup-${projectId}`}
        actionButtonLabel="Open Project"
        handleActionButtonClick={() => history.push(`/admin/projects/${projectId}/details`)}
      />
    </Popup>
  );
};
