import { NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    
    const productName = formData.get("productName") as string
    const description = formData.get("description") as string
    const price = parseFloat(formData.get("price") as string)
    const currency = formData.get("currency") as string
    const category = formData.get("category") as string
    const estimatedDelivery = formData.get("estimatedDelivery") as string
    const condition = formData.get("condition") as string
    const brand = formData.get("brand") as string
    const model = formData.get("model") as string
    const warranty = formData.get("warranty") as string
    const shippingMethod = formData.get("shippingMethod") as string
    const returnPolicy = formData.get("returnPolicy") as string
    const sellerWallet = formData.get("sellerWallet") as string
    const sellerName = formData.get("sellerName") as string

    // Validate required fields
    if (!productName || !description || !price || !currency || !category || !estimatedDelivery || !condition || !sellerWallet) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Convert price to cents for storage
    const amountCents = Math.round(price * 100)

    // Handle image uploads (for now, just store image count)
    const imageCount = Array.from(formData.keys()).filter(key => key.startsWith('image_')).length

    // Create detailed description with all product info
    const detailedDescription = `${description}\n\nProduct Details:\n- Brand: ${brand || 'Not specified'}\n- Model: ${model || 'Not specified'}\n- Condition: ${condition}\n- Warranty: ${warranty || 'Not specified'}\n- Shipping: ${shippingMethod || 'Not specified'}\n- Returns: ${returnPolicy || 'Not specified'}\n- Images: ${imageCount} photos included`

    // Insert product into orders table (treating as a product listing)
    const result = await query(
      `INSERT INTO orders (
        product, 
        seller_name, 
        seller_wallet, 
        amount_cents, 
        currency, 
        status, 
        progress,
        delivery_status,
        estimated_release_at
      ) VALUES (?, ?, ?, ?, ?, 'pending', 0, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
      [
        productName,
        sellerName || "Seller",
        sellerWallet,
        amountCents,
        currency,
        `Category: ${category} | Delivery: ${estimatedDelivery} | ${detailedDescription}`,
      ]
    )

    return NextResponse.json({
      success: true,
      productId: result.insertId,
      message: "Product created successfully",
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get("category")
    const sellerWallet = searchParams.get("sellerWallet")

    let sql = `
      SELECT 
        id,
        product,
        seller_name,
        seller_wallet,
        buyer_name,
        buyer_wallet,
        amount_cents,
        currency,
        status,
        progress,
        delivery_status,
        escrow_hash,
        created_at
      FROM orders 
      WHERE status = 'pending'
    `
    const params: any[] = []

    if (sellerWallet) {
      sql += " AND seller_wallet = ?"
      params.push(sellerWallet)
    }

    sql += " ORDER BY created_at DESC"

    const products = await query(sql, params)

    return NextResponse.json({ products })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}
