import { Typography } from '@mui/material';

interface ISurveyMapTooltipProps {
  label: string;
}

const SurveyMapTooltip = (props: ISurveyMapTooltipProps) => {
  return (
    <Typography component="dt" sx={{ fontSize: '0.8rem' }} color="textSecondary" fontWeight={700}>
      {props.label}
    </Typography>
  );
};

export default SurveyMapTooltip;
