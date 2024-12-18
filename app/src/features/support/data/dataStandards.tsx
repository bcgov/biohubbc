import { Typography } from '@mui/material';
import { EnumMarkdownTypes, MarkdownTypeSupportNameEnum, SupportPageView } from './types';

const dataStandards = [
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
];

export default dataStandards;
