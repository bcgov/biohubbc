import { Box, CircularProgress, ThemeProvider, Typography } from '@material-ui/core';
import { IChangeEvent, ISubmitEvent } from '@rjsf/core';
import Form from '@rjsf/material-ui';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { IActivity, ITemplate } from 'interfaces/useBioHubApi-interfaces';
import { JSONSchema7 } from 'json-schema';
import React, { useEffect, useState } from 'react';
import ArrayFieldTemplate from 'rjsf/templates/ArrayFieldTemplate';
import FieldTemplate from 'rjsf/templates/FieldTemplate';
import ObjectFieldTemplate from 'rjsf/templates/ObjectFieldTemplate';
import rjsfTheme from 'themes/rjsfTheme';
import FormControlsComponent, { IFormControlsComponentProps } from './FormControlsComponent';

export interface IFormContainerProps extends IFormControlsComponentProps {
  classes?: any;
  activity?: IActivity;
  template?: ITemplate;
  customValidation?: any;
  isDisabled?: boolean;
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
    const setupForm = async () => {
      if (!props.activity && !props.template) {
        // neither activity nor template provided
        console.log('temp: FormContainer - Error - must provide at least 1');
        return;
      }

      if (!props.template) {
        // only activity provided
        const response = await biohubApi.getTemplate(props.activity.template_id);

        setSchemas({ schema: response.data_template, uiSchema: response.ui_template });
        return;
      }

      // at least template provided
      setSchemas({ schema: props.template.data_template, uiSchema: props.template.ui_template });
    };

    setupForm();
  }, []);

  if (!schemas.schema || !schemas.uiSchema) {
    return <CircularProgress />;
  }

  const isDisabled = props.isDisabled;

  return (
    <Box>
      <Box mb={3}>
        <FormControlsComponent onSubmit={() => formRef.submit()} isDisabled={isDisabled} />
      </Box>

      <ThemeProvider theme={rjsfTheme}>
        <Form
          ObjectFieldTemplate={ObjectFieldTemplate}
          FieldTemplate={FieldTemplate}
          ArrayFieldTemplate={ArrayFieldTemplate}
          key={props?.activity?.activity_id}
          disabled={isDisabled}
          formData={props?.activity?.form_data || null}
          schema={schemas.schema as JSONSchema7}
          uiSchema={schemas.uiSchema}
          liveValidate={false}
          showErrorList={true}
          validate={props.customValidation}
          autoComplete="off"
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
      </ThemeProvider>

      <Box mt={3}>
        <FormControlsComponent onSubmit={() => formRef.submit()} isDisabled={isDisabled} />
      </Box>
    </Box>
  );
};

export default FormContainer;
