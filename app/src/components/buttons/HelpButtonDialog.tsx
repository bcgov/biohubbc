import { mdiHelpCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Button } from '@mui/material';
import { CustomMarkdown } from 'components/markdown/CustomMarkdown';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';
import { PropsWithChildren } from 'react';

interface IHelpButtonDialogProps {
  markdownType: MarkdownTypeNameEnum;
}

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
  SURVEY_METADATA = 'Survey Metadata',
  OBSERVATIONS = 'Observations'
}

const HelpButtonDialog = ({ markdownType, children }: PropsWithChildren<IHelpButtonDialogProps>) => {
  const dialogContext = useDialogContext();
  const biohubApi = useBiohubApi();

  const handleOpenDialog = async () => {
    const { markdown } = await biohubApi.markdown.getMarkdown({ typeName: markdownType });

    if (markdown) {
      dialogContext.setVoteDialog(createDialogConfig(markdown));
    }
  };

  const createDialogConfig = (markdown: any) => ({
    open: true,
    dialogContent: <CustomMarkdown markdown={markdown.data} />,
    hasSubmitted: markdown.participated,
    onSubmit: async (score: number) => {
      await biohubApi.markdown.insertScore({ markdownId: markdown.markdown_id, score });
      dialogContext.setVoteDialog({ hasSubmitted: true });
    },
    onOk: () => {
      dialogContext.setVoteDialog({ open: false });
    }
  });

  return (
    <Button variant="outlined" startIcon={<Icon path={mdiHelpCircleOutline} size={1} />} onClick={handleOpenDialog}>
      {children ?? 'Help'}
    </Button>
  );
};

export default HelpButtonDialog;
