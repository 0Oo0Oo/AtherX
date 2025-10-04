// Configuration for API keys and services
// For production, consider using environment variables or secure storage

const config = {
  // PoseTracker API Configuration
  POSE_TRACKER_API_KEY: 'af48c0d0-dca9-4cc3-93e7-f67174bbbedb', // Your actual PoseTracker API key
  POSE_TRACKER_BASE_URL: 'https://api.posetracker.com/v1',
  
  // App Configuration
  MAX_RECORDING_DURATION: 30, // seconds
  VIDEO_QUALITY: '720p',
  
  // Demo Mode (set to false when using real API key)
  USE_DEMO_MODE: false, // Using real API key now
};

export default config;
