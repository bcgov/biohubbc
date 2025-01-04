import { Typography } from '@mui/material';
import { EnumMarkdownTypes, SupportPageView } from './types';

const foundation = [
  {
    label: 'Blocks',
    description: [
      <Typography variant="body1" gutterBottom>
        This foundational data section will detail the elements of your survey that are required to establish the
        structure and context needed to support meaningful ecological data collection. By defining key components like
        strata, blocks, sampling techniques, sampling sites, and attachments, foundational data ensure that survey
        observation records and broader sampling effort are organized and aligned within the objectives of the survey.
      </Typography>,
      <Typography variant="body1" gutterBottom>
        Establishing foundational data in your survey ensures that sampling objectives are clearly defined and that
        metadata for sampling efforts are well-documented, accessible and interpretable.
      </Typography>
    ],
    markdownType: EnumMarkdownTypes[SupportPageView.FOUNDATION]?.[0]
  },
  {
    label: 'Strata',
    description: [
      <Typography variant="body1" gutterBottom>
        <strong>Strata</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        Text
      </Typography>
    ],
    markdownType: EnumMarkdownTypes[SupportPageView.FOUNDATION]?.[1]
  },
  {
    label: 'Techniques',
    description: [
      <Typography variant="body1" gutterBottom>
        <strong>Techniques</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        TEXT
      </Typography>
    ],
    markdownType: EnumMarkdownTypes[SupportPageView.FOUNDATION]?.[2]
  },
  {
    label: 'Sampling Sites',
    description: [
      <Typography variant="body1" gutterBottom>
        <strong>Sampling Sites</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        Insert text
      </Typography>
    ],
    markdownType: EnumMarkdownTypes[SupportPageView.FOUNDATION]?.[3]
  },
  {
    label: 'FAQ',
    description: [
      <Typography variant="body1" gutterBottom>
        <strong>FAQ</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        <strong>QUESTION</strong>
      </Typography>,
      <Typography variant="body1" gutterBottom>
        ANSWER
      </Typography>
    ]
  }
];

export default foundation;
