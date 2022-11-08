import Box from '@material-ui/core/Box';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Divider from '@material-ui/core/Divider';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TextField from '@material-ui/core/TextField';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import { mdiAttachment, mdiChevronDown, mdiLockOutline, mdiFilePdfBox } from '@mdi/js';
import Icon from '@mdi/react';
import AttachmentsList from 'components/attachments/AttachmentsList';
import { IUploadHandler } from 'components/attachments/FileUploadItem';
import { IReportMetaForm } from 'components/attachments/ReportMetaForm';
import FileUploadWithMetaDialog from 'components/dialog/FileUploadWithMetaDialog';
// import { H2MenuToolbar } from 'components/toolbar/ActionToolbars';
import { useBiohubApi } from 'hooks/useBioHubApi';
import {
  IGetProjectAttachment,
  IGetProjectForViewResponse,
  IUploadAttachmentResponse
} from 'interfaces/useProjectApi.interface';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { AttachmentType } from '../../../constants/attachments';

export interface IProjectAttachmentsProps {
  projectForViewData: IGetProjectForViewResponse;
}

/**
 * Project attachments content for a project.
 *
 * @return {*}
 */
const ProjectAttachments: React.FC<IProjectAttachmentsProps> = () => {
  const urlParams = useParams();
  const projectId = urlParams['id'];
  const biohubApi = useBiohubApi();

  const [openUploadAttachments, setOpenUploadAttachments] = useState(false);
  const [attachmentType, setAttachmentType] = useState<AttachmentType.REPORT | AttachmentType.OTHER>(
    AttachmentType.OTHER
  );
  const [attachmentsList, setAttachmentsList] = useState<IGetProjectAttachment[]>([]);

  const handleUploadReportClick = () => {
    setAttachmentType(AttachmentType.REPORT);
    setOpenUploadAttachments(true);
  };
  const handleUploadAttachmentClick = () => {
    setAttachmentType(AttachmentType.OTHER);
    setOpenUploadAttachments(true);
  };

  const getAttachments = useCallback(
    async (forceFetch: boolean) => {
      if (attachmentsList.length && !forceFetch) {
        return;
      }

      try {
        const response = await biohubApi.project.getProjectAttachments(projectId);

        if (!response?.attachmentsList) {
          return;
        }

        setAttachmentsList([...response.attachmentsList]);
      } catch (error) {
        return error;
      }
    },
    [biohubApi.project, projectId, attachmentsList.length]
  );

  const getUploadHandler = (): IUploadHandler<IUploadAttachmentResponse> => {
    return (file, cancelToken, handleFileUploadProgress) => {
      return biohubApi.project.uploadProjectAttachments(projectId, file, cancelToken, handleFileUploadProgress);
    };
  };

  const getFinishHandler = () => {
    return (fileMeta: IReportMetaForm) => {
      return biohubApi.project.uploadProjectReports(projectId, fileMeta.attachmentFile, fileMeta).finally(() => {
        setOpenUploadAttachments(false);
      });
    };
  };

  useEffect(() => {
    getAttachments(false);
    // eslint-disable-next-line
  }, []);

  const [open, setOpen] = React.useState(false);

  const openSecurityDialog = () => {
    setOpen(true);
  };

  const closeSecurityDialog = () => {
    setOpen(false);
  };

  // Show/Hide Project Settings Menu
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <FileUploadWithMetaDialog
        open={openUploadAttachments}
        dialogTitle={attachmentType === 'Report' ? 'Upload Report' : 'Upload Attachment'}
        attachmentType={attachmentType}
        onFinish={getFinishHandler()}
        onClose={() => {
          setOpenUploadAttachments(false);
          getAttachments(true);
        }}
        uploadHandler={getUploadHandler()}
      />

      {/* Prototype Dialog for Applying Security Reasons */}
      <Dialog
        fullWidth
        maxWidth="lg"
        open={open}
        onClose={closeSecurityDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <DialogTitle>Apply Security Reasons</DialogTitle>
        <DialogContent style={{paddingTop: 0, paddingBottom: 0}}>
          <Typography variant="body1" color="textSecondary" style={{marginBottom: '24px'}}>
            Apply one or more security reasons to selected documents.
          </Typography>
          <Divider></Divider>
          <TableContainer>
            <Table>
            <TableHead>
              <TableRow>
                <TableCell width="70" padding="checkbox"></TableCell>
                <TableCell width="200">Category</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell width="160">Expiry Date</TableCell>
              </TableRow> 
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox color="primary"/>
                </TableCell>
                <TableCell>Persecution or Harm</TableCell>
                <TableCell>
                  <Typography style={{fontWeight: 700}}>Reason Title</Typography>
                  <Typography variant="body2" color="textSecondary">Reason Description</Typography>
                </TableCell>
                <TableCell>
                  <TextField type="date" variant="outlined" size="small"></TextField>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox color="primary"/>
                </TableCell>
                <TableCell>Persecution or Harm</TableCell>
                <TableCell>
                  <Typography style={{fontWeight: 700}}>Reason Title</Typography>
                  <Typography variant="body2" color="textSecondary">Reason Description</Typography>
                </TableCell>
                <TableCell>
                  <TextField type="date" variant="outlined" size="small" fullWidth></TextField>
                </TableCell>
              </TableRow>  
            </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button
            color="primary"
            variant="contained"
            onClick={closeSecurityDialog}>
            Apply
          </Button>
          <Button
            color="primary"
            variant="outlined"
            onClick={closeSecurityDialog}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Need to use the regular toolbar in lieu of these action toolbars given it doesn't support multiple buttons */}
      <Toolbar style={{display: 'flex', justifyContent: 'space-between'}}>
        <Typography variant="h4" component="h2">Documents</Typography>
        <Box>
          <Button
            color="primary"
            variant="contained"
            endIcon={<Icon path={mdiChevronDown} size={0.8} />}
            aria-controls="simple-menu"
            aria-haspopup="true"
            onClick={handleClick}>
            Submit Documents
          </Button>
          <Menu style={{marginTop: '8px'}}
            id="attachmentsMenu"
            anchorEl={anchorEl}
            getContentAnchorEl={null}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right'
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right'
            }}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem onClick={handleUploadReportClick}>
              <ListItemIcon>
                <Icon path={mdiFilePdfBox} size={1} />
              </ListItemIcon>
              <Typography variant="inherit">Submit Report</Typography>
            </MenuItem>
            <MenuItem onClick={handleUploadAttachmentClick}>
              <ListItemIcon>
                <Icon path={mdiAttachment} size={1} />
              </ListItemIcon>
              <Typography variant="inherit">Submit Attachments</Typography>
            </MenuItem>
          </Menu>
          <Button
            style={{marginLeft: '8px'}}
            variant="contained"
            color="primary"
            startIcon={<Icon path={mdiLockOutline} size={0.8} />}
            onClick={openSecurityDialog}>
            Apply Security
          </Button>
        </Box>
      </Toolbar>
      <Divider></Divider>
      <Box px={1}>
        <AttachmentsList projectId={projectId} attachmentsList={attachmentsList} getAttachments={getAttachments} />
      </Box>
    </>
  );
};

export default ProjectAttachments;
