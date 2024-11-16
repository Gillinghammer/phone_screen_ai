import { prisma } from '../../../lib/prisma';
import jwt from 'jsonwebtoken';
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      let userId;

      // First, try to get the user from the session
      const session = await getSession({ req });
      if (session && session.user) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        });
        if (user) {
          userId = user.id;
        }
      }

      // If no session, try to get the user from the token
      if (!userId) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          const token = authHeader.split(' ')[1];
          const decoded = jwt.verify(token, process.env.JWT_SECRET);
          userId = decoded.userId;
        }
      }

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          companyId: true,
        },
      });

      const company = await prisma.company.findUnique({
        where: { id: user.companyId },
        select: {
          id: true,
          name: true,
          domain: true,
          subscriptions: {
            where: {
              status: 'ACTIVE'
            },
            select: {
              id: true,
              status: true,
            }
          },
        },
      });

      const hasActiveSubscription = company.subscriptions.length > 0;

      res.status(200).json({ user, company, hasActiveSubscription });
    } catch (error) {
      console.error(error);
      res.status(401).json({ error: 'Unauthorized' });
    }
  } else {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
  }
}