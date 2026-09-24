import { VideoHelpSection, VideoHelpSectionProps } from './VideoHelpSection';

/**
 * Help content for transforming data from wide to narrow format
 */
export const TransformDataHelp = () => {
  const helpProps: VideoHelpSectionProps = {
    title: 'How to Transform Your Data from Wide to Narrow Format in Excel',
    videoUrl: 'https://nrs.objectstore.gov.bc.ca/locsch/resources/Import_PQMP4_2_slow.mp4',
    steps: [
      {
        label: 'Step 1:',
        text: 'Select your data, navigate to the "Data" tab and choose "From Data/Range", then confirm with "OK".'
      },
      {
        label: 'Step 2:',
        text: 'Select all columns you want to transform, open the "Transform" tab and select "Unpivot Columns".'
      },
      {
        label: 'Step 3:',
        text: 'Rename your new columns appropriately, return to the home tab, then select "Close and Load".'
      }
    ],
    collapsedText: 'Need help transforming data from wide to narrow?',
    expandedText: 'Hide data transformation instructions'
  };

  return <VideoHelpSection {...helpProps} />;
};
