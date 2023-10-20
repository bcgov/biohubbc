import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Typography from '@mui/material/Typography';
import { IErrorDetailsProps } from 'components/file-upload/FileUploadItem';
import { useState } from 'react';

/**
 * Upload item error details.
 *
 * @param {*} props
 * @return {*}
 */
const FileUploadItemErrorDetails = (props: IErrorDetailsProps) => {
  const [showErrorDetails, setShowErrorDetails] = useState<boolean>(false);

  if (!props.error) {
    return <></>;
  }

  if (!props.errorDetails?.length) {
    return <></>;
  }

  return (
    <>
      <Button
        variant="text"
        size="small"
        onClick={() => setShowErrorDetails(!showErrorDetails)}
        startIcon={<Icon path={(showErrorDetails && mdiChevronUp) || mdiChevronDown} size={1} />}
        sx={{ color: 'text.secondary' }}>
        {`${(showErrorDetails && 'Hide') || 'Show'} Details`}
      </Button>
      <Collapse in={showErrorDetails}>
        <Typography variant="body2" color="text.secondary">
          <List disablePadding dense>
            {props.errorDetails?.map((detail) => (
              <ListItem disableGutters key={detail._id}>
                {detail.message}
              </ListItem>
            ))}
          </List>
        </Typography>
      </Collapse>
    </>
  );
};

export default FileUploadItemErrorDetails;
