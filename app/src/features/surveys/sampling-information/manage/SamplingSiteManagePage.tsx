import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { SystemAlertBanner } from 'features/alert/banner/SystemAlertBanner';
import { SamplingTechniqueContainer } from 'features/surveys/sampling-information/techniques/SamplingTechniqueContainer';
import { SystemAlertBannerEnum } from 'interfaces/useAlertApi.interface';
import { SamplingPeriodContainer } from '../periods/SamplingPeriodContainer';
import { SamplingSiteContainer } from '../sites/SamplingSiteTableContainer';

/**
 * Page for managing sampling information (sampling techniques and sites).
 *
 * @return {*}
 */
export const SamplingSiteManagePage = () => {
  return (
    <Stack flex="1 1 auto">
      <SystemAlertBanner alertTypes={[SystemAlertBannerEnum.SAMPLING]} />
      <Paper id="sites" sx={{ mb: 3 }}>
        <SamplingSiteContainer />
      </Paper>
      <Paper id="techniques" sx={{ mb: 3 }}>
        <SamplingTechniqueContainer />
      </Paper>
      <Paper id="periods">
        <SamplingPeriodContainer />
      </Paper>
    </Stack>
  );
};
