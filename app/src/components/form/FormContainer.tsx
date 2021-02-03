import { Box, ThemeProvider, Typography } from '@material-ui/core';
import { AjvError, ErrorListProps, FormValidation, IChangeEvent, ISubmitEvent } from '@rjsf/core';
import Form from '@rjsf/material-ui';
import { IFormRecord, ITemplate } from 'interfaces/useBioHubApi-interfaces';
import React, { useState } from 'react';
import ArrayFieldTemplate from 'rjsf/templates/ArrayFieldTemplate';
import FieldTemplate from 'rjsf/templates/FieldTemplate';
import ObjectFieldTemplate from 'rjsf/templates/ObjectFieldTemplate';
import rjsfTheme from 'themes/rjsfTheme';

export enum FormControlLocation {
  TOP = 'top',
  BOTTOM = 'bottom'
}

export interface IFormControlsComponentProps {
  onSubmit: Function;
  isDisabled?: boolean;
}

export interface IFormContainerProps {
  record?: IFormRecord;
  template: ITemplate;
  customValidation?: (formData: any, errors: FormValidation) => FormValidation;
  customErrorTransformer?: (errors: AjvError[]) => AjvError[];
  isDisabled?: boolean;
  liveValidation?: boolean;
  setFormRef?: (formRef: any) => void;
  formControlsComponent?: React.FunctionComponent<IFormControlsComponentProps>;
  formControlsLocation?: FormControlLocation[];
  formErrorComponent?: React.FunctionComponent<ErrorListProps>;
  /**
   * A function executed everytime the form changes.
   *
   * Note: This will fire frequently, so consider wrapping it in a debounce function (see utils.ts > debounced).
   */
  onFormChange?: (event: IChangeEvent<any>, formRef: any) => any;
  /**
   * A function executed when the form submit hook fires, and form validation errors are found.
   */
  onFormError?: (errors: any[], formRef: any) => any;
  /**
   * A function executed everytime the form submit hook fires.
   *
   * Note: Form validation rules will run, and must succeed, before this will be called.
   */
  onFormSubmitSuccess?: (event: ISubmitEvent<any>, formRef: any) => any;
}

/**
 * Conditionally returns a form controls element.
 *
 * @param {FormControlLocation} targetLocation The desired form control location.
 * @param {FormControlLocation[]} formControlsLocation The allowed form control locations(s).
 * @param {React.FunctionComponent<IFormControlsComponentProps>} formControlsComponent The form control component to
 * render, which will receive additional props.
 * @param {*} formRef The form reference, used in passing additional props to the from control component.
 * @return {*}
 */
const getFormControls = (
  targetLocation: FormControlLocation,
  formControlsLocation: FormControlLocation[] | undefined,
  formControlsComponent: React.FunctionComponent<IFormControlsComponentProps> | undefined,
  formRef: any
) => {
  if (formControlsLocation && formControlsLocation.includes(targetLocation)) {
    return (
      <Box my={3}>
        {formControlsComponent &&
          formControlsComponent({
            onSubmit: () => {
              if (!formRef || !formRef.submit) {
                return;
              }

              formRef.submit();
            }
          })}
      </Box>
    );
  }
};

const FormContainer: React.FC<IFormContainerProps> = (props) => {
  const [formRef, setFormRef] = useState<any | null>(null);

  const isDisabled = props.isDisabled;

  return (
    <Box>
      {getFormControls(FormControlLocation.TOP, props.formControlsLocation, props.formControlsComponent, formRef)}

      <ThemeProvider theme={rjsfTheme}>
        <Box mb={2}>
          <Typography variant="subtitle2">
            <Box color="#db3131" display="inline">
              *
            </Box>{' '}
            indicates a required field
          </Typography>
        </Box>
        <Form
          ObjectFieldTemplate={ObjectFieldTemplate}
          FieldTemplate={FieldTemplate}
          ArrayFieldTemplate={ArrayFieldTemplate}
          key={props?.record?.id || props?.template?.id}
          disabled={isDisabled}
          formData={props?.record || null}
          schema={props.template.data_template}
          uiSchema={props.template.ui_template}
          liveValidate={props?.liveValidation || false}
          showErrorList={true}
          validate={props.customValidation}
          autoComplete="off"
          transformErrors={props.customErrorTransformer}
          ErrorList={(errorProps) => {
            if (props.formErrorComponent) {
              return props.formErrorComponent(errorProps);
            }

            return (
              <Box mb={2}>
                <Typography color="error" variant="h5">
                  The form is incomplete
                </Typography>
                <Typography color="error" variant="h6">
                  Fields that need further action are highlighted below
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
            if (!props.onFormError) {
              return;
            }

            props.onFormError(error, formRef);
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

            if (props.setFormRef) {
              props.setFormRef(form);
            }

            setFormRef(() => {
              return form;
            });
          }}>
          <React.Fragment />
        </Form>
      </ThemeProvider>

      {getFormControls(FormControlLocation.BOTTOM, props.formControlsLocation, props.formControlsComponent, formRef)}
    </Box>
  );
};

export default FormContainer;
