import { Typography } from '@mui/material';

interface ISurveyMapTooltipProps {
  label: string;
}

/**
 * Returns a popup component for displaying information about a leaflet map layer upon hover
 *
 * @param props {ISurveyMapPopupProps}
 * @returns
 */
const SurveyMapTooltip = (props: ISurveyMapTooltipProps) => {
  return (
    <Typography component="dt" sx={{ fontSize: '0.8rem' }} color="textSecondary" fontWeight={700}>
      {props.label}
    </Typography>
  );
};

export default SurveyMapTooltip;
