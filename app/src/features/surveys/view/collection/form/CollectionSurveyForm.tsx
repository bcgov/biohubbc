import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import { NameDescriptionCard } from 'components/card/NameDescriptionCard';
import AutocompleteField from 'components/fields/AutocompleteField';
import { FieldArray, useFormikContext } from 'formik';
import { useBiohubApi } from 'hooks/useBioHubApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect } from 'react';
import { TransitionGroup } from 'react-transition-group';

export interface ICollectionSurveyData {
  collections: { collection_id: number }[];
}

/**
 * Form for adding a survey to multiple collections
 *
 * @returns {*}
 */
const CollectionSurveyForm = () => {
  const { values } = useFormikContext<ICollectionSurveyData>();

  const biohubApi = useBiohubApi();
  const collectionsDataLoader = useDataLoader(() => biohubApi.collection.findCollections());

  useEffect(() => {
    collectionsDataLoader.load();
  }, [collectionsDataLoader]);

  return (
    <form>
      <FieldArray
        name="collections"
        render={(arrayHelpers) => (
          <>
            <Box component="fieldset" mb={1}>
              {/* Dropdown to add new collection to the array */}
              <AutocompleteField
                label="Collections"
                id="collections"
                name="collections"
                options={
                  collectionsDataLoader.data?.collections.map((collection) => ({
                    value: collection.collection_id,
                    label: collection.name
                  })) ?? []
                }
                onChange={(_, selectedOption) => {
                  if (
                    selectedOption &&
                    !values.collections.some((collection) => collection.collection_id === selectedOption.value)
                  ) {
                    arrayHelpers.push({ collection_id: selectedOption.value });
                  }
                }}
              />
            </Box>

            {/* Cards for current values */}
            <Box>
              <TransitionGroup>
                {values.collections.map((collection: any, index: number) => {
                  const collectionMeta = collectionsDataLoader.data?.collections.find(
                    (existing) => existing.collection_id === collection.collection_id
                  );

                  return (
                    <Collapse key={collection.collection_id}>
                      <Box my={0.5}>
                        <NameDescriptionCard
                          label={collectionMeta?.name ?? ''}
                          description={collectionMeta?.description ?? ''}
                          onDelete={() => arrayHelpers.remove(index)}
                        />
                      </Box>
                    </Collapse>
                  );
                })}
              </TransitionGroup>
            </Box>
          </>
        )}
      />
    </form>
  );
};

export default CollectionSurveyForm;
