import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  CheckCircle,
  AlertTriangle,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface DocumentUploadProps {
  documentType: string;
  onUploadSuccess?: (documentId: number) => void;
  onUploadError?: (error: string) => void;
}

interface ValidationFeedback {
  isValid: boolean;
  riskScore: number;
  flags: Array<{
    type: "error" | "warning" | "info";
    code: string;
    message: string;
    severity: "low" | "medium" | "high";
  }>;
  recommendations: string[];
  status: {
    status: "safe" | "warning" | "danger";
    label: string;
  };
}

/**
 * Document Upload Component with Real-time Validation
 * Provides immediate feedback on document quality and validity
 */
export function DocumentUploadWithValidation({
  documentType,
  onUploadSuccess,
  onUploadError,
}: DocumentUploadProps) {
  const { language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationFeedback, setValidationFeedback] =
    useState<ValidationFeedback | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Validation query
  const validateMutation = trpc.validation.validateDocument.useQuery(
    selectedFile
      ? {
          fileSize: selectedFile.size,
          mimeType: selectedFile.type,
          fileName: selectedFile.name,
          metadata: undefined,
        }
      : { fileSize: 0, mimeType: "", fileName: "", metadata: undefined },
    { enabled: !!selectedFile && isValidating }
  );

  // Upload mutation
  const uploadMutation = trpc.userProfile.uploadDocument.useMutation({
    onSuccess: (data) => {
      setSelectedFile(null);
      setValidationFeedback(null);
      setUploadProgress(0);
      onUploadSuccess?.(data.data?.id || 0);
    },
    onError: (error) => {
      onUploadError?.(error.message);
    },
  });

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsValidating(true);
    setValidationFeedback(null);
  };

  // Update validation feedback when query completes
  useEffect(() => {
    if (validateMutation.data) {
      setValidationFeedback(validateMutation.data.data);
      setIsValidating(false);
    }
  }, [validateMutation.data]);

  const handleUpload = async () => {
    if (!selectedFile || !validationFeedback?.isValid) return;

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("documentType", documentType);

      // Simulate upload progress
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Upload file
      await uploadMutation.mutateAsync({
        documentType: documentType as "passport" | "national_id" | "driver_license" | "visa" | "other",
        documentName: selectedFile.name,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        fileUrl: "", // Will be set by backend
        fileKey: "", // Will be set by backend
      });

      clearInterval(interval);
      setUploadProgress(100);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setValidationFeedback(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "text-green-600";
      case "warning":
        return "text-amber-600";
      case "danger":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "safe":
        return <CheckCircle className="w-5 h-5" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5" />;
      case "danger":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {/* File Input Area */}
      <div
        className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
          className="hidden"
        />

        {!selectedFile ? (
          <>
            <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-semibold mb-1">
              {language === "en"
                ? "Drop your document here"
                : "أفلت وثيقتك هنا"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === "en"
                ? "or click to select. Supported: PDF, JPEG, PNG, DOC, DOCX"
                : "أو انقر للتحديد. المدعوم: PDF، JPEG، PNG، DOC، DOCX"}
            </p>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div className="text-left">
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Validation Feedback */}
      {validationFeedback && (
        <Card className="p-4 space-y-4">
          {/* Status Header */}
          <div
            className={`flex items-center gap-3 p-3 rounded-lg ${
              validationFeedback.status.status === "safe"
                ? "bg-green-50"
                : validationFeedback.status.status === "warning"
                ? "bg-amber-50"
                : "bg-red-50"
            }`}
          >
            <div className={getStatusColor(validationFeedback.status.status)}>
              {getStatusIcon(validationFeedback.status.status)}
            </div>
            <div className="flex-1">
              <p className="font-semibold">
                {validationFeedback.status.label}
              </p>
              <p className="text-sm text-muted-foreground">
                {language === "en"
                  ? `Risk Score: ${validationFeedback.riskScore}/100`
                  : `درجة المخاطر: ${validationFeedback.riskScore}/100`}
              </p>
            </div>
          </div>

          {/* Risk Score Progress */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">
                {language === "en" ? "Risk Assessment" : "تقييم المخاطر"}
              </span>
              <span className="text-muted-foreground">
                {validationFeedback.riskScore}%
              </span>
            </div>
            <Progress value={validationFeedback.riskScore} className="h-2" />
          </div>

          {/* Validation Flags */}
          {validationFeedback.flags.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">
                {language === "en" ? "Issues Found" : "المشاكل المكتشفة"}
              </p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {validationFeedback.flags.map((flag, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded text-sm ${
                      flag.type === "error"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : flag.type === "warning"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-blue-50 text-blue-700 border border-blue-200"
                    }`}
                  >
                    <div className="flex gap-2">
                      {flag.type === "error" && (
                        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      )}
                      {flag.type === "warning" && (
                        <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      )}
                      {flag.type === "info" && (
                        <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      )}
                      <span>{flag.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {validationFeedback.recommendations.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">
                {language === "en"
                  ? "Recommendations"
                  : "التوصيات"}
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {validationFeedback.recommendations.map((rec, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{language === "en" ? "Uploading..." : "جاري الرفع..."}</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {selectedFile && (
          <>
            <Button
              onClick={handleUpload}
              disabled={
                !validationFeedback?.isValid ||
                uploadMutation.isPending ||
                uploadProgress > 0
              }
              className="flex-1"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {language === "en" ? "Uploading..." : "جاري الرفع..."}
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  {language === "en" ? "Upload Document" : "رفع الوثيقة"}
                </>
              )}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              disabled={uploadMutation.isPending}
            >
              <X className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Validation Status Message */}
      {validationFeedback && !validationFeedback.isValid && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {language === "en"
            ? "This document cannot be uploaded due to validation errors. Please address the issues above."
            : "لا يمكن رفع هذه الوثيقة بسبب أخطاء التحقق. يرجى معالجة المشاكل أعلاه."}
        </div>
      )}
    </div>
  );
}
