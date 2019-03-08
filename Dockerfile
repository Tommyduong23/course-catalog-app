# FID Access Dockerfile
#
# For more information on how to modify this file and all
# available directives, visit the link below:
# https://docs.docker.com/engine/reference/builder/

# Node chosen for its immediate access to NodeJS; ships
# with the yarn package manager and Aptitude
# https://yarnpkg.com/en/
ARG VERSION=10
FROM node:${VERSION}


# Copy all files (that aren't ignored by .dockerignore) to
# our `home` directory and install all project dependencies
WORKDIR /home
COPY . .
RUN yarn --pure-lockfile

# Init project env variables and expose app port; NODE_ENV
# is set to `production` here. Use `yarn dev` locally for
# development; only use Docker for deploying the
# application.
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD yarn serve
