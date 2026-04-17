import { useState } from 'react'
import { useLocation } from 'wouter'
import { trpc } from '@/lib/trpc'
import { useAuth } from '@/_core/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, AlertTriangle, Info, CheckCircle, X, Bell, TrendingDown } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function AdminAlertsDashboard() {
  const [, navigate] = useLocation()
  const { user } = useAuth()
  const { language, isRTL } = useLanguage()
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([])
  const [selectedAlert, setSelectedAlert] = useState<any>(null)

  // Verify admin access
  if (!user || user.role !== 'admin') {
    return (
      <div className="container py-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {language === 'en' ? 'Access Denied' : 'تم رفض الوصول'}
          </h1>
          <p className="text-muted-foreground mb-4">
            {language === 'en'
              ? 'You do not have permission to view this page.'
              : 'ليس لديك إذن لعرض هذه الصفحة.'}
          </p>
          <Button onClick={() => navigate('/admin/performance')}>
            {language === 'en' ? 'Back to Dashboard' : 'العودة إلى لوحة التحكم'}
          </Button>
        </div>
      </div>
    )
  }

  // Fetch alerts data
  const { data: alertsData, isLoading } = trpc.admin.performance.getAlerts.useQuery(
    { days: 30 },
    { refetchInterval: 60000 } // Refetch every minute
  )

  const alertsList = alertsData?.data?.alerts || []
  const activeAlerts = alertsList.filter((alert: any) => !dismissedAlerts.includes(alert.message))
  const criticalAlerts = activeAlerts.filter((a: any) => a.severity === 'critical')
  const highAlerts = activeAlerts.filter((a: any) => a.severity === 'high')
  const mediumAlerts = activeAlerts.filter((a: any) => a.severity === 'medium')

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />
      case 'medium':
        return <Info className="w-5 h-5 text-yellow-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'destructive'
      case 'high':
        return 'secondary'
      case 'medium':
        return 'outline'
      default:
        return 'default'
    }
  }

  const dismissAlert = (alertId: string) => {
    setDismissedAlerts([...dismissedAlerts, alertId])
  }

  const handleEscalate = (alert: any) => {
    // TODO: Implement escalation logic
    console.log('Escalating alert:', alert)
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {language === 'en' ? 'Loading alerts...' : 'جاري تحميل التنبيهات...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-4xl font-bold">
            {language === 'en' ? 'Performance Alerts' : 'تنبيهات الأداء'}
          </h1>
          <Bell className="w-8 h-8 text-primary" />
        </div>
        <p className="text-muted-foreground">
          {language === 'en'
            ? 'Monitor and manage performance alerts for your verification team'
            : 'مراقبة وإدارة تنبيهات الأداء لفريق التحقق الخاص بك'}
        </p>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {language === 'en' ? 'Total Alerts' : 'إجمالي التنبيهات'}
              </p>
              <p className="text-3xl font-bold">{activeAlerts.length}</p>
            </div>
            <Bell className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {language === 'en' ? 'Critical' : 'حرج'}
              </p>
              <p className="text-3xl font-bold text-destructive">{criticalAlerts.length}</p>
            </div>
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {language === 'en' ? 'High' : 'عالي'}
              </p>
              <p className="text-3xl font-bold text-orange-600">{highAlerts.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {language === 'en' ? 'Resolved' : 'تم حله'}
              </p>
              <p className="text-3xl font-bold text-green-600">{dismissedAlerts.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Alerts Tabs */}
      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">
            {language === 'en' ? 'All' : 'الكل'} ({activeAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="critical">
            {language === 'en' ? 'Critical' : 'حرج'} ({criticalAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="high">
            {language === 'en' ? 'High' : 'عالي'} ({highAlerts.length})
          </TabsTrigger>
          <TabsTrigger value="medium">
            {language === 'en' ? 'Medium' : 'متوسط'} ({mediumAlerts.length})
          </TabsTrigger>
        </TabsList>

        {/* All Alerts Tab */}
        <TabsContent value="all" className="space-y-4">
          {activeAlerts.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'en' ? 'No Active Alerts' : 'لا توجد تنبيهات نشطة'}
              </h3>
              <p className="text-muted-foreground">
                {language === 'en'
                  ? 'Your team is performing well. All systems are operating normally.'
                  : 'فريقك يؤدي بشكل جيد. جميع الأنظمة تعمل بشكل طبيعي.'}
              </p>
            </Card>
          ) : (
            activeAlerts.map((alert: any, idx: number) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{alert.message}</h3>
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{alert.type}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        {language === 'en' ? 'View Details' : 'عرض التفاصيل'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEscalate(alert)}
                      >
                        {language === 'en' ? 'Escalate' : 'تصعيد'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissAlert(alert.message)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Critical Alerts Tab */}
        <TabsContent value="critical" className="space-y-4">
          {criticalAlerts.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'en' ? 'No Critical Alerts' : 'لا توجد تنبيهات حرجة'}
              </h3>
            </Card>
          ) : (
            criticalAlerts.map((alert: any, idx: number) => (
              <Card key={idx} className="p-6 border-destructive bg-destructive/5 hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg text-destructive">{alert.message}</h3>
                      <Badge variant="destructive">CRITICAL</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{alert.type}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        {language === 'en' ? 'View Details' : 'عرض التفاصيل'}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleEscalate(alert)}
                      >
                        {language === 'en' ? 'Escalate Immediately' : 'تصعيد فوري'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissAlert(alert.message)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* High Alerts Tab */}
        <TabsContent value="high" className="space-y-4">
          {highAlerts.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'en' ? 'No High Priority Alerts' : 'لا توجد تنبيهات ذات أولوية عالية'}
              </h3>
            </Card>
          ) : (
            highAlerts.map((alert: any, idx: number) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{alert.message}</h3>
                      <Badge variant="secondary">HIGH</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{alert.type}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        {language === 'en' ? 'View Details' : 'عرض التفاصيل'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEscalate(alert)}
                      >
                        {language === 'en' ? 'Escalate' : 'تصعيد'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissAlert(alert.message)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Medium Alerts Tab */}
        <TabsContent value="medium" className="space-y-4">
          {mediumAlerts.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle className="w-12 h-12 mx-auto text-green-600 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {language === 'en' ? 'No Medium Priority Alerts' : 'لا توجد تنبيهات ذات أولوية متوسطة'}
              </h3>
            </Card>
          ) : (
            mediumAlerts.map((alert: any, idx: number) => (
              <Card key={idx} className="p-6 hover:shadow-lg transition">
                <div className="flex items-start gap-4">
                  {getSeverityIcon(alert.severity)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{alert.message}</h3>
                      <Badge variant="outline">MEDIUM</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{alert.type}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        {language === 'en' ? 'View Details' : 'عرض التفاصيل'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEscalate(alert)}
                      >
                        {language === 'en' ? 'Escalate' : 'تصعيد'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => dismissAlert(alert.message)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
