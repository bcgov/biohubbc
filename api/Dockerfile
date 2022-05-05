# ################################# W A R N I N G ####################################################################
# This DockerFile is used for deployments only, please do not change for other purposes. It will break our deployment.
# ####################################################################################################################

FROM node:14

ENV HOME=/opt/app-root/src

RUN mkdir -p $HOME

WORKDIR $HOME

# Copy the package files only
# A wildcard is used to ensure both package.json AND package-lock.json are copied where available (npm@5+)
COPY ./package*.json ./

# If you are building your code for production
# RUN npm install --only=production
RUN npm install

ENV PATH /opt/rh/rh-nodejs8/root/usr/bin:${HOME}/node_modules/.bin/:${HOME}/app.npm-global/bin/:${HOME}/bin:${HOME}/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Copy the rest of the files
COPY . ./

# Cleaning any existing generated file
RUN rm -rf ./dist

# Build api
RUN npm run build

# Application VOLUME
VOLUME ${HOME}

EXPOSE 6100

# Application Entry point
CMD ["npm", "run", "start"]
