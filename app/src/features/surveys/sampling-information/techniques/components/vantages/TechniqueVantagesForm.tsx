import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import { DualAutocompleteField } from 'components/fields/DualAutocompleteField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { GetVantageReferenceRecord } from 'interfaces/useReferenceApi.interface';
import { TransitionGroup } from 'react-transition-group';
import { v4 } from 'uuid';
import { CreateTechniqueFormValues, TechniqueVantagesFormValues, UpdateTechniqueFormValues } from '../TechniqueFormContainer';

const initialVantagesFormValues: Partial<Pick<TechniqueVantagesFormValues, 'vantage_mode_method_id'>> = {
  vantage_mode_method_id: undefined
};

interface ITechniqueVantageFormProps {
  vantageReferenceRecords: GetVantageReferenceRecord[]
}

export const TechniqueVantageForm = <FormValues extends CreateTechniqueFormValues | UpdateTechniqueFormValues>(
  props: ITechniqueVantageFormProps
) => {
  const { vantageReferenceRecords } = props;
  const { values } = useFormikContext<FormValues>();

  return (
    <FieldArray
      name="vantages"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <TransitionGroup>
            {values.vantages.map((vantage, index) => (
              <Collapse key={vantage._id}>
                <Box mb={2}>
                  <DualAutocompleteField
                    categoryOptions={vantageReferenceRecords.map((record) => ({
                      value: record.vantage_id,
                      label: record.name
                    }))}
                    getUnitOptions={(categoryId: number) => {
                      const selectedVantage = vantageReferenceRecords.find(
                        (record) => record.vantage_id === categoryId
                      );
                      return selectedVantage?.vantage_modes.map((unit) => ({
                        value: unit.vantage_mode_method_id,
                        label: unit.name
                      })) ?? [];
                    }}
                    formikCategoryFieldName={`vantages[${index}].vantage_id`}
                    formikUnitFieldName={`vantages[${index}].vantage_mode_method_id`}
                    filterCategoryIds={values.vantages.map(v => v.vantage_id)}
                    filterUnitIds={values.vantages.map(v => v.vantage_mode_method_id)}
                    onDelete={() => arrayHelpers.remove(index)}
                  />
                </Box>
              </Collapse>
            ))}
          </TransitionGroup>

          <Button
            color="primary"
            variant="outlined"
            startIcon={<Icon path={mdiPlus} size={1} />}
            aria-label="add vantage"
            onClick={() => {
              arrayHelpers.push({ ...initialVantagesFormValues, _id: v4() });
            }}>
            Add Vantage
          </Button>
        </>
      )}
    />
  );
};


//   return (
//     <Grid container spacing={2}>
//       <Grid item xs={12}>
//         <Typography component="legend">Vantages (optional)</Typography>
//         <AutocompleteField
//           id="vantage_mode_method_id"
//           label="Enter a vantage"
//           name="vantages"
//           loading={codesContext.codesDataLoader.isLoading}
//           options={
//             vantages
//               .map((option) => ({
//                 value: option.id,
//                 label: option.name,
//                 description: option.description
//               }))
//               .filter(
//                 (option) => !values.vantages.some((vantage) => vantage.vantage_mode_method_id === option.value)
//               ) ?? []
//           }
//           onChange={(_, value) => {
//             if (value?.value) {
//               setFieldValue('vantages', [...values.vantages, { vantage_mode_method_id: value.value }]);
//             }
//           }}
//         />
//       </Grid>
//       <Grid item xs={12}>
//         <TransitionGroup>
//           {values.vantages.map((vantage, index) => {
//             const vantageCode = vantages.find((option) => option.id === vantage.vantage_mode_method_id);

//             return (
//               <Collapse key={vantage.vantage_mode_method_id}>
//                 <Paper
//                   variant="outlined"
//                   sx={{
//                     py: 1.5,
//                     px: 2.5,
//                     mb: 1,
//                     background: grey[100],
//                     flex: '1 1 auto',
//                     display: 'flex',
//                     justifyContent: 'space-between'
//                   }}>
//                   <Box>
//                     <Typography fontWeight={700}>{vantageCode?.name}</Typography>
//                     <Typography color="textSecondary" variant="body2">
//                       {vantageCode?.description}
//                     </Typography>
//                   </Box>
//                   <Box>
//                     <IconButton
//                       data-testid={`remove-vantage-button-${index}`}
//                       sx={{
//                         ml: 2
//                       }}
//                       aria-label="remove vantage"
//                       onClick={() => {
//                         // Remove the clicked vantage record from the list of vantages
//                         setFieldValue(
//                           'vantages',
//                           values.vantages.filter(
//                             (item) => item.vantage_mode_method_id !== vantage.vantage_mode_method_id
//                           )
//                         );
//                       }}>
//                       <Icon path={mdiClose} size={1} />
//                     </IconButton>
//                   </Box>
//                 </Paper>
//               </Collapse>
//             );
//           })}
//         </TransitionGroup>
//       </Grid>
//     </Grid>
//   );
// };
