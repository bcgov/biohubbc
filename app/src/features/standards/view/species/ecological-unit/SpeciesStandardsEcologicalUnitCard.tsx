import grey from '@mui/material/colors/grey';
import Stack from '@mui/material/Stack';
import { useCritterbaseApi } from 'hooks/useCritterbaseApi';
import useDataLoader from 'hooks/useDataLoader';
import { useEffect, useRef } from 'react';
import { AccordionStandardCard } from '../../components/AccordionStandardCard';

interface ISpeciesStandardsEcologicalUnitCardProps {
  collectionCategoryId: string;
}

/**
 * Displays expandable card that fetches collection unit options for a given collection category when expanded
 *
 * @param {ISpeciesStandardsEcologicalUnitCardProps} props
 * @returns
 */
export const SpeciesStandardsEcologicalUnitCard = (props: ISpeciesStandardsEcologicalUnitCardProps) => {
  const { collectionCategoryId } = props;

  const critterbaseApi = useCritterbaseApi();
  const unitsDataLoader = useDataLoader(() => critterbaseApi.xref.getCollectionUnits(collectionCategoryId));

  const loadRef = useRef(unitsDataLoader.load);
  loadRef.current = unitsDataLoader.load;
  useEffect(() => {
    loadRef.current();
  }, [collectionCategoryId]);

  const units = unitsDataLoader.data ?? [];

  return (
    <Stack gap={2} mb={2}>
      {units.map((unit) => (
        <AccordionStandardCard
          key={unit.collection_unit_id}
          label={unit.unit_name}
          subtitle={unit.description}
          colour={grey[200]}
        />
      ))}
    </Stack>
  );
};
