import { ProductGallery } from "@/components/website/product-gallery"
import { ProductBadge } from "@/components/website/product-badge"
import { ProductCard } from "@/components/website/product-card"
import { Breadcrumb } from "@/components/shared/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/website/empty-state"
import { ProductDetailsSkeleton } from "@/components/website/skeletons"
import { EnquiryDialog } from "@/components/website/enquiry-dialog"
import { MapPin, MessageSquare, Share2, Heart } from "lucide-react"
import Link from "next/link"
import { getProductBySlug, getRelatedProducts } from "@/services/products"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Metadata } from "next"

interface ProductDetailsPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: ProductDetailsPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  
  if (!product) {
    return {
      title: "Product Not Found | Feenix Repair B2B Marketplace",
    }
  }

  const dealerName = product.dealer?.business_name || product.dealer?.name || "Seller"
  const categoryName = product.category?.name || ""
  const brandName = product.brand?.name || ""
  const modelName = product.model?.name || ""

  return {
    title: `${product.title} | Feenix Repair B2B Marketplace`,
    description: product.description || `Buy ${product.title} from ${dealerName}. ${categoryName} - ${brandName} - ${modelName}`,
    keywords: [product.title, categoryName, brandName, modelName, "B2B", "repair parts"].filter(Boolean),
    openGraph: {
      title: product.title,
      description: product.description || `Buy ${product.title} from ${dealerName}`,
      type: "website",
      images: product.primary_image ? [product.primary_image] : [],
    },
  }
}

async function ProductDetailsContent({ params }: ProductDetailsPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return (
      <EmptyState
        type="products"
        title="Product Not Found"
        description="The product you're looking for doesn't exist or has been removed."
        className="py-16"
      />
    )
  }

  const isOutOfStock = product.stock === 0
  const images = product.images?.map((img: any) => img.image_url) || []
  const primaryImage = product.primary_image || images[0]

  // Get related products
  const relatedProducts = await getRelatedProducts(product.id, product.category_id, 4)

  // Breadcrumb items - safely handle missing relationships
  const breadcrumbItems = [
    { label: 'Products', href: '/products' },
    ...(product.category ? [{ label: product.category.name, href: `/categories/${product.category.slug}` }] : []),
    ...(product.brand ? [{ label: product.brand.name, href: `/products?brand=${product.brand.id}` }] : []),
    { label: product.title }
  ]

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-24">
      {/* Breadcrumb */}
      <div className="mb-8">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-16">
        {/* Product Gallery */}
        <div>
          <ProductGallery images={images} alt={product.title} />
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.category && (
                <Badge variant="outline" className="rounded-full px-3 py-1 text-xs font-medium border-slate-200 text-slate-600">{product.category.name}</Badge>
              )}
              {product.condition && (
                <ProductBadge variant={product.condition.toLowerCase() as any} className="rounded-full px-3 py-1 text-xs font-medium">
                  {product.condition}
                </ProductBadge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-3 text-slate-900">{product.title}</h1>
            <p className="text-slate-600 leading-relaxed">{product.description}</p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl md:text-5xl font-extrabold text-gradient">
              ₹{product.price.toLocaleString("en-IN")}
            </span>
            {!isOutOfStock && (
              <span className="text-slate-500 font-medium">
                {product.stock} in stock
              </span>
            )}
          </div>

          {isOutOfStock && (
            <Badge variant="destructive" className="text-sm rounded-full px-3 py-1">Out of Stock</Badge>
          )}

          <Separator className="bg-slate-100" />

          {/* Specifications */}
          <div>
            <h3 className="font-semibold mb-4">Product Details</h3>
            <div className="space-y-3">
              {product.category && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Category</span>
                  <span className="font-medium">{product.category.name}</span>
                </div>
              )}
              {product.brand && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Brand</span>
                  <span className="font-medium">{product.brand.name}</span>
                </div>
              )}
              {product.model && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Model</span>
                  <span className="font-medium">{product.model.name}</span>
                </div>
              )}
              {product.quality && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Quality</span>
                  <span className="font-medium">{product.quality}</span>
                </div>
              )}
              {product.warranty && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Warranty</span>
                  <span className="font-medium">{product.warranty}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-600">Minimum Order</span>
                <span className="font-medium">{product.minimum_order} units</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            {product.dealer && (
              <EnquiryDialog
                productId={product.id}
                productTitle={product.title}
                productDealerId={product.dealer.id}
                minimumOrder={product.minimum_order}
                stock={product.stock}
                isOutOfStock={isOutOfStock}
              />
            )}
            <Button size="lg" variant="outline" className="rounded-full border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
              <Heart className="h-4 w-4 text-slate-600" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full border-slate-200 hover:border-blue-200 hover:bg-blue-50/50 transition-all">
              <Share2 className="h-4 w-4 text-slate-600" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dealer Information */}
      {product.dealer && (
        <Card className="mb-16 rounded-2xl border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)]">
          <CardHeader>
            <CardTitle>Seller Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg">{product.dealer.business_name || product.dealer.name}</h3>
                    {product.dealer.is_active && (
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    )}
                  </div>
                  {product.dealer.city && (
                    <div className="flex items-center gap-2 text-slate-600 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>{product.dealer.city}, {product.dealer.state}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Information */}
      <div className="grid md:grid-cols-2 gap-8 mb-16">
        <Card className="rounded-2xl border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)]">
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Shipping:</strong> Worldwide shipping available</p>
            <p><strong>Delivery Time:</strong> 3-7 business days</p>
            <p><strong>Shipping Cost:</strong> Calculated at checkout</p>
            <p><strong>Tracking:</strong> Real-time tracking provided</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-slate-100 bg-white shadow-[0_4px_24px_-10px_rgba(30,41,59,0.06)]">
          <CardHeader>
            <CardTitle>Return Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Returns:</strong> 30-day return policy</p>
            <p><strong>Condition:</strong> Item must be in original condition</p>
            <p><strong>Refund:</strong> Full refund within 14 days</p>
            <p><strong>Exchange:</strong> Exchange available for defective items</p>
          </CardContent>
        </Card>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-gradient mb-8">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function ProductDetailsPage({ params }: ProductDetailsPageProps) {
  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetailsContent params={params} />
    </Suspense>
  )
}
