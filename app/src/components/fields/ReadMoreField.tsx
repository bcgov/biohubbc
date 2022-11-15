import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface IReadMoreFieldProps {
  text: string;
  maxCharLength: number;
}

/**
 * Format text with 'read more' and 'read less' buttons.
 *
 * @return {*}
 */
export const ReadMoreField: React.FC<IReadMoreFieldProps> = (props) => {
  const { text, maxCharLength } = props;

  /*
    Determines whether or not the given body of text will be truncated based on
    the max character length.
  */
  const willTruncateText = (content: string): boolean => {
    return content?.trim().length > maxCharLength || false;
  };

  const [isTruncatedText, setIsTruncatedText] = useState(willTruncateText(text));

  const renderParagraph = (paragraph: string) => {
    if (paragraph) {
      return (
        <Typography color="textSecondary" key={uuidv4()}>
          {paragraph}
        </Typography>
      );
    }
    return <p key={uuidv4()}></p>;
  };

  /*
    Function that finds a nice index (at a period ending a sentence)
    to truncate objectives longer than maxCharLength characters
  */
  const determineTruncatingLength = () => {
    const periodIndices = [];

    for (let i = 0; i < text.length; i++) {
      if (text[i - 1] === '.' && text[i] === ' ') {
        periodIndices.push(i);
      }
    }

    return periodIndices.reduce((prev, curr) => {
      return Math.abs(curr - maxCharLength) < Math.abs(prev - maxCharLength) ? curr : prev;
    });
  };

  return (
    <Box>
      {isTruncatedText && (
        <>
          {text
            .slice(0, determineTruncatingLength())
            .split('\n')
            .map((paragraph: string) => {
              return renderParagraph(paragraph);
            })}
          <Box mt={0.5} mb={-0.75} ml="-5px">
            <Button size="small" variant="text" onClick={() => setIsTruncatedText(false)} style={{ color: '#999' }}>
              READ MORE...
            </Button>
          </Box>
        </>
      )}
      {!isTruncatedText && (
        <>
          {text?.split('\n').map((paragraph: string) => {
            return renderParagraph(paragraph);
          })}
          {willTruncateText(text) && (
            <Box mt={0.5} mb={-0.75} ml="-5px">
              <Button size="small" variant="text" onClick={() => setIsTruncatedText(true)} style={{ color: '#999' }}>
                READ LESS
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ReadMoreField;
