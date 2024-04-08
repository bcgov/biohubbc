import { mdiFileOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import useTheme from '@mui/material/styles/useTheme';
import { PublishStatus } from 'constants/attachments';

const useStyles = () => {
  const theme = useTheme();

  return {
    importFile: {
      display: 'flex',
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
      paddingRight: theme.spacing(2),
      paddingLeft: '20px',
      overflow: 'hidden',
      '& .importFile-icon': {
        color: '#1a5a96'
      },
      '&.error': {
        borderColor: '#ebccd1',
        '& .importFile-icon': {
          color: theme.palette.error.main
        },
        '& .MuiLink-root': {
          color: theme.palette.error.main
        },
        '& .MuiChip-root': {
          display: 'none'
        }
      }
    },
    observationFileName: {
      marginTop: '2px',
      marginBottom: '4px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      textDecoration: 'underline',
      cursor: 'pointer'
    },
    chip: {
      minWidth: '7rem',
      fontSize: '11px',
      textTransform: 'uppercase'
    },
    chipUnSubmitted: {
      borderColor: '#afd3ee',
      backgroundColor: 'rgb(232, 244, 253)'
    },
    chipSubmitted: {
      color: '#2D4821',
      backgroundColor: '#DFF0D8'
    }
  };
};

export interface IAttachmentsFileCardProps {
  fileName: string;
  status: PublishStatus;
  submittedDate?: string;
}

const AttachmentsFileCard = (props: IAttachmentsFileCardProps) => {
  const classes = useStyles();

  const submittedDate: Date | string = props.submittedDate
    ? new Date(props.submittedDate).toISOString().split('T')[0]
    : 'YYYY-MM-DD';

  return (
    <Paper variant="outlined" sx={classes.importFile}>
      <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
        <Box display="flex" alignItems="center" flex="1 1 auto" style={{ overflow: 'hidden' }}>
          <Box display="flex" alignItems="center" flex="0 0 auto" mr={2} className="importFile-icon">
            <Icon path={mdiFileOutline} size={1} />
          </Box>
          <Box mr={2} flex="1 1 auto" style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <strong>{props.fileName}</strong>
          </Box>
        </Box>

        <Box flex="0 0 auto" display="flex" alignItems="center">
          <Chip
            title={props.status === PublishStatus.SUBMITTED ? 'SUBMITTED' : 'UNSUBMITTED'}
            variant="outlined"
            sx={{
              ...classes.chip,
              ...(props.status === PublishStatus.SUBMITTED ? classes.chipSubmitted : classes.chipUnSubmitted)
            }}
            label={props.status === PublishStatus.SUBMITTED ? `SUBMITTED: ${submittedDate}` : 'UNSUBMITTED'}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default AttachmentsFileCard;
