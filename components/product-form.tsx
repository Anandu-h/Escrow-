"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Package, DollarSign, Upload, CheckCircle, AlertCircle, Image, Camera } from "lucide-react"
import { useAccount } from "wagmi"

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  currency: z.string().min(3, "Currency is required"),
  category: z.string().min(1, "Category is required"),
  estimatedDelivery: z.string().min(1, "Estimated delivery is required"),
  condition: z.string().min(1, "Condition is required"),
  brand: z.string().optional(),
  model: z.string().optional(),
  warranty: z.string().optional(),
  shippingMethod: z.string().optional(),
  returnPolicy: z.string().optional(),
})

type ProductFormData = z.infer<typeof productSchema>

interface ProductFormProps {
  onProductCreated: () => void
}

export function ProductForm({ onProductCreated }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreview, setImagePreview] = useState<string[]>([])
  const { address } = useAccount()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedImages(prev => [...prev, ...files].slice(0, 5)) // Max 5 images
      
      // Create preview URLs
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setImagePreview(prev => [...prev, ...newPreviews].slice(0, 5))
    }
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreview(prev => {
      URL.revokeObjectURL(prev[index])
      return prev.filter((_, i) => i !== index)
    })
  }

  const onSubmit = async (data: ProductFormData) => {
    if (!address) {
      setSubmitStatus("error")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // Create FormData for file upload
      const formData = new FormData()
      formData.append("productName", data.productName)
      formData.append("description", data.description)
      formData.append("price", data.price.toString())
      formData.append("currency", data.currency)
      formData.append("category", data.category)
      formData.append("estimatedDelivery", data.estimatedDelivery)
      formData.append("condition", data.condition)
      formData.append("brand", data.brand || "")
      formData.append("model", data.model || "")
      formData.append("warranty", data.warranty || "")
      formData.append("shippingMethod", data.shippingMethod || "")
      formData.append("returnPolicy", data.returnPolicy || "")
      formData.append("sellerWallet", address)
      formData.append("sellerName", "Seller")

      // Add images
      selectedImages.forEach((image, index) => {
        formData.append(`image_${index}`, image)
      })

      const response = await fetch("/api/products", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        setSubmitStatus("success")
        reset()
        setSelectedImages([])
        setImagePreview([])
        onProductCreated()
      } else {
        setSubmitStatus("error")
      }
    } catch (error) {
      console.error("Error creating product:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="glass-card max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          Create New Product
        </CardTitle>
        <CardDescription>
          List your product for sale with blockchain escrow protection
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Images */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Product Images</label>
            <div className="border-2 border-dashed border-primary/30 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <Camera className="h-8 w-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload images (max 5 images)
                </p>
              </label>
            </div>
            
            {/* Image Previews */}
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Product Name *</label>
              <Input
                {...register("productName")}
                placeholder="Enter product name"
                className="cyber-border bg-transparent"
              />
              {errors.productName && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.productName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Category *</label>
              <select
                {...register("category")}
                className="w-full px-3 py-2 border border-primary/30 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              >
                <option value="">Select category</option>
                <option value="Electronics">Electronics</option>
                <option value="Clothing">Clothing</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Sports">Sports</option>
                <option value="Books">Books</option>
                <option value="Automotive">Automotive</option>
                <option value="Health & Beauty">Health & Beauty</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Brand</label>
              <Input
                {...register("brand")}
                placeholder="e.g., Apple, Samsung"
                className="cyber-border bg-transparent"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Model</label>
              <Input
                {...register("model")}
                placeholder="e.g., iPhone 15, Galaxy S24"
                className="cyber-border bg-transparent"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Description *</label>
            <textarea
              {...register("description")}
              placeholder="Describe your product in detail..."
              rows={4}
              className="w-full px-3 py-2 border border-primary/30 rounded-lg bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
            />
            {errors.description && (
              <p className="text-sm text-red-400 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Price *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  {...register("price", { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="cyber-border bg-transparent pl-10"
                />
              </div>
              {errors.price && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.price.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Currency *</label>
              <select
                {...register("currency")}
                className="w-full px-3 py-2 border border-primary/30 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="ETH">ETH</option>
                <option value="BTC">BTC</option>
              </select>
              {errors.currency && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.currency.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Condition *</label>
              <select
                {...register("condition")}
                className="w-full px-3 py-2 border border-primary/30 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              >
                <option value="">Select condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
              {errors.condition && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.condition.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Estimated Delivery *</label>
              <Input
                {...register("estimatedDelivery")}
                placeholder="e.g., 3-5 days"
                className="cyber-border bg-transparent"
              />
              {errors.estimatedDelivery && (
                <p className="text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.estimatedDelivery.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Warranty</label>
              <Input
                {...register("warranty")}
                placeholder="e.g., 1 year manufacturer warranty"
                className="cyber-border bg-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Shipping Method</label>
              <select
                {...register("shippingMethod")}
                className="w-full px-3 py-2 border border-primary/30 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              >
                <option value="">Select shipping method</option>
                <option value="Standard Shipping">Standard Shipping</option>
                <option value="Express Shipping">Express Shipping</option>
                <option value="Overnight Shipping">Overnight Shipping</option>
                <option value="Pickup Only">Pickup Only</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Return Policy</label>
              <select
                {...register("returnPolicy")}
                className="w-full px-3 py-2 border border-primary/30 rounded-lg bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50"
              >
                <option value="">Select return policy</option>
                <option value="30 days return">30 days return</option>
                <option value="14 days return">14 days return</option>
                <option value="7 days return">7 days return</option>
                <option value="No returns">No returns</option>
              </select>
            </div>
          </div>

          {submitStatus === "success" && (
            <div className="flex items-center gap-2 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-green-400">Product created successfully!</span>
            </div>
          )}

          {submitStatus === "error" && (
            <div className="flex items-center gap-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-red-400">Failed to create product. Please try again.</span>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isSubmitting || !address}
              className="flex-1 neon-gradient"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Product...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Create Product
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => reset()}
              className="cyber-border bg-transparent"
            >
              Reset
            </Button>
          </div>

          {!address && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-yellow-400">Please connect your wallet first</span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}
