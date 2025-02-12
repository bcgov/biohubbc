import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { PROJECT_ROLE_ICONS } from 'constants/roles';

/**
 * Information about Projects
 *
 * @returns {*}
 */
export const SupportProjects = () => (
  <Stack gap={5} mb={3}>
    <Box>
      <Typography >
        Projects are collaborative workspaces that only you and your team can access, keeping you in control of the data
        that you upload. Projects help ensure your whole team can access shared information, and with appropriate
        permissions.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Team Members
      </Typography>
      <Typography variant="body1" gutterBottom >
        The Project team is the group of people who can access the Project. When you invite someone to a Project, you'll
        give them a specific <strong>role</strong> determining their permissions:
      </Typography>
      <List sx={{ '& .MuiListItem-root': { ml: 1, alignItems: 'center' } }}>
        <ListItem sx={{ alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon path={PROJECT_ROLE_ICONS['Coordinator']} size={0.75} style={{ color: grey[600] }} />
            <Typography>
              <strong>Coordinators</strong> can add and edit information, manage the Project team and roles, and publish
              data
            </Typography>
          </Stack>
        </ListItem>
        <ListItem sx={{ alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon path={PROJECT_ROLE_ICONS['Collaborator']} size={0.75} style={{ color: grey[600] }} />
            <Typography>
              <strong>Collaborators</strong> can add and edit information, but not manage the team or publish
            </Typography>
          </Stack>
        </ListItem>
        <ListItem sx={{ alignItems: 'center' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Icon path={PROJECT_ROLE_ICONS['Observer']} size={0.75} style={{ color: grey[600] }} />
            <Typography>
              <strong>Observers</strong> can only view information
            </Typography>
          </Stack>
        </ListItem>
      </List>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Surveys
      </Typography>
      <Typography variant="body1" gutterBottom >
        Surveys contain the ecological data that you collected. Surveys are like subfolders in a
        Project that the whole team can access. Whether a team member can add, edit or only view Survey data depends on
        their role in the Project.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        When do I make a Project?
      </Typography>
      <Typography variant="body1" gutterBottom >
        You can create a new Project whenever you need to share information with a new group of collaborators. We
        recommend organizing Projects in a way that focuses on giving people access to information instead of grouping
        related data&mdash;Surveys are designed to group related data, Projects are designed to control access to data. Keep in mind that all team members can see all
        Surveys in a Project.
      </Typography>
    </Box>
  </Stack>
);
