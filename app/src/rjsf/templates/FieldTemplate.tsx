import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Typography from '@material-ui/core/Typography';
import { FieldTemplateProps } from '@rjsf/core';
import React from 'react';
import WrapIfAdditional from './WrapIfAdditional';

const FieldTemplate = (props: FieldTemplateProps) => {
  return (
    <WrapIfAdditional
      classNames={props.classNames}
      disabled={props.disabled}
      id={props.id}
      label={props.label}
      onDropPropertyClick={props.onDropPropertyClick}
      onKeyChange={props.onKeyChange}
      readonly={props.readonly}
      required={props.required}
      schema={props.schema}>
      <FormControl
        fullWidth={true}
        error={(props.rawErrors && props.rawErrors.length && true) || false}
        required={props.required}>
        {props.children}
        {props.displayLabel && props.rawDescription ? (
          <Typography variant="caption" color="textSecondary">
            {props.rawDescription}
          </Typography>
        ) : null}
        {props.rawErrors && props.rawErrors.length > 0 && (
          <List dense={true} disablePadding={true}>
            {props.rawErrors.map((error, i: number) => {
              return (
                <ListItem key={i} disableGutters={true}>
                  <FormHelperText id={props.id}>{error}</FormHelperText>
                </ListItem>
              );
            })}
          </List>
        )}
        {props.rawHelp && <FormHelperText id={props.id}>{props.rawHelp}</FormHelperText>}
      </FormControl>
    </WrapIfAdditional>
  );
};

export default FieldTemplate;
