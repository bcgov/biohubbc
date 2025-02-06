import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import Paper, { PaperProps } from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import React, { PropsWithChildren, ReactElement, useState } from 'react';

interface IAccordionStandardCardProps extends PaperProps {
  label: string | React.ReactElement;
  subtitle?: string | null;
  ornament?: ReactElement;
  colour: string;
  disableCollapse?: boolean;
  checkboxSelected?: boolean;
  handleCheckboxChange?: () => void;
  checkboxDisabled?: boolean;
}

/**
 * Returns a collapsible paper component for displaying lookup values
 *
 * @param {PropsWithChildren<IAccordionStandardCardProps>} props
 * @return {*}
 */
export const AccordionStandardCard = (props: PropsWithChildren<IAccordionStandardCardProps>) => {
  const {
    label,
    subtitle,
    children,
    colour,
    ornament,
    disableCollapse,
    checkboxSelected,
    handleCheckboxChange,
    checkboxDisabled,
    ...paperProps
  } = props;

  const [isCollapsed, setIsCollapsed] = useState(true);

  const expandable = (children || subtitle) && !disableCollapse;

  const handleHeaderClick = () => {
    if (expandable) {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <Paper elevation={0} {...paperProps} sx={{ bgcolor: colour, flex: '1 1 auto', ...paperProps.sx }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        sx={{ cursor: expandable ? 'pointer' : 'default', px: 3, py: 2 }}
        onClick={handleHeaderClick}>
        <Box display="flex" alignItems="center">
          {handleCheckboxChange && (
            <Checkbox
              checked={checkboxSelected}
              onClick={(e) => {
                handleCheckboxChange();
                // Stop propogation to prevent the accordion from expanding when the checkbox is clicked
                e.stopPropagation();
              }}
              disabled={checkboxDisabled}
              sx={{ mr: 1, ml: -1, position: 'absolute' }}
            />
          )}
          <Typography
            variant="h5"
            sx={{
              ml: handleCheckboxChange ? 5 : 0,
              '&::first-letter': {
                textTransform: 'capitalize'
              }
            }}>
            {label}
          </Typography>
        </Box>
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
