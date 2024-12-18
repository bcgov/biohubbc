import Typography from '@mui/material/Typography';
import { MarkdownTypeSupportNameEnum } from 'interfaces/useMarkdownApi.interface';
import { SupportPageView } from '../constants/SupportPageView';
import { DataMap, EnumMarkdownTypes } from './types';

export const dataMap: DataMap = {
  [SupportPageView.GENERAL]: [
    {
      label: 'General Overview',
      description: [
        <Typography variant="body1" gutterBottom>
          Discover the purpose and functionality of SIMS, including its objectives, appropriate use cases, and the roles
          and responsibilities of users within the system.
        </Typography>
      ],
      markdownType: EnumMarkdownTypes[SupportPageView.GENERAL]?.[0] || MarkdownTypeSupportNameEnum.GENERAL
    }
  ],




  
  [SupportPageView.STRUCTURE]: [
    {
      label: 'SIMS Structure',
      description: [
        <Typography variant="body1" gutterBottom>
          Learn how data is organized within SIMS, from projects to surveys and observations. Understand the system’s
          hierarchical structure and how it applies to your work.
        </Typography>
      ],
      markdownType: EnumMarkdownTypes[SupportPageView.STRUCTURE]?.[0] || MarkdownTypeSupportNameEnum.STRUCTURE
    }
  ],
  [SupportPageView.FOUNDATION]: [
    {
      label: 'Foundational Data',
      description: [
        <Typography variant="body1" gutterBottom>
          Explore the core elements needed to organize ecological data, such as sites, blocks, strata, and techniques,
          which form the foundation for effective data management in SIMS.
        </Typography>
      ],
      markdownType: EnumMarkdownTypes[SupportPageView.FOUNDATION]?.[0] || MarkdownTypeSupportNameEnum.FOUNDATION
    }
  ],
  [SupportPageView.DATA_STANDARDS]: [
    {
      label: 'Data Standards Overview',
      description: [
        <Typography variant="body1" gutterBottom>
          Understand the importance of consistent formatting and adherence to data standards in SIMS. Gain guidance on
          taxonomy, measurement protocols, and templates for reliable data submission.
        </Typography>
      ],
      markdownType: EnumMarkdownTypes[SupportPageView.DATA_STANDARDS]?.[0] || MarkdownTypeSupportNameEnum.DATA_STANDARDS
    }
  ],
  [SupportPageView.ANIMALS]: [
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
          Animal data can be managed independently in SIMS or serve as foundational data for managing other datasets.
          For instance, telemetry data in SIMS is attributed as an extension of an animal, seamlessly linking the two
          for a comprehensive understanding of individual animal movements and behaviors.
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
          one at a time using the site interface, or upload data in bulk using pre-formatted CSV files. Formatting
          guides for these CSV files are available for download directly within the interface, ensuring proper alignment
          with system requirements.
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
          <strong>I am trying to add an ecological unit to my animal and I am unable to make a selection.</strong>
        </Typography>,
        <Typography variant="body1" gutterBottom>
          Ecological units in SIMS are legislated units, tailored to relevant species. If your animal belongs to an
          unlegislated ecological unit, that information can be captured in the animal description. If you believe there
          should be a legislated ecological unit available to your species, please contact us and we will look into
          making that available in SIMS.
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
  ],
  [SupportPageView.TELEMETRY]: [
    {
      label: 'Telemetry Overview',
      description: [
        <Typography variant="body1" gutterBottom>
          Dive into the management of data from tracking devices, including deployments and automated data retrieval.
          Learn how telemetry supports real-time tracking and historical data analysis.
        </Typography>
      ],
      markdownType: EnumMarkdownTypes[SupportPageView.TELEMETRY]?.[0] || MarkdownTypeSupportNameEnum.TELEMETRY
    }
  ],
  [SupportPageView.OBSERVATIONS]: [
    {
      label: 'Observation Data Overview',
      description: [
        <Typography variant="body1" gutterBottom>
          Get insights into the collection and management of ecological data, including species sightings and
          measurements. See how observations tie into foundational data and learn about data upload options.
        </Typography>
      ],
      markdownType: EnumMarkdownTypes[SupportPageView.OBSERVATIONS]?.[0] || MarkdownTypeSupportNameEnum.OBSERVATIONS
    }
  ],
  [SupportPageView.CONTACT]: [
    {
      label: 'Contact Support',
      description: [
        <Typography variant="body1" gutterBottom>
          For technical support or questions about this application, please email{' '}
          <a href="mailto:spi_mail@gov.bc.ca">spi_mail@gov.bc.ca</a>.
        </Typography>
      ]
    }
  ]
};
