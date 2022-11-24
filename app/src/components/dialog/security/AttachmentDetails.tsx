import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Typography from '@material-ui/core/Typography';
import { mdiTrayArrowDown } from '@mdi/js';
import Icon from '@mdi/react';
import { default as React } from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  docTitle: {
    display: '-webkit-box',
    '-webkit-line-clamp': 2,
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden'
  },
  docDL: {
    margin: 0,
    '& dt': {
      flex: '0 0 200px',
      margin: '0',
      color: theme.palette.text.secondary
    },
    '& dd': {
      flex: '1 1 auto'
    }
  },
  docMetaRow: {
    display: 'flex'
  }
}));

export interface IAttachmentDetailsProps {
  title: string;
  attachmentSize: string;
  onFileDownload: () => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const AttachmentDetails: React.FC<IAttachmentDetailsProps> = (props) => {
  const classes = useStyles();

  return (
    <>
      <Box display="flex" justifyContent="space-between">
        <Box style={{ maxWidth: '120ch' }}>
          <Typography variant="h2" component="h1" className={classes.docTitle}>
            {props.title}
          </Typography>
        </Box>

        <Box display="flex" flex="0 0 auto">
          <Button
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiTrayArrowDown} size={0.8} />}
            onClick={() => props.onFileDownload()}>
            Download ({props.attachmentSize})
          </Button>
        </Box>
      </Box>
    </>
  );
};

export default AttachmentDetails;
