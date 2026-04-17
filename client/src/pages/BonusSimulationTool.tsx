import { useState } from 'react'
import { useLocation } from 'wouter'
import { trpc } from '@/lib/trpc'
import { useAuth } from '@/_core/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { AlertCircle, DollarSign, TrendingUp, Users, Download } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function BonusSimulationTool() {
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

  // Simulation state
  const [accuracyWeight, setAccuracyWeight] = useState(40)
  const [volumeWeight, setVolumeWeight] = useState(35)
  const [speedWeight, setSpeedWeight] = useState(25)
  const [baseBonus, setBaseBonus] = useState(1000)
  const [maxBonus, setMaxBonus] = useState(5000)

  // Fetch leaderboard data for simulation
  const { data: leaderboardData } = trpc.admin.performance.getLeaderboard.useQuery(
    { limit: 100, days: 90 }
  )

  const verifiers = Array.isArray(leaderboardData?.data) ? leaderboardData.data : leaderboardData || []

  // Calculate bonus for each verifier based on current configuration
  const calculateBonus = (verifier: any) => {
    const accuracyScore = (verifier.accuracy || 0) * (accuracyWeight / 100)
    const volumeScore = Math.min((verifier.documentsProcessed || 0) / 1000 * 100, 100) * (volumeWeight / 100)
    const speedScore = Math.min(100, (24 / (verifier.averageProcessingTime || 1)) * 10) * (speedWeight / 100)
    
    const totalScore = accuracyScore + volumeScore + speedScore
    const bonus = baseBonus + ((totalScore / 100) * (maxBonus - baseBonus))
    
    return {
      score: totalScore,
      bonus: Math.round(bonus),
      accuracy: accuracyScore,
      volume: volumeScore,
      speed: speedScore,
    }
  }

  const bonusData = (Array.isArray(verifiers) ? verifiers : []).map((v: any) => ({
    ...v,
    ...calculateBonus(v),
  }))

  const totalBonusPool = bonusData.reduce((sum: number, v: any) => sum + (v.bonus || 0), 0)
  const avgBonus = bonusData.length > 0 ? Math.round(totalBonusPool / bonusData.length) : 0
  const bonuses = bonusData.map((v: any) => v.bonus || 0)
  const maxBonusValue = bonuses.length > 0 ? Math.max(...bonuses) : 0
  const minBonusValue = bonuses.length > 0 ? Math.min(...bonuses) : 0

  // Prepare chart data
  const topVerifiersData = bonusData
    .sort((a: any, b: any) => b.bonus - a.bonus)
    .slice(0, 10)
    .map((v: any) => ({
      name: `Verifier ${v.verifierId}`,
      bonus: v.bonus,
      accuracy: v.accuracy,
    }))

  const bonusDistribution = [
    { name: language === 'en' ? 'Accuracy' : 'الدقة', value: accuracyWeight },
    { name: language === 'en' ? 'Volume' : 'الحجم', value: volumeWeight },
    { name: language === 'en' ? 'Speed' : 'السرعة', value: speedWeight },
  ]

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b']

  const handleExport = () => {
    const csv = [
      ['Verifier ID', 'Documents Processed', 'Accuracy', 'Avg Processing Time', 'Bonus Amount'],
      ...bonusData.map((v: any) => [
        v.verifierId,
        v.documentsProcessed,
        v.accuracy.toFixed(2),
        v.averageProcessingTime.toFixed(2),
        v.bonus,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bonus_simulation.csv'
    a.click()
  }

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">
          {language === 'en' ? 'Bonus Simulation Tool' : 'أداة محاكاة المكافآت'}
        </h1>
        <p className="text-muted-foreground">
          {language === 'en'
            ? 'Simulate and compare different bonus configurations before implementation'
            : 'محاكاة ومقارنة تكوينات المكافآت المختلفة قبل التنفيذ'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <Card className="p-6 sticky top-8">
            <h3 className="text-lg font-semibold mb-6">
              {language === 'en' ? 'Configuration' : 'التكوين'}
            </h3>

            {/* Weight Sliders */}
            <div className="space-y-6 mb-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    {language === 'en' ? 'Accuracy Weight' : 'وزن الدقة'}
                  </label>
                  <Badge variant="outline">{accuracyWeight}%</Badge>
                </div>
                <Slider
                  value={[accuracyWeight]}
                  onValueChange={(value) => setAccuracyWeight(value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    {language === 'en' ? 'Volume Weight' : 'وزن الحجم'}
                  </label>
                  <Badge variant="outline">{volumeWeight}%</Badge>
                </div>
                <Slider
                  value={[volumeWeight]}
                  onValueChange={(value) => setVolumeWeight(value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">
                    {language === 'en' ? 'Speed Weight' : 'وزن السرعة'}
                  </label>
                  <Badge variant="outline">{speedWeight}%</Badge>
                </div>
                <Slider
                  value={[speedWeight]}
                  onValueChange={(value) => setSpeedWeight(value[0])}
                  max={100}
                  step={5}
                  className="w-full"
                />
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">
                  {language === 'en' ? 'Total Weight' : 'الوزن الإجمالي'}
                </p>
                <p className="text-lg font-bold">
                  {accuracyWeight + volumeWeight + speedWeight}%
                </p>
              </div>
            </div>

            {/* Bonus Range */}
            <div className="space-y-4 mb-8 pb-8 border-b">
              <h4 className="font-medium text-sm">
                {language === 'en' ? 'Bonus Range' : 'نطاق المكافآت'}
              </h4>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  {language === 'en' ? 'Base Bonus ($)' : 'المكافأة الأساسية ($)'}
                </label>
                <Input
                  type="number"
                  value={baseBonus}
                  onChange={(e) => setBaseBonus(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  {language === 'en' ? 'Maximum Bonus ($)' : 'الحد الأقصى للمكافأة ($)'}
                </label>
                <Input
                  type="number"
                  value={maxBonus}
                  onChange={(e) => setMaxBonus(parseInt(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Total Pool' : 'إجمالي المجموعة'}
                </span>
                <span className="font-bold text-lg text-primary">
                  ${totalBonusPool.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Average Bonus' : 'متوسط المكافأة'}
                </span>
                <span className="font-bold">${avgBonus.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {language === 'en' ? 'Range' : 'النطاق'}
                </span>
                <span className="font-bold text-sm">
                  ${minBonusValue.toLocaleString()} - ${maxBonusValue.toLocaleString()}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Visualization Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'en' ? 'Total Verifiers' : 'إجمالي المدققين'}
                  </p>
                  <p className="text-3xl font-bold">{bonusData.length}</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'en' ? 'Total Budget' : 'الميزانية الإجمالية'}
                  </p>
                  <p className="text-3xl font-bold">${(totalBonusPool / 1000).toFixed(1)}K</p>
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {language === 'en' ? 'Avg Per Verifier' : 'المتوسط لكل مدقق'}
                  </p>
                  <p className="text-3xl font-bold">${avgBonus.toLocaleString()}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Charts */}
          <Tabs defaultValue="distribution" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="distribution">
                {language === 'en' ? 'Weight Distribution' : 'توزيع الأوزان'}
              </TabsTrigger>
              <TabsTrigger value="topverifiers">
                {language === 'en' ? 'Top Verifiers' : 'أفضل المدققين'}
              </TabsTrigger>
              <TabsTrigger value="table">
                {language === 'en' ? 'Details' : 'التفاصيل'}
              </TabsTrigger>
            </TabsList>

            {/* Weight Distribution Chart */}
            <TabsContent value="distribution" className="mt-6">
              <Card className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={bonusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {bonusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            {/* Top Verifiers Chart */}
            <TabsContent value="topverifiers" className="mt-6">
              <Card className="p-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topVerifiersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `$${value}`} />
                    <Legend />
                    <Bar dataKey="bonus" fill="#10b981" name={language === 'en' ? 'Bonus' : 'المكافأة'} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </TabsContent>

            {/* Details Table */}
            <TabsContent value="table" className="mt-6">
              <Card className="p-6 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2">
                        {language === 'en' ? 'Verifier' : 'المدقق'}
                      </th>
                      <th className="text-left py-2 px-2">
                        {language === 'en' ? 'Documents' : 'المستندات'}
                      </th>
                      <th className="text-left py-2 px-2">
                        {language === 'en' ? 'Accuracy' : 'الدقة'}
                      </th>
                      <th className="text-right py-2 px-2">
                        {language === 'en' ? 'Bonus' : 'المكافأة'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bonusData
                      .sort((a: any, b: any) => b.bonus - a.bonus)
                      .slice(0, 10)
                      .map((v: any, idx: number) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-2">#{v.verifierId}</td>
                          <td className="py-2 px-2">{v.documentsProcessed}</td>
                          <td className="py-2 px-2">{v.accuracy.toFixed(1)}%</td>
                          <td className="text-right py-2 px-2 font-bold text-green-600">
                            ${v.bonus.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Export Button */}
          <div className="flex gap-2">
            <Button onClick={handleExport} className="w-full">
              <Download className="w-4 h-4 mr-2" />
              {language === 'en' ? 'Export Simulation' : 'تصدير المحاكاة'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
