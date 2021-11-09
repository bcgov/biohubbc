import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Dialog, { DialogProps } from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { mdiDownload, mdiPencilOutline } from '@mdi/js';
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
        <DialogContent>
          <Box>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} height="2rem">
              <Typography data-testid="view-meta-dialog-title" variant="h3">
                {reportMetaData?.title}
              </Typography>
              {showEditButton && (
                <Button
                  variant="text"
                  color="primary"
                  className="sectionHeaderButton"
                  onClick={props.onEdit}
                  title="Edit Report"
                  aria-label="Edit Report"
                  startIcon={<Icon path={mdiPencilOutline} size={0.875} />}>
                  Edit
                </Button>
              )}
            </Box>
            <dl>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={12} md={12}>
                  <Typography component="dt" variant="subtitle2" color="textSecondary">
                    Last modified{' '}
                    {getFormattedDateRangeString(
                      DATE_FORMAT.ShortMediumDateFormat,
                      reportMetaData?.last_modified || ''
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                  <Typography component="dd" variant="body1">
                    {reportMetaData?.description}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Typography component="dt" variant="subtitle2" color="textSecondary">
                    Year Published
                  </Typography>
                  <Typography component="dd" variant="body1">
                    {reportMetaData?.year_published}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <Typography component="dt" variant="subtitle2" color="textSecondary">
                    Authors
                  </Typography>
                  <Typography component="dd" variant="body1">
                    {reportMetaData?.authors
                      ?.map((author) => [author.first_name, author.last_name].join(' '))
                      .join(', ')}
                  </Typography>
                </Grid>
              </Grid>
            </dl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={props.onDownload}
            color="primary"
            variant="contained"
            startIcon={<Icon path={mdiDownload} size={0.875} />}>
            Download Report ({props.attachmentSize})
          </Button>
          <Button onClick={props.onClose} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewFileWithMetaDialog;
