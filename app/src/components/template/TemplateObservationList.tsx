import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import { DATE_FORMAT } from 'constants/dateTimeFormats';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import React, { useState } from 'react';
import { handleChangePage, handleChangeRowsPerPage } from 'utils/tablePaginationUtils';
import { getFormattedDate } from 'utils/Utils';

const useStyles = makeStyles({
  table: {
    minWidth: 650
  },
  heading: {
    fontWeight: 'bold'
  },
  tableCellBorderTop: {
    borderTop: '1px solid rgba(224, 224, 224, 1)'
  }
});

export interface ITemplateObservationsListProps {
  projectId: number;
  surveyId?: number;
  attachmentsList: IGetProjectAttachment[];
  getAttachments: (forceFetch: boolean) => void;
}

const TemplateObservationsList: React.FC<ITemplateObservationsListProps> = (props) => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const viewFileContents = async (attachment: any) => {
    try {
      let response;

      if (props.surveyId) {
        response = await biohubApi.survey.getTemplateObservationsSignedURL(
          props.projectId,
          props.surveyId,
          attachment.id
        );
      }

      if (!response) {
        return;
      }

      window.open(response);
    } catch (error) {
      return error;
    }
  };

  const getFormattedFileSize = (fileSize: number) => {
    // kilobyte size
    if (fileSize < 1000000) {
      return `${(fileSize / 1000).toFixed(1)} KB`;
    }

    // megabyte size
    if (fileSize < 1000000000) {
      return `${(fileSize / 1000000).toFixed(1)} MB`;
    }

    // gigabyte size
    return `${(fileSize / 1000000000).toFixed(1)} GB`;
  };

  return (
    <>
      <Paper>
        <TableContainer>
          <Table className={classes.table} aria-label="attachments-list-table">
            <TableHead>
              <TableRow>
                <TableCell className={classes.heading}>Name</TableCell>
                <TableCell className={classes.heading}>Last Modified</TableCell>
                <TableCell className={classes.heading}>File Size</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {props.attachmentsList.length > 0 &&
                props.attachmentsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                  <TableRow key={row.id}>
                    <TableCell component="th" scope="row">
                      <Link underline="always" component="button" variant="body2" onClick={() => viewFileContents(row)}>
                        {row.fileName}
                      </Link>
                    </TableCell>
                    <TableCell>{getFormattedDate(DATE_FORMAT.ShortMediumDateTimeFormat, row.lastModified)}</TableCell>
                    <TableCell>{getFormattedFileSize(row.size)}</TableCell>
                  </TableRow>
                ))}
              {!props.attachmentsList.length && (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No template observations
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {props.attachmentsList.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 15, 20]}
            component="div"
            count={props.attachmentsList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onChangePage={(event: unknown, newPage: number) => handleChangePage(event, newPage, setPage)}
            onChangeRowsPerPage={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleChangeRowsPerPage(event, setPage, setRowsPerPage)
            }
          />
        )}
      </Paper>
    </>
  );
};

export default TemplateObservationsList;
