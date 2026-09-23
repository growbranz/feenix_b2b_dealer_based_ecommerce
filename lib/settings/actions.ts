"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { requireAdmin, getCurrentUserProfile } from "@/lib/auth/auth.helpers"
import { logActivity } from "@/lib/activity/service"

const db = supabaseAdmin as any

export interface SettingsData {
  site_name?: string
  company_name?: string
  company_email?: string
  company_phone?: string
  company_address?: string
  gst_number?: string
  logo_url?: string
  support_email?: string
  support_phone?: string
  whatsapp_number?: string
  facebook_url?: string
  instagram_url?: string
  linkedin_url?: string
  seo_title?: string
  seo_description?: string
}

export async function getSettings(): Promise<SettingsData> {
  try {
    await requireAdmin()
    
    const { data, error } = await db
      .from("settings")
      .select("*")
      .single()

    if (error) {
      console.error("Error fetching settings:", error)
      // Return default settings if error occurs
      return getDefaultSettings()
    }

    // Map old column names to new interface if needed
    return mapDatabaseToSettings(data)
  } catch (error) {
    console.error("Error in getSettings:", error)
    return getDefaultSettings()
  }
}

export async function saveSettings(settings: SettingsData): Promise<SettingsData> {
  try {
    const { user, profile } = await requireAdmin()
    
    console.log("Saving settings:", settings)
    
    // Check if settings record exists
    const { data: existing, error: checkError } = await db
      .from("settings")
      .select("id")
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error("Error checking existing settings:", checkError)
      throw new Error(`Failed to check existing settings: ${checkError.message}`)
    }

    let result
    
    // Map settings to database columns (handle both old and new schema)
    const dbSettings = mapSettingsToDatabase(settings)
    
    if (existing) {
      console.log("Updating existing settings with ID:", existing.id)
      // Update existing settings
      const { data, error } = await db
        .from("settings")
        .update(dbSettings)
        .eq("id", existing.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating settings:", error)
        throw error
      }
      result = data
    } else {
      console.log("Inserting new settings")
      // Insert new settings
      const { data, error } = await db
        .from("settings")
        .insert(dbSettings)
        .select()
        .single()

      if (error) {
        console.error("Error inserting settings:", error)
        throw error
      }
      result = data
    }

    console.log("Settings saved successfully:", result)

    // Log the activity
    try {
      await logActivity({
        type: "SETTINGS_ACTION",
        action: "Updated platform settings",
        actor_id: user.id,
        actor_name: profile?.name || profile?.email || "Admin",
        actor_role: profile?.role || "ADMIN",
        target_type: "Settings",
        target_id: result.id,
        target_name: "Platform Settings",
        metadata: {
          updated_fields: Object.keys(settings),
          updated_by: user.id
        }
      })
    } catch (logError) {
      console.error("Failed to log activity:", logError)
      // Don't throw on activity logging failure
    }

    return mapDatabaseToSettings(result) as SettingsData
  } catch (error) {
    console.error("Error saving settings:", error)
    throw new Error(`Failed to save settings: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Map database columns to settings interface (handles both old and new schema)
function mapDatabaseToSettings(data: any): SettingsData {
  if (!data) return getDefaultSettings()
  
  return {
    site_name: data.site_name || "Feenix Repair",
    company_name: data.company_name || data.site_name || "Feenix Repair",
    company_email: data.company_email || data.email || "",
    company_phone: data.company_phone || data.phone || "",
    company_address: data.company_address || data.address || "",
    gst_number: data.gst_number || "",
    logo_url: data.logo_url || data.logo || "",
    support_email: data.support_email || data.email || "",
    support_phone: data.support_phone || data.phone || "",
    whatsapp_number: data.whatsapp_number || data.whatsapp || "",
    facebook_url: data.facebook_url || "",
    instagram_url: data.instagram_url || "",
    linkedin_url: data.linkedin_url || "",
    seo_title: data.seo_title || "",
    seo_description: data.seo_description || "",
  }
}

// Map settings interface to database columns (handles both old and new schema)
function mapSettingsToDatabase(settings: SettingsData): any {
  const dbSettings: any = {
    site_name: settings.site_name,
  }
  
  // Try new column names first, fall back to old ones
  if (settings.company_name) dbSettings.company_name = settings.company_name
  if (settings.company_email) {
    dbSettings.company_email = settings.company_email
    dbSettings.email = settings.company_email // Old column name
  }
  if (settings.company_phone) {
    dbSettings.company_phone = settings.company_phone
    dbSettings.phone = settings.company_phone // Old column name
  }
  if (settings.company_address) {
    dbSettings.company_address = settings.company_address
    dbSettings.address = settings.company_address // Old column name
  }
  if (settings.gst_number) dbSettings.gst_number = settings.gst_number
  if (settings.logo_url) {
    dbSettings.logo_url = settings.logo_url
    dbSettings.logo = settings.logo_url // Old column name
  }
  if (settings.support_email) dbSettings.support_email = settings.support_email
  if (settings.support_phone) dbSettings.support_phone = settings.support_phone
  if (settings.whatsapp_number) {
    dbSettings.whatsapp_number = settings.whatsapp_number
    dbSettings.whatsapp = settings.whatsapp_number // Old column name
  }
  if (settings.facebook_url) dbSettings.facebook_url = settings.facebook_url
  if (settings.instagram_url) dbSettings.instagram_url = settings.instagram_url
  if (settings.linkedin_url) dbSettings.linkedin_url = settings.linkedin_url
  if (settings.seo_title) dbSettings.seo_title = settings.seo_title
  if (settings.seo_description) dbSettings.seo_description = settings.seo_description
  
  return dbSettings
}

function getDefaultSettings(): SettingsData {
  return {
    site_name: "Feenix Repair",
    company_name: "Feenix Repair",
    company_email: "info@feenixrepair.com",
    company_phone: "+91 1800 123 4567",
    company_address: "",
    gst_number: "",
    logo_url: "",
    support_email: "support@feenixrepair.com",
    support_phone: "+91 1800 123 4567",
    whatsapp_number: "+91 98765 43210",
    facebook_url: "",
    instagram_url: "",
    linkedin_url: "",
    seo_title: "Feenix Repair - Premium Mobile Repair Parts",
    seo_description: "Your trusted source for quality mobile repair parts and accessories."
  }
}
