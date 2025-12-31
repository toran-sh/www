import { MongoClient, Db } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const MONGODB_DATABASE = process.env.MONGODB_DATABASE || "toran";

const globalForMongo = globalThis as unknown as {
  mongoClient: MongoClient | undefined;
  mongoDb: Db | undefined;
};

let client: MongoClient;
let db: Db;

if (process.env.NODE_ENV === "production") {
  client = new MongoClient(MONGODB_URI);
  db = client.db(MONGODB_DATABASE);
} else {
  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(MONGODB_URI);
    globalForMongo.mongoDb = globalForMongo.mongoClient.db(MONGODB_DATABASE);
  }
  client = globalForMongo.mongoClient;
  db = globalForMongo.mongoDb!;
}

export { client, db };
