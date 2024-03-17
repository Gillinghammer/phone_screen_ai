// pages/api/test-session.js
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  console.log('Test Session:', session);
  res.json({ session });
}
