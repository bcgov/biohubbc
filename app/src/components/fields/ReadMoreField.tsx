import { Box, Button, Typography } from '@material-ui/core';
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
      return (
        <Typography style={{ wordBreak: 'break-all' }} key={uuidv4()}>
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
          <Box>
            {text
              .slice(0, determineTruncatingLength())
              .split('\n')
              .map((paragraph: string) => {
                return renderParagraph(paragraph);
              })}
          </Box>
          <Button color="primary" onClick={() => setIsTruncatedText(false)}>
            Read More
          </Button>
        </>
      )}
      {!isTruncatedText && (
        <>
          <Box>
            {text?.split('\n').map((paragraph: string) => {
              return renderParagraph(paragraph);
            })}
          </Box>
          {text?.length > maxCharLength && (
            <Button color="primary" onClick={() => setIsTruncatedText(true)}>
              Read Less
            </Button>
          )}
        </>
      )}
    </Box>
  );
};

export default ReadMoreField;
