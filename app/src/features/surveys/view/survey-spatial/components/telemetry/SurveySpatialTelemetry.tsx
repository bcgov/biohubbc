import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { DateField } from 'components/fields/DateField';
import { IStaticLayer, IStaticLayerFeature } from 'components/map/components/StaticLayers';
import { DateRangeSlider } from 'components/sliders/DateRangeSlider';
import { SURVEY_MAP_LAYER_COLOURS } from 'constants/colours';
import dayjs, { Dayjs } from 'dayjs';
import { SurveySpatialTelemetryContainer } from 'features/surveys/view/survey-spatial/components/telemetry/SurveySpatialTelemetryContainer';
import { SurveySpatialTelemetryPopup } from 'features/surveys/view/survey-spatial/components/telemetry/SurveySpatialTelemetryPopup';
import SurveyMap from 'features/surveys/view/SurveyMap';
import SurveyMapTooltip from 'features/surveys/view/SurveyMapTooltip';
import { useBiohubApi } from 'hooks/useBioHubApi';
import { useSurveyContext } from 'hooks/useContext';
import useDataLoader from 'hooks/useDataLoader';
import { TelemetryFilters } from 'interfaces/useTelemetryApi.interface';
import { debounce } from 'lodash-es';
import { useEffect, useMemo, useState } from 'react';

interface ISurveySpatialTelemetryProps {
  staticLayers: IStaticLayer[];
}

export const SurveySpatialTelemetry = (props: ISurveySpatialTelemetryProps) => {
  const surveyContext = useSurveyContext();
  const biohubApi = useBiohubApi();

  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  const telemetrySpatialDataLoader = useDataLoader((projectId: number, surveyId: number, filters?: TelemetryFilters) =>
    biohubApi.telemetry.getTelemetrySpatialForSurvey(projectId, surveyId, filters)
  );

  useEffect(() => {
    const initializeTelemetry = async () => {
      const telemetry = await telemetrySpatialDataLoader.load(surveyContext.projectId, surveyContext.surveyId);

      if (telemetry?.supplementaryData && !dateRange) {
        const { start_date, end_date } = telemetry.supplementaryData;
        setDateRange([dayjs(start_date), dayjs(end_date)]);
      }
    };

    initializeTelemetry();
  }, [surveyContext.projectId, surveyContext.surveyId, telemetrySpatialDataLoader, dateRange]);

  const debouncedRefreshTelemetry = useMemo(() => {
    return debounce((filters: TelemetryFilters) => {
      telemetrySpatialDataLoader.refresh(surveyContext.projectId, surveyContext.surveyId, filters);
    }, 500);
  }, [telemetrySpatialDataLoader, surveyContext.projectId, surveyContext.surveyId]);

  const points: IStaticLayerFeature[] = useMemo(() => {
    const points: IStaticLayerFeature[] = [];

    for (const item of telemetrySpatialDataLoader.data?.telemetry ?? []) {
      if (!item.geometry) {
        // Skip invalid points
        continue;
      }

      points.push({
        id: item.telemetry_id,
        key: `telemetry-${item.telemetry_id}`,
        geoJSON: {
          type: 'Feature',
          properties: {},
          geometry: item.geometry
        }
      });
    }

    return points;
  }, [telemetrySpatialDataLoader.data?.telemetry]);

  const layer: IStaticLayer = {
    layerName: 'Telemetry',
    layerOptions: {
      fillColor: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      color: SURVEY_MAP_LAYER_COLOURS.TELEMETRY_COLOUR ?? SURVEY_MAP_LAYER_COLOURS.DEFAULT_COLOUR,
      opacity: 0.75
    },
    features: points,
    popup: (feature) => <SurveySpatialTelemetryPopup feature={feature} />,
    tooltip: (feature) => <SurveyMapTooltip title="Telemetry" key={`telemetry-tooltip-${feature.id}`} />
  };

  const handleDateRangeChange = (newRange: [Dayjs, Dayjs]) => {
    setDateRange(newRange);
    debouncedRefreshTelemetry({
      startDate: newRange[0].toISOString(),
      endDate: newRange[1].toISOString()
    });
  };

  const handleStartDateChange = (startDate: Dayjs | null) => {
    if (!startDate || !dateRange) {
      return;
    }
    handleDateRangeChange([startDate, dateRange[1]]);
  };

  const handleEndDateChange = (endDate: Dayjs | null) => {
    if (!endDate || !dateRange) {
      return;
    }
    handleDateRangeChange([dateRange[0], endDate]);
  };

  return (
    <>
      <Box height={{ xs: 300, md: 500 }} position="relative">
        <SurveyMap staticLayers={[...props.staticLayers, layer]} isLoading={telemetrySpatialDataLoader.isLoading} />
      </Box>

      {dateRange && (
        <Stack flexDirection="row" gap={2} flex="1 1 auto" p={2} alignItems="center">
          <Box>
            <DateField label="Start date" value={dateRange[0]} onChange={handleStartDateChange} />
          </Box>
          <Box flex="1 1 auto" px={5}>
            <DateRangeSlider
              label="Date Range"
              value={dateRange}
              minDate={dayjs(telemetrySpatialDataLoader.data?.supplementaryData.start_date)}
              maxDate={dayjs(telemetrySpatialDataLoader.data?.supplementaryData.end_date)}
              onChange={handleDateRangeChange}
            />
          </Box>
          <Box>
            <DateField label="End date" value={dateRange[1]} onChange={handleEndDateChange} />
          </Box>
        </Stack>
      )}

      <Divider />

      <Box height={{ xs: 300, md: 500 }} display="flex" flexDirection="column" pt={2}>
        <SurveySpatialTelemetryContainer />
      </Box>
    </>
  );
};
