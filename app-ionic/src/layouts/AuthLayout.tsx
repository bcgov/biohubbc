import { CircularProgress } from '@material-ui/core';
import React from 'react';
import { AuthStateContext } from 'contexts/authStateContext';
import PublicLayout from './PublicLayout';

const AuthLayout: React.FC = (props) => {
  return (
    <AuthStateContext.Consumer>
      {(context) => {
        if (!context.ready) {
          return <CircularProgress></CircularProgress>;
        }

        return <PublicLayout>{props.children}</PublicLayout>;
      }}
    </AuthStateContext.Consumer>
  );
};

export default AuthLayout;
