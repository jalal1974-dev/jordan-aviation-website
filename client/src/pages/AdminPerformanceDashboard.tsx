import { useState, useMemo } from 'react'
import { useAuth } from '@/_core/hooks/useAuth'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import {
  Trophy,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Download,
  Filter,
} from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { toast } from 'sonner'

interface PerformanceMetric {
  verifierId: string
  verifierName: string
  documentsProcessed: number
  averageProcessingTime: number
  accuracy: number
  performanceScore: number
  ranking: number
  trend: 'up' | 'down' | 'stable'
  trendPercentage: number
}

interface PerformanceStats {
  totalDocumentsProcessed: number
  averageAccuracy: number
  averageProcessingTime: number
  topPerformer: PerformanceMetric
  teamStats: {
    totalVerifiers: number
    activeVerifiers: number
    averageScore: number
  }
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AdminPerformanceDashboard() {
  const { user, isAuthenticated, loading } = useAuth()
  const { language, t, isRTL } = useLanguage()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')
  const [sortBy, setSortBy] = useState<'score' | 'documents' | 'accuracy'>('score')

  // Fetch performance data
  const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
  const days = daysMap[timeRange]

  const { data: leaderboardResponse, isLoading: leaderboardLoading } =
    trpc.admin.performance.getLeaderboard.useQuery(
      { days, limit: 50 },
      { enabled: isAuthenticated && user?.role === 'admin' }
    )

  const { data: statsResponse, isLoading: statsLoading } =
    trpc.admin.performance.getStatistics.useQuery(
      { days },
      { enabled: isAuthenticated && user?.role === 'admin' }
    )

  const { data: trendsResponse, isLoading: trendsLoading } =
    trpc.admin.performance.getTrends.useQuery(
      { days },
      { enabled: isAuthenticated && user?.role === 'admin' }
    )

  // Extract data from responses
  const leaderboardData = leaderboardResponse?.data
  const statsData = statsResponse?.data
  const trendsData = trendsResponse?.data?.current

  // Check admin access
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-bold mb-2">
            {language === 'en' ? 'Access Denied' : 'تم رفض الوصول'}
          </h2>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'You do not have permission to access this page.'
              : 'ليس لديك إذن للوصول إلى هذه الصفحة.'}
          </p>
        </Card>
      </div>
    )
  }

  // Sort leaderboard data
  const sortedLeaderboard = useMemo(() => {
    if (!leaderboardData || !Array.isArray(leaderboardData)) return []

    const sorted = [...leaderboardData]
    sorted.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'documents':
          return (b.documentsVerified || 0) - (a.documentsVerified || 0)
        case 'accuracy':
          return (b.accuracyRate || 0) - (a.accuracyRate || 0)
        case 'score':
        default:
          return (b.performanceScore || 0) - (a.performanceScore || 0)
      }
    })

    return sorted
  }, [leaderboardData, sortBy])

  // Prepare chart data
  const trendChartData = useMemo(() => {
    if (!trendsData) return []
    // Generate daily trend data based on stats
    const days = daysMap[timeRange]
    const data = []
    for (let i = days; i > 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toLocaleDateString(),
        averageScore: trendsData.teamPerformanceScore || 0,
        accuracy: (trendsData.avgAccuracyRate || 0) * 100,
        documentsProcessed: Math.floor((trendsData.totalDocumentsVerified || 0) / days),
      })
    }
    return data
  }, [trendsData, timeRange, daysMap])

  const topVerifiersData = useMemo(() => {
    if (!sortedLeaderboard || !Array.isArray(sortedLeaderboard)) return []
    return sortedLeaderboard.slice(0, 5).map((verifier: any) => ({
      name: verifier.name || verifier.verifierName || 'Unknown',
      score: Math.round((verifier.performanceScore || 0) * 100) / 100,
    }))
  }, [sortedLeaderboard])

  const accuracyDistribution = useMemo(() => {
    if (!sortedLeaderboard || !Array.isArray(sortedLeaderboard)) return []

    const ranges = [
      { range: '95-100%', count: 0 },
      { range: '90-95%', count: 0 },
      { range: '85-90%', count: 0 },
      { range: '80-85%', count: 0 },
      { range: '<80%', count: 0 },
    ]

    sortedLeaderboard.forEach((verifier: any) => {
      const accuracy = (verifier.accuracyRate || 0) * 100
      if (accuracy >= 95) ranges[0].count++
      else if (accuracy >= 90) ranges[1].count++
      else if (accuracy >= 85) ranges[2].count++
      else if (accuracy >= 80) ranges[3].count++
      else ranges[4].count++
    })

    return ranges
  }, [sortedLeaderboard])

  const handleExportReport = async () => {
    try {
      // Create CSV data
      const headers = [
        'Ranking',
        'Verifier Name',
        'Documents Processed',
        'Accuracy',
        'Avg Processing Time',
        'Performance Score',
      ]

      const rows = sortedLeaderboard.map((verifier: any, index: number) => [
        index + 1,
        verifier.name || verifier.verifierName || 'Unknown',
        verifier.documentsVerified || 0,
        `${((verifier.accuracyRate || 0) * 100).toFixed(2)}%`,
        `${(verifier.avgProcessingTime || 0).toFixed(2)}s`,
        (verifier.performanceScore || 0).toFixed(2),
      ])

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n')

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `performance-report-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success(
        language === 'en' ? 'Report exported successfully' : 'تم تصدير التقرير بنجاح'
      )
    } catch (error) {
      toast.error(
        language === 'en' ? 'Failed to export report' : 'فشل تصدير التقرير'
      )
    }
  }

  const isLoading = leaderboardLoading || statsLoading || trendsLoading

  return (
    <div className={`min-h-screen bg-background p-4 md:p-8 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {language === 'en' ? 'Performance Dashboard' : 'لوحة الأداء'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'en'
              ? 'Monitor verifier performance and team metrics'
              : 'مراقبة أداء المدققين ومقاييس الفريق'}
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 items-start md:items-center justify-between">
          <div className="flex gap-2">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                onClick={() => setTimeRange(range)}
                size="sm"
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleExportReport}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            {language === 'en' ? 'Export Report' : 'تصدير التقرير'}
          </Button>
        </div>

        {/* Key Statistics */}
        {!isLoading && statsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'en' ? 'Total Processed' : 'إجمالي المعالجة'}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {statsData?.totalDocumentsVerified || 0}
                  </p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'en' ? 'Avg Accuracy' : 'متوسط الدقة'}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {((statsData?.avgAccuracyRate || 0) * 100).toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-12 h-12 text-blue-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'en' ? 'Avg Processing Time' : 'متوسط وقت المعالجة'}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {(statsData?.avgProcessingTimeAcrossTeam || 0).toFixed(1)}h
                  </p>
                </div>
                <Clock className="w-12 h-12 text-orange-500 opacity-20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'en' ? 'Active Verifiers' : 'المدققون النشطون'}
                  </p>
                  <p className="text-3xl font-bold text-foreground">
                    {statsData?.totalVerifiers || 0}
                  </p>
                </div>
                <Users className="w-12 h-12 text-purple-500 opacity-20" />
              </div>
            </Card>
          </div>
        )}

        {/* Charts Section */}
        <Tabs defaultValue="trends" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="trends">
              {language === 'en' ? 'Trends' : 'الاتجاهات'}
            </TabsTrigger>
            <TabsTrigger value="topVerifiers">
              {language === 'en' ? 'Top Performers' : 'أفضل الأداء'}
            </TabsTrigger>
            <TabsTrigger value="accuracy">
              {language === 'en' ? 'Accuracy' : 'الدقة'}
            </TabsTrigger>
          </TabsList>

          {/* Trends Chart */}
          <TabsContent value="trends" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'en' ? 'Performance Trends' : 'اتجاهات الأداء'}
              </h3>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : trendChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={trendChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="averageScore"
                      stroke="#3b82f6"
                      name={language === 'en' ? 'Avg Score' : 'متوسط النقاط'}
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
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  {language === 'en' ? 'No data available' : 'لا توجد بيانات متاحة'}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Top Performers Chart */}
          <TabsContent value="topVerifiers" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'en' ? 'Top 5 Performers' : 'أفضل 5 أداء'}
              </h3>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : topVerifiersData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={topVerifiersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="score" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  {language === 'en' ? 'No data available' : 'لا توجد بيانات متاحة'}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Accuracy Distribution Chart */}
          <TabsContent value="accuracy" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {language === 'en' ? 'Accuracy Distribution' : 'توزيع الدقة'}
              </h3>
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : accuracyDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={accuracyDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ range, count }) => `${range}: ${count}`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {accuracyDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-80 flex items-center justify-center text-muted-foreground">
                  {language === 'en' ? 'No data available' : 'لا توجد بيانات متاحة'}
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Leaderboard Table */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              {language === 'en' ? 'Verifier Leaderboard' : 'ترتيب المدققين'}
            </h3>

            <div className="flex gap-2">
              <Button
                variant={sortBy === 'score' ? 'default' : 'outline'}
                onClick={() => setSortBy('score')}
                size="sm"
              >
                {language === 'en' ? 'Score' : 'النقاط'}
              </Button>
              <Button
                variant={sortBy === 'documents' ? 'default' : 'outline'}
                onClick={() => setSortBy('documents')}
                size="sm"
              >
                {language === 'en' ? 'Documents' : 'المستندات'}
              </Button>
              <Button
                variant={sortBy === 'accuracy' ? 'default' : 'outline'}
                onClick={() => setSortBy('accuracy')}
                size="sm"
              >
                {language === 'en' ? 'Accuracy' : 'الدقة'}
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : sortedLeaderboard && Array.isArray(sortedLeaderboard) && sortedLeaderboard.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-semibold">
                      {language === 'en' ? 'Rank' : 'الترتيب'}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold">
                      {language === 'en' ? 'Verifier' : 'المدقق'}
                    </th>
                    <th className="text-center py-3 px-4 font-semibold">
                      {language === 'en' ? 'Documents' : 'المستندات'}
                    </th>
                    <th className="text-center py-3 px-4 font-semibold">
                      {language === 'en' ? 'Accuracy' : 'الدقة'}
                    </th>
                    <th className="text-center py-3 px-4 font-semibold">
                      {language === 'en' ? 'Avg Time (hrs)' : 'متوسط الوقت (ساعات)'}
                    </th>
                    <th className="text-center py-3 px-4 font-semibold">
                      {language === 'en' ? 'Score' : 'النقاط'}
                    </th>
                    <th className="text-center py-3 px-4 font-semibold">
                      {language === 'en' ? 'Trend' : 'الاتجاه'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedLeaderboard.map((verifier: any, index: number) => (
                    <tr
                      key={verifier.id || index}
                      className="border-b border-border hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {index < 3 ? (
                            <Trophy
                              className={`w-5 h-5 ${
                                index === 0
                                  ? 'text-yellow-500'
                                  : index === 1
                                    ? 'text-gray-400'
                                    : 'text-orange-600'
                              }`}
                            />
                          ) : (
                            <span className="text-muted-foreground font-semibold">
                              {index + 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">{verifier.name || verifier.verifierName || 'Unknown'}</td>
                      <td className="py-4 px-4 text-center">
                        {verifier.documentsVerified || 0}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                          {((verifier.accuracyRate || 0) * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {(verifier.avgProcessingTime || 0).toFixed(1)}h
                      </td>
                      <td className="py-4 px-4 text-center font-semibold">
                        {(verifier.performanceScore || 0).toFixed(2)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-muted-foreground text-sm">—</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {language === 'en'
                ? 'No performance data available'
                : 'لا توجد بيانات أداء متاحة'}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
