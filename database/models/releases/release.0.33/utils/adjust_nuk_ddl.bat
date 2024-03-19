cp ..\biohub.sql biohub_unadjusted.sql
del ..\biohub.sql
sed -e 's/record_end_date)/(record_end_date is NULL)) where record_end_date is null/g' biohub_unadjusted.sql >> biohub.sql
cp biohub.sql ..
del biohub_unadjusted.sql
del biohub.sql