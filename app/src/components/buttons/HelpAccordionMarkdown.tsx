import { mdiPlusBoxOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Button } from '@mui/material';
import { CustomMarkdown } from 'components/markdown/CustomMarkdown';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useDialogContext } from 'hooks/useContext';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { PropsWithChildren, useState } from 'react';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { Collapse } from '@mui/material';
import Box from '@mui/material/Box';
import Paper, { PaperProps } from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React, { ReactElement } from 'react';

// Accordion Support Card Component
interface IAccordionSupportCardProps extends PaperProps {
  label: string | React.ReactNode;
  subtitle?: string | React.ReactNode | null;
  ornament?: ReactElement;
  colour: string;
  disableCollapse?: boolean;
}

export const AccordionSupportCard = (props: PropsWithChildren<IAccordionSupportCardProps>) => {
  const { label, subtitle, children, colour, ornament, disableCollapse, ...paperProps } = props;
  const [isCollapsed, setIsCollapsed] = useState(true);
  const expandable = (children || subtitle) && !disableCollapse;

  const handleHeaderClick = () => {
    if (expandable) {
      setIsCollapsed(!isCollapsed);
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
  const dialogContext = useDialogContext();
  const biohubApi = useBiohubApi();

  const createDialogConfig = (markdown: any) => ({
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
    <AccordionSupportCard label={label} colour={colour} subtitle={subtitle}>
      <Button onClick={handleOpenDialog} startIcon={<Icon path={mdiPlusBoxOutline} size={1} />}>
        Get Help
      </Button>
    </AccordionSupportCard>
  );
};

export default HelpAccordionMarkdown;
