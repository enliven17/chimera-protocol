/**
 * Minimal Vincent Test Server
 */

const express = require('express');
const app = express();
app.use(express.json());

const PORT = 3002;

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Vincent is working!',
    timestamp: new Date().toISOString()
  });
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Vincent Test Server',
    timestamp: new Date().toISOString()
  });
});

// Execute action endpoint
app.post('/execute_action', (req, res) => {
  console.log('📥 Received action:', req.body);
  
  res.json({
    success: true,
    action: req.body.action || 'unknown',
    message: 'Action received successfully',
    data: req.body,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Vincent Test Server running on port ${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/test`);
  console.log(`💚 Health: http://localhost:${PORT}/health`);
});

process.on('SIGINT', () => {
  console.log('\n👋 Vincent Test Server shutting down...');
  process.exit(0);
});