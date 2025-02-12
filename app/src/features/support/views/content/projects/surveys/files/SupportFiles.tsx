import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Information about Files
 *
 * @returns {*}
 */
export const SupportFiles = () => (
  <Stack gap={5} mb={3}>
    <Box>
      <Typography>
        You can add supplementary information to your Survey by uploading attachments. This lets you store information
        beyond the main data types.
      </Typography>
    </Box>
    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Common Attachments
      </Typography>
      <Typography gutterBottom>Here are some items that you that you might upload as Survey attachments:</Typography>
      <List sx={{ listStyleType: 'disc', '& .MuiListItem-root': { ml: 5 }, mb: 2 }}>
        <ListItem sx={{ display: 'list-item' }}>Maps</ListItem>
        <ListItem sx={{ display: 'list-item' }}>Photographs</ListItem>
        <ListItem sx={{ display: 'list-item' }}>Original data files</ListItem>
        <ListItem sx={{ display: 'list-item' }}>Spatial files</ListItem>
      </List>
    </Box>
    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Project vs. Survey Attachments
      </Typography>
      <Typography gutterBottom mb={2}>
        Attachments can be added to Projects or Surveys, but you should put data-related files in the relevant Survey.
        Project-level attachments should be more general information that your team needs to store and that you wouldn't
        include if you were sharing your dataset.
      </Typography>
      <Typography gutterBottom>Here are some good examples of Project-level attachments:</Typography>
      <List sx={{ listStyleType: 'disc', '& .MuiListItem-root': { ml: 5 }, mb: 2 }}>
        <ListItem sx={{ display: 'list-item' }}>Species identification guides</ListItem>
        <ListItem sx={{ display: 'list-item' }}>Meeting notes</ListItem>
        <ListItem sx={{ display: 'list-item' }}>Draft documents</ListItem>
      </List>
    </Box>
  </Stack>
);
