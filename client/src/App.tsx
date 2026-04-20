import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import Home from "./pages/Home";
import SearchResults from "./pages/SearchResults";
import PassengerDetails from "./pages/PassengerDetails";
import Payment from "./pages/Payment";
import ManageBooking from "./pages/ManageBooking";
import FlightStatus from "./pages/FlightStatus";
import Destinations from "./pages/Destinations";
import Offers from "./pages/Offers";
import TravelInfo from "./pages/TravelInfo";
import HelpCenter from "./pages/HelpCenter";
import About from "./pages/About";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLoyaltyPage from "./pages/AdminLoyaltyPage";
import AdminAffiliatePage from "./pages/AdminAffiliatePage";
import AdminAnalyticsPage from "./pages/AdminAnalyticsPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import LoyaltyDashboard from "./pages/LoyaltyDashboard";
import AffiliateDashboard from "./pages/AffiliateDashboard";
import RegisterProfile from "./pages/RegisterProfile";
import ProfileDashboard from "./pages/ProfileDashboard";
import BookingConfirmation from "./pages/BookingConfirmation";
import MilesRedemption from "./pages/MilesRedemption";
import BookingHistoryDashboard from "./pages/BookingHistoryDashboard";
import UserProfile from "./pages/UserProfile";
import AdminDocumentVerification from "@/pages/AdminDocumentVerification";
import AdminAnalyticsDashboard from "@/pages/AdminAnalyticsDashboard";
import { StructuredData } from "./components/StructuredData";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/book" component={SearchResults} />
      <Route path="/search-results" component={SearchResults} />
      <Route path="/passenger-details" component={PassengerDetails} />
      <Route path="/payment" component={Payment} />
      <Route path="/manage-booking" component={ManageBooking} />
      <Route path="/flight-status" component={FlightStatus} />
      <Route path="/destinations" component={Destinations} />
      <Route path="/offers" component={Offers} />
      <Route path="/travel-info" component={TravelInfo} />
       <Route path="/help" component={HelpCenter} />
      <Route path="/about" component={About} />
      <Route path="/loyalty" component={LoyaltyDashboard} />
      <Route path="/affiliate" component={AffiliateDashboard} />
      <Route path="/register-profile" component={RegisterProfile} />
      <Route path="/profile" component={ProfileDashboard} />
      <Route path="/booking-confirmation/:bookingId" component={BookingConfirmation} />
      <Route path="/miles-redemption" component={MilesRedemption} />
      <Route path="/booking-history" component={BookingHistoryDashboard} />
      <Route path="/user-profile" component={UserProfile} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/loyalty" component={AdminLoyaltyPage} />
      <Route path="/admin/affiliate" component={AdminAffiliatePage} />
      <Route path="/admin/settings" component={AdminSettingsPage} />
      <Route path="/admin/documents" component={AdminDocumentVerification} />
      <Route path="/admin/analytics" component={AdminAnalyticsDashboard} />
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <LanguageProvider>
          <TooltipProvider>
            <StructuredData />
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
