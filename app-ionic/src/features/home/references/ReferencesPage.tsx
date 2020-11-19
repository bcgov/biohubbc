import { Container } from '@material-ui/core';
import ReferenceActivitiesList from 'components/activities-list/ReferenceActivitiesList';
import React from 'react';

interface IReferencesPagePage {
  classes?: any;
}

const ReferencesPage: React.FC<IReferencesPagePage> = (props) => {
  return (
    <Container className={props.classes.container}>
      <ReferenceActivitiesList />
    </Container>
  );
};

export default ReferencesPage;
