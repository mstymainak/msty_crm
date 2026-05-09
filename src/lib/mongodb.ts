import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let cached = (global as any).mongoose;
let mongoServer: MongoMemoryServer | null = (global as any).__mongoServer || null;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  let uri = process.env.MONGODB_URI;

  // If no valid URI, use in-memory MongoDB (for development/demo)
  if (!uri || uri.includes('>') || uri.length < 20) {
    if (!mongoServer) {
      console.log('⚡ No valid MONGODB_URI found — starting in-memory MongoDB...');
      mongoServer = await MongoMemoryServer.create();
      (global as any).__mongoServer = mongoServer;
    }
    uri = mongoServer.getUri();
    console.log('⚡ Using in-memory MongoDB (data resets on restart)');
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    };

    cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;