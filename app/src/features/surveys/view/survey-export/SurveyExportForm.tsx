import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import { useEffect, useReducer } from 'react';

const useStyles = () => {
  return {
    exportInput: {
      alignItems: 'flex-start',
      maxWidth: '92ch',
      '& label': {
        alignItems: 'flex-start'
      },
      '& .MuiButtonBase-root': {
        marginTop: '-6px',
        marginRight: '0.5rem'
      }
    }
  };
};

export interface ISurveyExportFormProps {
  onExportConfig: (config: SurveyExportConfig) => void;
}

export type SurveyExportConfig = {
  metadata: boolean;
  sampling_data: boolean;
  observation_data: boolean;
  telemetry_data: boolean;
  animal_data: boolean;
  artifacts: boolean;
};

export const SurveyExportForm = (props: ISurveyExportFormProps) => {
  const { onExportConfig } = props;

  const classes = useStyles();

  const [surveyExportConfig, dispatchSurveyExportConfig] = useReducer(
    (
      state: SurveyExportConfig,
      action: { type: 'all' | 'none' } | { type: 'toggle'; fieldName: keyof SurveyExportConfig }
    ): SurveyExportConfig => {
      switch (action.type) {
        case 'all':
          return {
            metadata: true,
            sampling_data: true,
            observation_data: true,
            telemetry_data: true,
            animal_data: true,
            artifacts: true
          };
        case 'none':
          return {
            metadata: false,
            sampling_data: false,
            observation_data: false,
            telemetry_data: false,
            animal_data: false,
            artifacts: false
          };
        case 'toggle':
          return {
            ...state,
            [action.fieldName]: !state[action.fieldName]
          };
        default:
          return state;
      }
    },
    {
      metadata: false,
      sampling_data: false,
      observation_data: false,
      telemetry_data: false,
      animal_data: false,
      artifacts: false
    }
  );

  useEffect(() => {
    onExportConfig(surveyExportConfig);
  }, [onExportConfig, surveyExportConfig]);

  const allChecked = Object.values(surveyExportConfig).every((value) => value === true);
  const someChecked = Object.values(surveyExportConfig).some((value) => value === true);

  return (
    <Box component="fieldset">
      <Typography component="legend">Select Data to Export</Typography>
      <Typography variant="body1" color="textSecondary">
        Select the data you wish to include in the export.
      </Typography>
      <Box flex="0 0 auto" display="flex" alignItems="center" height={55}>
        <FormGroup>
          <FormControlLabel
            label={
              <Typography
                variant="body2"
                component="span"
                color="textSecondary"
                fontWeight={700}
                sx={{ textTransform: 'uppercase' }}>
                Select All
              </Typography>
            }
            control={
              <Checkbox
                checked={allChecked}
                indeterminate={!allChecked && someChecked}
                onChange={() => {
                  if (allChecked) {
                    dispatchSurveyExportConfig({ type: 'none' });
                  } else {
                    dispatchSurveyExportConfig({ type: 'all' });
                  }
                }}
              />
            }
          />
        </FormGroup>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <FormControl sx={classes.exportInput} component="fieldset">
          <FormControlLabel
            label="Survey Metadata"
            control={
              <Checkbox
                checked={surveyExportConfig.metadata}
                onChange={() => dispatchSurveyExportConfig({ type: 'toggle', fieldName: 'metadata' })}
              />
            }
          />
          <FormHelperText>
            <Typography variant="body1" color="textSecondary">
              Survey basic information (title, participants, species, funding sources, etc).
            </Typography>
          </FormHelperText>
        </FormControl>
        <FormControl sx={classes.exportInput} component="fieldset">
          <FormControlLabel
            label="Sampling Data"
            control={
              <Checkbox
                checked={surveyExportConfig.sampling_data}
                onChange={() => dispatchSurveyExportConfig({ type: 'toggle', fieldName: 'sampling_data' })}
              />
            }
          />
          <FormHelperText>
            <Typography variant="body1" color="textSecondary">
              Survey sampling information (sites, methods, periods, blocks, etc).
            </Typography>
          </FormHelperText>
        </FormControl>
        <FormControl sx={classes.exportInput} component="fieldset">
          <FormControlLabel
            label="Observation Data"
            control={
              <Checkbox
                checked={surveyExportConfig.observation_data}
                onChange={() => dispatchSurveyExportConfig({ type: 'toggle', fieldName: 'observation_data' })}
              />
            }
          />
          <FormHelperText>
            <Typography variant="body1" color="textSecondary">
              Observation data recorded during this survey.
            </Typography>
          </FormHelperText>
        </FormControl>
        <FormControl sx={classes.exportInput} component="fieldset">
          <FormControlLabel
            label="Telemetry Data"
            control={
              <Checkbox
                checked={surveyExportConfig.telemetry_data}
                onChange={() => dispatchSurveyExportConfig({ type: 'toggle', fieldName: 'telemetry_data' })}
              />
            }
          />
          <FormHelperText>
            <Typography variant="body1" color="textSecondary">
              Telemetry data for all devices registered to this survey.
            </Typography>
          </FormHelperText>
        </FormControl>
        <FormControl sx={classes.exportInput} component="fieldset">
          <FormControlLabel
            label="Animal Data"
            control={
              <Checkbox
                checked={surveyExportConfig.animal_data}
                onChange={() => dispatchSurveyExportConfig({ type: 'toggle', fieldName: 'animal_data' })}
              />
            }
          />
          <FormHelperText>
            <Typography variant="body1" color="textSecondary">
              Animal data recorded during this survey.
            </Typography>
          </FormHelperText>
        </FormControl>
        <FormControl sx={classes.exportInput} component="fieldset">
          <FormControlLabel
            label="Artifacts"
            control={
              <Checkbox
                checked={surveyExportConfig.artifacts}
                onChange={() => dispatchSurveyExportConfig({ type: 'toggle', fieldName: 'artifacts' })}
              />
            }
          />
          <FormHelperText>
            <Typography variant="body1" color="textSecondary">
              Survey artifact information (file names, report authors, etc).
            </Typography>
          </FormHelperText>
        </FormControl>
      </Box>
    </Box>
  );
};