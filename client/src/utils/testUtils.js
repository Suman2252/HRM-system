import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';

// Mock data for testing
export const mockUser = {
  _id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'employee',
  department: 'Engineering',
  designation: 'Developer',
};

export const mockEmployees = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    department: 'Engineering',
    designation: 'Senior Developer',
    joiningDate: '2024-01-01',
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    department: 'Design',
    designation: 'UI Designer',
    joiningDate: '2024-01-15',
  },
];

export const mockAttendance = [
  {
    _id: '1',
    userId: '1',
    date: '2024-01-22',
    clockIn: '09:00',
    clockOut: '17:00',
    status: 'present',
  },
];

export const mockLeaves = [
  {
    _id: '1',
    userId: '1',
    startDate: '2024-02-01',
    endDate: '2024-02-02',
    type: 'annual',
    reason: 'Vacation',
    status: 'pending',
  },
];

export const mockPayroll = [
  {
    _id: '1',
    userId: '1',
    month: '2024-01',
    basicSalary: 5000,
    allowances: 1000,
    deductions: 500,
    netSalary: 5500,
    status: 'completed',
  },
];

// Test wrapper component
export const TestWrapper = ({ children }) => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Custom render function
export const renderWithProviders = (ui, options = {}) => {
  return render(ui, {
    wrapper: TestWrapper,
    ...options,
  });
};

// Mock API responses
export const mockApiResponses = {
  login: {
    success: {
      token: 'mock_token',
      user: mockUser,
    },
    error: {
      message: 'Invalid credentials',
    },
  },
  employees: {
    list: {
      success: {
        data: mockEmployees,
        total: mockEmployees.length,
      },
      error: {
        message: 'Failed to fetch employees',
      },
    },
  },
  attendance: {
    list: {
      success: {
        data: mockAttendance,
        total: mockAttendance.length,
      },
      error: {
        message: 'Failed to fetch attendance',
      },
    },
  },
  leaves: {
    list: {
      success: {
        data: mockLeaves,
        total: mockLeaves.length,
      },
      error: {
        message: 'Failed to fetch leaves',
      },
    },
  },
  payroll: {
    list: {
      success: {
        data: mockPayroll,
        total: mockPayroll.length,
      },
      error: {
        message: 'Failed to fetch payroll',
      },
    },
  },
};

// Mock local storage
export const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock theme functions
export const mockTheme = {
  theme: 'light',
  setTheme: jest.fn(),
};

// Mock auth functions
export const mockAuth = {
  user: mockUser,
  login: jest.fn(),
  logout: jest.fn(),
  register: jest.fn(),
  isAuthenticated: true,
  loading: false,
};

// Mock navigation functions
export const mockNavigate = jest.fn();

// Mock form submission
export const mockSubmit = jest.fn();

// Mock API calls
export const mockApi = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
};

// Mock event handlers
export const mockHandlers = {
  onClick: jest.fn(),
  onChange: jest.fn(),
  onSubmit: jest.fn(),
};

// Mock error boundary
export class MockErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong.</div>;
    }

    return this.props.children;
  }
}

// Mock intersection observer
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.IntersectionObserver = mockIntersectionObserver;
};

// Mock resize observer
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: () => null,
    unobserve: () => null,
    disconnect: () => null,
  });
  window.ResizeObserver = mockResizeObserver;
};

// Setup all mocks
export const setupMocks = () => {
  // Mock window functions
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
  Object.defineProperty(window, 'matchMedia', {
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });

  // Mock observers
  mockIntersectionObserver();
  mockResizeObserver();

  // Clear all mocks after each test
  afterEach(() => {
    jest.clearAllMocks();
  });
};

export default {
  mockUser,
  mockEmployees,
  mockAttendance,
  mockLeaves,
  mockPayroll,
  TestWrapper,
  renderWithProviders,
  mockApiResponses,
  setupMocks,
};
