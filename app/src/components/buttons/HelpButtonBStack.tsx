import Box from '@mui/material/Box';
import Stack, { StackProps } from '@mui/material/Stack';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import { PropsWithChildren } from 'react';

interface IHelpButtonStackProps extends StackProps {
  helpText: string;
}

const HelpButtonBStack = (props: PropsWithChildren<IHelpButtonStackProps>) => {
  const { helpText, children, ...stackProps } = props;
  return (
    <Stack flexDirection="row" alignItems="center" spacing={0.25} flexGrow={1} {...stackProps}>
      <Box sx={{ flexGrow: 1 }} width={'100%'}>
        {children}
      </Box>
      <HelpButtonTooltip content={helpText} />
    </Stack>
  );
};

export default HelpButtonBStack;
