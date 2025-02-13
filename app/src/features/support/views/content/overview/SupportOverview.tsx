import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * General information about the Species Inventory Management System
 *
 * @returns {*}
 */
export const SupportOverview = () => (
  <Stack gap={5} mb={3}>
    <Box>
      <Typography gutterBottom key="gensims1">
        The Species Inventory Management System helps you and your team collaboratively manage fish and wildlife data.
      </Typography>
      <List sx={{ listStyleType: 'disc', '& .MuiListItem-root': { ml: 5 } }}>
        <ListItem sx={{ display: 'list-item' }}>
          Upload species observations, animal telemetry, and other information to <strong>shared workspaces</strong>{' '}
          that are private to your team
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          Plot your data on <strong>interactive maps</strong> and gain insights into demographics or population trends
          through easy analytics
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          Publish data to BiodiversityHub BC and the BC Geographic Warehouse to help{' '}
          <strong>protect biodiversity</strong> in British Columbia
        </ListItem>
      </List>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Work Together
      </Typography>
      <Typography variant="body1" gutterBottom>
        The Species Inventory Management System simplifies data sharing with collaborators through&nbsp;
        <strong>Projects</strong>. When you make a Project, only you and your team can access and manage the information
        in that Project.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Simplify Data Management
      </Typography>
      <Typography variant="body1" gutterBottom>
        Add data to <strong>Surveys</strong> to start gaining insights into species distributions, demographics, and
        more through interactive maps and quick analytics. Surveys help you structure data in alignment with provincial
        standards, enabling comparisons to other datasets and simplifying data management.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Modernizing Legacy Systems
      </Typography>
      <Typography variant="body1" gutterBottom>
        The Species Inventory Management System is part of modernizing British Columbia's legacy fish and wildlife data
        systems. The Species Inventory Management System will partly replace the Species Inventory (SPI) database, which
        stores decades worth of fish and wildlife data from across British Columbia. The historical data stored in SPI
        will be moved into the Species Inventory Management System for easier management.
      </Typography>
    </Box>
  </Stack>
);
