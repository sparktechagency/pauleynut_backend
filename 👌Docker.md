# ✅ **Option 2 — Use mongosh inside the Mongo Docker container**

The official MongoDB image **no longer includes the mongo shell**, but we can install mongosh inside it:

```bash
docker exec -it কন্টেইনারের_নাম bash
```

Inside container:

```bash
apt-get update
apt-get install -y wget gnupg
wget -qO - https://pgp.mongodb.com/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" > /etc/apt/sources.list.d/mongodb-org-6.0.list
apt-get update
apt-get install -y mongodb-mongosh
```

Then run:

```bash
mongosh
show dbs
```

### Connect to MongoDB via Compass

In MongoDB Compass, you will connect to the container using the following settings:

- **Hostname**: `localhost` or `127.0.0.1`
- **Port**: `27017`
- **Authentication**: If you haven't set up authentication in the container, you can leave this blank. Otherwise, provide the credentials.

#### Example:

- **Connection String**: `mongodb://localhost:27017`

     - OR
     - **Hostname**: `localhost`
     - **Port**: `27017`

If your MongoDB has authentication enabled, you would also need to provide your username and password.

### Step 4: Verify the Connection

- Click on **Connect**.
- If everything is set up correctly, you should now be able to see the databases inside your MongoDB container in Compass.

# handle error on running multiple project [port errror]
```
abdullah@abdullah-MS-7E05:~/Desktop/devlife/self learninng/microservice/sangam/practice_sangam_microservice/api-gateway$ docker compose up --build
[+] Running 2/2
 ✔ Network api-gateway_app-network  Created                                       0.0s 
 ✔ Container mongo-db-api-gateway   Created                                       0.2s 
Attaching to mongo-db-api-gateway
Error response from daemon: failed to set up container networking: driver failed programming external connectivity on endpoint mongo-db-api-gateway (6781d1d70342bc2a4429c7fa039a7a74de6157498e408f70ef76a9b9ab2c261a): Bind for 0.0.0.0:27017 failed: port is already allocated
```

- it has two fix
- - either you ignore _**docker compose up**_ or _**docker compose up --build**_ and reuse older container just by changing collection name
```
DATABASE_URL=mongodb://localhost:27017/api-gateway
```
- - create a new container in different port like bellow
### use different port in _docker-compose.yaml_
**project 1**  - docker-compose.yml:
```
services:
  mongo:
    image: mongo:latest
    container_name: mongo-db-project1
    restart: always
    networks:
      - app-network
    volumes:
      - mongo-data:/data/db  # Persist MongoDB data
    ports:
      - "27017:27017"  # Expose MongoDB to your local machine (Project 1 on port 27017)

volumes:
  mongo-data:  # Persisted volume for MongoDB data

networks:
  app-network:  # Custom network for inter-container communication
```
**Project 2** - docker-compose.yml:
```
services:
  mongo:
    image: mongo:latest
    container_name: mongo-db-project2
    restart: always
    networks:
      - app-network
    volumes:
      - mongo-data:/data/db  # Persist MongoDB data
    ports:
      - "27018:27017"  # Expose MongoDB to your local machine (Project 2 on port 27018)

volumes:
  mongo-data:  # Persisted volume for MongoDB data

networks:
  app-network:  # Custom network for inter-container communication

```
