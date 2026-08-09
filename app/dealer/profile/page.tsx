"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, Mail, Phone, MapPin, FileText, Save, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ImageUpload } from "@/components/dealer/image-upload"
import { ProfileCompletionCard } from "@/components/dealer/profile-completion-card"
import { dealerProfileSchema, type DealerProfileFormData } from "@/lib/validations/dealer.validation"
import { updateDealerProfile } from "@/lib/dealer/actions"
import { useDealer } from "@/components/dealer/dealer-provider"
import type { Profile } from "@/types"

function getDefaultValues(profile: Profile | null): DealerProfileFormData {
  return {
    business_name: profile?.business_name || "",
    gst_number: profile?.gst_number || "",
    phone: profile?.phone || "",
    email: profile?.email || "",
    address: profile?.address || "",
    city: profile?.city || "",
    state: profile?.state || "",
    country: profile?.country || "India",
    pincode: profile?.pincode || "",
    business_description: profile?.business_description || "",
    profile_image: profile?.profile_image || undefined,
  }
}

export default function DealerProfilePage() {
  const router = useRouter()
  const dealer = useDealer()
  const [isSaving, setIsSaving] = React.useState(false)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  const form = useForm<DealerProfileFormData>({
    resolver: zodResolver(dealerProfileSchema),
    defaultValues: getDefaultValues(dealer),
  })

  const { watch, formState } = form
  const formValues = watch()

  React.useEffect(() => {
    if (dealer) {
      form.reset(getDefaultValues(dealer))
    }
  }, [dealer, form])

  const onSubmit = async (data: DealerProfileFormData) => {
    setIsSaving(true)
    setSuccessMessage(null)
    setErrorMessage(null)
    try {
      const result = await updateDealerProfile(data)
      if (result.success) {
        setSuccessMessage(result.message)
        router.refresh()
      } else {
        setErrorMessage(result.message)
      }
    } catch (error) {
      console.error("Save error:", error)
      setErrorMessage("An unexpected error occurred. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    form.reset(getDefaultValues(dealer))
    setSuccessMessage(null)
    setErrorMessage(null)
  }

  const completionPercentage = React.useMemo(() => {
    const requiredFields = [
      formValues.business_name,
      formValues.phone,
      formValues.email,
      formValues.address,
      formValues.city,
      formValues.state,
      formValues.country,
      formValues.pincode,
    ]
    const filled = requiredFields.filter((f) => typeof f === "string" && f.trim().length > 0).length
    return Math.min(100, Math.round((filled / requiredFields.length) * 100))
  }, [formValues])

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dealer Profile</h1>
            <p className="mt-2 text-muted-foreground">
              Manage your business information and preferences
            </p>
          </div>
          <ProfileCompletionCard percentage={completionPercentage} />
        </div>
      </motion.div>

      {successMessage && (
        <div className="rounded-xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 border border-emerald-200">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-xl bg-rose-50 p-4 text-sm font-medium text-rose-700 border border-rose-200">
          {errorMessage}
        </div>
      )}

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Logo Upload */}
          <Card className="border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-base">Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                value={formValues.profile_image || null}
                onChange={(url) => form.setValue("profile_image", url || undefined)}
                dealerId={dealer?.id || ""}
                disabled={!dealer}
              />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card className="border-border/50 bg-card/80 shadow-sm backdrop-blur-sm lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business_name">Company Name *</Label>
                  <Input
                    id="business_name"
                    {...form.register("business_name")}
                    placeholder="Enter company name"
                  />
                  {form.formState.errors.business_name && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.business_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gst_number">GST Number</Label>
                  <Input
                    id="gst_number"
                    {...form.register("gst_number")}
                    placeholder="Enter GST number"
                  />
                  {form.formState.errors.gst_number && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.gst_number.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    {...form.register("phone")}
                    placeholder="Enter phone number"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    {...form.register("email")}
                    type="email"
                    placeholder="Enter email address"
                    disabled
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="business_description">Business Description</Label>
                <Textarea
                  id="business_description"
                  {...form.register("business_description")}
                  placeholder="Describe your business..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Address Information */}
        <Card className="border-border/50 bg-card/80 shadow-sm backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Address Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                {...form.register("address")}
                placeholder="Enter street address"
              />
              {form.formState.errors.address && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...form.register("city")}
                  placeholder="Enter city"
                />
                {form.formState.errors.city && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  {...form.register("state")}
                  placeholder="Enter state"
                />
                {form.formState.errors.state && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.state.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  {...form.register("country")}
                  placeholder="Enter country"
                />
                {form.formState.errors.country && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.country.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  {...form.register("pincode")}
                  placeholder="Enter pincode"
                />
                {form.formState.errors.pincode && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.pincode.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={!formState.isDirty || isSaving}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={!formState.isDirty || isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </motion.form>
    </div>
  )
}
