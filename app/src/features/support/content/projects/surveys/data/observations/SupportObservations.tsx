import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

/**
 * Information about Observations
 *
 * @returns {*}
 */
export const SupportObservations = () => (
  <Stack gap={5} mb={3}>
    <Box>
      <Typography key="project-components-2">
        Observations are counts of species at specific locations and times. The location is typically a sampling site,
        but you can also add observations without a sampling site if you know the coordinate location.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Species
      </Typography>
      <Typography gutterBottom key="gensims2" mb={2}>
        The species is the taxon that you observed. If you cannot determine the species, you can use a higher taxon like
        the genus or family.
      </Typography>
      <Typography gutterBottom key="gensims2">
        Temporarily, the list of available species comes from the&nbsp;
        <a href="itis.gov">Integrated Taxonomic Information System</a>. We are working with the Conservation Data Center
        to integrate British Columbia's official taxonomy information and replace the Integrated Taxonomic Information
        System.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Sampling Information
      </Typography>
      <Typography gutterBottom key="gensims2">
        You can link observations to sampling information by including the period when the observation was made. You can
        still add observations without sampling information, but observations without sampling sites are commonly
        considered incidentals and less informative for rigorous analyses.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Species Attributes
      </Typography>
      <Typography gutterBottom key="gensims2">
        You can add species-specific attributes (eg. life stage, sex, body condition) to your observations. The
        attributes applicable to a species are shown in the Standards.
      </Typography>
    </Box>

    <Box>
      <Typography fontWeight={700} variant="h4" mb={2}>
        Environmental Conditions
      </Typography>
      <Typography gutterBottom key="gensims2">
        You can add environmental conditions (eg. temperature, cloud cover, wind speed) to your observations. Possible
        environmental conditions are shown in the Standards.
      </Typography>
    </Box>
  </Stack>
);
