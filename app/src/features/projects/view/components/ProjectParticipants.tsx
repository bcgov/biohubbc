import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { ProjectContext } from 'contexts/projectContext';
import { useContext } from 'react';

/**
 * Participants of a project.
 *
 * @return {*}
 */
const ProjectParticipants = () => {
  const projectContext = useContext(ProjectContext);
  const projectData = projectContext.projectDataLoader.data;

  if (!projectData) {
    return <></>;
  }

  const projectParticipants = projectData.projectData.participants;

  return (
    <>
      <List disablePadding>
        {projectParticipants.length > 0 ? (
          <>
            {projectParticipants.map((participant) => (
              <ListItem disableGutters divider key={participant.system_user_id}>
                <Box flex="1 1 auto">
                  <Box>
                    <Typography>{participant.system_user_id}</Typography>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </>
        ) : (
          <ListItem disableGutters>
            <Typography>No Project Participants</Typography>
          </ListItem>
        )}
      </List>
    </>
  );
};

export default ProjectParticipants;
