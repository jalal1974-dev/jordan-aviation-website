import { useState } from 'react'
import { useParams, useLocation } from 'wouter'
import { trpc } from '@/lib/trpc'
import { useAuth } from '@/_core/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ArrowLeft, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock, Target } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function VerifierProfileDashboard() {
  const { verifierId } = useParams()
  const [, navigate] = useLocation()
  const { user } = useAuth()
  const { language, isRTL } = useLanguage()

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
  const { data: profileData, isLoading: profileLoading } = trpc.admin.performance.getVerifierMetrics.useQuery(
    { verifierId: parseInt(verifierId || '0'), days: 90 },
    { enabled: !!verifierId }
  )

  const { data: leaderboardData } = trpc.admin.performance.getLeaderboard.useQuery(
    { limit: 100, days: 90 },
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

  if (!profileData || !profileData.data) {
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

  const metrics = profileData.data
  const verifierRank = leaderboardData?.data?.findIndex((v: any) => v.verifierId === parseInt(verifierId || '0')) || 0

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
            <h1 className="text-4xl font-bold mb-2">
              {language === 'en' ? `Verifier #${verifierId}` : `المدقق #${verifierId}`}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' ? 'Rank:' : 'الترتيب:'} #{verifierRank + 1}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-primary mb-2">
              {metrics.performanceScore.toFixed(1)}
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
              <p className="text-3xl font-bold">{metrics.documentsVerified}</p>
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
              <p className="text-3xl font-bold">{metrics.verificationAccuracyRate.toFixed(1)}%</p>
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
              <p className="text-3xl font-bold">{metrics.averageProcessingTimeHours.toFixed(1)}h</p>
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
              <p className="text-3xl font-bold">{metrics.rejectionRate.toFixed(1)}%</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">
            {language === 'en' ? 'Overview' : 'نظرة عامة'}
          </TabsTrigger>
          <TabsTrigger value="metrics">
            {language === 'en' ? 'Metrics' : 'المقاييس'}
          </TabsTrigger>
          <TabsTrigger value="actions">
            {language === 'en' ? 'Actions' : 'الإجراءات'}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'en' ? 'Performance Summary' : 'ملخص الأداء'}
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-muted-foreground">
                  {language === 'en' ? 'Total Documents Verified' : 'إجمالي المستندات المُتحقق منها'}
                </span>
                <span className="font-bold">{metrics.documentsVerified}</span>
              </div>
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-muted-foreground">
                  {language === 'en' ? 'Accuracy Rate' : 'معدل الدقة'}
                </span>
                <Badge variant={metrics.verificationAccuracyRate >= 85 ? 'default' : 'secondary'}>
                  {metrics.verificationAccuracyRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex items-center justify-between pb-4 border-b">
                <span className="text-muted-foreground">
                  {language === 'en' ? 'Average Processing Time' : 'متوسط وقت المعالجة'}
                </span>
                <span className="font-bold">{metrics.averageProcessingTimeHours.toFixed(2)} hours</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {language === 'en' ? 'Rejection Rate' : 'معدل الرفض'}
                </span>
                <Badge variant={metrics.rejectionRate <= 10 ? 'default' : 'destructive'}>
                  {metrics.rejectionRate.toFixed(1)}%
                </Badge>
              </div>
            </div>
          </Card>

          {/* Performance Alert */}
          {metrics.performanceScore < 50 && (
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
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'en' ? 'Detailed Metrics' : 'المقاييس التفصيلية'}
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={[
                {
                  name: language === 'en' ? 'Metrics' : 'المقاييس',
                  'Accuracy': metrics.verificationAccuracyRate,
                  'Processing Speed': Math.min(100, (24 / (metrics.averageProcessingTimeHours || 1)) * 10),
                  'Volume': Math.min(100, (metrics.documentsVerified / 1000) * 100),
                },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Accuracy" fill="#10b981" />
                <Bar dataKey="Processing Speed" fill="#3b82f6" />
                <Bar dataKey="Volume" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              {language === 'en' ? 'Admin Actions' : 'إجراءات المسؤول'}
            </h3>
            <div className="space-y-3">
              <Button className="w-full" variant="outline">
                {language === 'en' ? 'Send Performance Feedback' : 'إرسال ملاحظات الأداء'}
              </Button>
              <Button className="w-full" variant="outline">
                {language === 'en' ? 'Schedule Training' : 'جدولة التدريب'}
              </Button>
              <Button className="w-full" variant="outline">
                {language === 'en' ? 'View Verification History' : 'عرض سجل التحقق'}
              </Button>
              <Button className="w-full" variant="outline">
                {language === 'en' ? 'Generate Performance Report' : 'إنشاء تقرير الأداء'}
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
