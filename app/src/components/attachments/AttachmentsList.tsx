import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  IconButton,
  Paper,
  TableRow,
  TableHead,
  TableContainer,
  TableCell,
  TableBody,
  Table,
  TablePagination,
  Link
} from '@material-ui/core';
import Icon from '@mdi/react';
import { mdiTrashCanOutline } from '@mdi/js';
import clsx from 'clsx';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IGetProjectAttachment } from 'interfaces/useProjectApi.interface';
import { getFormattedDate } from 'utils/Utils';
import { DATE_FORMAT } from 'constants/dateFormats';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  heading: {
    fontWeight: 'bold'
  },
  tableCellBorderTop: {
    borderTop: '1px solid rgba(224, 224, 224, 1)'
  }
});

export interface IAttachmentsListProps {
  projectId: number
}

const AttachmentsList: React.FC<IAttachmentsListProps> = (props) => {
  const classes = useStyles();
  const biohubApi = useBiohubApi();

  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const getAttachments = async () => {
    try {
      const response = await biohubApi.project.getProjectAttachments(props.projectId);

      if (!response?.attachmentsList) {
        return;
      }

      setAttachmentsList([...response.attachmentsList]);
    } catch (error) {
      return error;
    }
  };

  useEffect(() => {
    getAttachments();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const deleteAttachment = async (attachment: any) => {
    try {
      const response = await biohubApi.project.deleteProjectAttachment(props.projectId, attachment.id);

      if (!response) {
        return;
      }

      getAttachments();
    } catch (error) {
      return error;
    }
  };

  const viewFileContents = async (attachment: any) => {
    try {
      // const response = await biohubApi.project.getAttachmentSignedURL(props.projectId, attachment.id);

      // if (!response) {
      //   return;
      // }

      // console.log(response);

      const url = 'https://nrs.objectstore.gov.bc.ca/gblhvt/2/10MB.pdf';
      window.open(url);
    } catch (error) {
      return error;
    }
  };

  return (
    <Paper>
      <TableContainer>
        <Table className={classes.table} aria-label="attachments-list-table">
          <TableHead>
            <TableRow>
              <TableCell className={classes.heading}>Name</TableCell>
              <TableCell className={classes.heading}>Last Modified</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {attachmentsList.length > 0 && attachmentsList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
              <TableRow key={row.fileName}>
                <TableCell component="th" scope="row">
                  <Link
                    underline="always"
                    component="button"
                    variant="body2"
                    onClick={() => viewFileContents(row)}>
                    {row.fileName}
                  </Link>
                </TableCell>
                <TableCell>{getFormattedDate(DATE_FORMAT.ShortDateFormatMonthFirst, row.lastModified)}</TableCell>
                <TableCell align="right" className={clsx(index === 0 && classes.tableCellBorderTop)}>
                  <IconButton color="primary" aria-label="delete-attachment" onClick={() => deleteAttachment(row)}>
                    <Icon path={mdiTrashCanOutline} size={1} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!attachmentsList.length && (
              <TableRow>
                <TableCell colSpan={2} align="center">No Attachments</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {attachmentsList.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 15, 20]}
          component="div"
          count={attachmentsList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
};

export default AttachmentsList;
