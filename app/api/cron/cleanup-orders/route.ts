import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * CRON JOB: Cleanup Stale Pending Orders
 * 
 * This endpoint identifies and deletes orders with 'pending' status
 * that were created more than 72 hours ago. 
 * 
 * SECURITY: Requires an 'Authorization: Bearer <CRON_SECRET>' header.
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;

    // 1. Secret Validation
    if (!secret || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Invalid or missing CRON_SECRET' },
        { status: 401 }
      );
    }

    // 2. Define Threshold (72 Hours)
    const thresholdDate = new Date();
    thresholdDate.setHours(thresholdDate.getHours() - 72);

    // 3. Execution (Cleanup)
    const deleted = await prisma.order.deleteMany({
      where: {
        status: 'pending',
        createdAt: {
          lt: thresholdDate,
        },
      },
    });

    // 4. Logging & Response
    console.log(`[CRON] Cleaned up ${deleted.count} stale pending orders.`);

    return NextResponse.json({
      success: true,
      message: `Successfully cleaned up ${deleted.count} stale pending orders.`,
      count: deleted.count,
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('[CRON ERROR]', message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

// Allow GET for testing via browser if the secret is provided as a param (optional)
export async function GET(request: Request) {
  return POST(request);
}
