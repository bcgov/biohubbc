import { mdiThumbDownOutline, mdiThumbUpOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

interface IMarkdownVoteButtonsProps {
  positiveText: string;
  negativeText: string;
  handleSubmit: (score: number) => void;
}

export const MarkdownVoteButtons = (props: IMarkdownVoteButtonsProps) => {
  const { positiveText, negativeText, handleSubmit } = props;

  return (
    <Stack gap={2} direction="row" sx={{ '& .MuiButton-text': { fontWeight: 700 } }}>
      <Button startIcon={<Icon path={mdiThumbUpOutline} size={0.8} />} onClick={() => handleSubmit(1)}>
        {positiveText}
      </Button>
      <Button startIcon={<Icon path={mdiThumbDownOutline} size={0.8} />} onClick={() => handleSubmit(-1)}>
        {negativeText}
      </Button>
    </Stack>
  );
};
