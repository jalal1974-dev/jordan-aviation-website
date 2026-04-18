/**
 * Scheduled Report Manager
 * Admin dashboard for managing automated performance report schedules
 */

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { trpc } from '@/lib/trpc'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Edit2, Trash2, Play, Clock, Mail, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

interface Schedule {
  id: string
  name: string
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
  recipients: string[]
  format: 'csv' | 'json' | 'html'
  sendTime: string
  enabled: boolean
  lastSent?: Date
  nextScheduled?: Date
}

export default function ScheduledReportManager() {
  const { language, isRTL } = useLanguage()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly'
    recipients: string
    format: 'csv' | 'json' | 'html'
    sendTime: string
    enabled: boolean
  }>({
    name: '',
    frequency: 'daily',
    recipients: '',
    format: 'html',
    sendTime: '08:00',
    enabled: true,
  })

  // Fetch schedules
  const { data: schedulesData, isLoading, refetch } = trpc.admin.reports.getSchedules.useQuery()
  const schedules = schedulesData?.data || []

  // Mutations
  const createMutation = trpc.admin.reports.createSchedule.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Schedule created successfully' : 'تم إنشاء الجدول بنجاح')
      setIsCreateOpen(false)
      resetForm()
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.message)
    },
  })

  const updateMutation = trpc.admin.reports.updateSchedule.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Schedule updated successfully' : 'تم تحديث الجدول بنجاح')
      setIsEditOpen(false)
      resetForm()
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.message)
    },
  })

  const deleteMutation = trpc.admin.reports.deleteSchedule.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Schedule deleted successfully' : 'تم حذف الجدول بنجاح')
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.message)
    },
  })

  const enableMutation = trpc.admin.reports.enableSchedule.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.message)
    },
  })

  const disableMutation = trpc.admin.reports.disableSchedule.useMutation({
    onSuccess: () => {
      refetch()
    },
    onError: (error: any) => {
      toast.error(error.message)
    },
  })

  const triggerMutation = trpc.admin.reports.triggerNow.useMutation({
    onSuccess: () => {
      toast.success(language === 'en' ? 'Report triggered successfully' : 'تم تشغيل التقرير بنجاح')
    },
    onError: (error: any) => {
      toast.error(error.message)
    },
  })

  const resetForm = () => {
    setFormData({
      name: '',
      frequency: 'daily',
      recipients: '',
      format: 'html',
      sendTime: '08:00',
      enabled: true,
    })
    setSelectedSchedule(null)
  }

  const handleCreate = async () => {
    if (!formData.name || !formData.recipients) {
      toast.error(language === 'en' ? 'Please fill in all fields' : 'يرجى ملء جميع الحقول')
      return
    }

    const recipients = formData.recipients
      .split(',')
      .map(r => r.trim())
      .filter(r => r)

    if (recipients.length === 0) {
      toast.error(language === 'en' ? 'Please provide at least one recipient' : 'يرجى توفير متلقي واحد على الأقل')
      return
    }

    await createMutation.mutateAsync({
      name: formData.name,
      frequency: formData.frequency,
      recipients,
      format: formData.format,
      sendTime: formData.sendTime,
      enabled: formData.enabled,
    })
  }

  const handleUpdate = async () => {
    if (!selectedSchedule) return

    const recipients = formData.recipients
      .split(',')
      .map(r => r.trim())
      .filter(r => r)

    await updateMutation.mutateAsync({
      scheduleId: selectedSchedule.id,
      name: formData.name || undefined,
      frequency: formData.frequency,
      recipients: recipients.length > 0 ? recipients : undefined,
      format: formData.format,
      sendTime: formData.sendTime,
      enabled: formData.enabled,
    })
  }

  const handleEdit = (schedule: Schedule) => {
    setSelectedSchedule(schedule)
    setFormData({
      name: schedule.name,
      frequency: schedule.frequency,
      recipients: schedule.recipients.join(', '),
      format: schedule.format,
      sendTime: schedule.sendTime,
      enabled: schedule.enabled,
    })
    setIsEditOpen(true)
  }

  const handleDelete = (scheduleId: string) => {
    if (confirm(language === 'en' ? 'Are you sure?' : 'هل أنت متأكد؟')) {
      deleteMutation.mutate({ scheduleId })
    }
  }

  const handleToggle = (schedule: Schedule) => {
    if (schedule.enabled) {
      disableMutation.mutate({ scheduleId: schedule.id })
    } else {
      enableMutation.mutate({ scheduleId: schedule.id })
    }
  }

  const frequencyLabels = {
    daily: language === 'en' ? 'Daily' : 'يومي',
    weekly: language === 'en' ? 'Weekly' : 'أسبوعي',
    biweekly: language === 'en' ? 'Bi-weekly' : 'نصف شهري',
    monthly: language === 'en' ? 'Monthly' : 'شهري',
  }

  const formatLabels = {
    csv: 'CSV',
    json: 'JSON',
    html: 'HTML',
  }

  return (
    <div className={`container py-8 ${isRTL ? 'text-right' : 'text-left'}`}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">
              {language === 'en' ? 'Scheduled Reports' : 'التقارير المجدولة'}
            </h1>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                {language === 'en' ? 'New Schedule' : 'جدول جديد'}
              </Button>
            </DialogTrigger>
            <DialogContent className={isRTL ? 'text-right' : 'text-left'}>
              <DialogHeader>
                <DialogTitle>
                  {language === 'en' ? 'Create New Schedule' : 'إنشاء جدول جديد'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    {language === 'en' ? 'Schedule Name' : 'اسم الجدول'}
                  </label>
                  <Input
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    placeholder={language === 'en' ? 'e.g., Weekly Team Report' : 'مثل: تقرير الفريق الأسبوعي'}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    {language === 'en' ? 'Frequency' : 'التكرار'}
                  </label>
                  <Select value={formData.frequency} onValueChange={(value: 'daily' | 'weekly' | 'biweekly' | 'monthly') => setFormData({ ...formData, frequency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">{frequencyLabels.daily}</SelectItem>
                      <SelectItem value="weekly">{frequencyLabels.weekly}</SelectItem>
                      <SelectItem value="biweekly">{frequencyLabels.biweekly}</SelectItem>
                      <SelectItem value="monthly">{frequencyLabels.monthly}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">
                    {language === 'en' ? 'Send Time (HH:MM)' : 'وقت الإرسال (HH:MM)'}
                  </label>
                  <Input
                    type="time"
                    value={formData.sendTime}
                    onChange={e => setFormData({ ...formData, sendTime: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    {language === 'en' ? 'Recipients (comma-separated)' : 'المستقبلون (مفصولة بفواصل)'}
                  </label>
                  <Input
                    value={formData.recipients}
                    onChange={e => setFormData({ ...formData, recipients: e.target.value })}
                    placeholder="admin@example.com, manager@example.com"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">
                    {language === 'en' ? 'Format' : 'الصيغة'}
                  </label>
                  <Select value={formData.format} onValueChange={(value: 'csv' | 'json' | 'html') => setFormData({ ...formData, format: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    checked={formData.enabled}
                    onChange={e => setFormData({ ...formData, enabled: e.target.checked })}
                  />
                  <label htmlFor="enabled" className="text-sm">
                    {language === 'en' ? 'Enable this schedule' : 'تفعيل هذا الجدول'}
                  </label>
                </div>

                <Button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="w-full"
                >
                  {createMutation.isPending ? (
                    language === 'en' ? 'Creating...' : 'جاري الإنشاء...'
                  ) : (
                    language === 'en' ? 'Create Schedule' : 'إنشاء الجدول'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-muted-foreground">
          {language === 'en'
            ? 'Manage automated performance report schedules and delivery settings'
            : 'إدارة جداول التقارير المؤتمتة وإعدادات التسليم'}
        </p>
      </div>

      {/* Schedules List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {language === 'en' ? 'Loading schedules...' : 'جاري تحميل الجداول...'}
          </p>
        </div>
      ) : schedules.length === 0 ? (
        <Card className="p-12 text-center">
          <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground mb-4">
            {language === 'en'
              ? 'No schedules yet. Create one to get started.'
              : 'لا توجد جداول حتى الآن. قم بإنشاء واحد للبدء.'}
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>
            {language === 'en' ? 'Create First Schedule' : 'إنشاء أول جدول'}
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {schedules.map((schedule: Schedule) => (
            <Card key={schedule.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{schedule.name}</h3>
                    <Badge variant={schedule.enabled ? 'default' : 'secondary'}>
                      {schedule.enabled ? (language === 'en' ? 'Active' : 'نشط') : (language === 'en' ? 'Inactive' : 'غير نشط')}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'en' ? 'Frequency:' : 'التكرار:'} {frequencyLabels[schedule.frequency]} •{' '}
                    {language === 'en' ? 'Format:' : 'الصيغة:'} {formatLabels[schedule.format]} •{' '}
                    {language === 'en' ? 'Time:' : 'الوقت:'} {schedule.sendTime}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerMutation.mutate({ scheduleId: schedule.id })}
                    disabled={triggerMutation.isPending}
                    title={language === 'en' ? 'Trigger now' : 'تشغيل الآن'}
                  >
                    <Play className="w-4 h-4" />
                  </Button>

                  <Dialog open={isEditOpen && selectedSchedule?.id === schedule.id} onOpenChange={setIsEditOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(schedule)}
                        title={language === 'en' ? 'Edit' : 'تحرير'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className={isRTL ? 'text-right' : 'text-left'}>
                      <DialogHeader>
                        <DialogTitle>
                          {language === 'en' ? 'Edit Schedule' : 'تحرير الجدول'}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">
                            {language === 'en' ? 'Schedule Name' : 'اسم الجدول'}
                          </label>
                          <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            {language === 'en' ? 'Frequency' : 'التكرار'}
                          </label>
                          <Select value={formData.frequency} onValueChange={(value: 'daily' | 'weekly' | 'biweekly' | 'monthly') => setFormData({ ...formData, frequency: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="daily">{frequencyLabels.daily}</SelectItem>
                              <SelectItem value="weekly">{frequencyLabels.weekly}</SelectItem>
                              <SelectItem value="biweekly">{frequencyLabels.biweekly}</SelectItem>
                              <SelectItem value="monthly">{frequencyLabels.monthly}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            {language === 'en' ? 'Send Time' : 'وقت الإرسال'}
                          </label>
                          <Input
                            type="time"
                            value={formData.sendTime}
                            onChange={e => setFormData({ ...formData, sendTime: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            {language === 'en' ? 'Recipients' : 'المستقبلون'}
                          </label>
                          <Input
                            value={formData.recipients}
                            onChange={e => setFormData({ ...formData, recipients: e.target.value })}
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">
                            {language === 'en' ? 'Format' : 'الصيغة'}
                          </label>
                          <Select value={formData.format} onValueChange={(value: 'csv' | 'json' | 'html') => setFormData({ ...formData, format: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="html">HTML</SelectItem>
                              <SelectItem value="csv">CSV</SelectItem>
                              <SelectItem value="json">JSON</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          onClick={handleUpdate}
                          disabled={updateMutation.isPending}
                          className="w-full"
                        >
                          {updateMutation.isPending ? (
                            language === 'en' ? 'Updating...' : 'جاري التحديث...'
                          ) : (
                            language === 'en' ? 'Update Schedule' : 'تحديث الجدول'
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(schedule.id)}
                    disabled={deleteMutation.isPending}
                    title={language === 'en' ? 'Delete' : 'حذف'}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              {/* Schedule Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'Recipients' : 'المستقبلون'}
                  </p>
                  <p className="text-sm font-medium">{schedule.recipients.length}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {language === 'en' ? 'Next Send' : 'الإرسال التالي'}
                  </p>
                  <p className="text-sm font-medium">
                    {schedule.nextScheduled
                      ? new Date(schedule.nextScheduled).toLocaleDateString()
                      : language === 'en'
                        ? 'Pending'
                        : 'قيد الانتظار'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {language === 'en' ? 'Last Sent' : 'آخر إرسال'}
                  </p>
                  <p className="text-sm font-medium">
                    {schedule.lastSent
                      ? new Date(schedule.lastSent).toLocaleDateString()
                      : language === 'en'
                        ? 'Never'
                        : 'لم يتم'}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'Status' : 'الحالة'}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggle(schedule)}
                    disabled={enableMutation.isPending || disableMutation.isPending}
                    className="h-auto p-0 text-sm font-medium"
                  >
                    {schedule.enabled ? (
                      <span className="text-green-600">
                        {language === 'en' ? 'Disable' : 'تعطيل'}
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        {language === 'en' ? 'Enable' : 'تفعيل'}
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
