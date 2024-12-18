import { Typography } from '@mui/material';
import { EnumMarkdownTypes, MarkdownTypeSupportNameEnum, SupportPageView } from './types';

const structure = [
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
];

export default structure;
