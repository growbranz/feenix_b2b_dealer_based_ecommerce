"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { getApiKeys, createApiKey, revokeApiKey, deleteApiKey } from "@/lib/api-keys/actions"
import { Key, Copy, Trash, RotateCcw, Plus } from "lucide-react"

export function ApiKeyManager() {
  const [keys, setKeys] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [newKey, setNewKey] = React.useState<any>(null)
  const [name, setName] = React.useState("")

  async function load() {
    setLoading(true)
    try {
      const data = await getApiKeys()
      setKeys(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    load()
  }, [])

  async function generate() {
    if (!name) return
    const key = await createApiKey({ name })
    setNewKey(key)
    setName("")
    await load()
  }

  function copy(text: string) {
    navigator.clipboard.writeText(text)
    alert("Copied to clipboard")
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border bg-white p-4 shadow-sm dark:bg-slate-900">
        <h3 className="mb-3 text-sm font-semibold">Generate API Key</h3>
        <div className="flex gap-2">
          <Input placeholder="Key name" value={name} onChange={(e) => setName(e.target.value)} />
          <Button onClick={generate}>
            <Plus className="mr-2 h-4 w-4" />
            Generate
          </Button>
        </div>
      </div>

      {newKey && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:bg-emerald-900/20">
          <p className="text-sm font-medium">Copy this key now — it will not be shown again.</p>
          <div className="mt-2 flex items-center gap-2">
            <code className="break-all rounded bg-white p-2 text-xs dark:bg-slate-900">{newKey.plain}</code>
            <Button size="sm" variant="outline" onClick={() => copy(newKey.plain)}>
              <Copy className="mr-2 h-3 w-3" />
              Copy
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Preview</th>
                <th className="px-4 py-3">Permissions</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id} className="border-t">
                  <td className="px-4 py-3">{k.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{k.key_preview}</td>
                  <td className="px-4 py-3 text-xs">{k.permissions.join(", ")}</td>
                  <td className="px-4 py-3 text-xs">{k.is_active ? "Active" : "Revoked"}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{new Date(k.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {k.is_active && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => revokeApiKey(k.id).then(load)}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteApiKey(k.id).then(load)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
