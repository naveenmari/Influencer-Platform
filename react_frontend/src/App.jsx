import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './layout/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetails from './pages/CampaignDetails';
import CreateProfile from './pages/CreateProfile';
import EditCampaign from './pages/EditCampaign';
import ForgotPassword from './pages/ForgotPassword';
import Leaderboard from './pages/Leaderboard';
import EditProfile from './pages/EditProfile';
import { AuthProvider } from './context/AuthContext';
import LiquidBackground from './components/LiquidBackground';
import CustomCursor from './components/CustomCursor';
import AIMatching from './pages/AIMatching';
import AdminDashboard from './pages/AdminDashboard';
import TrendAnalysis from './pages/TrendAnalysis';
import SearchInfluencers from './pages/SearchInfluencers';
import Inbox from './pages/Inbox';
import Billing from './pages/Billing';

function App() {
  return (
    <AuthProvider>
      <CustomCursor />
      <Router>
        <LiquidBackground />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Auth />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="register" element={<Auth />} />
            <Route path="matches" element={<AIMatching />} />
            <Route path="search" element={<SearchInfluencers />} />
            <Route path="trends" element={<TrendAnalysis />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="rankings" element={<Leaderboard />} />
            <Route path="campaigns/create" element={<CreateCampaign />} />
            <Route path="campaigns/:id" element={<CampaignDetails />} />
            <Route path="campaigns/edit/:id" element={<EditCampaign />} />
            <Route path="create-profile" element={<CreateProfile />} />
            <Route path="edit-profile" element={<EditProfile />} />
            <Route path="admin" element={<AdminDashboard />} />
            <Route path="inbox" element={<Inbox />} />
            <Route path="billing" element={<Billing />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
