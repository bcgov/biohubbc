import { Box, Typography } from '@mui/material';

interface IQuestionAnswerProps {
  title: string;
  subtext: JSX.Element | string;
  textAlign?: 'center';
}

export const QuestionAnswer = (props: IQuestionAnswerProps) => {
  return (
    <Box textAlign='center'>
      <Typography variant="h2" mb={2} color="primary" textAlign={props.textAlign ?? 'start'}>
        {props.title}
      </Typography>
      <Typography sx={{ fontSize: '0.8em' }} color="textSecondary" textAlign={props.textAlign ?? 'start'}>
        {props.subtext}
      </Typography>
    </Box>
  );
};
