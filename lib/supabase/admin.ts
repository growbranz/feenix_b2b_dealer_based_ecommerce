import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types"

let _client: ReturnType<typeof createClient<Database>> | null = null

export function validateSupabaseAdminConfig() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in environment configuration.")
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in environment configuration.")
  }
}

function getClient() {
  if (_client) return _client

  validateSupabaseAdminConfig()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  _client = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })

  return _client
}

export const supabaseAdmin = new Proxy({} as any, {
  get(_target, prop) {
    const client = getClient()
    return (client as any)[prop]
  },
})
