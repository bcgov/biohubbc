import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Collapse } from '@mui/material';
import Box from '@mui/material/Box';
import Paper, { PaperProps } from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { CustomMarkdown } from 'components/markdown/CustomMarkdown';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import React, { PropsWithChildren, ReactElement, useState } from 'react';

// Accordion Support Card Component
interface IAccordionSupportCardProps extends PaperProps {
  label: string | React.ReactNode;
  subtitle?: string | React.ReactNode | null;
  ornament?: ReactElement;
  colour: string;
  disableCollapse?: boolean;
  onExpand?: () => void; // Added callback for expand action
}

export const AccordionSupportCard = (props: PropsWithChildren<IAccordionSupportCardProps>) => {
  const { label, subtitle, children, colour, ornament, disableCollapse, onExpand, ...paperProps } = props;
  const [isCollapsed, setIsCollapsed] = useState(true);
  const expandable = (children || subtitle) && !disableCollapse;

  const handleHeaderClick = () => {
    if (expandable) {
      const newCollapseState = !isCollapsed;
      setIsCollapsed(newCollapseState);
      if (onExpand && newCollapseState === false) {
        // Trigger onExpand only when expanding
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
            <Typography sx={{ pb: !children ? 2 : 0 }} color="textSecondary">
              {subtitle}
            </Typography>
          )}
          {children}
        </Collapse>
      </Box>
    </Paper>
  );
};

// Help Accordion for Markdown Retrieval
interface IHelpAccordionMarkdownProps {
  markdownType: MarkdownTypeNameEnum;
  label: string | React.ReactNode;
  colour: string;
  subtitle?: string | React.ReactNode | null;
}

const HelpAccordionMarkdown = (props: PropsWithChildren<IHelpAccordionMarkdownProps>) => {
  const { markdownType, label, colour, subtitle } = props;
  const [markdownContent, setMarkdownContent] = useState<string | null>(null); // State for fetched content
  const biohubApi = useBiohubApi();

  const fetchMarkdownContent = async () => {
    const { markdown } = await biohubApi.markdown.getMarkdown({ typeName: markdownType });
    if (markdown) {
      setMarkdownContent(markdown.data);
    }
  };

  return (
    <AccordionSupportCard
      label={label}
      colour={colour}
      subtitle={subtitle}
      onExpand={fetchMarkdownContent} // Trigger fetchMarkdownContent when expanding
    >
      {markdownContent ? <CustomMarkdown markdown={markdownContent} /> : <Typography>Loading content...</Typography>}
    </AccordionSupportCard>
  );
};

export default HelpAccordionMarkdown;
