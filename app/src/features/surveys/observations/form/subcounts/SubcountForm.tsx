import { mdiChevronDown, mdiChevronUp, mdiPlus } from '@mdi/js';
import { Icon } from '@mdi/react';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import grey from '@mui/material/colors/grey';
import Typography from '@mui/material/Typography';
import AutocompleteField from 'components/fields/AutocompleteField';
import CustomTextField from 'components/fields/CustomTextField';
import { FieldArray, FieldArrayRenderProps, useFormikContext } from 'formik';
import { ICreateObservationRequest } from 'interfaces/useObservationApi.interface';
import { useState } from 'react';
import { TransitionGroup } from 'react-transition-group';
import { initialSubcountValues } from '../../create/CreateObservationPage';
import { ObservationEnvironmentForm } from './environments/ObservationEnvironmentForm';
import { ObservationMeasurementForm } from './measurements/ObservationMeasurementForm';

const SubcountForm = () => {
  const [showComment, setShowComment] = useState<boolean>(false);
  const formikProps = useFormikContext<ICreateObservationRequest>();

  const [expandedSubcounts, setExpandedSubcounts] = useState<number[]>([]);

  const handleAccordionChange = (index: number) => (_: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSubcounts((prev) => {
      if (isExpanded) {
        return [...prev, index];
      } else {
        return prev.filter((item) => item !== index);
      }
    });
  };

  // Prevent expanding the Accordion when CustomTextField is clicked
  const preventAccordionExpansion = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent the click from propagating to Accordion
  };

  return (
    <FieldArray
      name="subcounts"
      render={(arrayHelpers: FieldArrayRenderProps) => (
        <>
          <TransitionGroup>
            {formikProps.values.subcounts.map((subcount, index) => (
              <Accordion
                variant="outlined"
                key={subcount.observation_subcount_id || index}
                disableGutters
                onChange={handleAccordionChange(index)}
                sx={{
                  bgcolor: grey[50],
                  mb: 2
                }}>
                <AccordionSummary
                  sx={{
                    '&.Mui-focusVisible': {
                      bgcolor: grey[50]
                    }
                  }}>
                  <Box flex={0.5} display="flex" alignItems="center" onClick={preventAccordionExpansion}>
                    <CustomTextField
                      label="Subcount"
                      name={`subcounts[${index}].subcount`}
                      other={{
                        type: 'number',
                        sx: { position: 'relative', zIndex: 99 }
                      }}
                    />
                  </Box>
                  <Box flex={0.5} display="flex" justifyContent="flex-end" alignItems="center">
                    <Icon path={expandedSubcounts.includes(index) ? mdiChevronUp : mdiChevronDown} size={1}></Icon>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box my={3}>
                    <AutocompleteField id="sign" name="sign" required label={'Sign'} options={[]} />
                  </Box>

                  <Box mb={3}>
                    <ObservationMeasurementForm />
                  </Box>

                  <Box mb={3}>
                    <ObservationEnvironmentForm />
                  </Box>

                  <Box mb={3}>
                    <Typography component="legend">Comment</Typography>

                    {showComment ? (
                      <CustomTextField
                        name="comment"
                        label="Comment"
                        maxLength={250}
                        other={{ multiline: true, placeholder: 'Maximum 250 characters', rows: 3 }}
                      />
                    ) : (
                      <Button
                        color="primary"
                        variant="outlined"
                        startIcon={<Icon path={mdiPlus} size={1} />}
                        aria-label="add marking"
                        onClick={() => {
                          setShowComment(true);
                        }}>
                        Add Comment
                      </Button>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
            ))}
          </TransitionGroup>

          <Button
            color="primary"
            sx={{ mt: 2 }}
            variant="outlined"
            startIcon={<Icon path={mdiPlus} size={1} />}
            aria-label="add subcount"
            onClick={() => arrayHelpers.push(initialSubcountValues)}>
            Add Subcount
          </Button>
        </>
      )}
    />
  );
};

export default SubcountForm;
