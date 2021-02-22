FROM registry.redhat.io/rhscl/postgresql-12-rhel7

# PostgreSQL image for OpenShift with PostGIS extension.
# Volumes:
#  * /var/lib/psql/data   - Database cluster for PostgreSQL
# Environment:
#  * $POSTGRESQL_USER     - Database user name
#  * $POSTGRESQL_PASSWORD - User's password
#  * $POSTGRESQL_DATABASE - Name of the database to create
#  * $POSTGRESQL_ADMIN_PASSWORD (Optional) - Password for the 'postgres'
#                           PostgreSQL administrative account

ENV POSTGIS_EXTENSION=N \
    PGCRYPTO_EXTENSION=N \
    POSTGRESQL_VERSION=12 \
    POSTGRESQL_PREV_VERSION=10 \
    HOME=/var/lib/pgsql \
    PGUSER=postgres \
    LC_ALL=en_US.UTF-8 LANG=en_US.UTF-8 \
    APP_DATA=/opt/app-root
    
ENV POSTGISV 3
ENV TZ America/Vancouver
ENV PORT 5432 

ENV SUMMARY="PostgreSQL is an advanced Object-Relational database management system" \
    DESCRIPTION="PostgreSQL is an advanced Object-Relational database management system (DBMS). \
The image contains the client and server programs that you'll need to \
create, run, maintain and access a PostgreSQL DBMS server."

LABEL summary=$SUMMARY \
      description="$DESCRIPTION" \
      io.k8s.description="$DESCRIPTION" \
      io.k8s.display-name="PostgreSQL $POSTGRESQL_VERSION" \
      io.openshift.expose-services="5432:postgresql" \
      io.openshift.tags="database,postgresql,postgresql$POSTGRESQL_VERSION,rh-postgresql$POSTGRESQL_VERSION,postgis,postgis$POSTGISV" \
      name="rhscl/postgresql-$POSTGRESQL_VERSION-rhel7" \
      com.redhat.component="rh-postgresql$POSTGRESQL_VERSION-container" \
      version="1" \
      release="1" \
      com.redhat.license_terms="https://www.redhat.com/en/about/red-hat-end-user-license-agreements#rhel" \
      usage="podman run -d --name postgresql_database -e POSTGRESQL_USER=user -e POSTGRESQL_PASSWORD=pass -e POSTGRESQL_DATABASE=db -p 5432:5432 rhscl/postgresql-$POSTGRESQL_VERSION-rhel7" \
      maintainer="SoftwareCollections.org <sclorg@redhat.com>"

COPY root/usr/libexec/fix-permissions /usr/libexec/fix-permissions

# Copy entitlements and subscription manager configurations
# https://github.com/BCDevOps/OpenShift4-Migration/issues/15
COPY ./etc-pki-entitlement /etc/pki/entitlement
COPY ./rhsm-conf /etc/rhsm
COPY ./rhsm-ca /etc/rhsm/ca

# This image must forever use UID 26 for postgres user so our volumes are
# safe in the future. This should *never* change, the last test is there
# to make sure of that.
# rhel-7-server-ose-3.2-rpms is enabled for nss_wrapper until this pkg is
# in base RHEL
#
# We need to call 2 (!) yum commands before being able to enable repositories properly
# This is a workaround for https://bugzilla.redhat.com/show_bug.cgi?id=1479388
# Initialize /etc/yum.repos.d/redhat.repo
# See https://access.redhat.com/solutions/1443553
RUN rm /etc/rhsm-host && \
    yum repolist > /dev/null && \
    yum install -y yum-utils gettext && \
    yum-config-manager --disable \* &> /dev/null && \
    yum-config-manager --enable rhel-server-rhscl-7-rpms && \
    yum-config-manager --enable rhel-7-server-rpms && \
    yum-config-manager --enable rhel-7-server-optional-rpms && \
    INSTALL_PKGS="rsync tar gettext bind-utils nss_wrapper" && \
    INSTALL_PKGS="$INSTALL_PKGS rh-postgresql$POSTGRESQL_VERSION-pgaudit" && \
    yum -y --setopt=tsflags=nodocs install $INSTALL_PKGS && \
    rpm -V $INSTALL_PKGS && \
    yum -y clean all --enablerepo='*' && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone && \
    localedef -f UTF-8 -i en_US en_US.UTF-8 && \
    test "$(id postgres)" = "uid=26(postgres) gid=26(postgres) groups=26(postgres)" && \
    mkdir -p /var/lib/pgsql/data && \
    /usr/libexec/fix-permissions /var/lib/pgsql /var/run/postgresql

