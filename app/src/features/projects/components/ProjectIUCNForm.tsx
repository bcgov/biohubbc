import { mdiArrowRight, mdiPlus, mdiTrashCanOutline } from '@mdi/js';
import Icon from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import { IMultiAutocompleteFieldOption } from 'components/fields/MultiAutocompleteFieldVariableSize';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import React from 'react';
import yup from 'utils/YupSchema';

export interface IProjectIUCNFormArrayItem {
  classification: number;
  subClassification1: number;
  subClassification2: number;
}

export interface IProjectIUCNForm {
  iucn: {
    classificationDetails: IProjectIUCNFormArrayItem[];
  };
}

export const ProjectIUCNFormArrayItemInitialValues: IProjectIUCNFormArrayItem = {
  classification: '' as unknown as number,
  subClassification1: '' as unknown as number,
  subClassification2: '' as unknown as number
};

export const ProjectIUCNFormInitialValues: IProjectIUCNForm = {
  iucn: {
    classificationDetails: []
  }
};

export interface IIUCNSubClassification1Option extends IMultiAutocompleteFieldOption {
  iucn1_id: number;
}

export interface IIUCNSubClassification2Option extends IMultiAutocompleteFieldOption {
  iucn2_id: number;
}

export const ProjectIUCNFormYupSchema = yup.object().shape({
  iucn: yup.object().shape({
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
  })
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
  const { values, handleChange, handleSubmit, getFieldMeta, errors } = useFormikContext<IProjectIUCNForm>();

  return (
    <form onSubmit={handleSubmit}>
      <FieldArray
        name="iucn.classificationDetails"
        render={(arrayHelpers: FieldArrayRenderProps) => (
          <Box>
            {values.iucn.classificationDetails.map((classificationDetail, index) => {
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
                  <Box display="flex" alignItems="center" py={1} width="250px">
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel id="classification">Classification</InputLabel>
                      <Select
                        id={`classificationDetails.[${index}].classification`}
                        name={`iucn.classificationDetails.[${index}].classification`}
                        labelId="classification"
                        label="Classification"
                        value={classificationDetail.classification}
                        onChange={(e: any) => {
                          classificationDetail.subClassification1 = '' as unknown as number;
                          classificationDetail.subClassification2 = '' as unknown as number;
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
                  <Box flex="0 0 auto" width="40px" textAlign="center">
                    <Icon path={mdiArrowRight} size={0.75}></Icon>
                  </Box>
                  <Box display="flex" alignItems="center" py={1} width="250px">
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel id="subClassification1">Sub-classification</InputLabel>
                      <Select
                        id={`classificationDetails.[${index}].subClassification1`}
                        name={`iucn.classificationDetails.[${index}].subClassification1`}
                        labelId="subClassification1"
                        label="Sub-classification"
                        value={classificationDetail.subClassification1}
                        onChange={(e: any) => {
                          classificationDetail.subClassification2 = '' as unknown as number;
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
                      <FormHelperText>{subClassification1Meta.touched && subClassification1Meta.error}</FormHelperText>
                    </FormControl>
                    <Box flex="0 0 auto" width="40px" textAlign="center">
                      <Icon path={mdiArrowRight} size={0.75}></Icon>
                    </Box>
                  </Box>
                  <Box display="flex" alignItems="center" py={1} width="250px">
                    <FormControl variant="outlined" fullWidth>
                      <InputLabel id="subClassification2">Sub-classification</InputLabel>
                      <Select
                        id={`classificationDetails.[${index}].subClassification2`}
                        name={`iucn.classificationDetails.[${index}].subClassification2`}
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
                      <FormHelperText>{subClassification2Meta.touched && subClassification2Meta.error}</FormHelperText>
                    </FormControl>
                  </Box>
                  <Box flex="0 0 auto" mx={1}>
                    <IconButton
                      data-testid="delete-icon"
                      aria-label="delete"
                      onClick={() => arrayHelpers.remove(index)}>
                      <Icon path={mdiTrashCanOutline} size={1} />
                    </IconButton>
                  </Box>
                </Box>
              );
            })}

            {errors?.iucn?.classificationDetails && !Array.isArray(errors?.iucn?.classificationDetails) && (
              <Box pb={2}>
                <Typography style={{ fontSize: '12px', color: '#f44336' }}>
                  {errors.iucn?.classificationDetails}
                </Typography>
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
