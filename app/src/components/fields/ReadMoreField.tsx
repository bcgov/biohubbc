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

  const [isTruncatedText, setIsTruncatedText] = useState(text?.length > maxCharLength);

  const renderParagraph = (paragraph: string) => {
    if (paragraph) {
      return <Typography key={uuidv4()}>{paragraph}</Typography>;
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
          <Box mt={3}>
            <Button size="small" variant="outlined" color="primary" onClick={() => setIsTruncatedText(false)}>
              Read More
            </Button>
          </Box>
        </>
      )}
      {!isTruncatedText && (
        <>
          {text?.split('\n').map((paragraph: string) => {
            return renderParagraph(paragraph);
          })}
          {text?.length > maxCharLength && (
            <Box mt={3}>
              <Button size="small" variant="outlined" color="primary" onClick={() => setIsTruncatedText(true)}>
                Read Less
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default ReadMoreField;
