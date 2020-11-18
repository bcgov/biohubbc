import { Box, CircularProgress, Typography } from '@material-ui/core';
import { IChangeEvent, ISubmitEvent } from '@rjsf/core';
import Form from '@rjsf/material-ui';
import { ActivitySyncStatus } from 'constants/activities';
import { useBiohubApi } from 'hooks/useBiohubApi';
import { JSONSchema7 } from 'json-schema';
import React, { useEffect, useState } from 'react';
import RootUISchemas from 'rjsf/RootUISchemas';
import FormControlsComponent, { IFormControlsComponentProps } from './FormControlsComponent';

// Custom themed `Form` component, using @rjsf/material-ui as default base theme
// const Form = withTheme({ ...rjsfMaterialTheme });

export interface IFormContainerProps extends IFormControlsComponentProps {
  classes?: any;
  activity: any;
  isReadOnly?: boolean;
  /**
   * A function executed everytime the form changes.
   *
   * Note: This will fire frequently, so consider wrapping it in a debounce function (see utils.ts > debounced).
   */
  onFormChange?: (event: IChangeEvent<any>, formRef: any) => any;
  /**
   * A function executed when the form submit hook fires, and form validation errors are found.
   */
  onFormSubmitError?: (errors: any[], formRef: any) => any;
  /**
   * A function executed everytime the form submit hook fires.
   *
   * Note: Form validation rules will run, and must succeed, before this will be called.
   */
  onFormSubmitSuccess?: (event: ISubmitEvent<any>, formRef: any) => any;
}

const FormContainer: React.FC<IFormContainerProps> = (props) => {
  const biohubApi = useBiohubApi();

  const [schemas, setSchemas] = useState<{ schema: any; uiSchema: any }>({ schema: null, uiSchema: null });

  const [formRef, setFormRef] = useState(null);

  useEffect(() => {
    const getApiSpec = async () => {
      const response = await biohubApi.getCachedApiSpec();

      setSchemas({
        schema: { ...response.components.schemas[props.activity.activitySubtype], components: response.components },
        uiSchema: RootUISchemas[props.activity.activitySubtype]
      });
    };

    getApiSpec();
  }, []);

  if (!schemas.schema || !schemas.uiSchema) {
    return <CircularProgress />;
  }

  const isDisabled = props.isReadOnly || props.activity?.sync?.status === ActivitySyncStatus.SYNC_SUCCESSFUL || false;

  return (
    <Box>
      <Box mb={3}>
        <FormControlsComponent onSubmit={() => formRef.submit()} isDisabled={isDisabled} />
      </Box>

      <Form
        key={props.activity?._id}
        disabled={isDisabled}
        formData={props.activity?.formData || null}
        schema={schemas.schema as JSONSchema7}
        uiSchema={schemas.uiSchema}
        liveValidate={false}
        showErrorList={true}
        ErrorList={() => {
          return (
            <div>
              <Typography color="error" variant="h5">
                The form contains one or more errors!
              </Typography>
              <Typography color="error" variant="h6">
                Incorrect fields are highlighted below.
              </Typography>
            </div>
          );
        }}
        onChange={(event) => {
          if (!props.onFormChange) {
            return;
          }

          props.onFormChange(event, formRef);
        }}
        onError={(error) => {
          if (!props.onFormSubmitError) {
            return;
          }

          props.onFormSubmitError(error, formRef);
        }}
        onSubmit={(event) => {
          if (!props.onFormSubmitSuccess) {
            return;
          }

          props.onFormSubmitSuccess(event, formRef);
        }}
        // `ref` does exist, but currently is missing from the `index.d.ts` types file.
        // @ts-ignore: No overload matches this call ts(2769)
        ref={(form) => {
          if (!form) {
            return;
          }

          setFormRef(form);
        }}>
        <React.Fragment />
      </Form>

      <Box mt={3}>
        <FormControlsComponent onSubmit={() => formRef.submit()} isDisabled={isDisabled} />
      </Box>
    </Box>
  );
};

export default FormContainer;
