import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { corsHeaders, handleOptions } from "@/middleware-cors"

/**
 * Handle OPTIONS preflight for CORS
 */
export async function OPTIONS(request: NextRequest) {
  return handleOptions(request)
}

/**
 * Get comments for a news post (public endpoint)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify post exists and is published
    const post = await prisma.newsPost.findFirst({
      where: {
        id,
        deletedAt: null,
        status: "published",
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: "News post not found" },
        {
          status: 404,
          headers: corsHeaders(request),
        }
      )
    }

    // Get top-level comments (no parent) with their replies
    const comments = await prisma.newsPostComment.findMany({
      where: {
        postId: id,
        parentId: null, // Top-level comments only
        approved: true,
        deletedAt: null,
      },
      include: {
        replies: {
          where: {
            approved: true,
            deletedAt: null,
          },
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(
      { comments },
      {
        headers: corsHeaders(request),
      }
    )
  } catch (error: any) {
    console.error("[COMMENTS API] Error fetching comments:", error)

    return NextResponse.json(
      {
        error: "Failed to fetch comments",
        details: error?.message || "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}

/**
 * Create a new comment (public endpoint)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const { content, authorName, authorEmail, parentId } = body

    // Validate required fields
    if (!content || !authorName) {
      return NextResponse.json(
        { error: "Content and author name are required" },
        {
          status: 400,
          headers: corsHeaders(request),
        }
      )
    }

    // Verify post exists and is published
    const post = await prisma.newsPost.findFirst({
      where: {
        id,
        deletedAt: null,
        status: "published",
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: "News post not found" },
        {
          status: 404,
          headers: corsHeaders(request),
        }
      )
    }

    // If parentId is provided, verify it exists and belongs to this post
    if (parentId) {
      const parent = await prisma.newsPostComment.findFirst({
        where: {
          id: parentId,
          postId: id,
          deletedAt: null,
        },
      })

      if (!parent) {
        return NextResponse.json(
          { error: "Parent comment not found" },
          {
            status: 404,
            headers: corsHeaders(request),
          }
        )
      }
    }

    // Create comment
    const comment = await prisma.newsPostComment.create({
      data: {
        postId: id,
        content: content.trim(),
        authorName: authorName.trim(),
        authorEmail: authorEmail?.trim() || null,
        parentId: parentId || null,
        approved: true, // Auto-approve for now
      },
    })

    return NextResponse.json(
      { comment },
      {
        status: 201,
        headers: corsHeaders(request),
      }
    )
  } catch (error: any) {
    console.error("[COMMENTS API] Error creating comment:", error)

    return NextResponse.json(
      {
        error: "Failed to create comment",
        details: error?.message || "Unknown error",
      },
      {
        status: 500,
        headers: corsHeaders(request),
      }
    )
  }
}
