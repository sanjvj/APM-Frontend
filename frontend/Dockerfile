FROM node:lts-alpine AS build
WORKDIR /usr/src/app
COPY ["package.json", "./"]
RUN npm install
COPY . .
COPY config.env ./
# Stage 2: Create the final runtime image
FROM node:lts-alpine AS final
WORKDIR /usr/src/app
COPY --from=build /usr/src/app .
RUN apk add --no-cache tzdata
ENV TZ="Etc/UTC"
RUN date
RUN chown -R node /usr/src/app
USER node
RUN npm run build
ENTRYPOINT ["npm", "run", "start"]
