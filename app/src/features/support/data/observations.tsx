import { Typography } from '@mui/material';
import { EnumMarkdownTypes, MarkdownTypeSupportNameEnum, SupportPageView } from './types';

const observations = [
  {
    label: 'Observation Data Overview',
    description: [
      <Typography variant="body1" gutterBottom>
        Observation data are detailed records of biological or ecological findings, collected through surveying efforts. Observations provide a snapshot summary of findings at specific moments in time, documenting factors such as species presence, environmental conditions, and behavioural patterns.  
      </Typography>, 
      <Typography>
        Observation data are recorded in relation to the foundational data you define in your survey. Each observation record is attributed to a sampling site and sampling period and is collected using a defined technique.  
      </Typography>, 
      <Typography>
        Key components of observation data include your observed species, the sampling site your observation was recorded at, the sampling period within which your observation was recorded, the technique with which your observation was recorded, the type of observation (direct versus indirect), your count, date, time, latitude, and longitude.  
      </Typography>,
      <Typography>
        In SIMS, your observation pane can be customized to note further detail, such as environmental conditions and species attributes.  
      </Typography>
    ]
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
        Observations are loaded through your survey observations page. Observations are loaded with reference to the sampling site, sampling period and sampling technique by which they were collected. Prior to loading observation data, your sampling sites, periods and techniques need to be established in your survey.  
      </Typography>, 
      <Typography variant="body1" gutterBottom>
        To prepare SIMS for observations data, the observations page can be configured to include columns required to fit the data for your individual survey. The CONFIGURE button on the top of the observations page allows for the addition of both species and environmental attributes. These species attributes are specific to the species observed in your surveying efforts and can also be found on the SIMS Standards page. When you have selected the columns that should be added to your observations pane, you can save and close the configure columns window, and you should see that the observations pane has been updated with additional columns.  
      </Typography>, 
      <Typography variant="body1" gutterBottom>
        SIMS provides flexible options for adding observation data to your system. You can either add records individually, one at a time using the site interface, or upload data in bulk using pre-formatted CSV files. 
      </Typography>
    ]
  },
  {
    label: 'Data Upload',
    description: [],
    markdownType: EnumMarkdownTypes[SupportPageView.OBSERVATIONS]?.[0] || MarkdownTypeSupportNameEnum.OBSERVATIONS
  }
];

export default observations;
