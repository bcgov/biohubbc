import { Typography } from '@mui/material';
import { EnumMarkdownTypes, MarkdownTypeSupportNameEnum, SupportPageView } from './types';

const dataStandards = [
  {
    label: 'Integrated Taxonomic Information System (ITIS)',
    description: [
      <Typography variant="body1" gutterBottom key="standitis1">
        Standards and guidelines outline the procedures and requirements for capturing, storing and managing wildlife
        species inventory data and information in the provincial Species Inventory Management System (SIMS) database.
      </Typography>,
      <Typography variant="body1" gutterBottom key="standitis2">
        Ensuring your project meets provincial government standards will improve data and information quality, integrity
        and comparability.
      </Typography>,
      <Typography variant="body1" gutterBottom key="standitis3">
        <strong>Species Inventory Fundamentals</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom key="standitis4">
        The Resources Information Standards Committee (RISC) is responsible for establishing standards for natural and
        cultural resources inventories, including collection, storage, analysis, interpretation and reporting of
        inventory data.
      </Typography>,
      <Typography variant="body1" gutterBottom key="standitis5">
        RISC Inventory Standards are published online and can be used as a guide to inform your survey design. These
        publications, divided by topic, can be found on the{' '}
        <a
          href="https://www2.gov.bc.ca/gov/content/environment/natural-resource-stewardship/laws-policies-standards-guidance/inventory-standards"
          target="_blank"
          rel="noopener noreferrer">
          Inventory Standards - Province of British Columbia
        </a>{' '}
        site.
      </Typography>,
      <Typography variant="body1" gutterBottom key="standitis6">
        <strong>Taxonomy</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom key="standitis7">
        SIMS is currently using the taxonomy as defined by the Integrated Taxonomic Information system (ITIS), until a
        taxonomic service specific to the Province of British Columbia is completed.
      </Typography>
    ],
    markdownType: EnumMarkdownTypes[SupportPageView.DATA_STANDARDS]?.[0] ?? MarkdownTypeSupportNameEnum.ITIS
  },
  {
    label: 'SIMS Standards',
    description: [
      <Typography variant="body1" gutterBottom key="standsims1">
        <strong>SIMS Standards</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom key="standsims2">
        Data managers in SIMS interact directly with the SIMS database when inputting or modifying data. To ensure
        successful data integration, adherence to standards is essential. These standards minimize inconsistencies by
        enforcing a uniform data structure. SIMS provides real-time feedback to guide users in formatting their data
        correctly. Data input will only be accepted once it fully complies with these standards, ensuring high-quality,
        consistent, and reliable data across the system.
      </Typography>,
      <Typography variant="body1" gutterBottom key="standsims3">
        On the navigation pane of the SIMS site, there is a page called ‘Standards’. This page highlights the available
        environment variables, sampling methods, and species-specific variables that are currently in SIMS. Each
        variable is listed accordion-style, expanding these accordions may display descriptions or values applicable to
        the variable. These variables will all be available in picklists the SIMS interface when you are loading your
        data. If you are hoping to bulk import data via spreadsheet, referring to this standards page for the variable
        options and proper syntax will be vital to a successful process.
      </Typography>
    ]
  },
  {
    label: 'FAQ',
    description: [
      <Typography variant="body1" gutterBottom key="standfaq1">
        <strong>FAQ</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom key="standfaq2">
        <strong>I cannot find my species in SIMS.</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom key="standfaq3">
        If your species search in SIMS is not generating any results, please visit the{' '}
        <a href="https://www.itis.gov/servlet/SingleRpt/SingleRpt" target="_blank" rel="noopener noreferrer">
          ITIS
        </a>{' '}
        site to search their species repository. The query function on the site allows for scientific and common name
        searches and will supply results for ITIS-determined 'valid' taxonomy that can be used in SIMS. Please keep in
        mind that ITIS is an interim taxonomy solution for SIMS.
      </Typography>,
      <Typography variant="body1" gutterBottom key="standfaq4">
        <strong>
          SIMS does not have a measurement, body location, marking, or environmental variable that I require in order to
          load my data.
        </strong>
      </Typography>,
      <Typography variant="body1" gutterBottom key="standfaq5">
        SIMS is flexible and can be amended to accommodate your data needs! Please contact our team and we will work
        with you to locate or add required variables.
      </Typography>,
      <Typography variant="body1" gutterBottom key="standfaq6">
        <strong>How were these standards determined?</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom key="standfaq7">
        These standards have been developed over decades from feedback and suggestions provided by data managers and
        biologists across the province. If you would like to offer feedback to make SIMS even better, please reach out
        to our team.
      </Typography>
    ]
  }
];

export default dataStandards;
