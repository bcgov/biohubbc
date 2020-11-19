# ################################# W A R N I N G ####################################################################
# This DockerFile is used for deployments only, please do not change for other purposes. It will break our deployment.
# ####################################################################################################################

FROM node:10

# Setting Path
ENV PATH /opt/rh/rh-nodejs8/root/usr/bin:/opt/app-root/src/node_modules/.bin/:/opt/app-root/src/app.npm-global/bin/:/opt/app-root/src/app/bin:/opt/app-root/src/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

# Create app directory

WORKDIR /opt/app-root/src

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# COPY PACKAGE JSON
COPY ./package*.json ./

# INSTALL NODE DEPENDENCIES
RUN npm install

# Copy All the sources
COPY ./ .

# BUILD APP
RUN npm run build-prod

EXPOSE 3030

# RUN APP
CMD ["npm", "run", "deploy_start"]
