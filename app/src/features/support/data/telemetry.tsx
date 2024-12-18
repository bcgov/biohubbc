import { Typography } from '@mui/material';
import { EnumMarkdownTypes, MarkdownTypeSupportNameEnum, SupportPageView } from './types';

const telemetry = [
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
];

export default telemetry;
