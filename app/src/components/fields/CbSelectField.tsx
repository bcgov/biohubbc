import { ICbRouteKey } from 'hooks/cb_api/useLookupApi';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import React from 'react';
import SelectWithSubtextField from './SelectWithSubtext';
export interface ICbSelectField {
  name: string;
  label: string;
  id: string;
  route: ICbRouteKey;
}

const CbSelectField: React.FC<ICbSelectField> = (props) => {
  const api = useCritterbaseApi();
  const cbLookupLoader = useDataLoader(async () => api.lookup.getSelectOptions(props.route));
  cbLookupLoader.load();

  return (
    <SelectWithSubtextField
      id={props.id}
      name={props.name}
      label={props.label}
      options={
        cbLookupLoader.data?.map((a) => {
          return typeof a === 'string' ? { label: a, value: a } : { label: a.value, value: a.id };
        }) ?? []
      }></SelectWithSubtextField>
  );
};

export default CbSelectField;
