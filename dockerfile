# Step 1: Use Node.js runtime 
FROM node:18-alpine

# Step 2: Set the working directory in the container
WORKDIR /app

# Step 3: Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install --production

# Step 5: Copy the rest of the application code to the container
COPY . .

# Step 6: Build the NestJS application (TypeScript)
RUN npm run build

# Step 7: Expose the port that your app will run on
EXPOSE 3000

# Step 8: Define the command to run your app using the built output
CMD ["npm", "run", "start:prod"]
