import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Information about team members in a Project
 *
 * @returns {*}
 */
export const SupportTeam = () => (
  <Stack gap={5} mb={3}>
    <Box>
      <Typography>
        Project teams are groups of people who collaboratively manage data and information. Each team member in a
        Project has a specific role that determines what they can do in the workspace.
      </Typography>
    </Box>

    <Stack gap={5}>
      <Box>
        <Typography fontWeight={700} variant="h4" mb={2}>
          Roles
        </Typography>
        <Typography gutterBottom>
          The person who created the Project will be a Coordinator by default, letting them invite others to the
          workspace. There must be at least one Coordinator at all times, but you can also have multiple Coordinators. A
          team member's role can be changed at any time.
        </Typography>
      </Box>

      <Box>
        <Typography fontWeight={700} variant="h5" mb={2}>
          Coordinators
        </Typography>
        <Typography variant="body1" gutterBottom>
          Team members with the Coordinator role have the following privileges:
        </Typography>
        <List sx={{ listStyleType: 'disc', '& .MuiListItem-root': { ml: 5, alignItems: 'center' } }}>
          <ListItem sx={{ display: 'list-item' }}>Invite and remove team members</ListItem>
          <ListItem sx={{ display: 'list-item' }}>Create, edit and delete Surveys</ListItem>
          <ListItem sx={{ display: 'list-item' }}>Create and delete Project attachments</ListItem>
          <ListItem sx={{ display: 'list-item' }}>Edit and delete the Project</ListItem>
        </List>
      </Box>

      <Box>
        <Typography fontWeight={700} variant="h5" mb={2}>
          Collaborators
        </Typography>
        <Typography variant="body1" gutterBottom>
          Team members with the Collaborator role have the following privileges:
        </Typography>
        <List sx={{ listStyleType: 'disc', '& .MuiListItem-root': { ml: 5, alignItems: 'center' } }}>
          <ListItem sx={{ display: 'list-item' }}>Create, edit and delete Surveys</ListItem>
          <ListItem sx={{ display: 'list-item' }}>Create and delete Project attachments</ListItem>
        </List>
      </Box>

      <Box>
        <Typography fontWeight={700} variant="h5" mb={2}>
          Observer
        </Typography>
        <Typography variant="body1" gutterBottom>
          Team members with the Observer role have the following privileges:
        </Typography>
        <List sx={{ listStyleType: 'disc', '& .MuiListItem-root': { ml: 5, alignItems: 'center' } }}>
          <ListItem sx={{ display: 'list-item' }}>Read-only access to information in the Project</ListItem>
        </List>
      </Box>
    </Stack>
  </Stack>
);
