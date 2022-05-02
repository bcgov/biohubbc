import { DialogTitle } from '@material-ui/core';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiPencilOutline, mdiTrayArrowDown } from '@mdi/js';
import Icon from '@mdi/react';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetReportMetaData } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { getFormattedDateRangeString } from 'utils/Utils';

export interface IViewFileWithMetaDialogProps {
  open: boolean;
  onEdit?: () => void;
  onClose: () => void;
  onDownload: () => void;
  reportMetaData: IGetReportMetaData | null;
  attachmentSize: string;
  dialogProps?: DialogProps;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const ViewFileWithMetaDialog: React.FC<IViewFileWithMetaDialogProps> = (props) => {
  const { reportMetaData } = props;

  const [showEditButton] = useState<boolean>(!!props.onEdit);

  if (!props.open) {
    return <></>;
  }

  return (
    <>
      <Dialog open={props.open} onClose={props.onClose} {...props.dialogProps} data-testid="view-meta-dialog">
        <DialogTitle data-testid="view-meta-dialog-title">
          {reportMetaData?.title}
        </DialogTitle>
        <DialogContent>
          <Box component="dl">
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography component="dt" variant="body2" color="textSecondary">
                  Summary
                </Typography>
                <Box mt={0.5} component="dd">
                  {reportMetaData?.description}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography component="dt" variant="body2" color="textSecondary">
                  Year Published
                </Typography>
                <Box mt={0.5} component="dd">
                  {reportMetaData?.year_published}
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography component="dt" variant="body2" color="textSecondary">
                  Last Modified
                </Typography>
                <Box mt={0.5} component="dd">
                  {getFormattedDateRangeString(DATE_FORMAT.ShortMediumDateFormat, reportMetaData?.last_modified || '')}
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography component="dt" variant="body2" color="textSecondary">
                  Authors
                </Typography>
                <Box mt={0.5} component="dd">
                  {reportMetaData?.authors?.map((author) => [author.first_name, author.last_name].join(' ')).join(', ')}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            startIcon={<Icon path={mdiTrayArrowDown} size={0.875} />}
            onClick={props.onDownload}>
            Download ({props.attachmentSize})
          </Button>
          {showEditButton && (
            <Button
              color="primary"
              variant="outlined"
              startIcon={<Icon path={mdiPencilOutline} size={0.875} />}
              onClick={props.onEdit}>
              Edit Details
            </Button>
          )}
          <Button onClick={props.onClose} color="primary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewFileWithMetaDialog;
