import { mdiInformationSlabBoxOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import IconButton from '@mui/material/IconButton';
import { CustomMarkdown } from 'components/markdown/CustomMarkdown';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';
import { MarkdownPayload, MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';

interface IHelpButtonDialogProps {
  markdownType: MarkdownTypeNameEnum;
}

/**
 * Returns a button that opens a dialog containing markdown, allowing the user to score the markdown text if they haven't scored it yet.
 *
 * @param {IHelpButtonDialogProps} props
 * @returns {*}
 */
const HelpButtonDialog = (props: IHelpButtonDialogProps) => {
  const { markdownType } = props;

  const dialogContext = useDialogContext();
  const biohubApi = useBiohubApi();

  const createDialogConfig = (markdown: MarkdownPayload) => ({
    open: true,
    dialogContent: <CustomMarkdown markdown={markdown.data} />,
    hasSubmitted: markdown.participated,
    onSubmit: async (score: number) => {
      await biohubApi.markdown.insertScore({ markdownId: markdown.markdown_id, score });
      dialogContext.setScoreDialog({ hasSubmitted: true });
    },
    onOk: () => {
      dialogContext.setScoreDialog({ open: false });
    }
  });

  // Open the markdown dialog
  const handleOpenDialog = async () => {
    const { markdown } = await biohubApi.markdown.getMarkdown({ typeName: markdownType });

    if (markdown) {
      dialogContext.setScoreDialog(createDialogConfig(markdown));
    }
  };

  return (
    <IconButton onClick={handleOpenDialog}>
      <Icon path={mdiInformationSlabBoxOutline} size={1} />
    </IconButton>
  );
};

export default HelpButtonDialog;
