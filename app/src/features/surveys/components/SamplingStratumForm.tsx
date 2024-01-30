import { mdiPlus,} from '@mdi/js';
import Icon from '@mdi/react';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
// import Alert from '@mui/material/Alert';
// import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
// import Card from '@mui/material/Card';
// import CardContent from '@mui/material/CardContent';
// import CardHeader from '@mui/material/CardHeader';
// import Collapse from '@mui/material/Collapse';
// import { grey } from '@mui/material/colors';
// import Divider from '@mui/material/Divider';
// import IconButton from '@mui/material/IconButton';
// import List from '@mui/material/List';
// import ListItem from '@mui/material/ListItem';
// import ListItemIcon from '@mui/material/ListItemIcon';
// import ListItemText from '@mui/material/ListItemText';
// import MenuItem from '@mui/material/MenuItem';
// import Select from '@mui/material/Select';
// import Autocomplete from '@mui/material/Autocomplete';
// import { MenuProps } from '@mui/material/Menu';
// import MenuItem from '@mui/material/MenuItem';
// import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CodesContext } from 'contexts/codesContext';
import { useFormikContext } from 'formik';
import { useContext, useEffect } from 'react';
// // import { TransitionGroup } from 'react-transition-group';
// // import { getCodesName } from 'utils/Utils';
import { ICreateSamplingSiteRequest } from '../observations/sampling-sites/SamplingSitePage';
// // import CreateSamplingMethod from './CreateSamplingMethod';
// // import EditSamplingMethod from './EditSamplingMethod';
// import { IEditSurveySampleMethodData } from './MethodForm';
import { SurveyContext } from 'contexts/surveyContext';
// import { alphabetizeObjects } from 'utils/Utils';
// import FormControl from '@mui/material/FormControl';
// import InputLabel from '@mui/material/InputLabel';
// import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import SelectWithSubtextField, { ISelectWithSubtextFieldOption } from 'components/fields/SelectWithSubtext';
import { IStratum } from './SurveySiteSelectionForm';
import { mdiTrashCanOutline } from '@mdi/js';
// import FormControl from '@mui/material/FormControl';
// import FormHelperText from '@mui/material/FormHelperText';
// import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
// import InputLabel from '@mui/material/InputLabel';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
// import MenuItem from '@mui/material/MenuItem';
// import Select from '@mui/material/Select';
// import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, FieldArrayRenderProps } from 'formik';

export interface ISamplingStratumFormProps {
  // intended_outcomes: ISelectWithSubtextFieldOption[];
  survey_blocks: ISelectWithSubtextFieldOption[];
}


const SamplingStratumForm = () => {
  const { values, setFieldValue } = useFormikContext<ICreateSamplingSiteRequest>();
  const codesContext = useContext(CodesContext);
  const surveyContext = useContext(SurveyContext);

  const surveyStratums = surveyContext.surveyDataLoader?.data?.surveyData?.site_selection?.stratums.map((stratum) => ({
    value: stratum.survey_stratum_id,
    label: stratum.name,
    subText: stratum?.description || undefined,
  }));

  useEffect(() => {
    codesContext.codesDataLoader.load();
  }, [codesContext.codesDataLoader]);

  const handleAddStratum = () => {
    const newStratum = {
      id: values.stratums.length,
      stratum: null,
    };

    setFieldValue('stratums', [...values.stratums, newStratum]);
  };

  const handleRemoveStratum = (index: number) => {
    const updatedStratums = values.stratums.filter((_, i) => i !== index);
    setFieldValue('stratums', updatedStratums);
  };

  return surveyStratums ? (
    <>
      <Typography component="legend">Assign to Stratum</Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{
          mb: 3,
          maxWidth: '92ch',
        }}
      >
        All sampling sites uploaded together will be assigned to the selected Stratum. These can be modified later if required.
      </Typography>
      <FieldArray
        name="sample.stratums"
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <>
            <List dense disablePadding>
              {values.stratums.map((stratum, index) => (
                <ListItem disableGutters key={index}>
                  <ListItemText>
                    <SelectWithSubtextField
                      id={`samplingSiteStratum-${index}`}
                      label="Stratum"
                      name={`stratums.${index}.stratum`}
                      options={surveyStratums}
                    />
                  </ListItemText>
                  <ListItemSecondaryAction>
                    <IconButton
                      data-testid={`delete-icon-${index}`}
                      aria-label="remove stratum"
                      onClick={() => handleRemoveStratum(index)}
                    >
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Box>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                aria-label="add stratum"
                startIcon={<Icon path={mdiPlus} size={1} />}
                onClick={handleAddStratum}
              >
                Add Stratum
              </Button>
            </Box>
          </>
        )}
      />
    </>
  ) : null;
};

export default SamplingStratumForm;
