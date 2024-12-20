import { Typography } from '@mui/material';
import { EnumMarkdownTypes, SupportPageView } from './types';

const animals = [
  {
    label: 'Animal Data Overview',
    description: [
      <Typography variant="body1" gutterBottom>
        Animal data represents information about identifiable individuals within your surveying effort.
      </Typography>,
      <Typography variant="body1" gutterBottom>
        Managing animal data through SIMS has the benefit of allowing you to establish a centralized repository of
        animal information for species in British Columbia. Contributing to this baseline dataset provides a powerful
        foundation for research, enabling a more comprehensive understanding of the history of animal handling events,
        animal survival, and animal health and fertility.
      </Typography>,
      <Typography variant="body1" gutterBottom>
        Animal data can be managed independently in SIMS or serve as foundational data for managing other datasets. For
        instance, telemetry data in SIMS is attributed as an extension of an animal, seamlessly linking the two for a
        comprehensive understanding of individual animal movements and behaviors.
      </Typography>
    ]
  },
  {
    label: (
      <Typography variant="h5" gutterBottom>
        Animal Profile
      </Typography>
    ),
    description: [
      <Typography variant="body1" gutterBottom>
        Animal data in SIMS is managed through the “Animals” page in your survey. There are two components to animal
        data: the animal, and its events.
      </Typography>
    ]
  },
  {
    label: 'The Animal',
    description: [],
    markdownType: EnumMarkdownTypes[SupportPageView.ANIMALS]?.[0]
  },
  {
    label: 'Animal Events',
    description: [],
    markdownType: EnumMarkdownTypes[SupportPageView.ANIMALS]?.[1]
  },
  {
    label: (
      <Typography variant="h5" gutterBottom>
        Data Loading
      </Typography>
    ),
    description: [
      <Typography variant="body1" gutterBottom>
        <strong>Data Loading</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        SIMS provides flexible options for adding animal data to your system. You can either add animals individually,
        one at a time using the site interface, or upload data in bulk using pre-formatted CSV files. Formatting guides
        for these CSV files are available for download directly within the interface, ensuring proper alignment with
        system requirements.
      </Typography>
    ]
  },
  {
    label: 'Bulk Import Template Formatting',
    description: [],
    markdownType: EnumMarkdownTypes[SupportPageView.ANIMALS]?.[2]
  },
  {
    label: 'FAQ',
    description: [
      <Typography variant="body1" gutterBottom>
      <strong>FAQ</strong>
    </Typography>,
      <Typography variant="body1" gutterBottom>
        <strong>I am trying to add an ecological unit to my animal and I am unable to make a selection.</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        Ecological units in SIMS are legislated units, tailored to relevant species. If your animal belongs to an
        unlegislated ecological unit, that information can be captured in the animal description. If you believe there
        should be a legislated ecological unit available to your species, please contact us and we will look into making
        that available in SIMS.
      </Typography>,
      <Typography variant="body1" gutterBottom>
        <strong>
          I placed a GPS collar on my animal during its capture event, but I am unable to add this as a marking
        </strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        GPS collars are associated with an animal on the telemetry page of SIMS, through a functionality called
        deployments. Collars are not placed on animals as markings during capture events. Please continue reading the
        telemetry data section to learn more.
      </Typography>
    ]
  }
];

export default animals;
