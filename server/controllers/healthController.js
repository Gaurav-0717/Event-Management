const { getDBStatus } = require('../config/db');

/**
 * @desc    Get API health & status
 * @route   GET /api/health
 * @access  Public
 */
const getHealthStatus = (req, res) => {
  const dbStatus = getDBStatus();

  res.status(200).json({
    status: 'ok',
    message: 'EventWise API is running healthy',
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())}s`,
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: dbStatus,
      api: 'operational'
    }
  });
};

module.exports = {
  getHealthStatus
};
