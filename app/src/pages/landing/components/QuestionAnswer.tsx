import { Typography } from '@mui/material';

interface IQuestionAnswerProps {
  title: string;
  subtext: string;
}

export const QuestionAnswer = (props: IQuestionAnswerProps) => {
  return (
    <>
      <Typography variant="h2" mb={2} color="primary">
        {props.title}
      </Typography>
      <Typography sx={{ fontSize: '0.8em' }} color='textSecondary'>
        {props.subtext}
      </Typography>
    </>
  );
};
