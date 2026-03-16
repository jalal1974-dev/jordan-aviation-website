import { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/_core/hooks/useAuth';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, FileText, Calendar, User, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type DocumentStatus = 'pending' | 'verified' | 'rejected';
type DocumentType = 'passport' | 'national_id' | 'driver_license' | 'visa' | 'other';

interface Document {
  id: number;
  userId: number;
  documentType: DocumentType;
  documentName: string;
  documentNumber?: string | null;
  fileUrl: string;
  verificationStatus: DocumentStatus;
  createdAt: Date;
  verificationDate?: Date | null;
  rejectionReason?: string | null;
}

export default function AdminDocumentVerification() {
  const { language, t, isRTL } = useLanguage();
  const { user } = useAuth();
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const [filterStatus, setFilterStatus] = useState<DocumentStatus | 'all'>('pending');
  const [filterType, setFilterType] = useState<DocumentType | 'all'>('all');
  const [searchUserId, setSearchUserId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [page, setPage] = useState(0);

  // Verify user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="container py-12 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to access this page.</p>
      </div>
    );
  }

  // Fetch data
  const { data: stats, isLoading: statsLoading } = trpc.admin.documents.getVerificationStats.useQuery();
  const { data: documents, isLoading: docsLoading, refetch: refetchDocs } = trpc.admin.documents.getFilteredDocuments.useQuery({
    status: filterStatus === 'all' ? undefined : filterStatus,
    documentType: filterType === 'all' ? undefined : filterType,
    userId: searchUserId ? parseInt(searchUserId) : undefined,
    limit: 50,
    offset: page * 50,
  });

  // Mutations
  const verifySingle = trpc.admin.documents.verifySingleDocument.useMutation({
    onSuccess: () => {
      toast.success('Document verified successfully');
      refetchDocs();
      setSelectedDocument(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to verify document');
    },
  });

  const rejectSingle = trpc.admin.documents.rejectSingleDocument.useMutation({
    onSuccess: () => {
      toast.success('Document rejected successfully');
      refetchDocs();
      setSelectedDocument(null);
      setRejectionReason('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject document');
    },
  });

  const bulkVerify = trpc.admin.documents.bulkVerifyDocuments.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} documents verified successfully`);
      refetchDocs();
      setSelectedDocuments([]);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to verify documents');
    },
  });

  const bulkReject = trpc.admin.documents.bulkRejectDocuments.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} documents rejected successfully`);
      refetchDocs();
      setSelectedDocuments([]);
      setRejectionReason('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to reject documents');
    },
  });

  const handleSelectAll = () => {
    if (selectedDocuments.length === (documents?.length || 0)) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(documents?.map((d) => d.id) || []);
    }
  };

  const handleSelectDocument = (id: number) => {
    setSelectedDocuments((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleBulkVerify = () => {
    if (selectedDocuments.length === 0) {
      toast.error('Please select documents to verify');
      return;
    }
    bulkVerify.mutate({ documentIds: selectedDocuments });
  };

  const handleBulkReject = () => {
    if (selectedDocuments.length === 0) {
      toast.error('Please select documents to reject');
      return;
    }
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    bulkReject.mutate({ documentIds: selectedDocuments, reason: rejectionReason });
  };

  const getStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'verified':
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
    }
  };

  const getDocumentTypeLabel = (type: DocumentType) => {
    const labels: Record<DocumentType, string> = {
      passport: 'Passport',
      national_id: 'National ID',
      driver_license: 'Driver License',
      visa: 'Visa',
      other: 'Other',
    };
    return labels[type];
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Document Verification</h1>
        <p className="text-muted-foreground">Review and verify user-uploaded documents</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="text-sm text-muted-foreground mb-2">Total Documents</div>
            <div className="text-3xl font-bold">{stats.total}</div>
          </Card>
          <Card className="p-6 border-yellow-200">
            <div className="text-sm text-yellow-700 mb-2">Pending Review</div>
            <div className="text-3xl font-bold text-yellow-700">{stats.pending}</div>
          </Card>
          <Card className="p-6 border-green-200">
            <div className="text-sm text-green-700 mb-2">Verified</div>
            <div className="text-3xl font-bold text-green-700">{stats.verified}</div>
          </Card>
          <Card className="p-6 border-red-200">
            <div className="text-sm text-red-700 mb-2">Rejected</div>
            <div className="text-3xl font-bold text-red-700">{stats.rejected}</div>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v as any); setPage(0); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Document Type</label>
            <Select value={filterType} onValueChange={(v) => { setFilterType(v as any); setPage(0); }}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="passport">Passport</SelectItem>
                <SelectItem value="national_id">National ID</SelectItem>
                <SelectItem value="driver_license">Driver License</SelectItem>
                <SelectItem value="visa">Visa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">User ID</label>
            <Input
              type="number"
              placeholder="Search by user ID"
              value={searchUserId}
              onChange={(e) => { setSearchUserId(e.target.value); setPage(0); }}
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => {
                setFilterStatus('pending');
                setFilterType('all');
                setSearchUserId('');
                setPage(0);
              }}
              className="w-full"
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedDocuments.length > 0 && (
        <Card className="p-6 mb-8 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">{selectedDocuments.length} documents selected</h3>
              <p className="text-sm text-muted-foreground">Perform bulk actions on selected documents</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleBulkVerify}
                disabled={bulkVerify.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                {bulkVerify.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Verify All
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" disabled={bulkReject.isPending}>
                    Reject All
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Reject Selected Documents</DialogTitle>
                    <DialogDescription>
                      Provide a reason for rejecting these {selectedDocuments.length} documents
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Rejection reason..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      className="min-h-24"
                    />
                    <Button
                      onClick={() => handleBulkReject()}
                      disabled={!rejectionReason.trim() || bulkReject.isPending}
                      className="w-full bg-red-600 hover:bg-red-700"
                    >
                      {bulkReject.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Confirm Rejection
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </Card>
      )}

      {/* Documents Table */}
      <Card className="overflow-hidden">
        {docsLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-muted-foreground">Loading documents...</p>
          </div>
        ) : documents && documents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <Checkbox
                      checked={selectedDocuments.length === documents.length && documents.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Document</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Uploaded</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {documents.map((doc: Document) => (
                  <tr key={doc.id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <Checkbox
                        checked={selectedDocuments.includes(doc.id)}
                        onCheckedChange={() => handleSelectDocument(doc.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{doc.documentName}</div>
                          {doc.documentNumber && (
                            <div className="text-xs text-muted-foreground">{doc.documentNumber}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>User #{doc.userId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm">{getDocumentTypeLabel(doc.documentType)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(doc.verificationStatus)}</td>
                    <td className="px-6 py-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedDocument(doc)}
                          >
                            Review
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Document Review</DialogTitle>
                          </DialogHeader>
                          {selectedDocument && (
                            <div className="space-y-6">
                              {/* Document Preview */}
                              <div>
                                <h3 className="font-semibold mb-2">Document Preview</h3>
                                <div className="bg-muted rounded-lg p-4 min-h-96 flex items-center justify-center">
                                  <div className="text-center">
                                    <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground mb-4">
                                      {selectedDocument.documentName}
                                    </p>
                                    <a
                                      href={selectedDocument.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline text-sm"
                                    >
                                      Open Full Document →
                                    </a>
                                  </div>
                                </div>
                              </div>

                              {/* Document Details */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Document Type</label>
                                  <p className="font-medium">{getDocumentTypeLabel(selectedDocument.documentType)}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Document Number</label>
                                  <p className="font-medium">{selectedDocument.documentNumber || 'N/A'}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">User ID</label>
                                  <p className="font-medium">#{selectedDocument.userId}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Uploaded Date</label>
                                  <p className="font-medium">
                                    {new Date(selectedDocument.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>

                              {/* Status & Actions */}
                              <div>
                                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                  Current Status
                                </label>
                                <div className="mb-4">{getStatusBadge(selectedDocument.verificationStatus)}</div>

                                {selectedDocument.verificationStatus === 'pending' && (
                                  <div className="space-y-3">
                                    <Button
                                      onClick={() =>
                                        verifySingle.mutate({ documentId: selectedDocument.id })
                                      }
                                      disabled={verifySingle.isPending}
                                      className="w-full bg-green-600 hover:bg-green-700"
                                    >
                                      {verifySingle.isPending && (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      )}
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Verify Document
                                    </Button>
                                    <div>
                                      <label className="text-sm font-medium mb-2 block">
                                        Rejection Reason (if rejecting)
                                      </label>
                                      <Textarea
                                        placeholder="Provide reason for rejection..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="min-h-20"
                                      />
                                    </div>
                                    <Button
                                      onClick={() =>
                                        rejectSingle.mutate({
                                          documentId: selectedDocument.id,
                                          reason: rejectionReason,
                                        })
                                      }
                                      disabled={!rejectionReason.trim() || rejectSingle.isPending}
                                      variant="destructive"
                                      className="w-full"
                                    >
                                      {rejectSingle.isPending && (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      )}
                                      <XCircle className="w-4 h-4 mr-2" />
                                      Reject Document
                                    </Button>
                                  </div>
                                )}

                                {selectedDocument.verificationStatus === 'rejected' && (
                                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <p className="text-sm font-medium text-red-800 mb-2">Rejection Reason:</p>
                                    <p className="text-sm text-red-700">
                                      {selectedDocument.rejectionReason}
                                    </p>
                                  </div>
                                )}

                                {selectedDocument.verificationStatus === 'verified' && (
                                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <p className="text-sm font-medium text-green-800">
                                      ✓ Verified on{' '}
                                      {selectedDocument.verificationDate
                                        ? new Date(selectedDocument.verificationDate).toLocaleDateString()
                                        : 'N/A'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No documents found</p>
          </div>
        )}
      </Card>

      {/* Pagination */}
      {documents && documents.length > 0 && (
        <div className="flex justify-center gap-2 mt-8">
          <Button
            variant="outline"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <div className="flex items-center px-4">
            <span className="text-sm text-muted-foreground">Page {page + 1}</span>
          </div>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={(documents?.length || 0) < 50}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
