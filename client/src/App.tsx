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
import Charter from "./pages/Charter";
import TravelInfo from "./pages/TravelInfo";
import HelpCenter from "./pages/HelpCenter";
import About from "./pages/About";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path="/search-results" component={SearchResults} />
      <Route path="/passenger-details" component={PassengerDetails} />
      <Route path="/payment" component={Payment} />
      <Route path="/manage-booking" component={ManageBooking} />
      <Route path="/flight-status" component={FlightStatus} />
      <Route path="/destinations" component={Destinations} />
      <Route path="/offers" component={Offers} />
      <Route path="/charter" component={Charter} />
      <Route path="/travel-info" component={TravelInfo} />
      <Route path="/help" component={HelpCenter} />
      <Route path="/about" component={About} />
      <Route path={"/404"} component={NotFound} />
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
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
