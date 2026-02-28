import { useState } from 'react';
import { Link } from 'wouter';
import { CreditCard, Lock, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import Layout from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';

export default function Payment() {
  const { language, currency, isRTL } = useLanguage();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVV, setCardCVV] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
    }, 2000);
  };

  if (paymentSuccess) {
    return (
      <Layout>
        <div className="container py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-primary mb-2">
              {language === 'en' ? 'Booking Confirmed!' : 'تم تأكيد الحجز!'}
            </h1>
            <p className="text-muted-foreground mb-6">
              {language === 'en'
                ? 'Your booking has been confirmed. Check your email for the confirmation details.'
                : 'تم تأكيد حجزك. تحقق من بريدك الإلكتروني للحصول على تفاصيل التأكيد.'}
            </p>

            <Card className="p-6 mb-6 text-left">
              <h3 className="font-bold text-primary mb-4">
                {language === 'en' ? 'Booking Reference' : 'رقم مرجع الحجز'}
              </h3>
              <div className="bg-primary/5 p-4 rounded-lg font-mono font-bold text-lg text-primary mb-4">
                JA-2026-ABC123
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Route' : 'الطريق'}
                  </span>
                  <span className="font-medium">AMM → CAI</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Date' : 'التاريخ'}
                  </span>
                  <span className="font-medium">March 2, 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Passengers' : 'الركاب'}
                  </span>
                  <span className="font-medium">1</span>
                </div>
                <div className="flex justify-between font-bold text-primary pt-2 border-t border-border">
                  <span>{language === 'en' ? 'Total Paid' : 'المبلغ المدفوع'}</span>
                  <span>{currency === 'USD' ? '$' : ''}124</span>
                </div>
              </div>
            </Card>

            <div className="space-y-3">
              <Link href="/">
                <a>
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    {language === 'en' ? 'Return to Home' : 'العودة إلى الرئيسية'}
                  </Button>
                </a>
              </Link>
              <Link href="/manage-booking">
                <a>
                  <Button variant="outline" className="w-full">
                    {language === 'en' ? 'Manage Booking' : 'إدارة الحجز'}
                  </Button>
                </a>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Booking Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="text-sm font-medium">
                {language === 'en' ? 'Search' : 'البحث'}
              </span>
            </div>
            <div className="flex-1 h-px bg-border mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <span className="text-sm font-medium">
                {language === 'en' ? 'Passengers' : 'الركاب'}
              </span>
            </div>
            <div className="flex-1 h-px bg-border mx-2"></div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <span className="text-sm font-medium">
                {language === 'en' ? 'Payment' : 'الدفع'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-primary mb-6">
                {language === 'en' ? 'Payment Method' : 'طريقة الدفع'}
              </h2>

              <Tabs value={paymentMethod} onValueChange={setPaymentMethod}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="card">
                    {language === 'en' ? 'Card' : 'بطاقة'}
                  </TabsTrigger>
                  <TabsTrigger value="apple">
                    {language === 'en' ? 'Apple Pay' : 'Apple Pay'}
                  </TabsTrigger>
                  <TabsTrigger value="google">
                    {language === 'en' ? 'Google Pay' : 'Google Pay'}
                  </TabsTrigger>
                </TabsList>

                {/* Credit Card */}
                <TabsContent value="card" className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {language === 'en' ? 'Card Number' : 'رقم البطاقة'}
                    </label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      {language === 'en' ? 'Cardholder Name' : 'اسم صاحب البطاقة'}
                    </label>
                    <Input
                      placeholder={language === 'en' ? 'John Doe' : 'جون دو'}
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {language === 'en' ? 'Expiry Date' : 'تاريخ الانتهاء'}
                      </label>
                      <Input
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        {language === 'en' ? 'CVV' : 'رمز الأمان'}
                      </label>
                      <Input
                        placeholder="123"
                        value={cardCVV}
                        onChange={(e) => setCardCVV(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex gap-2">
                    <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-800">
                      {language === 'en'
                        ? 'Your payment information is secure and encrypted'
                        : 'معلومات الدفع الخاصة بك آمنة ومشفرة'}
                    </p>
                  </div>
                </TabsContent>

                {/* Apple Pay */}
                <TabsContent value="apple" className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    {language === 'en'
                      ? 'Click the button below to pay with Apple Pay'
                      : 'انقر على الزر أدناه للدفع باستخدام Apple Pay'}
                  </p>
                  <Button className="bg-black hover:bg-black/90 text-white">
                    {language === 'en' ? 'Pay with Apple Pay' : 'الدفع باستخدام Apple Pay'}
                  </Button>
                </TabsContent>

                {/* Google Pay */}
                <TabsContent value="google" className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    {language === 'en'
                      ? 'Click the button below to pay with Google Pay'
                      : 'انقر على الزر أدناه للدفع باستخدام Google Pay'}
                  </p>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    {language === 'en' ? 'Pay with Google Pay' : 'الدفع باستخدام Google Pay'}
                  </Button>
                </TabsContent>
              </Tabs>

              {/* Terms & Conditions */}
              <div className="mt-6 pt-6 border-t border-border">
                <div className="flex items-start gap-3 mb-6">
                  <Checkbox
                    id="terms"
                    checked={agreeTerms}
                    onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
                    {language === 'en'
                      ? 'I agree to the terms and conditions and privacy policy'
                      : 'أوافق على الشروط والأحكام وسياسة الخصوصية'}
                  </label>
                </div>

                <Button
                  onClick={handlePayment}
                  disabled={!agreeTerms || isProcessing}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isProcessing
                    ? language === 'en'
                      ? 'Processing...'
                      : 'جاري المعالجة...'
                    : language === 'en'
                    ? 'Complete Booking'
                    : 'إكمال الحجز'}
                </Button>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-20">
              <h3 className="text-lg font-bold text-primary mb-4">
                {language === 'en' ? 'Order Summary' : 'ملخص الطلب'}
              </h3>

              <div className="space-y-3 mb-4 pb-4 border-b border-border">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {language === 'en' ? 'Flight' : 'الرحلة'}
                  </p>
                  <p className="font-medium">AMM → CAI</p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'en' ? 'March 2, 2026 • 08:00' : '2 مارس 2026 • 08:00'}
                  </p>
                </div>

                <div className="pt-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    {language === 'en' ? 'Passengers' : 'الركاب'}
                  </p>
                  <p className="font-medium">1 Adult</p>
                </div>

                <div className="pt-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    {language === 'en' ? 'Fare' : 'السعر'}
                  </p>
                  <p className="font-medium">Smart Bundle</p>
                </div>
              </div>

              <div className="space-y-2 mb-4 pb-4 border-b border-border text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Base Fare' : 'السعر الأساسي'}
                  </span>
                  <span className="font-medium">
                    {currency === 'USD' ? '$' : ''}89
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Taxes & Fees' : 'الضرائب والرسوم'}
                  </span>
                  <span className="font-medium">
                    {currency === 'USD' ? '$' : ''}15
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Add-ons' : 'الخدمات الإضافية'}
                  </span>
                  <span className="font-medium">
                    {currency === 'USD' ? '$' : ''}20
                  </span>
                </div>
              </div>

              <div className="flex justify-between mb-6">
                <span className="font-bold text-foreground">
                  {language === 'en' ? 'Total' : 'الإجمالي'}
                </span>
                <span className="text-2xl font-bold text-accent">
                  {currency === 'USD' ? '$' : ''}124
                </span>
              </div>

              <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-800">
                  {language === 'en'
                    ? 'Price locked for 15 minutes'
                    : 'السعر مقفول لمدة 15 دقيقة'}
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
