import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Gift, Plane, Armchair, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function MilesRedemption() {
  const { user } = useAuth();
  const { language, t, isRTL } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Fetch available rewards
  const { data: rewards, isLoading: rewardsLoading } = trpc.redemption.getAvailableOptions.useQuery({
    type: selectedType || undefined,
    category: selectedCategory || undefined,
  });

  // Fetch user stats
  const { data: stats } = trpc.redemption.getStats.useQuery();

  // Fetch redemption history
  const { data: history } = trpc.redemption.getHistory.useQuery({ limit: 10 });

  // Check if user can redeem
  const { data: canRedeemCheck } = trpc.redemption.canRedeem.useQuery(selectedReward?.id || 0, {
    enabled: !!selectedReward?.id,
  });

  // Redeem mutation
  const redeemMutation = trpc.redemption.redeem.useMutation({
    onSuccess: (data) => {
      alert(data.message);
      setSelectedReward(null);
      setShowConfirmation(false);
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const filteredRewards = rewards?.filter((reward) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        reward.name.toLowerCase().includes(query) ||
        reward.nameAr.includes(query) ||
        reward.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const getRewardIcon = (type: string) => {
    switch (type) {
      case "flight_upgrade":
        return <Plane className="w-6 h-6" />;
      case "seat_upgrade":
        return <Armchair className="w-6 h-6" />;
      case "free_flight":
        return <Gift className="w-6 h-6" />;
      default:
        return <Gift className="w-6 h-6" />;
    }
  };

  return (
    <div className={`min-h-screen bg-background py-8 ${isRTL ? "rtl" : "ltr"}`}>
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">
            {language === "en" ? "Redeem Your Miles" : "استبدل أميالك"}
          </h1>
          <p className="text-muted-foreground">
            {language === "en"
              ? "Use your accumulated miles to unlock premium rewards and experiences"
              : "استخدم أميالك المتراكمة لفتح مكافآت وتجارب متميزة"}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">
              {language === "en" ? "Available Miles" : "الأميال المتاحة"}
            </p>
            <p className="text-3xl font-bold text-primary">{stats?.totalRedemptions || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">
              {language === "en" ? "Total Redeemed" : "إجمالي المستبدل"}
            </p>
            <p className="text-3xl font-bold text-accent">{stats?.totalMilesRedeemed || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">
              {language === "en" ? "Pending" : "قيد الانتظار"}
            </p>
            <p className="text-3xl font-bold text-yellow-600">{stats?.pendingRedemptions || 0}</p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground mb-2">
              {language === "en" ? "Applied" : "تم التطبيق"}
            </p>
            <p className="text-3xl font-bold text-green-600">{stats?.appliedRedemptions || 0}</p>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="rewards" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rewards">
              {language === "en" ? "Available Rewards" : "المكافآت المتاحة"}
            </TabsTrigger>
            <TabsTrigger value="history">
              {language === "en" ? "Redemption History" : "سجل الاستبدال"}
            </TabsTrigger>
          </TabsList>

          {/* Rewards Tab */}
          <TabsContent value="rewards" className="space-y-6">
            {/* Filters */}
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === "en" ? "Search" : "بحث"}
                  </label>
                  <Input
                    placeholder={language === "en" ? "Search rewards..." : "ابحث عن المكافآت..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === "en" ? "Type" : "النوع"}
                  </label>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "en" ? "All Types" : "جميع الأنواع"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {language === "en" ? "All Types" : "جميع الأنواع"}
                      </SelectItem>
                      <SelectItem value="flight_upgrade">
                        {language === "en" ? "Flight Upgrade" : "ترقية الرحلة"}
                      </SelectItem>
                      <SelectItem value="seat_upgrade">
                        {language === "en" ? "Seat Upgrade" : "ترقية المقعد"}
                      </SelectItem>
                      <SelectItem value="free_flight">
                        {language === "en" ? "Free Flight" : "رحلة مجانية"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === "en" ? "Category" : "الفئة"}
                  </label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === "en" ? "All Categories" : "جميع الفئات"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">
                        {language === "en" ? "All Categories" : "جميع الفئات"}
                      </SelectItem>
                      <SelectItem value="economy_to_business">
                        {language === "en" ? "Economy to Business" : "اقتصادي إلى رجال الأعمال"}
                      </SelectItem>
                      <SelectItem value="business_to_first">
                        {language === "en" ? "Business to First" : "رجال الأعمال إلى الدرجة الأولى"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Rewards Grid */}
            {rewardsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredRewards && filteredRewards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRewards.map((reward) => (
                  <Card
                    key={reward.id}
                    className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                      selectedReward?.id === reward.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => setSelectedReward(reward)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="text-primary">{getRewardIcon(reward.type)}</div>
                      {reward.totalRedemptionsAvailable && reward.currentRedemptions >= reward.totalRedemptionsAvailable && (
                        <Badge variant="destructive">
                          {language === "en" ? "Sold Out" : "مباع"}
                        </Badge>
                      )}
                    </div>

                    <h3 className="text-lg font-bold mb-2">
                      {language === "en" ? reward.name : reward.nameAr}
                    </h3>

                    <p className="text-sm text-muted-foreground mb-4">
                      {language === "en" ? reward.description : reward.descriptionAr}
                    </p>

                    <div className="mb-4 p-3 bg-primary/10 rounded">
                      <p className="text-sm font-semibold text-primary">
                        {reward.milesRequired.toLocaleString()} {language === "en" ? "Miles" : "أميال"}
                      </p>
                    </div>

                    {reward.totalRedemptionsAvailable && (
                      <p className="text-xs text-muted-foreground mb-4">
                        {language === "en"
                          ? `${Math.max(0, reward.totalRedemptionsAvailable - (reward.currentRedemptions || 0))} slots available`
                          : `${Math.max(0, reward.totalRedemptionsAvailable - (reward.currentRedemptions || 0))} فتحات متاحة`}
                      </p>
                    )}

                    <Button
                      className="w-full"
                      disabled={reward.totalRedemptionsAvailable ? reward.currentRedemptions >= reward.totalRedemptionsAvailable : false}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedReward(reward);
                        setShowConfirmation(true);
                      }}
                    >
                      {language === "en" ? "Redeem" : "استبدل"}
                    </Button>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {language === "en" ? "No rewards available" : "لا توجد مكافآت متاحة"}
                </p>
              </Card>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            {history && history.length > 0 ? (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold">
                          {language === "en" ? "Reward" : "المكافأة"}
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">
                          {language === "en" ? "Miles Spent" : "الأميال المنفقة"}
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">
                          {language === "en" ? "Status" : "الحالة"}
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold">
                          {language === "en" ? "Date" : "التاريخ"}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((item: any) => (
                        <tr key={item.id} className="border-t hover:bg-muted/50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-medium">{language === "en" ? item.optionName : item.optionName}</p>
                              <p className="text-xs text-muted-foreground">{item.confirmationCode}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold">{item.milesSpent.toLocaleString()}</td>
                          <td className="px-6 py-4">
                            <Badge
                              variant={
                                item.status === "applied"
                                  ? "default"
                                  : item.status === "pending"
                                    ? "secondary"
                                    : "outline"
                              }
                            >
                              {item.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-sm">
                            {new Date(item.createdAt).toLocaleDateString(language === "en" ? "en-US" : "ar-SA")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <Card className="p-12 text-center">
                <Gift className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {language === "en" ? "No redemptions yet" : "لم يتم الاستبدال بعد"}
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Confirmation Modal */}
        {showConfirmation && selectedReward && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-4">
                {language === "en" ? "Confirm Redemption" : "تأكيد الاستبدال"}
              </h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Reward" : "المكافأة"}
                  </p>
                  <p className="font-semibold">
                    {language === "en" ? selectedReward.name : selectedReward.nameAr}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "en" ? "Miles Required" : "الأميال المطلوبة"}
                  </p>
                  <p className="font-semibold text-lg text-primary">
                    {selectedReward.milesRequired.toLocaleString()}
                  </p>
                </div>

                {!canRedeemCheck?.canRedeem && (
                  <div className="p-4 bg-destructive/10 rounded text-destructive text-sm">
                    {canRedeemCheck?.reason}
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowConfirmation(false);
                    setSelectedReward(null);
                  }}
                >
                  {language === "en" ? "Cancel" : "إلغاء"}
                </Button>
                <Button
                  className="flex-1"
                  disabled={!canRedeemCheck?.canRedeem || redeemMutation.isPending}
                  onClick={() => {
                    redeemMutation.mutate({
                      redemptionOptionId: selectedReward.id,
                    });
                  }}
                >
                  {redeemMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === "en" ? "Processing..." : "جاري المعالجة..."}
                    </>
                  ) : (
                    language === "en" ? "Confirm" : "تأكيد"
                  )}
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
