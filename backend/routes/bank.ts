import express from 'express';
import fetch from 'node-fetch';
import User from "../models/User";
const router = express.Router();

router.get('/link-token', async (req, res) => {
  try {
    const resp = await fetch('https://sandbox.setu.co/link/v1/link-token/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': process.env.SETU_CLIENT_ID!,
        'client-secret': process.env.SETU_CLIENT_SECRET!,
      },
      body: JSON.stringify({
        userId: req.user!.id,
        consentPurpose: ['AGGREGATOR_FIU'],
        redirectUrl: `${process.env.FRONTEND_URL}/bank/callback`
      }),
    });
    const { linkToken } = await resp.json();
    res.json({ linkToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create link token' });
  }
});

router.post('/complete-link', async (req, res) => {
  try {
    const { publicToken, accountId, bankName } = req.body;
    const resp = await fetch('https://sandbox.setu.co/link/v1/token/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'client-id': process.env.SETU_CLIENT_ID!,
        'client-secret': process.env.SETU_CLIENT_SECRET!,
      },
      body: JSON.stringify({ publicToken }),
    });
    const { accessToken } = await resp.json();

    await User.findByIdAndUpdate(
      req.user!.id,
      {
        $push: {
          bankLinks: {
            accountId,
            bankName,
            accessToken,
            paid: false,
            linkedAt: new Date(),
          }
        }
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Token exchange failed' });
  }
});

export default router;