import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Information about Surveys
 *
 * @returns {*}
 */
export const SupportSurveys = () => (
  <Stack gap={5} mb={3}>
    <Box>
      <Typography key="project-components-2">
        Surveys represent efforts to collect ecological data. Surveys often reflect actual ecological surveys done in
        the field, motivated by a population or area of interest. You should think of Surveys as subfolders to a Project
        that let you separate distinct data collected for different objectives.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h3" mb={2}>
        Parts of a Survey
      </Typography>
      <Typography gutterBottom key="gensims2">
        Surveys have four main parts: sampling information, data, attachments, and metadata. Collectively, these
        comprise all the information necessary to understand and ideally recreate your study. Separating these parts
        helps you organize your data in a simple, step-by-step way.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Sampling
      </Typography>
      <Typography gutterBottom key="gensims2">
        The sampling information in a Survey describes precisely <strong>where</strong>, <strong>when</strong>, and{' '}
        <strong>how</strong> you collected data:
      </Typography>
      <List sx={{ listStyleType: 'disc', '& .MuiListItem-root': { ml: 5 }, mb: 2 }}>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography>
            <strong>Sampling sites</strong> show exactly where data was collected, which might be at a point, transect,
            or area
          </Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography>
            <strong>Techniques</strong> represent methods used to collect data, such as camera traps or aerial transects
          </Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography>
            <strong>Periods</strong> describe exactly when you performed a technique at a sampling site
          </Typography>
        </ListItem>
      </List>
      <Typography gutterBottom key="gensims2">
        Sampling information is important because it lets you know <strong>sampling effort</strong>, which you can use
        to improve your analyses. Without rigorous sampling information, it's hard to know whether a species was absent
        from your data because it doesn't occur in the area or the area just wasn't sampled.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Data
      </Typography>
      <Typography gutterBottom key="gensims2">
        We use the term <i>data</i> for the results of your Survey&mdash;the values or patterns that you measured.
        Surveys let you manage multiple types of data:
      </Typography>
      <List sx={{ listStyleType: 'disc', '& .MuiListItem-root': { ml: 5 } }}>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography>
            <strong>Species observations</strong> are counts of species at specific locations and times
          </Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography>
            <strong>Telemetry</strong> is animal movement data typically recorded by a GPS device
          </Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography>
            <strong>Animals</strong> are uniquely recognized individuals that are typically captured and marked
          </Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography>
            <strong>Habitat features</strong> are ecologically significant landscape features (eg. mineral licks, dens,
            cavities)
          </Typography>
        </ListItem>
      </List>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Attachments
      </Typography>
      <Typography gutterBottom key="gensims2">
        Attachments are supplementary files with extra information about the Survey. They may include data beyond
        species observations, telemetry, and other recognized data types, as well as maps or other information that
        supplements your data.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Metadata
      </Typography>
      <Typography gutterBottom key="gensims2">
        We use the term <i>metadata</i> for all the information entered when creating the Survey. This includes your
        species of interest, survey area, and objectives. These details give important context and add value to your
        data.
      </Typography>
    </Box>
  </Stack>
);
