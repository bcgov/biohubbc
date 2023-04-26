import { AuthStateContext } from 'contexts/authStateContext';
import React, { useContext } from 'react';
interface ILandingPageProps {
  originalPath: string;
}

export const LandingPage: React.FC<ILandingPageProps> = ({ originalPath }) => {
  const { keycloakWrapper } = useContext(AuthStateContext);

  const handleLogin = () => {
    keycloakWrapper?.keycloak?.login();
  }

  return (
    <div>
      <p>Temporary home page, pending <strong><a target="_blank" href='https://apps.nrs.gov.bc.ca/int/jira/browse/SIMSBIOHUB-30'>SIMSBIOHUB-30</a></strong>.</p>
      <h2><a onClick={() => handleLogin()}>Click to Sign in</a></h2>
    </div>
  );
};
