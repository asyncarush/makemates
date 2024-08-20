FROM node:22-alpine3.19 AS build

WORKDIR /makemates-frontend

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:22-alpine3.19

WORKDIR /makemates-frontend

# Copy the necessary files from the build stage
COPY --from=build /makemates-frontend/.next ./.next
COPY --from=build /makemates-frontend/node_modules ./node_modules
COPY --from=build /makemates-frontend/package.json ./package.json
COPY --from=build /makemates-frontend/public ./public

EXPOSE 3000

# Start the Next.js application
CMD ["npm", "start"]
