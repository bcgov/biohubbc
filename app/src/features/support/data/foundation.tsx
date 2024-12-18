import { Typography } from '@mui/material';
import { EnumMarkdownTypes, MarkdownTypeSupportNameEnum, SupportPageView } from './types';

const foundation = [
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
];

export default foundation;
