import { mdiHelpCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Button } from '@mui/material';
import { CustomMarkdown } from 'components/markdown/CustomMarkdown';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';
import { PropsWithChildren } from 'react';

interface IHelpButtonDialogProps {
  markdownTypeName: string;
}

// These should match the names of records in the markdown type table
export enum MarkdownTypeNameEnum {
  PROJECTS_AND_SURVEYS = 'Projects and Surveys',
  SUMMARY_DATA = 'Summary Data',
  SAMPLING_INFORMATION = 'Sampling Information',
  SURVEY_DATA = 'Survey Data',
  PROJECT_DETAILS = 'Project Details',
  SURVEYS = 'Surveys',
  SURVEY_PAGE = 'Survey Page',
  TECHNIQUES = 'Techniques',
  SAMPLING_SITES = 'Sampling Sites',
  SURVEY_METADATA = 'Survey Metadata'
}

/**
 * Returns a help button that opens an info dialog when clicked, intended as a more informative alternative to a tooltip
 *
 * @param props PropsWithChildren<IHelpButtonDialogProps>
 * @returns
 */
const HelpButtonDialog = (props: PropsWithChildren<IHelpButtonDialogProps>) => {
  const { markdownTypeName, children } = props;

  const dialogContext = useDialogContext();
  const biohubApi = useBiohubApi();

  const handleOpenDialog = async () => {
    // Fetch the markdown content based on the markdownTypeName. Each dialog should correspond to a different markdownTypeName
    const { markdown } = await biohubApi.markdown.getMarkdown({ typeName: markdownTypeName });

    if (markdown) {
      dialogContext.setVoteDialog({
        open: true,
        dialogContent: <CustomMarkdown markdown={markdown.data} />,
        onSubmit: !markdown.participated
          ? async (score: number) => {
              await biohubApi.markdown.vote(score);
            }
          : undefined,
        onOk: () => dialogContext.setVoteDialog({ open: false })
      });
    }
  };

  return (
    <Button variant="outlined" startIcon={<Icon path={mdiHelpCircleOutline} size={1} />} onClick={handleOpenDialog}>
      {children ? children : 'Help'}
    </Button>
  );
};

export default HelpButtonDialog;
