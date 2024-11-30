import { mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import {
  CreateTechniqueFormValues,
  TechniqueVantagesFormValues,
  UpdateTechniqueFormValues
} from 'features/surveys/sampling-information/techniques/components/TechniqueFormContainer';
import { TechniqueVantageForm } from 'features/surveys/sampling-information/techniques/components/vantages/components/TechniqueVantageForm';

import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { v4 } from 'uuid';

const initialVantagesFormValues: Partial<Pick<TechniqueVantagesFormValues, 'vantage_mode_method_id'>> = {
  vantage_mode_method_id: undefined
};

/**
 * Technique vantages form.
 *
 * @template FormValues
 * @return {*}
 */
export const TechniqueVantagesForm = <FormValues extends CreateTechniqueFormValues | UpdateTechniqueFormValues>() => {
  const biohubApi = useBiohubApi();

  const { values } = useFormikContext<FormValues>();

  const vantageReferenceRecordsDataLoader = useDataLoader((methodLookupId: number) =>
    biohubApi.reference.getVantageReferenceRecords([methodLookupId])
  );

  useEffect(() => {
    if (!values.method_lookup_id) {
      return;
    }

    vantageReferenceRecordsDataLoader.load(values.method_lookup_id);
  }, [vantageReferenceRecordsDataLoader, values.method_lookup_id]);

  const vantageReferenceRecords = vantageReferenceRecordsDataLoader.data ?? [];

  return (
    <FieldArray
      name="attributes"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <TransitionGroup>
            {values.attributes.map((attribute, index) => {
              return (
                // Quantitative and qualitative measurements might have the same attribute_id, so use temporary _id
                <Collapse key={attribute.attribute_id ?? attribute._id}>
                  <Box mb={2}>
                    <TechniqueVantageForm
                      vantageReferenceRecords={vantageReferenceRecords}
                      arrayHelpers={arrayHelpers}
                      index={index}
                    />
                  </Box>
                </Collapse>
              );
            })}
          </TransitionGroup>
          <Button
            color="primary"
            variant="outlined"
            startIcon={<Icon path={mdiPlus} size={1} />}
            aria-label="add attribute"
            disabled={values.vantages.length >= vantageReferenceRecords.length} // TODO NICK: this isn't correct, it probably needs to check the total length of all vantage modes?
            onClick={() => {
              // When a new measurement is added, _id is created as its unique key.
              // Attribute_id, which represents the DB primary key, is null for records that don't yet exist in the DB.
              arrayHelpers.push({ ...initialVantagesFormValues, _id: v4() });
            }}>
            Add Attribute
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
