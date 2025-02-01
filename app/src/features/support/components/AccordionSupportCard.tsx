import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import { Collapse } from '@mui/material';
import Box from '@mui/material/Box';
import Paper, { PaperProps } from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { MarkdownScoreButtons } from 'components/buttons/MarkdownScoreButtons';
import { CustomMarkdown } from 'components/markdown/CustomMarkdown';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { MarkdownTypeSupportNameEnum } from 'interfaces/useMarkdownApi.interface';
import React, { PropsWithChildren, ReactElement, useEffect, useState } from 'react';

interface IAccordionSupportCardProps extends PropsWithChildren<PaperProps> {
  label: string | React.ReactNode;
  subtitle?: string | React.ReactNode | null;
  ornament?: ReactElement;
  colour: string;
  disableCollapse?: boolean;
  onExpand?: () => void;
}

export const AccordionSupportCard = (props: IAccordionSupportCardProps) => {
  const { label, subtitle, children, colour, ornament, disableCollapse, onExpand, ...paperProps } = props;
  const [isCollapsed, setIsCollapsed] = useState(true);
  const expandable = (children || subtitle) && !disableCollapse;

  const handleHeaderClick = () => {
    if (expandable) {
      const newCollapseState = !isCollapsed;
      setIsCollapsed(newCollapseState);
      if (onExpand && !newCollapseState) {
        onExpand();
      }
    }
  };

  return (
    <Paper elevation={0} {...paperProps} sx={{ bgcolor: colour, ...paperProps.sx }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ cursor: expandable ? 'pointer' : 'default', px: 3, py: 2 }}
        onClick={handleHeaderClick}>
        <Typography
          variant="h5"
          sx={{
            '&::first-letter': {
              textTransform: 'capitalize'
            }
          }}>
          {label}
        </Typography>
        <Box display="flex" alignItems="center">
          {ornament}
          <Box ml={4}>{expandable && <Icon path={isCollapsed ? mdiChevronDown : mdiChevronUp} size={1} />}</Box>
        </Box>
      </Box>
      <Box sx={{ px: 3 }}>
        <Collapse in={!isCollapsed || disableCollapse}>
          {subtitle && (
            <Typography sx={{ pb: children ? 0 : 2 }} color="textSecondary">
              {subtitle}
            </Typography>
          )}
          {children}
        </Collapse>
      </Box>
    </Paper>
  );
};

// Markdown Retrieval
interface IHelpAccordionMarkdownProps {
  markdownType: MarkdownTypeSupportNameEnum;
  label: string | React.ReactNode;
  colour: string;
  subtitle?: string | React.ReactNode | null;
}

const HelpAccordionMarkdown = (props: IHelpAccordionMarkdownProps) => {
  const { markdownType, label, colour, subtitle } = props;
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [markdownId, setMarkdownId] = useState<number | null>(null); // Track the markdownId
  const [hasSubmittedScore, setHasSubmittedScore] = useState(false);
  const [justSubmittedScore, setJustSubmittedScore] = useState(false);
  const biohubApi = useBiohubApi();

  const fetchMarkdownContent = async () => {
    const { markdown } = await biohubApi.markdown.getMarkdown({ typeName: markdownType });
    if (markdown) {
      setMarkdownContent(markdown.data);
      setMarkdownId(markdown.markdown_id); // Extract the markdownId from the response
      setHasSubmittedScore(markdown.participated);
    }
  };

  const handleScoreSubmit = async (score: number) => {
    if (!markdownId) {
      console.error('Markdown ID is not available for scoring.');
      return;
    }

    try {
      await biohubApi.markdown.insertScore({ markdownId, score });
      setHasSubmittedScore(true);
      setJustSubmittedScore(true);
    } catch (error) {
      console.error('Failed to submit score:', error);
    }
  };

  useEffect(() => {
    fetchMarkdownContent();
  }, []);

  return (
    <AccordionSupportCard label={label} colour={colour} subtitle={subtitle} onExpand={fetchMarkdownContent}>
      {markdownContent ? (
        <>
          <CustomMarkdown markdown={markdownContent} />
          {!hasSubmittedScore && (
            <Box sx={{ mb: 2 }}>
              <MarkdownScoreButtons
                positiveText="This is Helpful"
                negativeText="This is Confusing"
                handleSubmit={handleScoreSubmit}
              />
            </Box>
          )}
          {justSubmittedScore && (
            <Box sx={{ mb: 2 }}>
              <Typography color="textSecondary">Thanks for your feedback!</Typography>
            </Box>
          )}
        </>
      ) : (
        <Typography>Loading content...</Typography>
      )}
    </AccordionSupportCard>
  );
};

export default HelpAccordionMarkdown;
