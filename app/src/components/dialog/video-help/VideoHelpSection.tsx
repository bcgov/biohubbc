import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Box, Stack, Typography } from '@mui/material';
import { useState } from 'react';

export interface VideoHelpStep {
  label: string;
  text: string;
}

export interface VideoHelpSectionProps {
  /**
   * Title of the help section
   */
  title: string;

  /**
   * URL to the video to play
   */
  videoUrl: string;

  /**
   * Array of steps to display
   */
  steps: VideoHelpStep[];

  /**
   * Text to show when collapsed
   */
  collapsedText?: string;

  /**
   * Text to show when expanded
   */
  expandedText?: string;
}

/**
 * A reusable component for displaying video help instructions
 */
export const VideoHelpSection = (props: VideoHelpSectionProps) => {
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  const { title, videoUrl, steps, collapsedText = 'Show instructions', expandedText = 'Hide instructions' } = props;

  return (
    <>
      <Box
        onClick={() => setShowInstructions(!showInstructions)}
        sx={{
          display: 'flex',
          alignItems: 'center',
          my: 2,
          cursor: 'pointer',
          color: 'primary.main',
          '&:hover': {
            textDecoration: 'underline'
          }
        }}>
        <InfoOutlinedIcon fontSize="small" sx={{ mr: 0.5 }} />
        <Typography variant="body2" component="span">
          {showInstructions ? expandedText : collapsedText}
        </Typography>
        {showInstructions ? (
          <KeyboardArrowUpIcon fontSize="small" sx={{ ml: 0.5 }} />
        ) : (
          <KeyboardArrowDownIcon fontSize="small" sx={{ ml: 0.5 }} />
        )}
      </Box>

      {showInstructions && (
        <Box sx={{ width: '100%', my: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" component="h3">
              {title}
            </Typography>

            <Box sx={{ pl: 2 }}>
              {steps.map((step, index) => (
                <Typography key={index} variant="body1" component="div" sx={{ mb: 1 }}>
                  <strong>{step.label}</strong> {step.text}
                </Typography>
              ))}
            </Box>

            <Box sx={{ overflow: 'hidden', position: 'relative' }}>
              <video
                src={videoUrl}
                playsInline
                controls
                style={{
                  display: 'block',
                  width: '100%',
                  maxWidth: '800px',
                  height: 'auto',
                  margin: '0 auto',
                  border: '1px solid #eee',
                  objectFit: 'cover'
                }}
              />
            </Box>
          </Stack>
        </Box>
      )}
    </>
  );
};
