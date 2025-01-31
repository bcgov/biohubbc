import { PaperProps } from '@mui/material';
import blueGrey from '@mui/material/colors/blueGrey';
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
}

/**
 * Returns an expandable card with information about a survey technique, including its attributes and attractants
 *
 * @param {ISurveyTechniqueCardProps} props
 * @returns {*}
 */
export const SurveyTechniqueCard = ({
  technique,
  methodAttributes,
  ...accordionStandardCardProps
}: ISurveyTechniqueCardProps) => {
  const { codesDataLoader } = useCodesContext();
  const methodLookupName =
    codesDataLoader.data?.sample_methods.find((method) => method.id === technique.method_lookup_id)?.name ?? '';

  const attributesCount =
    technique.attributes.qualitative_attributes.length + technique.attributes.quantitative_attributes.length;
  const attractantsCount = technique.attractants.length;

  return (
    <AccordionStandardCard
      label={technique.name}
      colour={grey[50]}
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

      <AccordionStandardCard
        label={
          <>
            Attributes&nbsp;
            <Typography component="span">({attributesCount})</Typography>
          </>
        }
        colour={grey[200]}
        sx={{ my: 2 }}>
        {attributesCount === 0 ? (
          <Typography color="textSecondary" mb={2}>
            No attributes selected
          </Typography>
        ) : (
          <Stack gap={1} mb={2}>
            {technique.attributes.qualitative_attributes.length > 0 && (
              <QualitativeAttributes
                qualitativeAttributes={technique.attributes.qualitative_attributes}
                methodAttributes={methodAttributes}
              />
            )}
            {technique.attributes.quantitative_attributes.length > 0 && (
              <QuantitativeAttributes
                quantitativeAttributes={technique.attributes.quantitative_attributes}
                methodAttributes={methodAttributes}
              />
            )}
          </Stack>
        )}
      </AccordionStandardCard>

      <AccordionStandardCard
        label={
          <>
            Attractants&nbsp;
            <Typography component="span">({attractantsCount})</Typography>
          </>
        }
        colour={grey[200]}
        sx={{ my: 2 }}>
        {attractantsCount > 0 ? (
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
