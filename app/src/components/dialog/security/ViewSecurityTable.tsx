import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { mdiLockOpenOutline, mdiLockOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { IGetAttachmentDetails, IGetReportDetails, IGetSecurityReasons } from 'interfaces/useProjectApi.interface';
import { default as React } from 'react';
import { getFormattedDateRangeString } from 'utils/Utils';

export interface IViewSecurityTableProps {
  securityDetails: IGetReportDetails | IGetAttachmentDetails | null;
  showAddSecurityDialog: (value: boolean) => void;
  showDeleteSecurityReasonDialog: (securityReasons: IGetSecurityReasons[]) => void;
}

/**
 * General information content for a project.
 *
 * @return {*}
 */
const ViewSecurityTable: React.FC<IViewSecurityTableProps> = (props) => {

  return (
    <>
      <Paper variant="outlined" style={{ marginTop: '24px' }}>
        <Toolbar style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h5" component="h3">
            Security Reasons
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon path={mdiLockOutline} size={0.8} />}
              style={{ marginRight: '8px' }}
              onClick={() => props.showAddSecurityDialog(true)}>
              Add Security
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (props.securityDetails?.security_reasons) {
                  props.showDeleteSecurityReasonDialog(props.securityDetails?.security_reasons);
                }
              }}
              startIcon={<Icon path={mdiLockOpenOutline} size={0.8} />}>
              Remove Security
            </Button>
          </Box>
        </Toolbar>
        <Divider></Divider>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell width="200">Category</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell width="160">Dates</TableCell>
                <TableCell width="160">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.securityDetails &&
                props.securityDetails?.security_reasons &&
                props.securityDetails?.security_reasons?.length > 0 &&
                props.securityDetails?.security_reasons?.map((row, index) => {
                  return (
                    <TableRow key={`${row.security_reason_id}-${index}`}>
                      <TableCell>Persecution or Harm</TableCell>
                      <TableCell>
                        <Typography style={{ fontWeight: 700 }}>{row.security_reason_title}</Typography>
                        <Typography variant="body1" color="textSecondary">
                          {row.security_reason_description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" component="div">
                          Expired
                        </Typography>

                        <Typography variant="body2" component="div" color="textSecondary">
                          {row.date_expired ? row.date_expired : 'N/A'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="primary"
                          onClick={() => props.showDeleteSecurityReasonDialog([row])}
                          startIcon={<Icon path={mdiLockOpenOutline} size={0.8} />}>
                          Remove
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}

              {props.securityDetails && props.securityDetails?.security_reasons?.length === 0 && (
                <TableRow key={`0`}>
                  <TableCell>Security Administration</TableCell>
                  <TableCell>
                    <Typography style={{ fontWeight: 700 }}>Awaiting Security Review</Typography>
                    <Typography variant="body1" color="textSecondary">
                      Awaiting review to determine if security-reasons should be assigned
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" component="div">
                      Submitted
                    </Typography>
                    <Typography variant="body2" component="div" color="textSecondary">
                      {getFormattedDateRangeString(
                        DATE_FORMAT.ShortMediumDateFormat,
                         '' //props.securityDetails?.metadata?.last_modified ||
                      )}
                    </Typography>
                  </TableCell>
                  <TableCell></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </>
  );
};

export default ViewSecurityTable;
