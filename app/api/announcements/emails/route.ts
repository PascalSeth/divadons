import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { successResponse, errorResponse } from "@/lib/helpers/response";
import { requireAdmin, AuthError } from "@/lib/helpers/auth-guard";
import { z } from "zod";

const createEmailCampaignSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  sendToAll: z.boolean().default(true),
});

export async function GET() {
  try {
    const campaigns = await prisma.emailCampaign.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return successResponse(campaigns);
  } catch (error) {
    console.error("Error fetching email campaigns:", error);
    return errorResponse("Failed to fetch email campaigns", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const parsed = createEmailCampaignSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid input", 400, parsed.error.issues);
    }

    const { subject, content } = parsed.data;

    // Get all active newsletter subscribers
    const subscribers = await prisma.newsletterSubscription.findMany({
      where: { active: true },
      select: { email: true },
    });

    const recipientCount = subscribers.length;

    if (recipientCount === 0) {
      return errorResponse("No active subscribers to send to", 400);
    }

    // Create the campaign record
    const campaign = await prisma.emailCampaign.create({
      data: {
        subject,
        content,
        recipientCount,
        status: "pending",
      },
    });

    // In a production environment, you would integrate with an email service like:
    // - SendGrid
    // - Mailchimp
    // - AWS SES
    // - Resend
    // For now, we'll simulate the email sending and mark as sent

    // Simulate sending emails (in production, replace with actual email service)
    try {
      // Example with a hypothetical email service:
      // for (const subscriber of subscribers) {
      //   await emailService.send({
      //     to: subscriber.email,
      //     subject,
      //     html: content,
      //   });
      // }

      // Mark campaign as sent
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: {
          status: "sent",
          sentAt: new Date(),
        },
      });

      console.log(`Email campaign "${subject}" would be sent to ${recipientCount} subscribers:`, 
        subscribers.map(s => s.email).slice(0, 5), 
        recipientCount > 5 ? `...and ${recipientCount - 5} more` : ''
      );

      return successResponse({
        ...campaign,
        status: "sent",
        sentAt: new Date(),
        message: `Email campaign created. In production, this would send to ${recipientCount} subscribers.`,
      }, 201);
    } catch (sendError) {
      // Mark campaign as failed
      await prisma.emailCampaign.update({
        where: { id: campaign.id },
        data: { status: "failed" },
      });

      console.error("Error sending emails:", sendError);
      return errorResponse("Failed to send email campaign", 500);
    }
  } catch (error) {
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    console.error("Error creating email campaign:", error);
    return errorResponse("Failed to create email campaign", 500);
  }
}
