FROM postgres:15-bullseye

# ENV POSTGRES_VERSION=15
ENV POSTGIS_MAJOR 3
ENV POSTGIS_VERSION 3.4.2+dfsg-1.pgdg110+1

ENV TZ=America/Vancouver

ENV PORT=5432

ENV HOME=/var/lib/pgsql
ENV PGUSER=postgres
ENV PGDATA=/var/lib/pgsql/data

USER postgres

COPY ./libexec/fix-permissions /usr/libexec/fix-permissions

RUN apt-get update \
    && apt-cache showpkg postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR \
    && apt-get install -y --no-install-recommends \
    # ca-certificates: for accessing remote raster files;
    #   fix: https://github.com/postgis/docker-postgis/issues/307
    ca-certificates \
    \
    postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR=$POSTGIS_VERSION \
    postgresql-$PG_MAJOR-postgis-$POSTGIS_MAJOR-scripts \
    postgresql-$PG_MAJOR-pgrouting \
    postgresql-$PG_MAJOR-pgrouting-scripts \
    && rm -rf /var/lib/apt/lists/*

RUN usermod -a -G root postgres
RUN usermod -a -G 0 postgres

RUN usermod -G "" postgres
RUN test "$(id postgres)" = "uid=26(postgres) gid=26(postgres) groups=26(postgres)"

RUN mkdir -p /var/lib/pgsql/data
# RUN mkdir -p /var/run/postgresql
RUN bash /usr/libexec/fix-permissions /var/lib/pgsql
RUN bash /usr/libexec/fix-permissions /var/run/postgresql

# Grant permissions to the directories
# RUN chgrp -R 0 /var/lib/pgsql/data && chmod -R g=u /var/lib/pgsql/data
# RUN chgrp -R 0 /var/run/postgresql && chmod -R g=u /var/run/postgresql

# set time zone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# copy postgis init script to docker init directory
RUN mkdir -p /docker-entrypoint-initdb.d
COPY ./create_postgis.sql /docker-entrypoint-initdb.d/postgis.sql

RUN usermod -a -G root postgres 
RUN bash /usr/libexec/fix-permissions "$APP_DATA"

# USER 26

EXPOSE $PORT

CMD ["postgres"]
