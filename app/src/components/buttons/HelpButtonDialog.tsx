import { mdiHelpCircleOutline } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Button } from '@mui/material';
import { useDialogContext } from 'hooks/useContext';
import { PropsWithChildren, ReactNode } from 'react';

interface IHelpButtonDialogProps {
  dialogTitle: string;
  dialogText: string;
  dialogContent?: ReactNode;
}

/**
 * Returns a help button that opens an info dialog when clicked, intended as a more informative alternative to a tooltip
 *
 * @param props PropsWithChildren<IHelpButtonDialogProps>
 * @returns
 */
const HelpButtonDialog = (props: PropsWithChildren<IHelpButtonDialogProps>) => {
  const { dialogTitle, dialogText, dialogContent, children } = props;

  const dialogContext = useDialogContext();

  return (
    <Button
      variant="outlined"
      startIcon={<Icon path={mdiHelpCircleOutline} size={1} />}
      onClick={() => {
        dialogContext.setInfoDialog({
          open: true,
          dialogTitle,
          dialogText,
          dialogContent,
          onOk: () => dialogContext.setInfoDialog({ open: false })
        });
      }}>
      {children ? children : 'Help'}
    </Button>
  );
};

export default HelpButtonDialog;
