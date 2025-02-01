import { Typography } from '@mui/material';
import { EnumMarkdownTypes, SupportPageView } from './types';

const telemetry = [
  {
    label: 'Manual Upload',
    description: [
      <Typography key="manual-upload-1" variant="body1" gutterBottom>
        The telemetry page manages and stores the remote collection of GPS or location data. The telemetry page in SIMS
        has both the functionality to upload static sets of telemetry data, or to otherwise upload device key files to
        enable real-time data population.
      </Typography>,
      <Typography key="manual-upload-2" variant="body1" gutterBottom>
        Creating a long-term repository of telemetry data in your surveys will ensure that your data will always be
        retained no matter whether your telemetry device has been deactivated. The collaborative nature of SIMS allows
        for data access (with real-time access potential) for all members of your study.
      </Typography>,
      <Typography key="manual-upload-3" variant="body1" gutterBottom>
        <strong>Deployments</strong>
      </Typography>,
      <Typography key="manual-upload-4" variant="body1" gutterBottom>
        Telemetry data is managed through a data component we call a deployment. Deployments define relationships
        between an animal and your data generating device. For example, one deployment could state: I have device 12345
        loaded to my animal Bob between January 1, 2024 – January 31, 2024. When your telemetry is loaded into SIMS, it
        is loaded onto a deployment. If your telemetry data falls outside of the timeframe specified in your deployment,
        these data will not be loaded to the interface. In the example stated above, the deployment would only allow for
        data with an acquisition date in January 2024 to be loaded to that particular deployment of Bob - 12345. An
        animal and a device can have multiple deployments, but the deployments of the devices can never overlap. You
        cannot have the same device on two animals at the same time, device deployments are mutually exclusive.
      </Typography>,
      <Typography key="manual-upload-5" variant="body1" gutterBottom>
        If you are creating a deployment for a device and animal, you do not need to know the end date. You can come
        back into SIMS at a later date and close your deployment by adding the means by which it ended (collar drop-off,
        capture event, mortality event). Closing deployments ensures that the device is able to be used in another
        deployment and also contributes to animal survival and device effectiveness knowledge.
      </Typography>,
      <Typography key="manual-upload-6" variant="body1" gutterBottom>
        <strong>Data Upload Options</strong>
      </Typography>,
      <Typography key="manual-upload-7" variant="body1" gutterBottom>
        There are two means by which telemetry data can be loaded into SIMS: manual data upload, and automated data
        retrieval. Defining deployments is a necessary precursor to both these options.
      </Typography>
    ],
    markdownType: EnumMarkdownTypes[SupportPageView.TELEMETRY]?.[0]
  },
  { label: 'Automated Retrieval', description: [], markdownType: EnumMarkdownTypes[SupportPageView.TELEMETRY]?.[1] },
  {
    label: 'FAQ',
    description: [
      <Typography key="telemetry-faq-1" variant="body1" gutterBottom>
        <strong>FAQ</strong>
      </Typography>,
      <Typography key="telemetry-faq-2" variant="body1" gutterBottom>
        <strong>
          I am attempting to deploy a device but SIMS is giving me an error which states that this device is already
          deployed on another animal.
        </strong>
      </Typography>,
      <Typography key="telemetry-faq-3" variant="body1" gutterBottom>
        The error message that the device is already deployed signifies that this device is loaded up to a SIMS project
        in a deployment that has not yet been closed. In order to redeploy this device on a new animal, the previous
        deployment must have an end date.
      </Typography>,
      <Typography key="telemetry-faq-4" variant="body1" gutterBottom>
        <strong>
          I would like to implement automated retrieval but I am worried about the security of my device key.
        </strong>
      </Typography>,
      <Typography key="telemetry-faq-5" variant="body1" gutterBottom>
        Once keys are loaded using the device keys button, they are stored within the system and are not accessible for
        download or opening by any project members. Device keys are not published alongside survey data when you publish
        your survey. Device keys will only ever exist in the backend of SIMS to grant permission to your collar vendor
        to send applicable data to your deployment.
      </Typography>
    ]
  }
];

export default telemetry;
