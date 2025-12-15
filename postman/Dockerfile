FROM postman/newman:alpine

# Install newman-reporter-htmlextra for better reports
RUN npm install -g newman-reporter-htmlextra

# Copy Postman collections, environments, and globals
COPY collections/ /etc/newman/collections/
COPY environments/ /etc/newman/environments/
COPY globals/ /etc/newman/globals/

WORKDIR /etc/newman

# Set default command to run Integration Testing collection
CMD ["run", "collections/Integration Testing.postman_collection.json", \
     "-e", "environments/BookStore Node Env.postman_environment.json", \
     "-g", "globals/workspace.postman_globals.json", \
     "--reporters", "cli,json,htmlextra", \
     "--reporter-json-export", "results/results.json", \
     "--reporter-htmlextra-export", "results/report.html"]
