import { Grid, Typography, Button } from '@material-ui/core';
import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface IReadMoreFieldProps {
  text: string;
  max_char_length: number;
}

/**
 * Format text with 'read more' and 'read less' buttons.
 *
 * @return {*}
 */
export const ReadMoreField: React.FC<IReadMoreFieldProps> = (props) => {
  const { text, max_char_length } = props;

  const [isTruncatedText, setIsTruncatedText] = useState(text?.length > max_char_length);

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
    to truncate objectives longer than max_char_length characters
  */
  const determineTruncatingLength = () => {
    const periodIndices = [];

    for (let i = 0; i < text.length; i++) {
      if (text[i - 1] === '.' && text[i] === ' ') {
        periodIndices.push(i);
        console.log(periodIndices);
      }
    }

    return periodIndices.reduce((prev, curr) => {
      return Math.abs(curr - max_char_length) < Math.abs(prev - max_char_length) ? curr : prev;
    });
  };

  return (
    <>
      {isTruncatedText && (
        <>
          <Grid item xs={12}>
            {text
              .slice(0, determineTruncatingLength())
              .split('\n')
              .map((paragraph: string) => {
                return renderParagraph(paragraph);
              })}
          </Grid>
          <Button color="primary" onClick={() => setIsTruncatedText(false)}>
            Read More
          </Button>
        </>
      )}
      {!isTruncatedText && (
        <>
          <Grid item xs={12}>
            {text?.split('\n').map((paragraph: string) => {
              return renderParagraph(paragraph);
            })}
          </Grid>
          {text?.length > max_char_length && (
            <Button color="primary" onClick={() => setIsTruncatedText(true)}>
              Read Less
            </Button>
          )}
        </>
      )}
    </>
  );
};

export default ReadMoreField;
