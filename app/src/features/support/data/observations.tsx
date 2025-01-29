import { Typography } from '@mui/material';
import { EnumMarkdownTypes, MarkdownTypeSupportNameEnum, SupportPageView } from './types';

const observations = [
  {
    label: 'Observation Data Overview',
    description: [
      <Typography key="observation-overview-1" variant="body1" gutterBottom>
        Observation data are detailed records of biological or ecological findings, collected through surveying efforts.
        Observations provide a snapshot summary of findings at specific moments in time, documenting factors such as
        species presence, environmental conditions, and behavioural patterns.
      </Typography>,
      <Typography key="observation-overview-2" variant="body1" gutterBottom>
        Observation data are recorded in relation to the foundational data you define in your survey. Each observation
        record is attributed to a sampling site and sampling period and is collected using a defined technique.
      </Typography>,
      <Typography key="observation-overview-3" variant="body1" gutterBottom>
        Key components of observation data include your observed species, the sampling site your observation was
        recorded at, the sampling period within which your observation was recorded, the technique with which your
        observation was recorded, the type of observation (direct versus indirect), your count, date, time, latitude,
        and longitude.
      </Typography>,
      <Typography key="observation-overview-4" variant="body1" gutterBottom>
        In SIMS, your observation pane can be customized to note further detail, such as environmental conditions and
        species attributes.
      </Typography>
    ]
  },
  {
    label: (
      <Typography key="data-loading-label" variant="h5" gutterBottom>
        Data Loading
      </Typography>
    ),
    description: [
      <Typography key="data-loading-1" variant="body1" gutterBottom>
        <strong>Data Loading</strong>
      </Typography>,
      <Typography key="data-loading-2" variant="body1" gutterBottom>
        Observations are loaded through your survey observations page. Observations are loaded with reference to the
        sampling site, sampling period and sampling technique by which they were collected. Prior to loading observation
        data, your sampling sites, periods and techniques need to be established in your survey.
      </Typography>,
      <Typography key="data-loading-3" variant="body1" gutterBottom>
        To prepare SIMS for observations data, the observations page can be configured to include columns required to
        fit the data for your individual survey. The CONFIGURE button on the top of the observations page allows for the
        addition of both species and environmental attributes. These species attributes are specific to the species
        observed in your surveying efforts and can also be found on the SIMS Standards page. When you have selected the
        columns that should be added to your observations pane, you can save and close the configure columns window, and
        you should see that the observations pane has been updated with additional columns.
      </Typography>,
      <Typography key="data-loading-4" variant="body1" gutterBottom>
        SIMS provides flexible options for adding observation data to your system. You can either add records
        individually, one at a time using the site interface, or upload data in bulk using pre-formatted CSV files.
      </Typography>
    ]
  },
  {
    label: 'Data Upload',
    description: [],
    markdownType: EnumMarkdownTypes[SupportPageView.OBSERVATIONS]?.[0] ?? MarkdownTypeSupportNameEnum.OBSERVATIONS
  },
  {
    label: 'FAQ',
    description: [
      <Typography key="faq-1" variant="body1" gutterBottom>
        <strong>FAQ</strong>
      </Typography>,
      <Typography key="faq-2" variant="body1" gutterBottom>
        <strong>I have data collected using PIT Tags – is that observation data or telemetry data? </strong>
      </Typography>,
      <Typography key="faq-3" variant="body1" gutterBottom>
        We encourage the management of PIT Tag data through the observations pane, as tag readers/gates can be loaded up
        as sampling sites.
      </Typography>,
      <Typography key="faq-4" variant="body1" gutterBottom>
        <strong>I have collected my observations in UTM and am having trouble loading them.</strong>
      </Typography>,
      <Typography key="faq-5" variant="body1" gutterBottom>
        Currently, SIMS is configured to receive latitude and longitude data in decimal degrees, collected under WGS
        1984.
      </Typography>
    ]
  }
];

export default observations;
