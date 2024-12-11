import { mdiHelpCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Button } from '@mui/material';
import { MarkdownTypeNameEnum } from 'interfaces/useMarkdownApi.interface';
import { PropsWithChildren } from 'react';

interface IHelpAccordionProps {
  markdownType: MarkdownTypeNameEnum;
}

/**
 * Returns a button that opens a dialog containing markdown, allowing the user to score the markdown text if they haven't scored it yet.
 *
 * @param {PropsWithChildren<IHelpButtonDialogProps>} props
 * @returns {*}
 */
const HelpAccordionMarkdown = (props: PropsWithChildren<IHelpAccordionProps>) => {
  const { markdownType, children } = props;

  const handleOpenDialog = () => {
    // Logic for opening the dialog goes here
    console.log(`Dialog opened for markdown type: ${markdownType}`);
  };

  return (
    <Button variant="outlined" startIcon={<Icon path={mdiHelpCircleOutline} size={1} />} onClick={handleOpenDialog}>
      {children ?? 'Help'}
    </Button>
  );
};

export default HelpAccordionMarkdown;
