const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string:', process.env.MONGO_URI ? `${process.env.MONGO_URI.substring(0, 20)}...` : 'Missing MONGO_URI');
    
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI not found in environment variables');
    }
    
    // Note: modern Mongoose (v6+) does not require useNewUrlParser/useUnifiedTopology
    const conn = await mongoose.connect(process.env.MONGO_URI);

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
    try {
      const dns = require('dns').promises;
      // Try to provide additional SRV diagnostic information when relevant
      const msg = (error && error.message) ? error.message : String(error);
      console.error(`MongoDB Connection Error: ${msg}`);

      if (msg.includes('querySrv') || msg.toLowerCase().includes('querysrv') || error.code === 'ECONNREFUSED') {
        // Extract hostname from an SRV connection string like: mongodb+srv://...@HOSTNAME/...
        const m = process.env.MONGO_URI.match(/@([^/]+)\//);
        const host = m ? m[1] : null;
        if (host) {
          const srvName = `_mongodb._tcp.${host}`;
          console.error('Attempting DNS SRV lookup for:', srvName);
          try {
            const records = await dns.resolveSrv(srvName);
            console.error('SRV records found:');
            records.forEach((r) => console.error(` - ${r.name}:${r.port} (priority=${r.priority} weight=${r.weight})`));
          } catch (dnsErr) {
            console.error('SRV lookup failed:', dnsErr.message || dnsErr);
          }
        }

        console.error('\nPossible causes:');
        console.error(' - Your machine or network cannot resolve DNS SRV records (firewall or DNS settings).');
        console.error(' - The provided MONGO_URI may be incorrect or the Atlas cluster is unreachable.');
        console.error('\nSuggested fixes:');
        console.error(' 1) Ensure you have working internet / DNS. Try switching to a public DNS server such as 8.8.8.8 or 1.1.1.1.');
        console.error(" 2) In MongoDB Atlas, get the 'Standard connection string' (not the SRV one) which lists the seed hosts and update MONGO_URI in your .env to that string.");
        console.error(' 3) If you are behind a corporate network that blocks DNS SRV, use the standard connection string with host:port entries.');
      } else {
        console.error('Full error:', error);
      }
    } catch (inner) {
      console.error('Error while diagnosing MongoDB connection:', inner);
      console.error('Original error:', error);
    }

    // Exit so the process doesn't continue in a broken state. Nodemon will wait for changes.
    process.exit(1);
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
