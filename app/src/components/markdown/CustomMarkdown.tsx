import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import Markdown from 'react-markdown';
import appTheme from 'themes/appTheme';

interface CustomMarkdownProps {
  markdown: string;
}

/**
 * This file must be mocked if tested with Jest because it is ESM only and Jest does not support ESM.
 *
 * Example code to include in test files that import this component:
 *
 * ```
 * jest.mock('../../../components/markdown/CustomMarkdown', () => {
 * return {};
 * });
 * ```
 * See SurveyHeader.test.tsx for an example
 *
 * @param param
 * @returns
 */
export const CustomMarkdown = ({ markdown }: CustomMarkdownProps) => {
  const sx = {
    '& h1': { ...appTheme.typography.h1 },
    '& h2': { ...appTheme.typography.h2 },
    '& h3': { ...appTheme.typography.h3, my: 0 },
    '& h4': { ...appTheme.typography.h4, my: 0 },
    '& h5': { ...appTheme.typography.h5, mb: 2 },
    '& h6': { ...appTheme.typography.h6, fontSize: '1rem', mb: 0, mt: 2, color: grey[700] },
    '& p, & li': { color: appTheme.palette.text.secondary, my: 1, fontSize: '0.95rem' }
  };

  return (
    <Box sx={sx}>
      <Markdown>{markdown}</Markdown>
    </Box>
  );
};
