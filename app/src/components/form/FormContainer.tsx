import { Box, ThemeProvider, Typography } from '@material-ui/core';
import { IChangeEvent, ISubmitEvent } from '@rjsf/core';
import Form from '@rjsf/material-ui';
import { IFormRecord, ITemplate } from 'interfaces/useBioHubApi-interfaces';
import React, { useState } from 'react';
import ArrayFieldTemplate from 'rjsf/templates/ArrayFieldTemplate';
import FieldTemplate from 'rjsf/templates/FieldTemplate';
import ObjectFieldTemplate from 'rjsf/templates/ObjectFieldTemplate';
import rjsfTheme from 'themes/rjsfTheme';

export enum FormControlLocation {
  TOP = 'top',
  BOTTOM = 'bottom',
  TOP_AND_BOTTOM = 'top_and_bottom'
}

export interface IFormContainerProps {
  record?: IFormRecord;
  template: ITemplate;
  customValidation?: any;
  isDisabled?: boolean;
  formControlsComponent: any;
  formControlsLocation?: FormControlLocation;
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
  const [formRef, setFormRef] = useState(null);

  const isDisabled = props.isDisabled;

  return (
    <Box>
      {props.formControlsLocation === FormControlLocation.TOP ||
        (props.formControlsLocation === FormControlLocation.TOP_AND_BOTTOM && (
          <Box mb={3}>
            {React.Children.map(props.formControlsComponent, (child: any) => {
              return React.cloneElement(child, { ...child.props, onSubmit: () => formRef.submit() });
            })}
          </Box>
        ))}

      <ThemeProvider theme={rjsfTheme}>
        <Form
          ObjectFieldTemplate={ObjectFieldTemplate}
          FieldTemplate={FieldTemplate}
          ArrayFieldTemplate={ArrayFieldTemplate}
          key={props?.record?.id || props?.template?.id}
          disabled={isDisabled}
          formData={props?.record || null}
          schema={props.template.data_template}
          uiSchema={props.template.ui_template}
          liveValidate={false}
          showErrorList={true}
          validate={props.customValidation}
          autoComplete="off"
          ErrorList={() => {
            return (
              <Box>
                <Typography color="error" variant="h5">
                  The form contains errors.
                </Typography>
                <Typography color="error" variant="h6">
                  Incorrect fields are highlighted below.
                </Typography>
              </Box>
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

      {!props.formControlsLocation ||
        props.formControlsLocation === FormControlLocation.BOTTOM ||
        (props.formControlsLocation === FormControlLocation.TOP_AND_BOTTOM && (
          <Box mt={3}>
            {React.Children.map(props.formControlsComponent, (child: any) => {
              return React.cloneElement(child, { ...child.props, onSubmit: () => formRef.submit() });
            })}
          </Box>
        ))}
    </Box>
  );
};

export default FormContainer;
