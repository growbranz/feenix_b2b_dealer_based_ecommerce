"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Save, ArrowRight, ArrowLeft, Send, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Stepper } from "./stepper"
import { ImageGalleryUpload } from "./image-gallery-upload"
import {
  productBasicInfoSchema,
  productPricingSchema,
  productInventorySchema,
  productImagesSchema,
  type ProductBasicInfoFormData,
  type ProductPricingFormData,
  type ProductInventoryFormData,
  type ProductImagesFormData,
} from "@/lib/validations/product.validation"

const STEPS = [
  { id: "basic", label: "Basic Info" },
  { id: "pricing", label: "Pricing" },
  { id: "inventory", label: "Inventory" },
  { id: "images", label: "Images" },
  { id: "review", label: "Review" },
]

interface Option {
  id: string
  name: string
}

interface AddProductFormProps {
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
  categories?: Option[]
  brands?: Option[]
  models?: Option[]
  isLoading?: boolean
  initialValues?: any
  mode?: "add" | "edit"
}

export function AddProductForm({
  onSubmit,
  onCancel,
  categories = [],
  brands = [],
  models = [],
  isLoading = false,
  initialValues,
  mode = "add",
}: AddProductFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0)
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set())
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSavingDraft, setIsSavingDraft] = React.useState(false)

  const initialDefaultValues = React.useMemo(
    () => ({
      category_id: "",
      brand_id: "",
      model_id: "",
      title: "",
      sku: "",
      oem_number: "",
      compatible_models: "",
      description: "",
      price: 0,
      bulk_price: undefined,
      discount: 0,
      tax: 0,
      warranty: "",
      stock: 0,
      minimum_order: 1,
      warehouse: "",
      availability: "in_stock",
      images: [],
    }),
    []
  )

  const methods = useForm<any>({
    defaultValues: initialValues || initialDefaultValues,
  })

  const hasReset = React.useRef(false)
  React.useEffect(() => {
    if (initialValues && !hasReset.current) {
      methods.reset(initialValues)
      hasReset.current = true
    }
  }, [initialValues, methods])

  const { watch, trigger } = methods
  const formValues = watch()

  const handleNext = async () => {
    const isStepValid = await validateCurrentStep()
    if (isStepValid) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]))
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const validateCurrentStep = async () => {
    switch (currentStep) {
      case 0:
        return await trigger(["category_id", "brand_id", "model_id", "title", "sku", "description"])
      case 1:
        return await trigger(["price"])
      case 2:
        return await trigger(["stock", "minimum_order", "availability"])
      case 3:
        return await trigger(["images"])
      default:
        return true
    }
  }

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    setIsSavingDraft(true)
    try {
      // TODO: Implement draft save
      await new Promise((resolve) => setTimeout(resolve, 1000))
      alert("Draft saved!")
    } finally {
      setIsSavingDraft(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            key="step-basic"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category *</Label>
                    <Select {...methods.register("category_id")} disabled={isLoading}>
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand_id">Brand *</Label>
                    <Select {...methods.register("brand_id")} disabled={isLoading}>
                      <option value="">Select brand</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="model_id">Model *</Label>
                    <Select {...methods.register("model_id")} disabled={isLoading}>
                      <option value="">Select model</option>
                      {models.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU *</Label>
                    <Input {...methods.register("sku")} placeholder="Enter SKU" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Product Name *</Label>
                  <Input {...methods.register("title")} placeholder="Enter product name" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="oem_number">OEM Number</Label>
                    <Input {...methods.register("oem_number")} placeholder="Enter OEM number" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="compatible_models">Compatible Models</Label>
                    <Input {...methods.register("compatible_models")} placeholder="e.g., iPhone 14, 14 Pro" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea {...methods.register("description")} placeholder="Describe your product..." rows={4} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 1:
        return (
          <motion.div
            key="step-pricing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Dealer Price *</Label>
                    <Input
                      {...methods.register("price", { valueAsNumber: true })}
                      type="number"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bulk_price">Bulk Price</Label>
                    <Input
                      {...methods.register("bulk_price", { valueAsNumber: true })}
                      type="number"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="discount">Discount (%)</Label>
                    <Input
                      {...methods.register("discount", { valueAsNumber: true })}
                      type="number"
                      placeholder="0"
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax">Tax (%)</Label>
                    <Input
                      {...methods.register("tax", { valueAsNumber: true })}
                      type="number"
                      placeholder="18"
                      min={0}
                      max={100}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warranty">Warranty</Label>
                  <Input {...methods.register("warranty")} placeholder="e.g., 6 Months" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 2:
        return (
          <motion.div
            key="step-inventory"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Inventory</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock *</Label>
                    <Input
                      {...methods.register("stock", { valueAsNumber: true })}
                      type="number"
                      placeholder="0"
                      min={0}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minimum_order">Minimum Order *</Label>
                    <Input
                      {...methods.register("minimum_order", { valueAsNumber: true })}
                      type="number"
                      placeholder="1"
                      min={1}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="warehouse">Warehouse</Label>
                    <Input {...methods.register("warehouse")} placeholder="Enter warehouse location" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="availability">Availability *</Label>
                    <Select {...methods.register("availability")}>
                      <option value="in_stock">In Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                      <option value="pre_order">Pre Order</option>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      case 3:
        return (
          <motion.div
            key="step-images"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <ImageGalleryUpload
                  images={formValues.images}
                  onChange={(images) => methods.setValue("images", images)}
                  maxImages={5}
                />
              </CardContent>
            </Card>
          </motion.div>
        )

      case 4:
        return (
          <motion.div
            key="step-review"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-base">Review & Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold">Product Summary</h3>
                  <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Name:</span>
                      <span className="font-medium">{formValues.title || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU:</span>
                      <span className="font-medium">{formValues.sku || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">₹{formValues.price || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Stock:</span>
                      <span className="font-medium">{formValues.stock || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Images:</span>
                      <span className="font-medium">{formValues.images.length} uploaded</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Description Preview</h3>
                  <p className="text-sm text-muted-foreground">{formValues.description || "-"}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )

      default:
        return null
    }
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit)} className="space-y-8">
        <Stepper steps={STEPS} currentStep={currentStep} completedSteps={completedSteps} />

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>
        </div>

        <div className="flex items-center justify-between border-t border-border/50 pt-6">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSavingDraft || isSubmitting}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSavingDraft ? "Saving..." : "Save Draft"}
            </Button>
          </div>

          <div className="flex gap-3">
            {currentStep > 0 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext} disabled={isSubmitting}>
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting
                  ? mode === "edit" ? "Saving..." : "Publishing..."
                  : mode === "edit" ? "Save Changes" : "Publish Product"}
              </Button>
            )}
          </div>
        </div>
      </form>
    </FormProvider>
  )
}
