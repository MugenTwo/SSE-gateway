const express = require('express');
const app = express();
const port = 8081;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/accounts/low-balance-alerts', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const { customerId, currency } = req.query;
  console.log(`Account balance alerts SSE client connected - customerId: ${customerId}, currency: ${currency}`);

  let eventId = 1;

  const sendEvent = () => {
    const balanceAlert = {
      type: 'LOW_BALANCE_ALERT',
      customerId: customerId || `cust_${Math.floor(Math.random() * 1000)}`,
      accountId: `acct_${Math.floor(Math.random() * 10000)}`,
      currency: currency || ['USD', 'EUR', 'GBP'][Math.floor(Math.random() * 3)],
      previousBalance: (Math.random() * 100 + 50).toFixed(2),
      currentBalance: (Math.random() * 25).toFixed(2),
      threshold: '50.00',
      timestamp: new Date().toISOString(),
      severity: 'WARNING'
    };

    res.write(`id: ${eventId++}\n`);
    res.write(`event: account-low-balance\n`);
    res.write(`data: ${JSON.stringify(balanceAlert)}\n\n`);
  };

  // Send initial event
  sendEvent();
  
  // Send events every 3-7 seconds
  const interval = setInterval(sendEvent, Math.random() * 4000 + 3000);

  req.on('close', () => {
    console.log('Account balance alerts SSE client disconnected');
    clearInterval(interval);
  });
});

app.get('/accounts/transaction-events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const { customerId, currency, minAmount } = req.query;
  console.log(`Account transactions SSE client connected - customerId: ${customerId}, currency: ${currency}, minAmount: ${minAmount}`);

  let eventId = 1;

  const sendEvent = () => {
    const transactionEvent = {
      type: ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER', 'PAYMENT'][Math.floor(Math.random() * 4)],
      customerId: customerId || `cust_${Math.floor(Math.random() * 1000)}`,
      transactionId: `txn_${Math.floor(Math.random() * 1000000)}`,
      currency: currency || ['USD', 'EUR', 'GBP'][Math.floor(Math.random() * 3)],
      amount: (Math.random() * 5000).toFixed(2),
      status: ['PENDING', 'COMPLETED', 'FAILED', 'PROCESSING'][Math.floor(Math.random() * 4)],
      timestamp: new Date().toISOString(),
      fromAccount: `acct_${Math.floor(Math.random() * 10000)}`,
      toAccount: `acct_${Math.floor(Math.random() * 10000)}`,
      reference: `ref_${Math.floor(Math.random() * 100000)}`
    };

    res.write(`id: ${eventId++}\n`);
    res.write(`event: account-transaction\n`);
    res.write(`data: ${JSON.stringify(transactionEvent)}\n\n`);
  };

  sendEvent();
  
  const interval = setInterval(sendEvent, Math.random() * 3000 + 2000);

  req.on('close', () => {
    console.log('Account transactions SSE client disconnected');
    clearInterval(interval);
  });
});

app.listen(port, () => {
  console.log(`Account Service SSE server running on port ${port}`);
  console.log(`Endpoints:`);
  console.log(`  - http://localhost:${port}/accounts/low-balance-alerts`);
  console.log(`  - http://localhost:${port}/accounts/transaction-events`);
});