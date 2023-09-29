import { mdiCogOutline, mdiFloppy, mdiImport, mdiPlus, mdiTrashCan } from '@mdi/js';
import Icon from '@mdi/react';
import { LoadingButton } from '@mui/lab';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { CodesContext } from 'contexts/codesContext';
import { ObservationsContext } from 'contexts/observationsContext';
import { SurveyContext } from 'contexts/surveyContext';
import ObservationsTable, {
  ISampleMethodSelectProps,
  ISamplePeriodSelectProps,
  ISampleSiteSelectProps
} from 'features/surveys/observations/ObservationsTable';
import { useContext, useState } from 'react';
import { getCodesName } from 'utils/Utils';

const ObservationComponent = () => {
  const sampleSites: ISampleSiteSelectProps[] = [];
  const sampleMethods: ISampleMethodSelectProps[] = [];
  const samplePeriods: ISamplePeriodSelectProps[] = [];
  const observationsContext = useContext(ObservationsContext);
  const surveyContext = useContext(SurveyContext);
  const codesContext = useContext(CodesContext);

  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleSaveChanges = async () => {
    setIsSaving(true);

    return observationsContext.saveRecords().finally(() => {
      setIsSaving(false);
    });
  };

  const showSaveButton = observationsContext.hasUnsavedChanges();

  if (surveyContext.sampleSiteDataLoader.data && codesContext.codesDataLoader.data) {
    surveyContext.sampleSiteDataLoader.data.sampleSites.forEach((site) => {
      sampleSites.push({
        survey_sample_site_id: site.survey_sample_site_id,
        sample_site_name: site.name
      });

      site.sample_methods?.forEach((method) => {
        sampleMethods.push({
          survey_sample_method_id: method.survey_sample_method_id,
          survey_sample_site_id: site.survey_sample_site_id,
          sample_method_name:
            getCodesName(codesContext.codesDataLoader.data, 'sample_methods', method.method_lookup_id) || ''
        });

        method.sample_periods?.forEach((period) => {
          samplePeriods.push({
            survey_sample_period_id: period.survey_sample_period_id,
            survey_sample_method_id: period.survey_sample_method_id,
            sample_period_name: `${period.start_date} - ${period.end_date}`
          });
        });
      });
    });
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      flex="1 1 auto"
      height="100%"
      sx={{
        overflow: 'hidden'
      }}>
      {/* Observations Component */}
      <Toolbar
        sx={{
          flex: '0 0 auto',
          borderBottom: '1px solid #ccc',
          '& Button + Button': {
            ml: 1
          }
        }}>
        <Typography
          sx={{
            flexGrow: '1'
          }}>
          <strong>Observations</strong>
        </Typography>
        {showSaveButton && (
          <>
            <LoadingButton
              loading={isSaving}
              variant="contained"
              color="primary"
              startIcon={<Icon path={mdiFloppy} size={1} />}
              onClick={() => handleSaveChanges()}>
              Save Changes
            </LoadingButton>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Icon path={mdiTrashCan} size={1} />}
              onClick={() => observationsContext.revertRecords()}>
              Cancel
            </Button>
          </>
        )}
        <Button variant="contained" color="primary" startIcon={<Icon path={mdiImport} size={1} />}>
          Import
        </Button>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Icon path={mdiPlus} size={1} />}
          onClick={() => observationsContext.createNewRecord()}>
          Add Record
        </Button>
        <Button
          variant="outlined"
          sx={{
            mr: -1
          }}
          startIcon={<Icon path={mdiCogOutline} size={1} />}>
          Configure
        </Button>
      </Toolbar>
      <Box display="flex" flexDirection="column" flex="1 1 auto">
        {/* Map View */}

        {/* <ObservationMapView /> */}

        {/* Table View */}

        <ObservationsTable sample_sites={sampleSites} sample_methods={sampleMethods} sample_periods={samplePeriods} />
      </Box>
    </Box>
  );
};

export default ObservationComponent;
