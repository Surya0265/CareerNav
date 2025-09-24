const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const colors = require('colors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

console.log('Environment loaded, checking database connection variables...');
if (!process.env.MONGO_URI) {
  console.error('ERROR: MONGO_URI is missing in environment variables!');
  process.exit(1);
}

// Connect to MongoDB
connectDB();

const resumeRoutes = require('./routes/resumeRoutes');
const jobRoutes = require('./routes/jobRoutes');
const timelineRoutes = require('./routes/timelineRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('Backend is running');
});

// Database test route
app.get('/api/test-db', async (req, res) => {
  try {
    console.log('Testing database connection...');
    const dbState = mongoose.connection.readyState;
    
    if (dbState === 1) {
      // Try a simple DB operation
      const count = await mongoose.connection.db.collection('users').countDocuments();
      console.log('Users collection count:', count);
      
      res.json({
        status: 'success',
        message: 'Database connection successful',
        dbState: 'connected',
        collections: {
          users: count
        }
      });
    } else {
      console.error('Database not connected, state:', dbState);
      res.status(500).json({
        status: 'error',
        message: 'Database not connected',
        dbState: dbState
      });
    }
  } catch (error) {
    console.error('Error testing database:', error);
    res.status(500).json({
      status: 'error',
      message: 'Database test failed',
      error: error.message
    });
  }
});

app.use('/api/users', userRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/timeline', timelineRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend running on port http://localhost:${PORT}`));
