import { useEffect, useState } from 'react';

import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import { Box, IconButton, Typography } from '@mui/material';

import { MarkdownScoreButtons } from 'components/buttons/MarkdownScoreButtons';
import { CustomMarkdown } from 'components/markdown/CustomMarkdown';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';

import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { ACTIVE_VIEW_VALUE } from '../SurveyPage';

interface SurveyChecklistGuideProps {
  markdownType: MarkdownTypeNameEnum;
  activeView: ACTIVE_VIEW_VALUE | null;
  onClose: () => void;
}

export const SurveyChecklistGuide = ({ markdownType, onClose }: SurveyChecklistGuideProps) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const biohubApi = useBiohubApi();
  const dialogContext = useDialogContext();

  const markdownDataLoader = useDataLoader((typeName: MarkdownTypeNameEnum) =>
    biohubApi.markdown.getMarkdown({ typeName })
  );

  const markdown = markdownDataLoader.data?.markdown;

  useEffect(() => {
    markdownDataLoader.load(markdownType);
  }, [markdownDataLoader, markdownType]);

  useEffect(() => {
    if (markdown?.participated) {
      setHasSubmitted(true);
    }
  }, [markdown?.participated]);

  const handleSubmit = async (score: number) => {
    if (!markdown) {
      return;
    }

    await biohubApi.markdown.insertScore({
      markdownId: markdown.markdown_id,
      score
    });

    setHasSubmitted(true);
    dialogContext.setScoreDialog({ hasSubmitted: true });
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h4">Guide</Typography>

        <IconButton onClick={onClose}>
          <Icon path={mdiClose} size={1} />
        </IconButton>
      </Box>

      <Box flexShrink={0}>{markdown && <CustomMarkdown markdown={markdown.data} />}</Box>

      <Box mt={3}>
        {hasSubmitted ? (
          <Typography color="textSecondary">Thanks for your feedback!</Typography>
        ) : (
          <MarkdownScoreButtons
            positiveText="This is helpful"
            negativeText="This is confusing"
            handleSubmit={handleSubmit}
          />
        )}
      </Box>
    </>
  );
};
