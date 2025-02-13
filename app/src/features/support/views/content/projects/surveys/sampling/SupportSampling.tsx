import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Information about Sampling
 *
 * @returns {*}
 */
export const SupportSampling = () => (
  <Stack gap={5} mb={3}>
    <Box>
      <Typography>
        The sampling information in a Survey describes exactly where, when, and how you collected data. The term
        sampling is used because we often collect just a sample of ecological data to represent the area of interest,
        saving us from having to collect data everywhere.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Sampling Site
      </Typography>
      <Typography gutterBottom>
        A sampling site is a location where data is collected. Sampling sites can be points, transects, or areas,
        depending on how you sampled:
      </Typography>
      <List sx={{ listStyleType: 'disc', '& .MuiListItem-root': { ml: 5 }, mb: 2 }}>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography>
            <strong>Points</strong> should represent fixed locations where data was collected
          </Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography>
            <strong>Transects</strong> should represent paths that data were collected along, including flight paths
          </Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography>
            <strong>Areas</strong> should represent bigger areas that data were collected in
          </Typography>
        </ListItem>
      </List>
      <Typography fontWeight={700} variant="h5" mb={2}>
        Choose What Works
      </Typography>
      <Typography gutterBottom>
        You might be wondering whether your site is a point, line, or area. We recommend using the option that you think
        is best, given your objectives and understanding of the data. If your area is small enough to be considered a
        point without losing information, you can keep it simple by using a point. You can add comments to your site to
        save important details.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Technique
      </Typography>
      <Typography gutterBottom>
        Techniques represent the methods that you used to collect data at your sampling sites. Techniques can contain a
        variety of information:
      </Typography>
      <List sx={{ listStyleType: 'disc', '& .MuiListItem-root': { ml: 5 } }}>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography>
            <strong>Method</strong> is the category of common methods that the technique belongs to, such as visual
            encounter or camera trap
          </Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography>
            <strong>Attributes</strong> describe how you implemented a method, like the model of your camera trap or
            size of your net
          </Typography>
        </ListItem>
        <ListItem sx={{ display: 'list-item' }}>
          <Typography>
            <strong>Attractants</strong> are tools used to increase your chances of observing the target species, such
            as bait or light
          </Typography>
        </ListItem>
      </List>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Period
      </Typography>
      <Typography gutterBottom>
        Periods represent precisely when you collected data, which you might call a sampling session. Using the terms
        above, periods indicate <strong>when you applied a technique at a sampling site</strong>. Precise start and end
        information is important because it helps interpet the absence of species from your data&mdash;was the species
        missing because it didn't occur at that time or the species wasn't being searched for at that time?
      </Typography>
    </Box>
  </Stack>
);
