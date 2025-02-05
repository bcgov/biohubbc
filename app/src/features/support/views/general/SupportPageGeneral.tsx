import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';

export const SupportPageGeneral = () => {
  return (
    <Box>
      <Typography variant="h2" gutterBottom>
        General
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography paragraph>
        The Species Inventory Management System (SIMS) is a platform designed for teams to collaboratively manage fish
        and wildlife data in British Columbia. It aims to support fish and wildlife projects by enabling collaboration
        and promoting high-quality, standardized data.
      </Typography>
      <Typography>The platform can be used to manage a variety of information but focuses on: </Typography>
      <List sx={{ mb: 1, listStyleType: 'disc', ml: 5, '& .MuiListItem-root': { pb: 0 } }}>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="Species observations" />
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="Animal telemetry" />
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="Animal capture and mortality events" />
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="Sampling information" />
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <ListItemText primary="Reports" />
        </ListItem>
      </List>

      <Stack gap={2} mt={3} mb={5}>
        <AccordionStandardCard
          label="What is the Species Inventory Management System?"
          subtitle="SIMS is a collaborative platform for managing fish and wildlife data. It offers simple data uploads, interactive maps, and collaborative features for teams to easily organize, manage, and share information."
          colour={grey[50]}
        />
        <AccordionStandardCard
          label="Who can use the Species Inventory Management System?"
          subtitle="SIMS is designed for government staff, contractors, and partners of the Province who intend to submit or share fish and wildlife information. You must have an IDIR or BCeID to log in."
          colour={grey[50]}
        />
      </Stack>

      <Typography component="legend" gutterBottom>
        Getting Started
      </Typography>

      <Typography paragraph>
        If you're new to SIMS, we recommend reviewing the user guide and getting familiar with the key concepts.
        Detailed documentation and support resources are available to help you make the most of the platform.
      </Typography>

      <Stack gap={2} mt={3}>
        <AccordionStandardCard
          label="How do I gain access?"
          subtitle="When you first login with an IDIR or BCeID, you will be prompted to submit an access request describing how you intend to use the platform. After a system administrator approves your request, you will be able to create and get invited to Projects the next time you log in."
          colour={grey[50]}
        />
        <AccordionStandardCard
          label="How do I view my team's project?"
          subtitle="You can only access Projects you have created or been invited to. To view your team's Project, you'll need to ask your team to invite you."
          colour={grey[50]}
        />
        <AccordionStandardCard
          label="How do I collaborate?"
          subtitle="You should start by creating a Project, which is like a folder containing related information. When creating a Project, you'll be able to search for people and assign them an appropriate role in that Project."
          colour={grey[50]}
        />
      </Stack>
    </Box>
  );
};
