import { Typography } from '@mui/material';
import { EnumMarkdownTypes, MarkdownTypeSupportNameEnum, SupportPageView } from './types'; // Adjust the import paths as necessary

const general = [
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
];

export default general;
