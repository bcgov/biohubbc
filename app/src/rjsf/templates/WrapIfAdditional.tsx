import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import { utils } from '@rjsf/core';
import { JSONSchema7 } from 'json-schema';
import React from 'react';
import IconButton from 'rjsf/components/IconButton';

const { ADDITIONAL_PROPERTY_FLAG } = utils;

type WrapIfAdditionalProps = {
  children: React.ReactElement;
  classNames: string;
  disabled: boolean;
  id: string;
  label: string;
  onDropPropertyClick: (index: string) => (event?: any) => void;
  onKeyChange: (index: string) => (event?: any) => void;
  readonly: boolean;
  required: boolean;
  schema: JSONSchema7;
};

const WrapIfAdditional = (props: WrapIfAdditionalProps) => {
  const keyLabel = `${props.label} Key`; // i18n ?
  const additional = props.schema.hasOwnProperty(ADDITIONAL_PROPERTY_FLAG);
  const btnStyle = {
    flex: 1,
    paddingLeft: 6,
    paddingRight: 6,
    fontWeight: 'bold'
  };

  if (!additional) {
    return <>{props.children}</>;
  }

  const handleBlur = ({ target }: React.FocusEvent<HTMLInputElement>) => props.onKeyChange(target.value);

  return (
    <Grid container={true} key={`${props.id}-key`} alignItems="center" spacing={2}>
      <Grid item={true}>
        <FormControl fullWidth={true} required={props.required}>
          <InputLabel>{keyLabel}</InputLabel>
          <Input
            defaultValue={props.label}
            disabled={props.disabled || props.readonly}
            id={`${props.id}-key`}
            name={`${props.id}-key`}
            onBlur={!props.readonly ? handleBlur : undefined}
            type="text"
          />
        </FormControl>
      </Grid>
      <Grid item={true} xs>
        {props.children}
      </Grid>
      <Grid item={true}>
        <IconButton
          icon="remove"
          tabIndex={-1}
          style={btnStyle as any}
          disabled={props.disabled || props.readonly}
          onClick={props.onDropPropertyClick(props.label)}
        />
      </Grid>
    </Grid>
  );
};

export default WrapIfAdditional;
