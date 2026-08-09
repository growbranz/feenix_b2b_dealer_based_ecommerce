import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types"

let _client: ReturnType<typeof createClient<Database>> | null = null

function getClient() {
  if (_client) return _client

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Supabase service role key is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
  }

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
