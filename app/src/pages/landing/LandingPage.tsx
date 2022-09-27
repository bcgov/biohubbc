import { AuthStateContext } from 'contexts/authStateContext';
import React, { useContext, useEffect } from 'react';
interface ILandingPageProps {
    originalPath: string
}

export const LandingPage: React.FC<ILandingPageProps> = ({ originalPath }) => {
    const { keycloakWrapper } = useContext(AuthStateContext);

    useEffect(() => {
        keycloakWrapper?.keycloak?.login();
    }, [])

    return null;
}