const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', process.env.MONGO_URI ? `${process.env.MONGO_URI.substring(0, 20)}...` : 'Missing MONGO_URI');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not found in environment variables');
    }
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline.bold);
    
    // Test the connection with a simple query
    const connectionState = mongoose.connection.readyState;
    console.log('MongoDB connection state:', getConnectionStateString(connectionState));
    
    // Set up connection event listeners
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });
    
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`.red.bold);
    console.error('Full error:', error);
    process.exit(1); // Exit with failure
  }
};

// Helper function to get connection state as a string
function getConnectionStateString(state) {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    4: 'invalid credentials'
  };
  return states[state] || `unknown state (${state})`;
}

module.exports = connectDB;
