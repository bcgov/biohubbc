import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Collapse } from '@mui/material';
import Box, { BoxProps } from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

interface IAccordionStandardCardProps extends BoxProps {
  label: string;
  subtitle?: string | null;
  ornament?: JSX.Element;
  children?: JSX.Element;
  colour: string;
  disableCollapse?: boolean;
}

/**
 * Returns a collapsible paper component for displaying lookup values
 * @param props
 * @returns
 */
export const AccordionStandardCard = (props: IAccordionStandardCardProps) => {
  const { label, subtitle, children, colour, ornament, disableCollapse } = props;

  const [isCollapsed, setIsCollapsed] = useState(true);

  const expandable = (children || subtitle) && !disableCollapse;

  const handleHeaderClick = () => {
    if (expandable) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <Paper sx={{ bgcolor: colour, flex: '1 1 auto' }} elevation={0}>
      <Box
        display="flex"
        justifyContent="space-between"
        flex="1 1 auto"
        alignItems="center"
        sx={{ cursor: expandable ? 'pointer' : 'default', px: 3, py: 2 }}
        onClick={handleHeaderClick}>
        <Box display="flex" justifyContent="space-between" flex={0.975}>
          <Typography
            variant="h5"
            sx={{
              '&::first-letter': {
                textTransform: 'capitalize'
              }
            }}>
            {label}
          </Typography>
          {ornament}
        </Box>
        {expandable && <Icon path={isCollapsed ? mdiChevronDown : mdiChevronUp} size={1} />}
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
