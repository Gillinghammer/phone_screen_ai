import { getSession } from "next-auth/react";
import { prisma } from "../../../lib/prisma";

export default async function handler(req, res) {
  try {
    const session = await getSession({ req });
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        company: {
          include: {
            subscriptions: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const hasActiveSubscription = user.company?.subscriptions?.some(
      sub => sub.status === "ACTIVE"
    );

    const isWhiteLabel = user.company?.parentCompanyId != null;

    return res.json({
      hasActiveSubscription,
      isWhiteLabel,
      needsSubscription: !hasActiveSubscription && !isWhiteLabel,
      companyId: user.company?.id
    });
  } catch (error) {
    console.error("Check subscription error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}