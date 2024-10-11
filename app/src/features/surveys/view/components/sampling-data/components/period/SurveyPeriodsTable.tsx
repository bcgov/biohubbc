import { LoadingGuard } from 'components/loading/LoadingGuard';
import { SkeletonTable } from 'components/loading/SkeletonLoaders';
import { NoDataOverlay } from 'components/overlay/NoDataOverlay';
import { ISamplingSitePeriodRowData, SamplingPeriodTable } from 'features/surveys/sampling-information/periods/table/SamplingPeriodTable';

interface SurveyPeriodsTableProps {
  periods: ISamplingSitePeriodRowData[];
  isLoading: boolean;
  hasNoData: boolean;
}

export const SurveyPeriodsTable = ({ periods, isLoading, hasNoData }: SurveyPeriodsTableProps) => {
  return (
    <LoadingGuard
      isLoading={isLoading}
      isLoadingFallback={<SkeletonTable />}
      isLoadingFallbackDelay={100}
      hasNoData={hasNoData}
      hasNoDataFallback={
        <NoDataOverlay
          height="200px"
          title="Add Periods"
          subtitle="Add periods when you create sampling sites to show when you collected species observations"
        />
      }>
      <SamplingPeriodTable periods={periods} />
    </LoadingGuard>
  );
};
