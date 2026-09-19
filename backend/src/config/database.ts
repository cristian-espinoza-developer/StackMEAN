// src/config/database.ts
import { MongoClient, type Db } from 'mongodb';

let client: MongoClient | undefined;

export const connectDatabase = async (): Promise<Db> => {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('❌ Falta la variable de entorno MONGO_URI');
    process.exit(1);
  }
  try {
    client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('🔄 [Database]: Conexión exitosa a MongoDB');
    return client.db();
  } catch (error) {
    console.error('❌ Error crítico al conectar a la base de datos:', error);
    process.exit(1);
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await client?.close();
};
