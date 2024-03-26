FROM postgres:15-bullseye

# ENV POSTGRES_VERSION=15
ENV POSTGIS_MAJOR 3
ENV POSTGIS_VERSION 3.4.2+dfsg-1.pgdg110+1

ENV TZ=America/Vancouver

ENV PORT=5432

USER 0

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

RUN usermod -G "" postgres
RUN mkdir -p /var/lib/pgsql/data
RUN /usr/libexec/fix-permissions /var/lib/pgsql /var/run/postgresql

# set time zone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# copy postgis init script to docker init directory
RUN mkdir -p /docker-entrypoint-initdb.d
COPY ./create_postgis.sql /docker-entrypoint-initdb.d/postgis.sql

USER 26

EXPOSE $PORT

CMD ["postgres"]
