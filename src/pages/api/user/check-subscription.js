import { getSession } from "next-auth/react";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const session = await getSession({ req });
      if (!session) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
          company: {
            include: {
              subscriptions: {
                where: {
                  status: 'ACTIVE'
                }
              }
            }
          }
        }
      });

      const hasActiveSubscription = user.company?.subscriptions.length > 0;

      res.status(200).json({ hasActiveSubscription });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
  }
}