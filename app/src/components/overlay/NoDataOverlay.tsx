import Icon from '@mdi/react';
import Box, { BoxProps } from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface INoDataOverlayProps extends BoxProps {
  title?: string;
  subtitle?: string;
  icon?: string;
}

/**
 * Generic overlay displayed with instructions for how to add data.
 * Typically used as a child of <GridOverlay> with MUI's DataGrid
 *
 * @returns
 */
export const NoDataOverlay = (props: INoDataOverlayProps) => {
  const { title, subtitle, icon } = props;
  return (
    <Box justifyContent="center" display="flex" flexDirection="column" height="100%" {...props}>
      <Typography mb={1} variant="h4" color="textSecondary" textAlign="center">
        {title}
        {icon && <Icon path={icon} size={1} style={{ marginLeft: '8px' }} />}
      </Typography>
      <Typography color="textSecondary" textAlign="center">
        {subtitle}
      </Typography>
    </Box>
  );
};
