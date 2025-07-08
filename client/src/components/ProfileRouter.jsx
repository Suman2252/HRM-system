import { useAuth } from '../context/AuthContext';
import Profile from '../pages/profile/Profile';
import AdminProfile from '../pages/profile/AdminProfileNew';
import HRProfile from '../pages/profile/HRProfile';

const ProfileRouter = () => {
  const { user } = useAuth();

  // Route admin users to the premium AdminProfile design
  if (user?.role === 'admin') {
    return <AdminProfile />;
  }
  
  // Route HR users to HRProfile
  if (user?.role === 'hr' || user?.role === 'hr_manager') {
    return <HRProfile />;
  }
  
  // Route employees to the standard Profile
  return <Profile />;
};

export default ProfileRouter;
