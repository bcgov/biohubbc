import { PaperProps } from '@mui/material';
import { blueGrey } from '@mui/material/colors';
import grey from '@mui/material/colors/grey';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ColouredRectangleChip from 'components/chips/ColouredRectangleChip';
import { AccordionStandardCard } from 'features/standards/view/components/AccordionStandardCard';
import { useCodesContext } from 'hooks/useContext';
import { ITechniqueAttributeQualitative, ITechniqueAttributeQuantitative } from 'interfaces/useReferenceApi.interface';
import { IGetTechniqueResponse } from 'interfaces/useTechniqueApi.interface';
import QualitativeAttributes from './qualitative/TechniqueCardQualitativeAttributes';
import QuantitativeAttributes from './quantitative/TechniqueCardQuantitativeAttribute';

interface ISurveyTechniqueCardProps extends PaperProps {
  technique: IGetTechniqueResponse;
  methodAttributes: {
    quantitative: ITechniqueAttributeQuantitative[];
    qualitative: ITechniqueAttributeQualitative[];
  };
  disableCollapse?: boolean;
  startCollapsed?: boolean;
}

/**
 * SurveyTechniqueCard displays detailed information about a survey technique,
 * including its attributes and attractants.
 *
 * @param {ISurveyTechniqueCardProps} props - The props for the component.
 * @returns {JSX.Element} The rendered component.
 */
export const SurveyTechniqueCard = ({
  technique,
  methodAttributes,
  ...accordionStandardCardProps
}: ISurveyTechniqueCardProps): JSX.Element => {
  const { codesDataLoader } = useCodesContext();
  const methodLookupName =
    codesDataLoader.data?.sample_methods.find((method) => method.id === technique.method_lookup_id)?.name ?? '';

  return (
    <AccordionStandardCard
      label={technique.name}
      colour={grey[100]}
      variant="outlined"
      ornament={
        <Stack gap={1} direction="row">
          {technique.distance_threshold && (
            <ColouredRectangleChip label={`Detection distance: ${technique.distance_threshold} m`} colour={blueGrey} />
          )}
          <ColouredRectangleChip label={methodLookupName} colour={blueGrey} />
        </Stack>
      }
      {...accordionStandardCardProps}>
      <Typography color="textSecondary">{technique.description}</Typography>

      <AccordionStandardCard label="Attributes" colour={grey[200]} sx={{ my: 2 }}>
        {technique.attributes.qualitative_attributes.length > 0 ? (
          <QualitativeAttributes
            qualitativeAttributes={technique.attributes.qualitative_attributes}
            methodAttributes={methodAttributes}
          />
        ) : (
          <Typography color="textSecondary" mb={2}>
            No qualitative attributes selected
          </Typography>
        )}
        {technique.attributes.quantitative_attributes.length > 0 ? (
          <QuantitativeAttributes
            quantitativeAttributes={technique.attributes.quantitative_attributes}
            methodAttributes={methodAttributes}
          />
        ) : (
          <Typography color="textSecondary" mb={2}>
            No quantitative attributes selected
          </Typography>
        )}
      </AccordionStandardCard>

      <AccordionStandardCard label="Attractants" colour={grey[200]} sx={{ my: 2 }}>
        {technique.attractants.length > 0 ? (
          <Stack gap={1} mb={2}>
            {technique.attractants.map((attractant) => {
              const attractantName =
                codesDataLoader.data?.attractants.find((lookup) => lookup.id === attractant.attractant_lookup_id)
                  ?.name ?? '';

              return (
                <AccordionStandardCard
                  key={attractant.attractant_lookup_id}
                  label={attractantName}
                  colour={grey[300]}
                />
              );
            })}
          </Stack>
        ) : (
          <Typography color="textSecondary" mb={2}>
            No attractants selected
          </Typography>
        )}
      </AccordionStandardCard>
    </AccordionStandardCard>
  );
};
