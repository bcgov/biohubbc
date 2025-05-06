import Stack, { StackProps } from '@mui/material/Stack';
import HelpButtonTooltip from 'components/tooltip/HelpButtonTooltip';
import { PropsWithChildren } from 'react';

interface IHelpButtonStackProps extends StackProps {
  helpText?: string;
}

const HelpButtonStack = (props: PropsWithChildren<IHelpButtonStackProps>) => {
  const { helpText, children, ...stackProps } = props;
  return (
    <Stack flexDirection="row" alignItems="center" gap={0.75} flexGrow={1} mt={-1} {...stackProps}>
      {children}
      {helpText ? <HelpButtonTooltip content={helpText} /> : null}
    </Stack>
  );
};

export default HelpButtonStack;
