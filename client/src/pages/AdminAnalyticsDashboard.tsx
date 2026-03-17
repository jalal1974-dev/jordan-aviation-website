import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
} from "recharts";
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Download,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Admin Analytics Dashboard
 * Displays document verification metrics and analytics
 */
export default function AdminAnalyticsDashboard() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d">("30d");

  // Fetch analytics data
  const metricsQuery = trpc.admin.analytics.getComprehensiveMetrics.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );

  const trendsQuery = trpc.admin.analytics.getVerificationTrends.useQuery(
    { days: dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : 90 },
    { enabled: user?.role === "admin" }
  );

  const typeStatsQuery = trpc.admin.analytics.getDocumentTypeStats.useQuery(
    undefined,
    { enabled: user?.role === "admin" }
  );

  const rejectionReasonsQuery = trpc.admin.analytics.getTopRejectionReasons.useQuery(
    { limit: 5 },
    { enabled: user?.role === "admin" }
  );

  // Check authorization
  if (user?.role !== "admin") {
    return (
      <div className="container py-12">
        <Card className="p-6 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
          <h2 className="text-xl font-bold mb-2">
            {language === "en" ? "Access Denied" : "تم رفض الوصول"}
          </h2>
          <p className="text-muted-foreground">
            {language === "en"
              ? "Only administrators can access this dashboard"
              : "فقط المسؤولون يمكنهم الوصول إلى هذه اللوحة"}
          </p>
        </Card>
      </div>
    );
  }

  // Loading state
  if (
    metricsQuery.isLoading ||
    trendsQuery.isLoading ||
    typeStatsQuery.isLoading
  ) {
    return (
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded mb-2 w-3/4"></div>
              <div className="h-8 bg-muted rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const metrics = metricsQuery.data?.data;
  const trends = trendsQuery.data?.data || [];
  const typeStats = typeStatsQuery.data?.data || [];
  const rejectionReasons = rejectionReasonsQuery.data?.data || [];

  // Color palette
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  // Prepare pie chart data for document types
  const documentTypeChartData = (typeStats || []).map((stat: any) => ({
    name: stat.type,
    value: stat.total,
  }));

  // Prepare rejection reasons data
  const rejectionReasonData = (rejectionReasons || []).map((reason: any) => ({
    name: reason.reason.substring(0, 20),
    count: reason.count,
  }));

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {language === "en"
            ? "Document Verification Analytics"
            : "تحليلات التحقق من الوثائق"}
        </h1>
        <p className="text-muted-foreground">
          {language === "en"
            ? "Monitor document verification metrics and trends"
            : "مراقبة مقاييس واتجاهات التحقق من الوثائق"}
        </p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {/* Total Documents */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {language === "en" ? "Total Documents" : "إجمالي الوثائق"}
              </p>
              <p className="text-3xl font-bold">{metrics?.totalDocuments || 0}</p>
            </div>
            <Clock className="w-10 h-10 text-blue-500 opacity-20" />
          </div>
        </Card>

        {/* Verified Documents */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {language === "en" ? "Verified" : "تم التحقق"}
              </p>
              <p className="text-3xl font-bold text-green-600">
                {metrics?.verifiedCount || 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics?.overallVerificationRate || 0}%
              </p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500 opacity-20" />
          </div>
        </Card>

        {/* Rejected Documents */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {language === "en" ? "Rejected" : "مرفوض"}
              </p>
              <p className="text-3xl font-bold text-red-600">
                {metrics?.rejectedCount || 0}
              </p>
            </div>
            <XCircle className="w-10 h-10 text-red-500 opacity-20" />
          </div>
        </Card>

        {/* Pending Documents */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                {language === "en" ? "Pending" : "قيد الانتظار"}
              </p>
              <p className="text-3xl font-bold text-amber-600">
                {metrics?.pendingCount || 0}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-amber-500 opacity-20" />
          </div>
        </Card>
      </div>

      {/* Verification Trends Chart */}
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">
            {language === "en"
              ? "Verification Trends"
              : "اتجاهات التحقق"}
          </h2>
          <div className="flex gap-2">
            {(["7d", "30d", "90d"] as const).map((range) => (
              <Button
                key={range}
                variant={dateRange === range ? "default" : "outline"}
                size="sm"
                onClick={() => setDateRange(range)}
              >
                {range === "7d"
                  ? "7 Days"
                  : range === "30d"
                  ? "30 Days"
                  : "90 Days"}
              </Button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="verified"
              stroke="#10b981"
              name={language === "en" ? "Verified" : "تم التحقق"}
            />
            <Line
              type="monotone"
              dataKey="rejected"
              stroke="#ef4444"
              name={language === "en" ? "Rejected" : "مرفوض"}
            />
            <Line
              type="monotone"
              dataKey="pending"
              stroke="#f59e0b"
              name={language === "en" ? "Pending" : "قيد الانتظار"}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Document Type Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Document Type Distribution */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">
            {language === "en"
              ? "Document Type Distribution"
              : "توزيع نوع الوثيقة"}
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={documentTypeChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {documentTypeChartData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Document Type Statistics Table */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-6">
            {language === "en"
              ? "Document Type Stats"
              : "إحصائيات نوع الوثيقة"}
          </h2>
          <div className="space-y-4">
            {(typeStats || []).map((stat: any) => (
              <div key={stat.type} className="border-b pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{stat.type}</span>
                  <span className="text-sm text-muted-foreground">
                    {stat.total} {language === "en" ? "documents" : "وثائق"}
                  </span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="text-green-600">
                    ✓ {stat.verified} ({stat.verificationRate}%)
                  </span>
                  <span className="text-red-600">✗ {stat.rejected}</span>
                  <span className="text-amber-600">⏳ {stat.pending}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {language === "en"
                    ? `Avg processing: ${stat.avgProcessingTime.toFixed(1)} hours`
                    : `متوسط المعالجة: ${stat.avgProcessingTime.toFixed(1)} ساعة`}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Rejection Reasons */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">
          {language === "en"
            ? "Top Rejection Reasons"
            : "أفضل أسباب الرفض"}
        </h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={rejectionReasonData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar
              dataKey="count"
              fill="#ef4444"
              name={language === "en" ? "Count" : "العدد"}
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Processing Time Metric */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold mb-2">
              {language === "en"
                ? "Average Processing Time"
                : "متوسط وقت المعالجة"}
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {metrics?.avgProcessingTimeHours.toFixed(1) || 0}
            </p>
            <p className="text-sm text-muted-foreground">
              {language === "en" ? "hours" : "ساعات"}
            </p>
          </div>
          <Button variant="outline" size="lg">
            <Download className="w-4 h-4 mr-2" />
            {language === "en" ? "Export Report" : "تصدير التقرير"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
