import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id)
    if (!id) return NextResponse.json({ error: 'Invalid product id' }, { status: 400 })

    // Increment view count via stored procedure (safe, avoids unsupported SELECT triggers)
    try {
      await query('CALL IncrementProductView(?)', [id])
    } catch (e) {
      // Log and continue: increment failure shouldn't block returning product
      console.error('Failed to increment product view count:', e)
    }

    const products = await query(
      `SELECT 
        p.id,
        p.name,
        p.description,
        p.price_cents,
        p.currency,
        p.condition_enum,
        p.brand,
        p.model,
        p.warranty_info,
        p.shipping_method,
        p.return_policy,
        p.estimated_delivery_days,
        p.images,
        p.view_count,
        p.created_at,
        u.first_name as seller_name,
        u.wallet_address as seller_wallet,
        c.name as category_name
      FROM products p
      JOIN users u ON p.seller_id = u.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = TRUE LIMIT 1`,
      [id]
    )

    if (!products || (products as any[]).length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ product: (products as any[])[0] })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}
