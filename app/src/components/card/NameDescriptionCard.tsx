import { mdiClose } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import grey from '@mui/material/colors/grey';
import IconButton from '@mui/material/IconButton';
import Paper, { PaperProps } from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

interface INameDescriptionCardProps extends PaperProps {
  label: string;
  description?: string | null;
  onDelete?: () => void;
}

/**
 * Returns a grey card for displaying the title and description of an item
 *
 * @param {INameDescriptionCardProps} props
 * @returns
 */
export const NameDescriptionCard = (props: INameDescriptionCardProps) => {
  const { label, description, onDelete, ...boxProps } = props;

  return (
    <Paper elevation={0} {...boxProps} sx={{ p: 2, bgcolor: grey[100], ...boxProps.sx }}>
      <Box display="flex" justifyContent="space-between">
        <Typography variant="subtitle1" fontWeight="bold">
          {label}
        </Typography>
        <IconButton onClick={onDelete}>
          <Icon path={mdiClose} size={1} />
        </IconButton>
      </Box>
      {description && (
        <Box my={0.25}>
          <Typography variant="subtitle2" color="textSecondary">
            {description}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