RUN touch /etc/yum/pluginconf.d/rhnplugin.conf && \
    echo  exclude=postgresql* >> /etc/yum/pluginconf.d/rhnplugin.conf    

RUN bash /usr/libexec/fix-permissions /var/run/postgresql

# Get prefix path and path to scripts rather than hard-code them in scripts
ENV CONTAINER_SCRIPTS_PATH=/usr/share/container-scripts/postgresql \
    ENABLED_COLLECTIONS=rh-postgresql12

# When bash is started non-interactively, to run a shell script, for example it
# looks for this variable and source the content of this file. This will enable
# the SCL for all scripts without need to do 'scl enable'.
ENV BASH_ENV=${CONTAINER_SCRIPTS_PATH}/scl_enable \
    ENV=${CONTAINER_SCRIPTS_PATH}/scl_enable \
    PROMPT_COMMAND=". ${CONTAINER_SCRIPTS_PATH}/scl_enable"

VOLUME ["/var/lib/pgsql/data", "/var/run/postgresql"]

COPY root /
ENV PGCONFIG /opt/rh/rh-postgresql12/root/usr/bin
ENV PATH /opt/rh/rh-postgresql12/root/usr/bin/:/usr/bin/:${PATH}

# Aquire and build PostGIS 3.1, for PostgreSQL 12.x
RUN cd /tmp && \
    rpm -ivh https://download.postgresql.org/pub/repos/yum/reporpms/EL-6-x86_64/pgdg-redhat-repo-latest.noarch.rpm && \
    yum install -y https://dl.fedoraproject.org/pub/epel/epel-release-latest-7.noarch.rpm

RUN yum install -y postgis31_12 postgis31_12-client pgrouting_12

RUN /usr/bin/install -c -m 755  /usr/pgsql-12/lib/postgis* '/opt/rh/rh-postgresql12/root/usr/lib64/pgsql/' && \
    /usr/bin/install -c -m 755  /usr/pgsql-12/lib/libpgrouting* '/opt/rh/rh-postgresql12/root/usr/lib64/pgsql/' && \
    /usr/bin/install -c -m 755  /usr/pgsql-12/lib/pgcrypto* '/opt/rh/rh-postgresql12/root/usr/lib64/pgsql/' && \
    /usr/bin/install -c -m 755  /usr/pgsql-12/lib/fuzzystrmatch* '/opt/rh/rh-postgresql12/root/usr/lib64/pgsql/' && \    
    /usr/bin/install -c -m 644 /usr/pgsql-12/share/extension/postgis* '/opt/rh/rh-postgresql12/root/usr/share/pgsql/extension/' && \
    /usr/bin/install -c -m 644 /usr/pgsql-12/share/extension/pgrouting* '/opt/rh/rh-postgresql12/root/usr/share/pgsql/extension/' && \
    /usr/bin/install -c -m 644 /usr/pgsql-12/share/extension/pgcrypto* '/opt/rh/rh-postgresql12/root/usr/share/pgsql/extension/' && \
    /usr/bin/install -c -m 644 /usr/pgsql-12/share/extension/fuzzystrmatch* '/opt/rh/rh-postgresql12/root/usr/share/pgsql/extension/' && \
    mv /usr/pgsql-12/share/contrib/postgis-3.1/ /opt/rh/rh-postgresql12/root/usr/share/pgsql/contrib/ 
   
RUN rm -rf /tmp/pgdg-redhat-repo-latest.noarch.rpm /var/cache/yum

# Remove entitlements and Subscription Manager configs
RUN rm -rf /etc/pki/entitlement && \
    rm -rf /etc/rhsm

RUN bash /usr/libexec/fix-permissions /var/lib/pgsql

USER 26

EXPOSE ${PORT}

ENTRYPOINT ["/usr/bin/container-entrypoint"]
CMD ["/usr/bin/run-postgresql"]