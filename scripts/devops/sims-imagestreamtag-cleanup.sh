# Pre-req: Must already be logged into the Openshift environment
# Pre-req: Install `jq`, run: curl -L -o /usr/bin/jq.exe https://github.com/stedolan/jq/releases/latest/download/jq-win64.exe

# Remove the temp files
rm open_prs.txt open_prs_regex.txt old_imagestreamtags.txt old_imagestreamtags_filtered.txt

# Fetch a list of all open PRs (including drafts) which we will exclude from being deleted
curl -k -H "Accept: application/vnd.github.v3+json" "https://api.github.com/repos/bcgov/biohubbc/pulls?state=open&base=dev&sort=created&direction=asc&per_page=100&page=1" | jq '.[] .number' | sort -r >> open_prs.txt
curl -k -H "Accept: application/vnd.github.v3+json" "https://api.github.com/repos/bcgov/biohubbc/pulls?state=open&base=dev&sort=created&direction=asc&per_page=100&page=2" | jq '.[] .number' | sort -r >> open_prs.txt

# Set initial openshift environment
oc project af2668-tools

# Select image stream tags for specific image streams
# These regexes select specific named tags, where they end in a 1-4 digit pr number (and optional '-dev', '-test', or '-prod')
IMAGE_REGEXES=("^biohubbc-db:.*-([0-9]{1,4})(-dev|-test|-prod)?$"
               "^biohubbc-db-setup:.*-([0-9]{1,4})(-dev|-test|-prod)?$"
               "^biohubbc-app:.*-([0-9]{1,4})(-dev|-test|-prod)?$"
               "^biohubbc-api:.*-([0-9]{1,4})(-dev|-test|-prod)?$")

# How many of each type of image stream tag to keep (ex: keep the most recent 5 prod image stream tags, delete the rest)
ANY_IMAGES=30
DEV_IMAGES=5
TEST_IMAGES=5
PROD_IMAGES=5

# The tags are sorted, and the most recent ones are kept, including the most recent 5 tags each that end in '-dev', '-test', or '-prod'.
# Loop over the regular expressions
for REGEX in "${IMAGE_REGEXES[@]}"; do
    oc get imagestreamtag -o custom-columns=Name:.metadata.name,Created:.metadata.creationTimestamp --sort-by=.metadata.creationTimestamp | 
      sort -r | 
      gawk -v REGEX=$REGEX -v ANY_IMAGES=$ANY_IMAGES -v DEV_IMAGES=$DEV_IMAGES -v TEST_IMAGES=$TEST_IMAGES -v PROD_IMAGES=$PROD_IMAGES '{
        if (match($1, REGEX, grp)) {
            # Keep the most recent ANY_IMAGES image stream tags
            count++
            if(count <= ANY_IMAGES) {
                next
            }
            # Keep the most recent DEV_IMAGES '-dev' image stream tags
            if (match($1, /-dev$/)) {
                dev_count++
                if (dev_count <= DEV_IMAGES) {
                    next
                }
            # Keep the most recent TEST_IMAGES '-test' image stream tags
            } else if (match($1, /-test$/)) {
                test_count++
                if (test_count <= TEST_IMAGES) {
                    next
                }
            # Keep the most recent PROD_IMAGES '-prod' image stream tags
            } else if (match($1, /-prod$/)) {
                prod_count++
                if (prod_count <= PROD_IMAGES) {
                    next
                }
            }
            print $1
        }
    }' >> old_imagestreamtags.txt
done

# Generate a regex file to filter out open PRs from the list of image stream tags
sed 's/$/$/' open_prs.txt > open_prs_regex.txt
# Filter out the open PRs from the list of image stream tags
sort old_imagestreamtags | grep -v -f open_prs_regex.txt old_imagestreamtags.txt > old_imagestreamtags_filtered.txt

# For each imagestreamtag in the file, oc delete it
while read imagestreamtag; do
  oc delete imagestreamtag $imagestreamtag
done < old_imagestreamtags_filtered.txt

# Remove the temp files
rm open_prs.txt open_prs_regex.txt old_imagestreamtags.txt old_imagestreamtags_filtered.txt
