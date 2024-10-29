import Box from '@mui/material/Box';
import Markdown from 'react-markdown';
import appTheme from 'themes/appTheme';

interface CustomMarkdownProps {
  markdown: string;
}

export const CustomMarkdown = ({ markdown }: CustomMarkdownProps) => {
  const sx = {
    '& h1': appTheme.typography.h1,
    '& h2': appTheme.typography.h2,
    '& h3': appTheme.typography.h3,
    '& h4': appTheme.typography.h4,
    '& h5': appTheme.typography.h5,
    '& p': { color: appTheme.palette.text.secondary }
  };

  return (
    <Box sx={sx}>
      <Markdown>{markdown}</Markdown>
    </Box>
  );
};
