# Pre-req: Must already be logged into the Openshift environment
# Pre-req: Install `jq`, run: curl -L -o /usr/bin/jq.exe https://github.com/stedolan/jq/releases/latest/download/jq-win64.exe

# Remove the temp files
rm current_prs.txt current_prs_sorted.txt closed_prs.txt closed_prs_filtered.txt

# Set initial openshift environment
oc project af2668-dev

# Get all current PR numbers, whose env-id is a 1-4 digit pr number, and write to current_prs.txt
oc get deployments --show-labels | grep env-id | awk '{ match($1, /[0-9]{1,4}/); print substr($1, RSTART, RLENGTH) }' | grep -v '^$' | sort | uniq > current_prs.txt

# Fetch a list of the most recent 100 closed PRs and write the PR numbers to a temp file
curl -H "Accept: application/vnd.github.v3+json" "https://api.github.com/repos/bcgov/biohubbc/pulls?state=closed&base=dev&per_page=100&page=1&sort=updated&direction=desc" | jq '.[] .number' | sort -r >> closed_prs.txt

# Sort and filter PR numbers present in both closed_prs.txt and current_prs.txt
sort current_prs.txt > current_prs_sorted.txt
sort closed_prs.txt | grep -F -f current_prs_sorted.txt > closed_prs_filtered.txt

# For each PR number in the file, oc delete the PR artifacts in both the dev and tools environments
while read env_id; do
  echo ==============================
  echo Cleaning Closed PR $env_id
  echo ==============================
  oc project af2668-dev
  oc delete dc,all,secret,pvc --selector env-id=$env_id
  oc get ImageStreamTag -o name | grep $env_id | grep biohubbc | grep -v 'test' | grep -v 'prod' | awk   '{print "oc delete " $1}' | sort -r | bash
  oc project af2668-tools
  oc delete dc,all,secret,pvc --selector env-id=$env_id
  oc get ImageStreamTag -o name | grep $env_id | grep biohubbc | grep -v 'test' | grep -v 'prod' | awk   '{print "oc delete " $1}' | sort -r | bash
done < closed_prs_filtered.txt

# Remove the temp filess
rm current_prs.txt current_prs_sorted.txt closed_prs.txt closed_prs_filtered.txt

# Set initial openshift environment
oc project af2668-dev
