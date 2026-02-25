import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

type RouteContext = {
  params: Promise<{ productId: string }>
}

export async function GET(request: NextRequest) {
  try {
    const productId = request.nextUrl.searchParams.get('productId')
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10')
    const offset = parseInt(request.nextUrl.searchParams.get('offset') || '0')

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await prisma.review.count({
      where: { productId },
    })

    // Calculate average rating
    const avgRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        limit,
        offset,
        pages: Math.ceil(total / limit),
      },
      averageRating: parseFloat(avgRating.toFixed(1)),
    })
  } catch (error) {
    console.error('Reviews fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, customerName, email, rating, title, comment, verified } =
      body

    if (!productId || !customerName || !email || !rating || !title || !comment) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      )
    }

    const review = await prisma.review.create({
      data: {
        productId,
        customerName,
        email,
        rating,
        title,
        comment,
        verified: verified || false,
      },
    })

    return NextResponse.json(
      { success: true, data: review },
      { status: 201 }
    )
  } catch (error) {
    console.error('Review creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
