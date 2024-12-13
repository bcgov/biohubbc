import {
  mdiCardAccountMailOutline,
  mdiChevronLeft,
  mdiChevronRight,
  mdiDatabaseRefreshOutline,
  mdiEye,
  mdiLifebuoy,
  mdiOfficeBuildingCogOutline,
  mdiPaw,
  mdiWall,
  mdiWifiMarker
} from '@mdi/js';
import Box from '@mui/material/Box';
import { grey } from '@mui/material/colors';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import PageHeader from 'components/layout/PageHeader';
import AccordionSupportCard from 'features/support/components/AccordionSupportCard';
import { MarkdownTypeSupportNameEnum } from 'interfaces/useMarkdownApi.interface';
import { ReactNode, useState } from 'react';
import { StandardsToolbar } from '../standards/components/StandardsToolbar';

export enum SupportPageView {
  GENERAL = 'GENERAL',
  STRUCTURE = 'STRUCTURE',
  FOUNDATION = 'FOUNDATION',
  DATA_STANDARDS = 'DATA STANDARDS',
  ANIMALS = 'ANIMALS',
  TELEMETRY = 'TELEMETRY',
  OBSERVATIONS = 'OBSERVATIONS',
  CONTACT = 'CONTACT'
}

interface ISupportPageView {
  label: string;
  value: SupportPageView;
  icon: string;
}

interface IDataItem {
  label: string | ReactNode;
  description: ReactNode[];
  markdownType?: MarkdownTypeSupportNameEnum;
}

type DataMap = Partial<Record<SupportPageView, IDataItem[]>>;

const EnumMarkdownTypes: Partial<Record<SupportPageView, MarkdownTypeSupportNameEnum[]>> = {
  [SupportPageView.GENERAL]: [MarkdownTypeSupportNameEnum.GENERAL],
  [SupportPageView.STRUCTURE]: [MarkdownTypeSupportNameEnum.STRUCTURE],
  [SupportPageView.FOUNDATION]: [MarkdownTypeSupportNameEnum.FOUNDATION],
  [SupportPageView.DATA_STANDARDS]: [MarkdownTypeSupportNameEnum.DATA_STANDARDS],
  [SupportPageView.ANIMALS]: [
    MarkdownTypeSupportNameEnum.ANIMAL_ENTITY,
    MarkdownTypeSupportNameEnum.ANIMAL_EVENT,
    MarkdownTypeSupportNameEnum.ANIMAL_BULK
  ],
  [SupportPageView.TELEMETRY]: [MarkdownTypeSupportNameEnum.TELEMETRY],
  [SupportPageView.OBSERVATIONS]: [MarkdownTypeSupportNameEnum.OBSERVATIONS]
};

const dataMap: DataMap = {
  [SupportPageView.GENERAL]: [
    {
      label: 'General Overview',
      description: [
        <Typography variant="body1" gutterBottom>
          Discover the purpose and functionality of SIMS, including its objectives, appropriate use cases, and the
          roles and responsibilities of users within the system.
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
      markdownType:
        EnumMarkdownTypes[SupportPageView.DATA_STANDARDS]?.[0] || MarkdownTypeSupportNameEnum.DATA_STANDARDS
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
      label: <Typography variant="h5" gutterBottom>Animal Profile</Typography>,
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
      label: <Typography variant="h5" gutterBottom>Data Loading</Typography>,
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
          <strong>I placed a GPS collar on my animal during its capture event, but I am unable to add this as a marking</strong>
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
      markdownType:
        EnumMarkdownTypes[SupportPageView.OBSERVATIONS]?.[0] || MarkdownTypeSupportNameEnum.OBSERVATIONS
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

const SupportPage = () => {
  const [currentView, setCurrentView] = useState<SupportPageView>(SupportPageView.GENERAL);

  const views: ISupportPageView[] = [
    { label: 'General', value: SupportPageView.GENERAL, icon: mdiLifebuoy },
    { label: 'SIMS Structure', value: SupportPageView.STRUCTURE, icon: mdiOfficeBuildingCogOutline },
    { label: 'Foundational Data', value: SupportPageView.FOUNDATION, icon: mdiWall },
    { label: 'Data Standards', value: SupportPageView.DATA_STANDARDS, icon: mdiDatabaseRefreshOutline },
    { label: 'Animals', value: SupportPageView.ANIMALS, icon: mdiPaw },
    { label: 'Telemetry', value: SupportPageView.TELEMETRY, icon: mdiWifiMarker },
    { label: 'Observations', value: SupportPageView.OBSERVATIONS, icon: mdiEye },
    { label: 'Contact', value: SupportPageView.CONTACT, icon: mdiCardAccountMailOutline }
  ];

  const currentIndex = views.findIndex((view) => view.value === currentView);

  const nextView = views[(currentIndex + 1) % views.length];
  const prevView = views[(currentIndex - 1 + views.length) % views.length];

  return (
    <>
      <PageHeader title="Support" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction="row" gap={3} component={Paper} sx={{ p: 3 }}>
          <Box width="300px" flexShrink={0}>
            <StandardsToolbar
              views={views}
              currentView={currentView}
              setCurrentView={setCurrentView}
              legend="Support Overview"
            />
          </Box>

          <Divider orientation="vertical" flexItem />

          <Box flex="1 1 auto">
            <Typography variant="h2" gutterBottom>
              {views.find((view) => view.value === currentView)?.label}
            </Typography>

            <Box
              sx={{
                p: 3,
                border: '1px solid',
                borderColor: grey[300],
                borderRadius: '8px',
                bgcolor: grey[50]
              }}
            >
              <Stack gap={2}>
                {dataMap[currentView]?.map((item, index) => (
                  <Box key={index}>
                    {item.description.map((chunk, chunkIndex) => (
                      <Box key={chunkIndex} sx={{ mb: 2 }}>
                        {chunk}
                      </Box>
                    ))}
                    {item.markdownType && (
                      <AccordionSupportCard
                        label={item.label}
                        colour={grey[100]}
                        markdownType={item.markdownType}
                      />
                    )}
                  </Box>
                )) || <Typography>No content available for this section.</Typography>}
              </Stack>

              <Stack
                direction="row"
                justifyContent={
                  currentIndex === 0
                    ? 'flex-end'
                    : currentIndex === views.length - 1
                    ? 'flex-start'
                    : 'space-between'
                }
                alignItems="center"
                sx={{ mt: 2 }}
              >
                {currentIndex > 0 && (
                  <Box
                    component="button"
                    onClick={() => setCurrentView(prevView.value)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: grey[700],
                      '&:hover': { color: grey[900] }
                    }}
                  >
                    <svg style={{ width: 24, height: 24, marginRight: 8 }}>
                      <path d={mdiChevronLeft} fill="currentColor" />
                    </svg>
                    <Typography>Previous Topic</Typography>
                  </Box>
                )}

                {currentIndex < views.length - 1 && (
                  <Box
                    component="button"
                    onClick={() => setCurrentView(nextView.value)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      color: grey[700],
                      '&:hover': { color: grey[900] }
                    }}
                  >
                    <Typography>Next Topic</Typography>
                    <svg style={{ width: 24, height: 24, marginLeft: 8 }}>
                      <path d={mdiChevronRight} fill="currentColor" />
                    </svg>
                  </Box>
                )}
              </Stack>
            </Box>
          </Box>
        </Stack>
      </Container>
    </>
  );
};

export default SupportPage;
