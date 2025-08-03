const express = require('express');
const app = express();
const port = 8083;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/customers/activity', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const { customerId, activityType } = req.query;
  console.log(`Customer activity SSE client connected - customerId: ${customerId}, activityType: ${activityType}`);

  let eventId = 1;

  const activities = ['LOGIN', 'LOGOUT', 'PROFILE_UPDATE', 'PASSWORD_CHANGE', 'KYC_SUBMITTED', 'DOCUMENT_UPLOAD', 'ACCOUNT_VERIFICATION'];
  const devices = ['mobile', 'desktop', 'tablet', 'api'];
  const countries = ['US', 'CA', 'GB', 'DE', 'FR', 'AU', 'JP', 'SG', 'HK'];

  const sendEvent = () => {
    const activityEvent = {
      type: 'CUSTOMER_ACTIVITY',
      customerId: customerId || `cust_${Math.floor(Math.random() * 1000)}`,
      activityType: activityType || activities[Math.floor(Math.random() * activities.length)],
      timestamp: new Date().toISOString(),
      sessionId: `session_${Math.floor(Math.random() * 1000000)}`,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      userAgent: `FinTechApp/2.1.0`,
      device: devices[Math.floor(Math.random() * devices.length)],
      country: countries[Math.floor(Math.random() * countries.length)],
      riskScore: Math.floor(Math.random() * 100)
    };

    res.write(`id: ${eventId++}\n`);
    res.write(`event: customer-activity\n`);
    res.write(`data: ${JSON.stringify(activityEvent)}\n\n`);
  };

  sendEvent();
  
  const interval = setInterval(sendEvent, Math.random() * 5000 + 5000);

  req.on('close', () => {
    console.log('Customer activity SSE client disconnected');
    clearInterval(interval);
  });
});

app.get('/customers/security-alerts', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const { severity, customerId } = req.query;
  console.log(`Security alerts SSE client connected - severity: ${severity}, customerId: ${customerId}`);

  let eventId = 1;

  const alertTypes = ['SUSPICIOUS_LOGIN', 'MULTIPLE_FAILED_ATTEMPTS', 'UNUSUAL_TRANSACTION_PATTERN', 'ACCOUNT_LOCKED', 'FRAUD_DETECTED', 'AML_ALERT'];
  const severityLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];

  const sendEvent = () => {
    const alertEvent = {
      type: 'SECURITY_ALERT',
      alertId: `alert_${Math.floor(Math.random() * 1000000)}`,
      customerId: customerId || `cust_${Math.floor(Math.random() * 1000)}`,
      alertType: alertTypes[Math.floor(Math.random() * alertTypes.length)],
      severity: severity || severityLevels[Math.floor(Math.random() * severityLevels.length)],
      timestamp: new Date().toISOString(),
      description: 'Automated security alert triggered by risk engine',
      resolved: Math.random() > 0.7,
      ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      actionRequired: Math.random() > 0.5,
      complianceFlag: Math.random() > 0.8
    };

    res.write(`id: ${eventId++}\n`);
    res.write(`event: security-alert\n`);
    res.write(`data: ${JSON.stringify(alertEvent)}\n\n`);
  };

  sendEvent();
  
  const interval = setInterval(sendEvent, Math.random() * 10000 + 10000);

  req.on('close', () => {
    console.log('Security alerts SSE client disconnected');
    clearInterval(interval);
  });
});

app.listen(port, () => {
  console.log(`Customer Service SSE server running on port ${port}`);
  console.log(`Endpoints:`);
  console.log(`  - http://localhost:${port}/customers/activity`);
  console.log(`  - http://localhost:${port}/customers/security-alerts`);
});