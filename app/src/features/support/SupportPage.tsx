import {
  mdiCardAccountMailOutline,
  mdiEye,
  mdiLifebuoy,
  mdiOfficeBuildingCogOutline,
  mdiPaw,
  mdiWall,
  mdiWifiMarker
} from '@mdi/js';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import PageHeader from 'components/layout/PageHeader';
import CustomToggleButtonGroup from 'components/toolbar/CustomToggleButtonGroup';
import { useState } from 'react';
import { SupportPageGeneral } from './general/SupportPageGeneral';
import { SupportPageStandards } from './standards/SupportPageStandards';

// FAQ SECTIONS MAY NEED TO BE FORMATTED IN A DIFFERENT WAY, I DONT KNOW HOW BUT IM THINKING ABOUT IT

//ALSO ARE WE GOING To INCORPORATE THE MARKDOWN VOTING SYSTEM THAT MACGREGOR CREATED TO TRACK ANY OF THESE THINGS

//HAVING ISSUES WITH BEING ABLE TO EDIT THE DESCRIPTIONs OF THE DATAMAP ITEMS TO MANIPULATE IT LIKE A HTML ELEMENT (BOLD, LINE BREAKS, MALITO LINKS FOR EMAIL ADRESSES ETC). ITS IN A STRING LITERAL FORMAT AND I IMAGINE THERE IS A BETTER WAY TO DO THIS THAT ISNT RENDERING THE ITEM.DESCRIPTION AS A SUBITITLE OF THE ACCORDION CARD, I JUST DONT KNOW HOW ELSE TO DO IT AND THIS WAY IS NOT GOOD.

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

export interface ISupportPageView {
  label: string;
  value: SupportPageView;
  icon: string;
}

interface IDataItem {
  label: string;
  description: string;
  unit?: string;
}

type DataMap = Partial<Record<SupportPageView, IDataItem[]>>;

// Text variables to make editing easier
const generalText =
  'Discover the purpose and functionality of SIMS, including its objectives, appropriate use cases, and the roles and responsibilities of users within the system.';

const structureText =
  'Learn how data is organized within SIMS, from projects to surveys and observations. Understand the system’s hierarchical structure and how it applies to your work.';

const foundationText =
  'Explore the core elements needed to organize ecological data, such as sites, blocks, strata, and techniques, which form the foundation for effective data management in SIMS.';

const standardsText =
  'Understand the importance of consistent formatting and adherence to data standards in SIMS. Gain guidance on taxonomy, measurement protocols, and templates for reliable data submission.';

const observationText =
  'Get insights into the collection and management of ecological data, including species sightings and measurements. See how observations tie into foundational data and learn about data upload options.';

const animalText =
  'Manage individual animal records, including their attributes and key events like captures and mortalities. Discover the value of building a relational dataset for long-term ecological studies.';

const telemetryText =
  'Dive into the management of data from tracking devices, including deployments and automated data retrieval. Learn how telemetry supports real-time tracking and historical data analysis.';

const contactText =
  'Find out how to reach technical support for help with SIMS. Whether you’re troubleshooting or have questions about the system, help is just an email away.';

// mapping the above text variables to the page view
const textMap: Record<SupportPageView, string> = {
  [SupportPageView.GENERAL]: generalText,
  [SupportPageView.STRUCTURE]: structureText,
  [SupportPageView.FOUNDATION]: foundationText,
  [SupportPageView.DATA_STANDARDS]: standardsText,
  [SupportPageView.OBSERVATIONS]: observationText,
  [SupportPageView.ANIMALS]: animalText,
  [SupportPageView.TELEMETRY]: telemetryText,
  [SupportPageView.CONTACT]: contactText
};

