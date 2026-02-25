import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id: reviewId } = await context.params
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
    })

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: review })
  } catch (error) {
    console.error('Review fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch review' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id: reviewId } = await context.params
    const review = await prisma.review.delete({
      where: { id: reviewId },
    })

    return NextResponse.json({ success: true, data: review })
  } catch (error) {
    console.error('Review deletion error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 }
    )
  }
}
