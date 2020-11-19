import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import FormContainer, { IFormContainerProps } from 'components/form/FormContainer';
import MapContainer, { IMapContainerProps } from 'components/map/MapContainer';
import PhotoContainer, { IPhotoContainerProps } from 'components/photo/PhotoContainer';
import React from 'react';

export interface IActivityComponentProps extends IMapContainerProps, IFormContainerProps, IPhotoContainerProps {
  classes?: any;
  activity: any;
}

const ActivityComponent: React.FC<IActivityComponentProps> = (props) => {
  return (
    <>
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={props.classes.heading}>Map</Typography>
        </AccordionSummary>
        <AccordionDetails className={props.classes.mapContainer}>
          <MapContainer {...props} />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-form-content" id="panel-form-header">
          <Typography className={props.classes.heading}>Form</Typography>
        </AccordionSummary>
        <AccordionDetails className={props.classes.formContainer}>
          <FormContainer {...props} />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-photo-content" id="panel-photo-header">
          <Typography className={props.classes.heading}>Photos</Typography>
        </AccordionSummary>
        <AccordionDetails className={props.classes.photoContainer}>
          <PhotoContainer {...props} />
        </AccordionDetails>
      </Accordion>
    </>
  );
};

export default ActivityComponent;
