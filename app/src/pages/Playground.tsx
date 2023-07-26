import { Box, Button } from '@material-ui/core';
import CbSelectField from 'components/fields/CbSelectField';
import { Formik, FormikHelpers, FormikValues } from 'formik';
// import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
// import useDataLoader from 'hooks/useDataLoader';
// import useKeycloakWrapper from "hooks/useKeycloakWrapper";

export const Playground = () => {
  // const api = useCritterbaseApi();
  // // const keycloak = useKeycloakWrapper();
  // const dataLoader = useDataLoader(async () => api.lookup.getSelectOptions('colours'));
  // dataLoader.load();
  // const data = dataLoader.data ?? [];
  // console.log(data);
  return (
    <Formik
      initialValues={{ colour: '7a516697-c7ee-43b3-9e17-2fc31572d819' }}
      onSubmit={function (values: FormikValues, formikHelpers: FormikHelpers<FormikValues>): void | Promise<any> {
        console.log(`Values in Formik on submit: ${JSON.stringify(values, null, 2)}`);
      }}>
      {(formikProps) => (
        <>
          <Box marginTop={'60px'} maxWidth={'300px'}>
            <CbSelectField name={'colour'} label={'COLOUR'} id={'colour'} route={'colours'} />
            <CbSelectField name={'sex'} label={'SEX'} id={'sex'} route={'sex'} />
            <CbSelectField name={'marking_type'} label={'MARKING TYPE'} id={'marking_type'} route={'marking_type'} />
            <CbSelectField name={'species'} label={'SPECIES'} id={'species'} route={'species'} />
            <Button color="primary" variant="contained" onClick={formikProps.submitForm}>
              Submit
            </Button>
          </Box>
        </>
      )}
    </Formik>
  );
};
