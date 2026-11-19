import { VideoHelpSection, VideoHelpSectionProps } from './VideoHelpSection';

/**
 * Help content for importing observation data
 */
export const ObservationsHelp = () => {
  const helpProps: VideoHelpSectionProps = {
    title: 'How to Prepare Observation Data for Import',
    videoUrl: 'https://nrs.objectstore.gov.bc.ca/locsch/resources/observations_demo.mp4', // Example URL
    steps: [
      {
        label: 'Step 1:',
        text: 'Ensure your observation data is in the correct format with required columns.'
      },
      {
        label: 'Step 2:',
        text: 'Each row should represent a single observation with date, location, and measurement values.'
      },
      {
        label: 'Step 3:',
        text: 'Use the template to ensure all required fields are included.'
      }
    ],
    collapsedText: 'Need help preparing observation data?',
    expandedText: 'Hide observation data instructions'
  };

  return <VideoHelpSection {...helpProps} />;
};
