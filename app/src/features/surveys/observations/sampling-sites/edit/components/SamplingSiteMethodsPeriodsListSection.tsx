import { Box, Typography } from '@mui/material';

interface ISamplingSiteMethodPeriodsListSectionProps {
  title: string;
  body: JSX.Element;
}

const SamplingSiteMethodPeriodsListSection = (props: ISamplingSiteMethodPeriodsListSectionProps) => {
  return (
    <Box mb={1}>
      <Typography
        color="textSecondary"
        mb={1.5}
        sx={{
          fontWeight: 700,
          letterSpacing: '0.02rem',
          textTransform: 'uppercase',
          fontSize: '0.7rem'
        }}>
        {props.title}
      </Typography>
      {props.body}
    </Box>
  );
};

export default SamplingSiteMethodPeriodsListSection;
