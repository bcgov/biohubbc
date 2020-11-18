import { Container } from '@material-ui/core';
import React from 'react';
import ActivitiesList from 'components/activities-list/ActivitiesList';

interface IStatusPageProps {
  classes?: any;
}

const ActivitiesPage: React.FC<IStatusPageProps> = (props) => {
  return (
    <Container className={props.classes.container}>
      <ActivitiesList />
    </Container>
  );
};

export default ActivitiesPage;
