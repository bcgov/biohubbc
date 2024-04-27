import Typography from '@mui/material/Typography';
import { ICaptureResponse } from 'interfaces/useCritterApi.interface';

interface ICaptureCardDetails {
  capture: ICaptureResponse;
}

const CaptureCardDetails = (props: ICaptureCardDetails) => {
  const { capture } = props;
  return (
    <>
      <Typography variant="body2" color="textSecondary">
        {capture.capture_comment}
      </Typography>
    </>
  );
};

export default CaptureCardDetails;
