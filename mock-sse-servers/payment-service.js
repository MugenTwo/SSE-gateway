const express = require('express');
const app = express();
const port = 8082;

const paymentMethods = ['CARD', 'ACH', 'WIRE', 'CRYPTO', 'DIGITAL_WALLET', 'MOBILE'];
const statuses = ['COMPLETED', 'PENDING', 'FAILED', 'DECLINED'];

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/transactions/sse', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const { customerId, currency, limit } = req.query;
  console.log(`Payment transactions SSE client connected - customerId: ${customerId}, currency: ${currency}, limit: ${limit}`);

  let eventId = 1;

  const sendEvent = () => {
    const transactionEvent = {
      type: 'PAYMENT_PROCESSED',
      transactionId: `txn_${Math.floor(Math.random() * 1000000)}`,
      customerId: customerId || `cust_${Math.floor(Math.random() * 1000)}`,
      merchantId: `merch_${Math.floor(Math.random() * 100)}`,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      currency: currency || ['USD', 'EUR', 'GBP'][Math.floor(Math.random() * 3)],
      amount: (Math.random() * 1000).toFixed(2),
      fee: (Math.random() * 50).toFixed(2),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      timestamp: new Date().toISOString(),
      reference: `ref_${Math.floor(Math.random() * 10000)}`,
      exchangeRate: (Math.random() * 2 + 0.5).toFixed(4)
    };

    res.write(`id: ${eventId++}\n`);
    res.write(`event: payment-transaction\n`);
    res.write(`data: ${JSON.stringify(transactionEvent)}\n\n`);
  };

  sendEvent();
  
  const interval = setInterval(sendEvent, Math.random() * 3000 + 1000);

  req.on('close', () => {
    console.log('Payment transactions SSE client disconnected');
    clearInterval(interval);
  });
});

app.get('/transactions/high-value', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const { minAmount, currency } = req.query;
  console.log(`High-value transactions SSE client connected - minAmount: ${minAmount}, currency: ${currency}`);

  let eventId = 1;

  const sendEvent = () => {
    const highValueEvent = {
      type: 'HIGH_VALUE_TRANSACTION',
      transactionId: `txn_${Math.floor(Math.random() * 1000000)}`,
      customerId: `cust_${Math.floor(Math.random() * 1000)}`,
      merchantId: `merch_${Math.floor(Math.random() * 100)}`,
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      currency: currency || ['USD', 'EUR', 'GBP'][Math.floor(Math.random() * 3)],
      amount: (Math.random() * 50000 + 10000).toFixed(2), // Always high value
      fee: (Math.random() * 500 + 100).toFixed(2),
      status: 'COMPLETED',
      timestamp: new Date().toISOString(),
      riskScore: (Math.random() * 100).toFixed(1),
      priority: ['HIGH', 'URGENT', 'CRITICAL'][Math.floor(Math.random() * 3)]
    };

    res.write(`id: ${eventId++}\n`);
    res.write(`event: high-value-transaction\n`);
    res.write(`data: ${JSON.stringify(highValueEvent)}\n\n`);
  };

  sendEvent();
  
  const interval = setInterval(sendEvent, Math.random() * 7000 + 8000);

  req.on('close', () => {
    console.log('High-value transactions SSE client disconnected');
    clearInterval(interval);
  });
});

app.listen(port, () => {
  console.log(`Payment Processing Service SSE server running on port ${port}`);
  console.log(`Endpoints:`);
  console.log(`  - http://localhost:${port}/transactions/sse`);
  console.log(`  - http://localhost:${port}/transactions/high-value`);
});