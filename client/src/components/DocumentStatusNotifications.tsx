import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CheckCircle, Clock, XCircle, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DocumentStatus {
  id: number;
  documentType: string;
  documentName: string;
  verificationStatus: "pending" | "verified" | "rejected";
  createdAt: Date;
  updatedAt: Date;
  expiryDate?: Date | null;
  rejectionReason?: string | null;
}

interface NotificationData {
  totalDocuments: number;
  verifiedCount: number;
  pendingCount: number;
  rejectedCount: number;
  documents: DocumentStatus[];
  estimatedCompletionTime?: string;
  overallProgress: number;
}

/**
 * Document Status Notifications Component
 * Displays real-time document verification status in user dashboard
 */
export default function DocumentStatusNotifications() {
  const { language, t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData | null>(null);
  const [expandedDoc, setExpandedDoc] = useState<number | null>(null);

  // Fetch document status
  const { data: userDocuments, isLoading } = trpc.userProfile.getDocuments.useQuery(
    { documentType: undefined },
    { enabled: !!user?.id }
  );

  useEffect(() => {
    if (userDocuments) {
      const verified = userDocuments.filter((d: any) => d.verificationStatus === "verified").length;
      const pending = userDocuments.filter((d: any) => d.verificationStatus === "pending").length;
      const rejected = userDocuments.filter((d: any) => d.verificationStatus === "rejected").length;

      const progress = userDocuments.length > 0 ? (verified / userDocuments.length) * 100 : 0;

      setNotifications({
        totalDocuments: userDocuments.length,
        verifiedCount: verified,
        pendingCount: pending,
        rejectedCount: rejected,
        documents: userDocuments as DocumentStatus[],
        overallProgress: progress,
        estimatedCompletionTime: pending > 0 ? "24-48 hours" : undefined,
      });
    }
  }, [userDocuments]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "verified":
        return "default";
      case "rejected":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string): string => {
    const statusMap: Record<string, string> = {
      verified: language === "en" ? "Verified" : "تم التحقق",
      rejected: language === "en" ? "Rejected" : "مرفوض",
      pending: language === "en" ? "Pending" : "قيد الانتظار",
    };
    return statusMap[status] || status;
  };

  const getDocumentTypeLabel = (type: string): string => {
    const typeMap: Record<string, Record<string, string>> = {
      passport: { en: "Passport", ar: "جواز السفر" },
      national_id: { en: "National ID", ar: "الهوية الوطنية" },
      driver_license: { en: "Driver License", ar: "رخصة القيادة" },
      visa: { en: "Visa", ar: "التأشيرة" },
      other: { en: "Other", ar: "أخرى" },
    };
    return typeMap[type]?.[language] || type;
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          <div className="h-8 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!notifications || notifications.totalDocuments === 0) {
    return (
      <Card className="p-6 bg-blue-50 border-blue-200">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-blue-500" />
          <div>
            <h3 className="font-semibold text-blue-900">
              {language === "en" ? "No Documents Uploaded" : "لم يتم تحميل أي مستندات"}
            </h3>
            <p className="text-sm text-blue-700">
              {language === "en"
                ? "Upload your documents to complete your profile"
                : "قم بتحميل مستنداتك لإكمال ملفك الشخصي"}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card className="p-6">
        <div className={`space-y-4 ${isRTL ? "text-right" : "text-left"}`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {language === "en" ? "Document Verification Progress" : "تقدم التحقق من المستندات"}
            </h3>
            <span className="text-2xl font-bold text-primary">
              {Math.round(notifications.overallProgress)}%
            </span>
          </div>

          <Progress value={notifications.overallProgress} className="h-2" />

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{notifications.verifiedCount}</div>
              <div className="text-sm text-gray-600">
                {language === "en" ? "Verified" : "تم التحقق"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{notifications.pendingCount}</div>
              <div className="text-sm text-gray-600">
                {language === "en" ? "Pending" : "قيد الانتظار"}
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{notifications.rejectedCount}</div>
              <div className="text-sm text-gray-600">
                {language === "en" ? "Rejected" : "مرفوض"}
              </div>
            </div>
          </div>

          {notifications.estimatedCompletionTime && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-2">
              <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">
                  {language === "en" ? "Estimated Completion" : "الوقت المتوقع للإنجاز"}
                </p>
                <p className="text-sm text-blue-700">{notifications.estimatedCompletionTime}</p>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Individual Document Status */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold">
          {language === "en" ? "Your Documents" : "مستنداتك"}
        </h3>

        {notifications.documents.map((doc) => (
          <Card
            key={doc.id}
            className="p-4 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setExpandedDoc(expandedDoc === doc.id ? null : doc.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                {getStatusIcon(doc.verificationStatus)}
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h4 className="font-semibold">{getDocumentTypeLabel(doc.documentType)}</h4>
                  <p className="text-sm text-gray-600">{doc.documentName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === "en" ? "Submitted: " : "تم التقديم: "}
                    {new Date(doc.createdAt).toLocaleDateString(language === "en" ? "en-US" : "ar-SA")}
                  </p>
                </div>
              </div>
              <Badge variant={getStatusBadgeVariant(doc.verificationStatus)}>
                {getStatusText(doc.verificationStatus)}
              </Badge>
            </div>

            {/* Expanded Details */}
            {expandedDoc === doc.id && (
              <div className="mt-4 pt-4 border-t space-y-3">
                {doc.verificationStatus === "pending" && (
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                    <Clock className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">
                        {language === "en"
                          ? "Your document is under review"
                          : "مستندك قيد المراجعة"}
                      </p>
                      <p className="text-xs mt-1">
                        {language === "en"
                          ? "This usually takes 24-48 hours"
                          : "هذا عادة يستغرق 24-48 ساعة"}
                      </p>
                    </div>
                  </div>
                )}

                {doc.verificationStatus === "verified" && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-green-800">
                      <p className="font-medium">
                        {language === "en"
                          ? "Document verified successfully"
                          : "تم التحقق من المستند بنجاح"}
                      </p>
                      <p className="text-xs mt-1">
                        {language === "en" ? "Verified on: " : "تم التحقق في: "}
                        {new Date(doc.updatedAt).toLocaleDateString(language === "en" ? "en-US" : "ar-SA")}
                      </p>
                    </div>
                  </div>
                )}

                {doc.verificationStatus === "rejected" && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="text-sm text-red-800">
                        <p className="font-medium">
                          {language === "en"
                            ? "Document rejected"
                            : "تم رفض المستند"}
                        </p>
                        {doc.rejectionReason && (
                          <p className="text-xs mt-2">
                            <span className="font-medium">
                              {language === "en" ? "Reason: " : "السبب: "}
                            </span>
                            {doc.rejectionReason}
                          </p>
                        )}
                        <p className="text-xs mt-2">
                          {language === "en"
                            ? "Please resubmit your document within 7 days"
                            : "يرجى إعادة تقديم مستندك خلال 7 أيام"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {doc.expiryDate && (
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                    <p className="font-medium">
                      {language === "en" ? "Expiry Date: " : "تاريخ انتهاء الصلاحية: "}
                      {new Date(doc.expiryDate).toLocaleDateString(language === "en" ? "en-US" : "ar-SA")}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Help Section */}
      {notifications.rejectedCount > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-amber-900">
                {language === "en"
                  ? "Action Required"
                  : "إجراء مطلوب"}
              </h4>
              <p className="text-sm text-amber-800 mt-1">
                {language === "en"
                  ? "You have rejected documents that need to be resubmitted. Please review the rejection reasons and upload corrected versions."
                  : "لديك مستندات مرفوضة تحتاج إلى إعادة تقديم. يرجى مراجعة أسباب الرفض وتحميل النسخ المصححة."}
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
