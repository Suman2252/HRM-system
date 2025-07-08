import { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

// Set up axios defaults
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
        try {
      const response = await axios.get('http://localhost:5001/api/auth/me');
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.data.user,
              token,
            },
          });
        } catch (error) {
          dispatch({ type: 'AUTH_FAIL', payload: error.response?.data?.message || 'Authentication failed' });
          setAuthToken(null);
        }
      } else {
        dispatch({ type: 'AUTH_FAIL', payload: null });
      }
    };

    loadUser();
  }, []);

  // Login function
  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('http://localhost:5001/api/auth/login', { email, password });
      
      // Check if password change is required (first login)
      if (response.data.requirePasswordChange) {
        dispatch({ type: 'AUTH_FAIL', payload: null }); // Clear loading state
        toast.info('Please change your password to continue');
        return {
          success: true,
          requirePasswordChange: true,
          tempToken: response.data.tempToken,
          message: response.data.message
        };
      }

      const { token, user } = response.data;
      
      setAuthToken(token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
      
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('http://localhost:5001/api/auth/register', userData);
      const { token, user } = response.data;
      
      setAuthToken(token);
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token },
      });
      
      toast.success('Registration successful!');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('http://localhost:5001/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthToken(null);
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    }
  };

  // Update profile function
  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put('http://localhost:5001/api/auth/profile', profileData);
      dispatch({
        type: 'UPDATE_USER',
        payload: response.data.data,
      });
      toast.success('Profile updated successfully');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Change password function
  const changePassword = async (passwordData, tempToken = null) => {
    try {
      // If tempToken is provided (first login), use it instead of stored token
      if (tempToken) {
        setAuthToken(tempToken);
      }

      const response = await axios.post('http://localhost:5001/api/auth/change-password', passwordData);
      
      // Update token after password change
      const { token } = response.data;
      if (token) {
        localStorage.setItem('token', token);
        setAuthToken(token);
      }

      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed';
      throw new Error(message);
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
