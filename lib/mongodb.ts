import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

// Only throw error at runtime, not during build
if (!MONGODB_URI && typeof window === 'undefined' && process.env.NODE_ENV !== 'test') {
  // During build, we'll use a dummy connection string to avoid errors
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    // Build phase - use dummy connection
    console.warn('MONGODB_URI not set during build. Make sure to set it in production.');
  } else {
    // Runtime - throw error
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use global cache to prevent multiple connections in development
declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB(): Promise<typeof mongoose> {
  // During build, skip connection
  if (process.env.NEXT_PHASE === 'phase-production-build' && !MONGODB_URI) {
    return mongoose;
  }

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      if (process.env.NODE_ENV !== 'test') {
        console.log('✅ MongoDB connected successfully');
      }
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

export default connectDB;


