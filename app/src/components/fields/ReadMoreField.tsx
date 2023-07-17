import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography, { TypographyProps } from '@mui/material/Typography';
import React, { useState } from 'react';

export interface IReadMoreFieldProps {
  text: string;
  maxCharLength: number;
  TypographyProps?: Partial<TypographyProps>;
}

/**
 * Format text with 'read more' and 'read less' buttons.
 *
 * @return {*}
 */
export const ReadMoreField: React.FC<IReadMoreFieldProps> = (props) => {
  const { text, maxCharLength, TypographyProps } = props;
  const [showTruncated, setShowTruncated] = useState(false);

  if (!text || maxCharLength <= 0) {
    return <></>;
  }

  const sanitizedText = String(text).trim();
  const willTruncateText = sanitizedText.length > maxCharLength;

  if (!willTruncateText) {
    return <Typography color="textSecondary">{sanitizedText}</Typography>;
  }

  let truncationIndex = sanitizedText.slice(0, maxCharLength).lastIndexOf(' ');
  if (truncationIndex < 0) {
    truncationIndex = maxCharLength;
  }

  const persistentTextPortion = sanitizedText.slice(0, truncationIndex);

  return (
    <>
      <Typography {...TypographyProps}>
        {showTruncated ? (
          <span>{sanitizedText}</span>
        ) : (
          <>
            <span>{persistentTextPortion}</span>
            <span>&hellip;</span>
          </>
        )}
      </Typography>
      <Box mt={0.5} mb={-0.75} ml="-5px">
        <Button
          size="small"
          variant="text"
          onClick={() => setShowTruncated(!showTruncated)}
          style={{ color: '#757575', fontWeight: 600, textTransform: 'uppercase' }}>
          <>
            <Icon path={showTruncated ? mdiChevronUp : mdiChevronDown} size={1} />
            <span>{showTruncated ? 'Read Less' : 'Read More'}</span>
          </>
        </Button>
      </Box>
    </>
  );
};

export default ReadMoreField;
