import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Settings, FileText, Clock, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function UserProfilePage() {
  const { user } = useAuth();
  const { language, isRTL } = useLanguage();
  const [activeTab, setActiveTab] = useState("profile");

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = trpc.userProfile.getProfile.useQuery();
  const { data: preferences, isLoading: preferencesLoading } = trpc.userProfile.getPreferences.useQuery();
  const { data: documents } = trpc.userProfile.getDocuments.useQuery({});
  const { data: history } = trpc.userProfile.getHistory.useQuery({ limit: 10 });

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    firstName: (profile && 'firstName' in profile ? profile.firstName : null) || "",
    lastName: (profile && 'lastName' in profile ? profile.lastName : null) || "",
    phoneNumber: (profile && 'phoneNumber' in profile ? profile.phoneNumber : null) || "",
    nationality: (profile && 'nationality' in profile ? profile.nationality : null) || "",
    passportNumber: (profile && 'passportNumber' in profile ? profile.passportNumber : null) || "",
    frequentFlyerNumber: (profile && 'frequentFlyerNumber' in profile ? profile.frequentFlyerNumber : null) || "",
  });

  // Preferences form state
  const [preferencesForm, setPreferencesForm] = useState({
    emailNotifications: preferences?.emailNotifications ?? true,
    smsNotifications: preferences?.smsNotifications ?? false,
    pushNotifications: preferences?.pushNotifications ?? true,
    bookingConfirmations: preferences?.bookingConfirmations ?? true,
    flightReminders: preferences?.flightReminders ?? true,
    promotionalOffers: preferences?.promotionalOffers ?? true,
    loyaltyUpdates: preferences?.loyaltyUpdates ?? true,
  });

  // Update profile mutation
  const updateProfileMutation = trpc.userProfile.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Profile updated successfully" : "تم تحديث الملف الشخصي بنجاح");
      queryUtils.userProfile.getProfile.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = trpc.userProfile.updatePreferences.useMutation({
    onSuccess: () => {
      toast.success(language === "en" ? "Preferences updated successfully" : "تم تحديث التفضيلات بنجاح");
      queryUtils.userProfile.getPreferences.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const queryUtils = trpc.useUtils();

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfileMutation.mutateAsync(profileForm);
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePreferencesMutation.mutateAsync(preferencesForm);
  };

  if (profileLoading || preferencesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background py-8 ${isRTL ? "rtl" : "ltr"}`}>
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            {language === "en" ? "My Profile" : "ملفي الشخصي"}
          </h1>
          <p className="text-muted-foreground">
            {language === "en"
              ? "Manage your personal information, preferences, and documents"
              : "إدارة معلوماتك الشخصية والتفضيلات والمستندات"}
          </p>
        </div>

        {/* Profile Completion */}
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                {language === "en" ? "Profile Completion" : "اكتمال الملف الشخصي"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {profile?.profileCompletionPercentage || 0}%
              </p>
            </div>
            <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {profile?.profileCompletionPercentage || 0}%
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {language === "en" ? "Complete" : "مكتمل"}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">
              <User className="w-4 h-4 mr-2" />
              {language === "en" ? "Profile" : "الملف"}
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Settings className="w-4 h-4 mr-2" />
              {language === "en" ? "Preferences" : "التفضيلات"}
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="w-4 h-4 mr-2" />
              {language === "en" ? "Documents" : "المستندات"}
            </TabsTrigger>
            <TabsTrigger value="history">
              <Clock className="w-4 h-4 mr-2" />
              {language === "en" ? "History" : "السجل"}
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-6">
            <Card className="p-6">
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === "en" ? "First Name" : "الاسم الأول"}
                    </label>
                    <Input
                      value={profileForm.firstName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, firstName: e.target.value })
                      }
                      placeholder={language === "en" ? "First Name" : "الاسم الأول"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === "en" ? "Last Name" : "اسم العائلة"}
                    </label>
                    <Input
                      value={profileForm.lastName}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, lastName: e.target.value })
                      }
                      placeholder={language === "en" ? "Last Name" : "اسم العائلة"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === "en" ? "Phone Number" : "رقم الهاتف"}
                    </label>
                    <Input
                      type="tel"
                      value={profileForm.phoneNumber}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, phoneNumber: e.target.value })
                      }
                      placeholder={language === "en" ? "+1 (555) 000-0000" : "+966 50 000 0000"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === "en" ? "Nationality" : "الجنسية"}
                    </label>
                    <Input
                      value={profileForm.nationality}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, nationality: e.target.value })
                      }
                      placeholder={language === "en" ? "Nationality" : "الجنسية"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === "en" ? "Passport Number" : "رقم جواز السفر"}
                    </label>
                    <Input
                      value={profileForm.passportNumber}
                      onChange={(e) =>
                        setProfileForm({ ...profileForm, passportNumber: e.target.value })
                      }
                      placeholder={language === "en" ? "Passport Number" : "رقم جواز السفر"}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {language === "en" ? "Frequent Flyer Number" : "رقم الرحلات المتكررة"}
                    </label>
                    <Input
                      value={profileForm.frequentFlyerNumber}
                      onChange={(e) =>
                        setProfileForm({
                          ...profileForm,
                          frequentFlyerNumber: e.target.value,
                        })
                      }
                      placeholder={language === "en" ? "Frequent Flyer Number" : "رقم الرحلات"}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === "en" ? "Saving..." : "جاري الحفظ..."}
                    </>
                  ) : (
                    language === "en" ? "Save Profile" : "حفظ الملف"
                  )}
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="mt-6">
            <Card className="p-6">
              <form onSubmit={handlePreferencesSubmit} className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    {language === "en" ? "Notification Preferences" : "تفضيلات الإخطارات"}
                  </h3>
                  <div className="space-y-3">
                    {[
                      {
                        key: "emailNotifications",
                        label: language === "en" ? "Email Notifications" : "إخطارات البريد الإلكتروني",
                      },
                      {
                        key: "smsNotifications",
                        label: language === "en" ? "SMS Notifications" : "إخطارات الرسائل القصيرة",
                      },
                      {
                        key: "pushNotifications",
                        label: language === "en" ? "Push Notifications" : "إخطارات الدفع",
                      },
                      {
                        key: "bookingConfirmations",
                        label: language === "en" ? "Booking Confirmations" : "تأكيدات الحجز",
                      },
                      {
                        key: "flightReminders",
                        label: language === "en" ? "Flight Reminders" : "تذكيرات الرحلات",
                      },
                      {
                        key: "promotionalOffers",
                        label: language === "en" ? "Promotional Offers" : "العروض الترويجية",
                      },
                      {
                        key: "loyaltyUpdates",
                        label: language === "en" ? "Loyalty Updates" : "تحديثات الولاء",
                      },
                    ].map((item) => (
                      <div key={item.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={item.key}
                          checked={preferencesForm[item.key as keyof typeof preferencesForm] as boolean}
                          onCheckedChange={(checked) =>
                            setPreferencesForm({
                              ...preferencesForm,
                              [item.key]: checked,
                            })
                          }
                        />
                        <label htmlFor={item.key} className="text-sm cursor-pointer">
                          {item.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={updatePreferencesMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {updatePreferencesMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === "en" ? "Saving..." : "جاري الحفظ..."}
                    </>
                  ) : (
                    language === "en" ? "Save Preferences" : "حفظ التفضيلات"
                  )}
                </Button>
              </form>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {language === "en" ? "Your Documents" : "مستنداتك"}
              </h3>

              {documents && documents.length > 0 ? (
                <div className="space-y-4">
                  {documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{doc.documentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {language === "en" ? "Type" : "النوع"}: {doc.documentType}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.verificationStatus === "verified" ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : doc.verificationStatus === "rejected" ? (
                          <AlertCircle className="w-5 h-5 text-red-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-yellow-500" />
                        )}
                        <span className="text-xs">
                          {doc.verificationStatus === "verified"
                            ? language === "en"
                              ? "Verified"
                              : "موثق"
                            : doc.verificationStatus === "rejected"
                              ? language === "en"
                                ? "Rejected"
                                : "مرفوض"
                              : language === "en"
                                ? "Pending"
                                : "قيد الانتظار"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === "en" ? "No documents uploaded yet" : "لم يتم تحميل أي مستندات بعد"}
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="mt-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {language === "en" ? "Profile Change History" : "سجل تغييرات الملف الشخصي"}
              </h3>

              {history && history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((entry) => (
                    <div key={entry.id} className="pb-4 border-b last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{entry.fieldName}</p>
                          <p className="text-sm text-muted-foreground">{entry.reason}</p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {language === "en" ? "No changes yet" : "لا توجد تغييرات حتى الآن"}
                  </p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