const SupportPage = () => {
  const [activeView, setActiveView] = useState<SupportPageView>(SupportPageView.GENERAL);

  const views: ISupportPageView[] = [
    { label: 'General', value: SupportPageView.GENERAL, icon: mdiLifebuoy },
    { label: 'Data Standards', value: SupportPageView.DATA_STANDARDS, icon: mdiOfficeBuildingCogOutline },
    { label: 'Foundational Data', value: SupportPageView.FOUNDATION, icon: mdiWall },
    // { label: 'Data Standards', value: SupportPageView.DATA_STANDARDS, icon: mdiDatabaseRefreshOutline },
    { label: 'Observations', value: SupportPageView.OBSERVATIONS, icon: mdiEye },
    { label: 'Animals', value: SupportPageView.ANIMALS, icon: mdiPaw },
    { label: 'Telemetry', value: SupportPageView.TELEMETRY, icon: mdiWifiMarker },
    { label: 'Contact', value: SupportPageView.CONTACT, icon: mdiCardAccountMailOutline }
  ];

  const dataMap: DataMap = {
    [SupportPageView.STRUCTURE]: [
      {
        label: 'Projects',
        description:
          'Projects are the top-level grouping in SIMS, used to organize related surveys and observations for a specific purpose or area of study.'
      },
      {
        label: 'Surveys',
        description:
          'Surveys represent data collection efforts within a project, focusing on specific tasks, species, or geographic areas.'
      },
      {
        label: 'Observations',
        description:
          'Observations are individual data points collected during surveys, such as sightings, measurements, or tagged individuals.'
      },
      {
        label: 'When to use projects and surveys',
        description:
          'Projects and surveys are used to organize data hierarchically. Projects are broad and long-term, while surveys are focused, short-term efforts within a project.'
      },
      {
        label: 'Creating Projects',
        description:
          'Creating a project involves defining its purpose, setting its boundaries, and preparing for associated surveys and observations.'
      },
      {
        label: 'FAQ',
        description:
          'Answers to common questions about organizing data with projects, surveys, and observations in SIMS.'
      }
    ],

    [SupportPageView.FOUNDATION]: [
      {
        label: 'What is foundational data and how does it benefit you',
        description:
          'Foundational data forms the backbone of SIMS, providing standardized structures like blocks, strata, and sites for organizing ecological information efficiently.'
      },
      {
        label: 'Blocks',
        description:
          'Blocks are subdivisions of a larger area, helping to organize data collection within specific, defined zones.'
      },
      {
        label: 'Strata',
        description:
          'Strata represent layers or classifications within blocks, often based on characteristics like habitat type or species distribution.'
      },
      {
        label: 'Sampling sites',
        description:
          'Sampling sites are precise locations within blocks or strata where data collection activities take place.'
      },
      {
        label: 'Techniques',
        description:
          'Techniques refer to the specific methods or protocols used for data collection, such as trapping, surveying, or tagging.'
      },
      {
        label: 'Attachments',
        description:
          'Attachments allow you to upload and associate supplementary files, such as maps, documents, or photos, with foundational data elements.'
      },
      {
        label: 'Bulk Upload – sites, blocks, etc.',
        description:
          'The bulk upload feature simplifies the process of adding large volumes of foundational data, such as multiple sites or blocks, at once.'
      }
    ],

    [SupportPageView.OBSERVATIONS]: [
      {
        label: 'What is observation data and how does it benefit you',
        description:
          'Observation data captures detailed ecological information collected during surveys, such as species sightings, measurements, or tagged individuals. This data provides insights for analysis, reporting, and informed decision-making.'
      },
      {
        label: 'Relationships between observations and foundational data',
        description:
          'Observation data is linked to foundational elements like sites and techniques. These relationships ensure that observations are contextualized within specific locations and data collection methods, maintaining consistency and accuracy.'
      },
      {
        label: 'Configuring a template – using standards',
        description:
          'Templates allow you to align your observation data with standardized formats, ensuring consistency across projects. Learn how to set up and customize templates to meet project-specific requirements.'
      },
      {
        label: 'Bulk and manual upload',
        description:
          'Observation data can be added through manual entry or bulk upload, enabling flexibility for smaller datasets or large-scale imports. Each method ensures data integrity through validation checks.'
      },
      {
        label: 'FAQ',
        description:
          'This section addresses common questions about observation data:\n\n' +
          '- **Where should pit tag data go?** Pit tag data is included in observation records and linked to individual animals or events.\n' +
          '- **Should I use UTM or Lat/Long?** SIMS requires data in Latitude and Longitude format to ensure compatibility with mapping and analysis tools.'
      }
    ],

    [SupportPageView.ANIMALS]: [
      {
        label: 'What is animal data and how does it benefit you',
        description:
          'Animal data represents detailed information about individual animals, including their attributes and associated events. This data forms the basis for telemetry and long-term ecological studies, offering insights into survival, movement, and population trends.'
      },
      {
        label: 'Animal data is the foundation for telemetry',
        description:
          'Telemetry relies on accurate animal data, providing context for tracking information such as movement, habitat use, and environmental interactions.'
      },
      {
        label: 'Attributes that an animal can have',
        description:
          'Animals in SIMS can have various attributes, such as descriptions, names, population units, and other identifiers that provide a detailed profile for each individual.'
      },
      {
        label: 'Benefit of building a large queriable relational dataset',
        description:
          'A relational dataset enables efficient querying and analysis of animal data. This supports research into survival, movement, and population dynamics, improving conservation efforts and ecological understanding.'
      },
      {
        label: 'Bulk vs individual uploading',
        description:
          'Animal data can be uploaded individually or in bulk, depending on the volume of data. Bulk uploads are ideal for large datasets, while individual uploads offer precision for small-scale entries.'
      },
      {
        label: 'Where to find templates',
        description:
          'Templates for uploading animal data are available in SIMS, providing predefined formats to ensure consistency and simplify data entry.'
      },
      {
        label: 'Animal components: create animal, then create events',
        description:
          'Animals in SIMS are created first, followed by associated events such as captures or mortalities. This structure ensures that all events are linked to the appropriate individual.'
      },
      {
        label: 'FAQ',
        description:
          'This section addresses common questions about animal data:\n\n' +
          '- **I do not see my population unit here:** Check the population unit labels in SIMS. If your unit is missing, contact support to request its addition.\n' +
          '- **What are animal events?** Animal events include important occurrences such as captures, releases, and mortalities, providing a complete history of individual animals.'
      }
    ],

    [SupportPageView.TELEMETRY]: [
      {
        label: 'What is telemetry and how does this page benefit you',
        description:
          'Telemetry is the remote collection of data using devices attached to animals or deployed in the field. It provides close-to-real-time access to data, supports collaborative workflows, and ensures data is securely stored for long-term retrieval, even years after deployments end. This page centralizes telemetry data in SIMS, offering tools for managing, retrieving, and analyzing it effectively.'
      },
      {
        label: 'Deployments',
        description:
          'Deployments represent the relationship between a data-generating device and an animal. Properly managing deployments, including closing them and creating associated events when necessary, is critical for maintaining accurate records.'
      },
      {
        label: 'Manual upload and automated retrieval',
        description:
          'Telemetry data can be uploaded manually or retrieved automatically through the SIMS API. Manual uploads are subject to nightly updates, so recent data may not be immediately reflected. The automated retrieval process ensures consistency and reduces manual effort.'
      },
      {
        label: 'Bulk upload of imported data',
        description:
          'Bulk uploads simplify the process of importing large datasets. Ensure all required fields are included to maintain data integrity and compatibility with SIMS standards.'
      },
      {
        label: 'FAQ',
        description:
          'This section addresses common questions about telemetry data:\n\n' +
          '- **I tried to deploy a device but it’s giving me the error that this device is already deployed on another animal:** Check existing deployments to ensure the device is not already associated with another animal. Close any active deployments for the device before re-deploying.'
      }
    ],

    [SupportPageView.CONTACT]: [
      {
        label: 'Contact Support',
        description:
          'For technical support or questions about this application. please email <a href="mailto:spi_mail@gov.bc.ca">spi_mail@gov.bc.ca</a>'
      }
    ]
  };

  console.log(dataMap, textMap);

  return (
    <>
      <PageHeader title="Support" />
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack direction="row" gap={3} component={Paper} sx={{ p: 3 }}>
          <Box width="300px" flexShrink={0}>
            <CustomToggleButtonGroup
              views={views}
              activeView={activeView}
              onViewChange={(view) => setActiveView(view)}
              orientation="vertical"
            />
          </Box>

          <Divider orientation="vertical" flexItem />

          {activeView === SupportPageView.GENERAL && <SupportPageGeneral />}

          {activeView === SupportPageView.DATA_STANDARDS && <SupportPageStandards />}

          {activeView === SupportPageView.ANIMALS && <SupportPageGeneral />}

          {activeView === SupportPageView.OBSERVATIONS && <SupportPageGeneral />}

          {activeView === SupportPageView.FOUNDATION && <SupportPageGeneral />}

          {activeView === SupportPageView.STRUCTURE && <SupportPageGeneral />}

          {activeView === SupportPageView.TELEMETRY && <SupportPageGeneral />}

          {activeView === SupportPageView.CONTACT && <SupportPageGeneral />}
        </Stack>
      </Container>
    </>
  );
};

export default SupportPage;
