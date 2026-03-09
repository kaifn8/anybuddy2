import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import SplashPage from "./pages/SplashPage";
import OnboardingPage from "./pages/OnboardingPage";
import SignupPage from "./pages/SignupPage";
import HomePage from "./pages/HomePage";
import MapPage from "./pages/MapPage";
import CreateRequestPage from "./pages/CreateRequestPage";
import JoinRequestPage from "./pages/JoinRequestPage";
import RequestDetailPage from "./pages/RequestDetailPage";
import HostProfilePage from "./pages/HostProfilePage";
import ReviewPage from "./pages/ReviewPage";
import CreditsPage from "./pages/CreditsPage";
import ChatsPage from "./pages/ChatsPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import InviteFriendsPage from "./pages/InviteFriendsPage";
import SettingsPage from "./pages/SettingsPage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<SplashPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/create" element={<CreateRequestPage />} />
          <Route path="/join/:id" element={<JoinRequestPage />} />
          <Route path="/request/:id" element={<RequestDetailPage />} />
          <Route path="/host/:userId" element={<HostProfilePage />} />
          <Route path="/review/:id" element={<ReviewPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/chats" element={<ChatsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/invite" element={<InviteFriendsPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
