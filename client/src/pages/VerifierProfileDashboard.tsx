import { useState } from 'react'
import { useParams, useLocation } from 'wouter'
import { trpc } from '@/lib/trpc'
import { useAuth } from '@/_core/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Target } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function VerifierProfileDashboard() {
  const { verifierId } = useParams()
  const [, navigate] = useLocation()
  const { user } = useAuth()
  const { language, isRTL } = useLanguage()
  const [selectedDocType, setSelectedDocType] = useState<string | null>(null)

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

  // Fetch verifier profile data
  const verifierIdNum = verifierId ? parseInt(verifierId, 10) : 0
  
  const { data: profileData, isLoading: profileLoading } = trpc.admin.performance.getVerifierProfile.useQuery(
    { verifierId: verifierIdNum },
    { enabled: !!verifierId }
  )

  const { data: performanceHistory } = trpc.admin.performance.getVerifierPerformanceHistory.useQuery(
    { verifierId: verifierIdNum, days: 90 },
    { enabled: !!verifierId }
  )

  const { data: documentBreakdown } = trpc.admin.performance.getVerifierDocumentBreakdown.useQuery(
    { verifierId: verifierIdNum, days: 90 },
    { enabled: !!verifierId }
  )

  const { data: recentDocuments } = trpc.admin.performance.getVerifierRecentDocuments.useQuery(
    { verifierId: verifierIdNum, limit: 10 },
    { enabled: !!verifierId }
  )

  const { data: accuracyTrends } = trpc.admin.performance.getVerifierAccuracyTrends.useQuery(
    { verifierId: verifierIdNum, days: 90 },
    { enabled: !!verifierId }
  )

  if (profileLoading) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            {language === 'en' ? 'Loading verifier profile...' : 'جاري تحميل ملف التحقق...'}
          </p>
        </div>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="container py-8">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold mb-2">
            {language === 'en' ? 'Verifier Not Found' : 'لم يتم العثور على المدقق'}
          </h1>
          <Button onClick={() => navigate('/admin/performance')}>
            {language === 'en' ? 'Back to Dashboard' : 'العودة إلى لوحة التحكم'}
          </Button>
        </div>
      </div>
    )
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/admin/performance')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {language === 'en' ? 'Back to Leaderboard' : 'العودة إلى قائمة الترتيب'}
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">{profileData?.data?.verifierName ?? 'Unknown'}</h1>
            <p className="text-muted-foreground">
              {language === 'en' ? 'Verifier ID:' : 'معرف المدقق:'} {profileData?.data?.verifierId ?? 'N/A'}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary mb-2">
              {profileData?.data?.performanceScore?.toFixed(1) ?? '0'}
            </div>
            <p className="text-sm text-muted-foreground">
              {language === 'en' ? 'Performance Score' : 'درجة الأداء'}
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {language === 'en' ? 'Documents Verified' : 'المستندات المُتحقق منها'}
              </p>
              <p className="text-3xl font-bold">{profileData?.data?.documentsVerified ?? '0'}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {language === 'en' ? 'Accuracy' : 'الدقة'}
              </p>
              <p className="text-3xl font-bold">{profileData?.data?.accuracy?.toFixed(1) ?? '0'}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {language === 'en' ? 'Avg Processing Time' : 'متوسط وقت المعالجة'}
              </p>
              <p className="text-3xl font-bold">{profileData?.data?.avgProcessingHours?.toFixed(1) ?? '0'}h</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {language === 'en' ? 'Rejection Rate' : 'معدل الرفض'}
              </p>
              <p className="text-3xl font-bold">{profileData?.data?.rejectionRate?.toFixed(1) ?? '0'}%</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="performance" className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">
            {language === 'en' ? 'Performance' : 'الأداء'}
          </TabsTrigger>
          <TabsTrigger value="documents">
            {language === 'en' ? 'Documents' : 'المستندات'}
          </TabsTrigger>
          <TabsTrigger value="accuracy">
            {language === 'en' ? 'Accuracy' : 'الدقة'}
          </TabsTrigger>
          <TabsTrigger value="recent">
            {language === 'en' ? 'Recent' : 'الأخيرة'}
          </TabsTrigger>
        </TabsList>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'en' ? 'Performance Trend (90 Days)' : 'اتجاه الأداء (90 يوم)'}
            </h3>
            {performanceHistory?.data && Array.isArray(performanceHistory.data?.history) && performanceHistory.data.history.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceHistory.data.history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#3b82f6"
                    name={language === 'en' ? 'Performance Score' : 'درجة الأداء'}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#10b981"
                    name={language === 'en' ? 'Accuracy' : 'الدقة'}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {language === 'en' ? 'No data available' : 'لا توجد بيانات متاحة'}
              </p>
            )}
          </Card>
        </TabsContent>

        {/* Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'en' ? 'Document Type Breakdown' : 'تفصيل نوع المستند'}
            </h3>
            {documentBreakdown?.data && Array.isArray(documentBreakdown.data) && documentBreakdown.data.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={documentBreakdown.data}
                      dataKey="count"
                      nameKey="documentType"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {documentBreakdown.data.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <div className="space-y-3">
                  {documentBreakdown?.data?.map((item: any, index: number) => (
                    <div
                      key={item.documentType}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition"
                      onClick={() =>
                        setSelectedDocType(selectedDocType === item.documentType ? null : item.documentType)
                      }
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-medium">{item.documentType}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{item.count}</p>
                        <p className="text-xs text-muted-foreground">
                          {profileData?.data?.documentsVerified ? ((item.count / profileData.data.documentsVerified) * 100).toFixed(1) : '0'}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {language === 'en' ? 'No data available' : 'لا توجد بيانات متاحة'}
              </p>
            )}
          </Card>
        </TabsContent>

        {/* Accuracy Tab */}
        <TabsContent value="accuracy" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'en' ? 'Accuracy Trends' : 'اتجاهات الدقة'}
            </h3>
            {accuracyTrends?.data && Array.isArray(accuracyTrends.data) && accuracyTrends.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={accuracyTrends.data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="accuracy"
                    fill="#10b981"
                    name={language === 'en' ? 'Accuracy %' : 'دقة %'}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {language === 'en' ? 'No data available' : 'لا توجد بيانات متاحة'}
              </p>
            )}
          </Card>
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="recent" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'en' ? 'Recent Verifications' : 'التحقق الأخير'}
            </h3>
            {recentDocuments?.data && Array.isArray(recentDocuments.data) && recentDocuments.data.length > 0 ? (
              <div className="space-y-3">
                {recentDocuments.data.map((doc: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{doc.documentType}</p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'en' ? 'User:' : 'المستخدم:'} {doc.userId}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          doc.verificationStatus === 'verified'
                            ? 'default'
                            : doc.verificationStatus === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                        }
                      >
                        {doc.verificationStatus}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(doc.verifiedAt || doc.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {language === 'en' ? 'No recent activity' : 'لا توجد أنشطة حديثة'}
              </p>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Alerts */}
      {profileData?.data?.performanceScore !== undefined && profileData.data.performanceScore < 50 && (
        <Card className="p-6 border-destructive bg-destructive/5">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-destructive flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-destructive mb-2">
                {language === 'en' ? 'Performance Alert' : 'تنبيه الأداء'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {language === 'en'
                  ? 'This verifier is underperforming. Consider providing additional training or support.'
                  : 'هذا المدقق يعاني من ضعف الأداء. يرجى النظر في توفير تدريب أو دعم إضافي.'}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
