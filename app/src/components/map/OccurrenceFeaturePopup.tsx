import { DATE_FORMAT } from 'constants/dateTimeFormats';
import React from 'react';
import { Popup } from 'react-leaflet';
import { getFormattedDate } from 'utils/Utils';

export const OccurrenceFeaturePopup: React.FC<{ featureData: any }> = (props) => {
  const { featureData } = props;

  return (
    <Popup key={featureData.id} keepInView={false} autoPan={false}>
      <div>
        <b>Species</b>
        {`: ${featureData.taxonId}`}
      </div>
      <div>
        <b>Lifestage</b>
        {`: ${featureData.lifeStage}`}
      </div>
      <div>
        <b>Count</b>
        {`: ${
          featureData.organismQuantity
            ? `${featureData.organismQuantity} ${featureData.organismQuantityType}`
            : `${featureData.individualCount} Individuals`
        }`}
      </div>
      <div>
        <b>Date</b>
        {`: ${getFormattedDate(DATE_FORMAT.ShortMediumDateTimeFormat, featureData.eventDate)}`}
      </div>
    </Popup>
  );
};
