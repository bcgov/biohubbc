import { Typography } from '@mui/material';
import { EnumMarkdownTypes, MarkdownTypeSupportNameEnum, SupportPageView } from './types';

const observations = [
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
];

export default observations;
