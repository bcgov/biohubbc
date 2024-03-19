ren biohub.sql biohub_unadjusted.sql
sed -e 's/record_end_date)/(record_end_date is NULL)) where record_end_date is null/g' biohub_unadjusted.sql >> biohub.sql
del biohub_unadjusted.sql