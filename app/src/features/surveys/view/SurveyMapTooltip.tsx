import Typography from '@mui/material/Typography';
import { Tooltip } from 'react-leaflet';

interface ISurveyMapTooltipProps {
  title: string;
}

/**
 * Returns a popup component for displaying information about a leaflet map layer upon hover
 *
 * @param {ISurveyMapTooltipProps} props
 * @return {*}
 */
const SurveyMapTooltip = (props: ISurveyMapTooltipProps) => {
  return (
    <Tooltip direction="top" sticky={true}>
      <Typography component="dt" sx={{ fontSize: '0.8rem' }} color="textSecondary" fontWeight={700}>
        {props.title}
      </Typography>
    </Tooltip>
  );
};

export default SurveyMapTooltip;
