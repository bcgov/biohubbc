import { Typography } from '@mui/material';
import { EnumMarkdownTypes, SupportPageView } from './types';

const foundation = [
  {
    label: 'Managing Blocks',
    description: [
      <Typography variant="body1" gutterBottom key="samplblock1">
        This foundational data section will detail the elements of your survey that are required to establish the
        structure and context needed to support meaningful ecological data collection. By defining key components like
        strata, blocks, sampling techniques, sampling sites, and attachments, foundational data ensure that survey
        observation records and broader sampling effort are organized and aligned within the objectives of the survey.
      </Typography>,
      <Typography variant="body1" gutterBottom key="samplblock2">
        Establishing foundational data in your survey ensures that sampling objectives are clearly defined and that
        metadata for sampling efforts are well-documented, accessible and interpretable. Foundational data are defined
        within a survey by navigating to the Manage Sampling Information page.
      </Typography>,
      <Typography variant="body1" gutterBottom key="samplblock3">
        <strong>Blocks</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom key="samplblock4">
        Blocks are optional defined areas within a study area that enhance structured sampling and reduce variability.
        As a higher-level organizational unit, blocks contain sampling sites and help distribute sampling effort
        systematically across a large area, supporting randomization and reducing the potential for bias.
      </Typography>,
      <Typography variant="body1" gutterBottom key="samplblock5">
        Blocks can also be thought of a strategic clustering of sampling sites. For example, a study could be designed
        along a series of transects, with distinct sampling sites. Biologists could be travelling along 5 transect lines
        and stopping at 6 distinct locations on each transect to conduct sampling. In this case, the survey would have a
        sum total of 30 sampling sites, organized into 6 sampling sites per block, 5 blocks (the transects).
      </Typography>,
      <Typography variant="body1" gutterBottom key="samplblock6">
        A different application of blocks may be executed by biologists who sample by conducting aerial surveys. They
        may have a large study area (for example, a delineated Caribou Herd) within which they would like to sample 3
        distinct regions in this year of their study. The biologist may choose to define these regions as block A, B,
        and C, respectively. If the biologist is flying for 6 days, they may be able to fly over each block twice, and
        conduct a count of observation continuously from the air. In this scenario, block A, B, and C would each have
        two sample sites: the flightline from each day the block was visited. In this case, the block is used to relate
        the two flightlines (sampling sites) that were conducted in the same general spatial region within a study area.
      </Typography>
    ],
    markdownType: EnumMarkdownTypes[SupportPageView.FOUNDATION]?.[0]
  },
  {
    label: 'Managing Strata',
    description: [
      <Typography variant="body1" gutterBottom key="samplstrat1">
        <strong>Strata</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom key="samplstrat2">
        Strata are optional, but provide a framework to focus effort and minimize variability. Each stratum is
        homogeneous within, but distinct from, others.
      </Typography>,
      <Typography variant="body1" gutterBottom key="samplstrat3">
        For example, a survey could have two strata: low elevation, and high elevation. A sampling site may be
        classified under one stratum, or the other, but not both. Within the low elevation stratum, all sampling sites
        occur at low elevation - therefore homogenous within the stratum - but distinct from sampling sites that occur
        in the high-elevation stratum.
      </Typography>
    ],
    markdownType: EnumMarkdownTypes[SupportPageView.FOUNDATION]?.[1]
  },
  {
    label: 'Managing Techniques',
    description: [
      <Typography variant="body1" gutterBottom key="sampltech1">
        <strong>Techniques</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom key="sampltech2">
        A technique is a combination of a sampling method, method attributes, attractants and the detection distance for
        this methodology. Surveys may have a number of techniques applied at sampling sites depending on the number of
        combinations of attractants, attributes, and detection distances applied to a specific methodology.
      </Typography>,
      <Typography variant="body1" gutterBottom key="sampltech3">
        For example, a biologist may be using Angling as their methodology, but at a single site they will attempt
        Angling with Worms, and Reflective Materials, and then they may also attempt Angling with Maggots and no
        reflective lures. These two distinct combinations would each be classified as their own technique. By
        classifying each as their own technique applied at a single sampling site, the success of each technique can be
        evaluated by relating which observations were made using which technique.
      </Typography>
    ],
    markdownType: EnumMarkdownTypes[SupportPageView.FOUNDATION]?.[2]
  },
  {
    label: 'Managing Sampling Sites',
    description: [
      <Typography variant="body1" gutterBottom key="samplsite1">
        <strong>Sampling Sites</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom key="samplsite2">
        Sampling sites represent the most fine-scale level of organization within your survey framework. They exist
        within larger units like blocks and strata but function as the smallest, most detailed locations where data is
        collected and observations are directly recorded.
      </Typography>,
      <Typography variant="body1" gutterBottom key="samplsite3">
        A sampling site represents a specific area of interest within the larger study region, chosen to provide
        insights into the population, habitat, or ecological conditions being investigated.
      </Typography>,
      <Typography variant="body1" gutterBottom key="samplsite4">
        When loading observations into SIMS, each observation is linked to three key concepts: sampling site, sampling
        period, and sampling technique. At each sampling site, an observation is recorded during a specific period using
        a defined technique. A sampling site can have multiple sampling periods if it is sampled across distinct time
        intervals.
      </Typography>,
      <Typography variant="body1" gutterBottom key="samplsite5">
        For example, a biologist may sample a site daily for a week and choose to record this as a single sampling
        period. Alternatively, if the site is visited once per season, this would result in four distinct sampling
        periods at the same site within a year.
      </Typography>
    ],
    markdownType: EnumMarkdownTypes[SupportPageView.FOUNDATION]?.[3]
  }
];

export default foundation;
