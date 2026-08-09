import { getUnreadCount, getActivityLogs } from "@/lib/notifications/actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Activity } from "lucide-react"

export async function AdminNotificationWidget() {
  const [unread, activity] = await Promise.all([
    getUnreadCount(),
    getActivityLogs({ limit: 5 }),
  ])

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Unread Notifications</CardTitle>
          <Bell className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{unread}</div>
          <p className="text-xs text-slate-500">Notifications waiting for attention</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Latest Activity</CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          {activity.data.length === 0 ? (
            <p className="text-sm text-slate-500">No recent activity.</p>
          ) : (
            <ul className="space-y-2">
              {activity.data.slice(0, 3).map((log: any) => (
                <li key={log.id} className="text-sm">
                  <span className="font-medium">{log.action}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    {new Date(log.created_at).toLocaleDateString("en-IN")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
