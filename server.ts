import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { spawn } from 'child_process';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Body parsers with support for camera snapshot base64 payloads
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

/**
 * Execute command against bank_engine.py
 */
function runPythonBank(payload: Record<string, any>): Promise<any> {
  return new Promise((resolve, reject) => {
    const py = spawn('python3', ['bank_engine.py', JSON.stringify(payload)], {
      cwd: process.cwd()
    });

    let stdout = '';
    let stderr = '';

    py.stdout.on('data', (chunk) => {
      stdout += chunk.toString();
    });

    py.stderr.on('data', (chunk) => {
      stderr += chunk.toString();
    });

    py.on('close', (code) => {
      if (code !== 0 && !stdout) {
        return reject(new Error(stderr || `Python process failed with exit code ${code}`));
      }
      try {
        const result = JSON.parse(stdout.trim());
        resolve(result);
      } catch (err) {
        reject(new Error(`Failed to parse Python response: ${stdout}. Error: ${err}`));
      }
    });

    py.on('error', (err) => {
      reject(err);
    });
  });
}

// Ensure QRs directory exists and initial accounts QR codes are ready
runPythonBank({ action: 'init' }).catch((err) => {
  console.error('Initial QR generation error:', err);
});

// Serve static QR codes
const qrsDir = path.resolve(process.cwd(), 'QRs');
app.use('/QRs', express.static(qrsDir));

// API: Health / System Status
app.get('/api/status', (_req, res) => {
  res.json({
    status: 'online',
    bank: 'NovaBank Core',
    timestamp: new Date().toISOString()
  });
});

// API: Login
app.post('/api/login', async (req, res) => {
  try {
    const { account_no, pin } = req.body;
    const result = await runPythonBank({
      action: 'login',
      account_no,
      pin
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// API: Get Account
app.get('/api/account/:accountNo', async (req, res) => {
  try {
    const result = await runPythonBank({
      action: 'get_account',
      account_no: req.params.accountNo
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// API: Deposit
app.post('/api/deposit', async (req, res) => {
  try {
    const { account_no, amount } = req.body;
    const result = await runPythonBank({
      action: 'deposit',
      account_no,
      amount
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// API: Withdraw
app.post('/api/withdraw', async (req, res) => {
  try {
    const { account_no, amount } = req.body;
    const result = await runPythonBank({
      action: 'withdraw',
      account_no,
      amount
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// API: Transfer
app.post('/api/transfer', async (req, res) => {
  try {
    const { account_no, receiver_acc, amount } = req.body;
    const result = await runPythonBank({
      action: 'transfer',
      account_no,
      receiver_acc,
      amount
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// API: Scan and Pay (Choice 8)
app.post('/api/scan-and-pay', async (req, res) => {
  try {
    const { account_no, receiver_name, amount } = req.body;
    const result = await runPythonBank({
      action: 'scan_and_pay',
      account_no,
      receiver_name,
      amount
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// API: Transactions
app.get('/api/transactions/:accountNo', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : null;
    const result = await runPythonBank({
      action: 'get_transactions',
      account_no: req.params.accountNo,
      limit
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// API: Change PIN
app.post('/api/change-pin', async (req, res) => {
  try {
    const { account_no, current_pin, new_pin } = req.body;
    const result = await runPythonBank({
      action: 'change_pin',
      account_no,
      current_pin,
      new_pin
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// API: Scan QR Image with OpenCV
app.post('/api/scan-qr-image', async (req, res) => {
  try {
    const { image_data } = req.body;
    const result = await runPythonBank({
      action: 'scan_qr_image',
      image_data
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// API: Recipients List
app.get('/api/recipients', async (_req, res) => {
  try {
    const result = await runPythonBank({
      action: 'get_all_recipients'
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
});

// API: Get QR File explicitly
app.get('/api/qr/:accountNo', (req, res) => {
  const accountNo = req.params.accountNo.replace(/[^0-9]/g, '');
  const filePath = path.join(qrsDir, `${accountNo}.png`);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=60');
    return res.sendFile(filePath);
  }

  // If missing, generate dynamically
  runPythonBank({ action: 'get_account', account_no: accountNo })
    .then(() => {
      if (fs.existsSync(filePath)) {
        res.setHeader('Content-Type', 'image/png');
        return res.sendFile(filePath);
      }
      res.status(404).json({ error: 'QR not found' });
    })
    .catch((err) => {
      res.status(404).json({ error: 'QR generation failed', details: err.message });
    });
});

async function main() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
        watch: process.env.DISABLE_HMR === 'true' ? null : {}
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NovaBank Server live on http://0.0.0.0:${PORT}`);
  });
}

main().catch((err) => {
  console.error('Server startup failure:', err);
  process.exit(1);
});
