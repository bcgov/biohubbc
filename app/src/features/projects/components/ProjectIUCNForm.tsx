import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { mdiArrowRight, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { FieldArray, useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

const useStyles = makeStyles((theme: Theme) => ({
  iucnInputContainer: {
    overflow: 'hidden'
  },
  iucnInput: {
    width: '250px'
  }
}));

export interface IProjectIUCNFormArrayItem {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

export interface IProjectIUCNForm {
  classificationDetails: IProjectIUCNFormArrayItem[];
}

export const ProjectIUCNFormArrayItemInitialValues: IProjectIUCNFormArrayItem = {
  classification: ('' as unknown) as number,
  subClassification1: ('' as unknown) as number,
  subClassification2: ('' as unknown) as number
};

export const ProjectIUCNFormInitialValues: IProjectIUCNForm = {
  classificationDetails: []
};

export interface IIUCNSubClassification1Option extends IMultiAutocompleteFieldOption {
  iucn1_id: number;
}

export interface IIUCNSubClassification2Option extends IMultiAutocompleteFieldOption {
  iucn2_id: number;
}

export const ProjectIUCNFormYupSchema = yup.object().shape({
  classificationDetails: yup
    .array()
    .of(
      yup.object().shape({
        classification: yup.number().required('You must specify a classification'),
        subClassification1: yup.number().required('You must specify a sub-classification'),
        subClassification2: yup.number().required('You must specify a sub-classification')
      })
    )
    .isUniqueIUCNClassificationDetail('IUCN Classifications must be unique')
});

export interface IProjectIUCNFormProps {
  classifications: IMultiAutocompleteFieldOption[];
  subClassifications1: IIUCNSubClassification1Option[];
  subClassifications2: IIUCNSubClassification2Option[];
}

/**
 * Create project - IUCN classification section
 *
 * @return {*}
 */
const ProjectIUCNForm: React.FC<IProjectIUCNFormProps> = (props) => {
  const classes = useStyles();

  const { values, handleChange, handleSubmit, getFieldMeta, errors } = useFormikContext<IProjectIUCNForm>();

  return (
    <form onSubmit={handleSubmit}>
      <FieldArray
        name="classificationDetails"
        render={(arrayHelpers: any) => (
          <Box>
            {values.classificationDetails.map((classificationDetail, index) => {
              const classificationMeta = getFieldMeta(`classificationDetails.[${index}].classification`);
              const subClassification1Meta = getFieldMeta(`classificationDetails.[${index}].subClassification1`);
              const subClassification2Meta = getFieldMeta(`classificationDetails.[${index}].subClassification2`);

              return (
                <Box
                  display="flex"
                  alignItems="center"
                  mt={-1}
                  mb={1}
                  data-testid="iucn-classification-grid"
                  key={index}>
                  <Box display="flex" alignItems="center" className={classes.iucnInputContainer} mr={1}>
                    <Box className={classes.iucnInput} py={1}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel id="classification">Classification</InputLabel>
                        <Select
                          id={`classificationDetails.[${index}].classification`}
                          name={`classificationDetails.[${index}].classification`}
                          labelId="classification"
                          label="Classification"
                          value={classificationDetail.classification}
                          onChange={(e: any) => {
                            classificationDetail.subClassification1 = ('' as unknown) as number;
                            classificationDetail.subClassification2 = ('' as unknown) as number;
                            handleChange(e);
                          }}
                          error={classificationMeta.touched && Boolean(classificationMeta.error)}
                          inputProps={{ 'aria-label': 'Classification' }}>
                          {props.classifications.map((item: any) => (
                            <MenuItem key={item.value} value={item.value}>
                              {item.label}
                            </MenuItem>
                          ))}
                        </Select>
                        <FormHelperText>{classificationMeta.touched && classificationMeta.error}</FormHelperText>
                      </FormControl>
                    </Box>

                    <Box mx={1}>
                      <Icon path={mdiArrowRight} size={0.75}></Icon>
                    </Box>

                    <Box className={classes.iucnInput} py={1}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel id="subClassification1">Sub-classification</InputLabel>
                        <Select
                          id={`classificationDetails.[${index}].subClassification1`}
                          name={`classificationDetails.[${index}].subClassification1`}
                          labelId="subClassification1"
                          label="Sub-classification"
                          value={classificationDetail.subClassification1}
                          onChange={(e: any) => {
                            classificationDetail.subClassification2 = ('' as unknown) as number;
                            handleChange(e);
                          }}
                          disabled={!classificationDetail.classification}
                          error={subClassification1Meta.touched && Boolean(subClassification1Meta.error)}
                          inputProps={{ 'aria-label': 'subClassification1' }}>
                          {props.subClassifications1
                            // Only show the sub-classification 1 categories whose iucn1_id matches the classification id
                            .filter((item: any) => item.iucn1_id === classificationDetail.classification)
                            .map((item: any) => (
                              <MenuItem key={item.value} value={item.value}>
                                {item.label}
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>
                          {subClassification1Meta.touched && subClassification1Meta.error}
                        </FormHelperText>
                      </FormControl>
                    </Box>

                    <Box mx={1}>
                      <Icon path={mdiArrowRight} size={0.75}></Icon>
                    </Box>

                    <Box className={classes.iucnInput} py={1}>
                      <FormControl variant="outlined" fullWidth>
                        <InputLabel id="subClassification2">Sub-classification</InputLabel>
                        <Select
                          id={`classificationDetails.[${index}].subClassification2`}
                          name={`classificationDetails.[${index}].subClassification2`}
                          labelId="subClassification2"
                          label="Sub-classification"
                          value={classificationDetail.subClassification2}
                          onChange={handleChange}
                          disabled={!classificationDetail.subClassification1}
                          error={subClassification2Meta.touched && Boolean(subClassification2Meta.error)}
                          inputProps={{ 'aria-label': 'subClassification2' }}>
                          {props.subClassifications2
                            // Only show the sub-classification 2 categories whose iucn1_id matches the sub-classification 1 iucn2_id
                            .filter((item: any) => item.iucn2_id === classificationDetail.subClassification1)
                            .map((item: any) => (
                              <MenuItem key={item.value} value={item.value}>
                                {item.label}
                              </MenuItem>
                            ))}
                        </Select>
                        <FormHelperText>
                          {subClassification2Meta.touched && subClassification2Meta.error}
                        </FormHelperText>
                      </FormControl>
                    </Box>
                  </Box>

                  <Box ml={0.5}>
                    <IconButton
                      data-testid="delete-icon"
                      color="primary"
                      aria-label="delete"
                      onClick={() => arrayHelpers.remove(index)}>
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}

            {errors?.classificationDetails && !Array.isArray(errors?.classificationDetails) && (
              <Box pb={2}>
                <Typography style={{ fontSize: '12px', color: '#f44336' }}>{errors.classificationDetails}</Typography>
              </Box>
            )}

            <Box>
              <Button
                type="button"
                variant="outlined"
                color="primary"
                startIcon={<Icon path={mdiPlus} size={1} />}
                aria-label="Add Another"
                onClick={() => arrayHelpers.push(ProjectIUCNFormArrayItemInitialValues)}>
                Add Classification
              </Button>
            </Box>
          </Box>
        )}
      />
    </form>
  );
};

export default ProjectIUCNForm;
