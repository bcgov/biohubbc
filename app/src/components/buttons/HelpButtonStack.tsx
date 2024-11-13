import Stack, { StackProps } from '@mui/material/Stack';
import HelpButtonTooltip from 'components/buttons/HelpButtonTooltip';
import { PropsWithChildren } from 'react';

interface IHelpButtonStackProps extends StackProps {
  helpText: string;
}

const HelpButtonStack = (props: PropsWithChildren<IHelpButtonStackProps>) => {
  const { helpText, children, ...stackProps } = props;
  return (
    <Stack flexDirection="row" alignItems="center" spacing={0.25} flexGrow={1} {...stackProps}>
      {children}
      <HelpButtonTooltip content={helpText} />
    </Stack>
  );
};

export default HelpButtonStack;
