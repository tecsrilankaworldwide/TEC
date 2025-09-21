import React, { useState, useEffect, createContext, useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import "./App.css";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API}/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          console.error('Auth initialization failed:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/login`, { email, password });
      const { access_token, user: userData } = response.data;
      
      setToken(access_token);
      setUser(userData);
      localStorage.setItem('token', access_token);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(`${API}/register`, userData);
      return { success: true, user: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const getAgeGroupKey = (ageGroup) => {
    const mapping = {
      '5-8': 'early_learners',
      '9-12': 'middle_learners', 
      '13-16': 'teen_learners'
    };
    return mapping[ageGroup];
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    getAgeGroupKey,
    isAuthenticated: !!user,
    isTeacher: user?.role === 'teacher' || user?.role === 'admin',
    isStudent: user?.role === 'student',
    isAdmin: user?.role === 'admin',
    hasSubscription: user?.subscription_type && (!user?.subscription_expires || new Date(user.subscription_expires) > new Date())
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Protected Route Component
const ProtectedRoute = ({ children, requireRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && user.role !== requireRole && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Information */}
          <div className="col-span-2">
            <h3 className="text-xl font-bold mb-4">🎓 Steam Lanka Educational Platform</h3>
            <p className="text-gray-300 mb-4">
              Empowering Sri Lankan students aged 5-16 with AI, Creative Thinking, and Problem Solving skills for the future.
            </p>
            <div className="bg-gray-700 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Operated By:</h4>
              <p className="text-lg font-bold text-blue-300">TEC Sri Lanka Worldwide (Pvt.) Ltd</p>
              <p className="text-sm text-gray-400 mt-1">Registered Educational Technology Company</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/courses" className="hover:text-blue-300">Browse Courses</a></li>
              <li><a href="/subscription" className="hover:text-blue-300">Pricing Plans</a></li>
              <li><a href="/dashboard" className="hover:text-blue-300">Dashboard</a></li>
              <li><a href="/login" className="hover:text-blue-300">Login / Register</a></li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal & Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="text-sm">🏢 TEC Sri Lanka Worldwide (Pvt.) Ltd</li>
              <li className="text-sm">🏦 All payments processed under company name</li>
              <li className="text-sm">📧 Support: info@steamlanka.lk</li>
              <li className="text-sm">🌐 Sri Lanka Nationwide Delivery</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <div className="mb-4">
            <p className="text-gray-300">
              © 2024 <span className="font-semibold">TEC Sri Lanka Worldwide (Pvt.) Ltd</span>. All rights reserved.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Steam Lanka Educational Platform is a registered trademark of TEC Sri Lanka Worldwide (Pvt.) Ltd
            </p>
          </div>
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <span>🔒 Secure Payments</span>
            <span>📚 Quality Education</span>
            <span>🇱🇰 Made in Sri Lanka</span>
            <span>💎 Premium Materials</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Navigation Component
const Navigation = () => {
  const { user, logout, isTeacher, isStudent, hasSubscription } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold">🎓 Steam Lanka Edu</h1>
              <div className="text-xs text-blue-100">A TEC Sri Lanka Worldwide Initiative</div>
            </div>
            <div className="text-sm text-blue-100">AI • Creative • Problem Solving</div>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="/dashboard" className="hover:text-blue-200 transition-colors">Dashboard</a>
            {isTeacher && (
              <>
                <a href="/teacher" className="hover:text-blue-200 transition-colors">Teach</a>
                <a href="/analytics" className="hover:text-blue-200 transition-colors">Analytics</a>
              </>
            )}
            {isStudent && (
              <>
                <a href="/courses" className="hover:text-blue-200 transition-colors">Courses</a>
                <a href="/subscription" className="hover:text-blue-200 transition-colors">
                  {hasSubscription ? '💎 Premium' : '⭐ Subscribe'}
                </a>
              </>
            )}
            <div className="flex items-center space-x-3">
              <span className="text-sm">👋 {user.full_name}</span>
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs">
                {user.role}
                {hasSubscription && isStudent && <span className="ml-1">💎</span>}
              </span>
              <button 
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Login Component
const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'student',
    age_group: '9-12'
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const result = await login(formData.email, formData.password);
        if (result.success) {
          // Redirect to dashboard on successful login
          navigate('/dashboard');
        } else {
          setMessage(result.error);
        }
      } else {
        const result = await register(formData);
        if (result.success) {
          setMessage('Registration successful! Please login.');
          setIsLogin(true);
          setFormData({ ...formData, password: '' });
        } else {
          setMessage(result.error);
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🎓 Steam Lanka</h1>
          <p className="text-gray-600 mt-2">AI • Creative Thinking • Problem Solving</p>
          <p className="text-sm text-gray-500 mt-1">Education Platform for Ages 5-16</p>
          <p className="text-xs text-blue-600 mt-2">Operated by TEC Sri Lanka Worldwide (Pvt.) Ltd</p>
        </div>

        <div className="flex mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 px-4 rounded-l-lg transition-colors ${
              isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 px-4 rounded-r-lg transition-colors ${
              !isLogin ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              name="full_name"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          )}
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          {!isLogin && (
            <>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
              </select>

              {formData.role === 'student' && (
                <select
                  name="age_group"
                  value={formData.age_group}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="5-8">Ages 5-8 (Early Learners)</option>
                  <option value="9-12">Ages 9-12 (Middle Learners)</option>
                  <option value="13-16">Ages 13-16 (Teen Learners)</option>
                </select>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-3 rounded-lg text-center ${
            message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

// Age-Based Subscription Page
const SubscriptionPage = () => {
  const [plans, setPlans] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const { user, token, hasSubscription, getAgeGroupKey } = useAuth();

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await axios.get(`${API}/subscription/plans`);
        setPlans(response.data);
      } catch (error) {
        console.error('Failed to load subscription plans:', error);
      }
    };

    loadPlans();

    // Check for payment return
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    if (sessionId) {
      checkPaymentStatus(sessionId);
    }
  }, []);

  const checkPaymentStatus = async (sessionId) => {
    setCheckingPayment(true);
    let attempts = 0;
    const maxAttempts = 5;

    const pollPayment = async () => {
      try {
        const response = await axios.get(`${API}/payment/status/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.payment_status === 'paid') {
          alert('🎉 Payment successful! Your subscription is now active.');
          window.location.href = '/dashboard';
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(pollPayment, 2000);
        } else {
          setCheckingPayment(false);
          alert('Payment verification timed out. Please check your subscription status.');
        }
      } catch (error) {
        console.error('Payment status check failed:', error);
        setCheckingPayment(false);
      }
    };

    pollPayment();
  };

  const subscribe = async (subscriptionType) => {
    if (!user?.age_group) {
      alert('Age group is required for subscription. Please update your profile.');
      return;
    }

    setLoading(true);
    try {
      const currentUrl = window.location.origin + window.location.pathname;
      const successUrl = `${currentUrl}?session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = currentUrl;

      const response = await axios.post(`${API}/subscription/checkout`, {
        subscription_type: subscriptionType,
        age_group: user.age_group,
        success_url: successUrl,
        cancel_url: cancelUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      console.error('Subscription failed:', error);
      alert('Failed to create subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getAgeGroupName = (ageGroup) => {
    const names = {
      '5-8': 'Early Learners (Ages 5-8)',
      '9-12': 'Middle Learners (Ages 9-12)',
      '13-16': 'Teen Learners (Ages 13-16)'
    };
    return names[ageGroup] || 'Unknown Age Group';
  };

  if (checkingPayment) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Processing Payment...</h2>
          <p className="text-gray-600">Please wait while we confirm your subscription.</p>
        </div>
      </div>
    );
  }

  if (!user?.age_group) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Age Group Required</h2>
          <p className="text-gray-600 mb-4">Please set your age group in your profile to view subscription options.</p>
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const userPlans = plans[getAgeGroupKey(user.age_group)] || {};

  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">💎 Subscription Plans</h1>
          <h2 className="text-xl text-blue-600 mb-2">{getAgeGroupName(user.age_group)}</h2>
          {hasSubscription ? (
            <div className="bg-green-100 text-green-800 p-4 rounded-lg inline-block">
              <p className="font-semibold">✅ Active Subscription</p>
              <p>Plan: {user.subscription_type} | Expires: {new Date(user.subscription_expires).toLocaleDateString()}</p>
            </div>
          ) : (
            <p className="text-gray-600">Choose the perfect plan for {getAgeGroupName(user.age_group)}</p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          {userPlans.monthly && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-gray-200">
              <h3 className="text-2xl font-bold mb-4">📅 Monthly Plan</h3>
              <div className="text-4xl font-bold mb-2 text-blue-600">
                LKR {userPlans.monthly.digital_price.toLocaleString()}/month
              </div>
              <p className="text-gray-600 mb-6">{userPlans.monthly.description}</p>
              
              <div className="text-left mb-8 space-y-2">
                {userPlans.monthly.includes.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => subscribe('monthly')}
                disabled={loading || hasSubscription}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  hasSubscription 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? 'Processing...' : hasSubscription ? 'Current Plan' : 'Subscribe Monthly'}
              </button>
            </div>
          )}

          {/* Quarterly Plan */}
          {userPlans.quarterly && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border-4 border-purple-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                Best Value + Materials
              </div>
              
              <h3 className="text-2xl font-bold mb-4">📦 Quarterly Plan</h3>
              <div className="text-4xl font-bold mb-2 text-purple-600">
                LKR {userPlans.quarterly.total_price.toLocaleString()}
              </div>
              <div className="text-sm text-gray-500 mb-2">
                Digital: LKR {userPlans.quarterly.digital_price.toLocaleString()} + Materials: LKR 1,500
              </div>
              <div className="text-green-600 font-semibold mb-4">
                {userPlans.quarterly.savings} ✨
              </div>
              <p className="text-gray-600 mb-6">{userPlans.quarterly.description}</p>
              
              <div className="text-left mb-8 space-y-2">
                {userPlans.quarterly.includes.map((feature, index) => (
                  <div key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-yellow-800 mb-2">📚 Physical Materials Included:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Term book with activities</li>
                  <li>• Practical work kit</li>
                  <li>• Free shipping to your door</li>
                  <li>• Delivered every 3 months</li>
                </ul>
              </div>

              <button
                onClick={() => subscribe('quarterly')}
                disabled={loading || hasSubscription}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  hasSubscription 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                }`}
              >
                {loading ? 'Processing...' : hasSubscription ? 'Current Plan' : 'Subscribe Quarterly'}
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 text-center text-gray-500">
          <div className="mb-4">
            <p className="text-lg font-semibold text-gray-700">Operated by</p>
            <p className="text-xl font-bold text-blue-800">TEC Sri Lanka Worldwide (Pvt.) Ltd</p>
          </div>
          <p>🔒 Secure payment powered by Stripe</p>
          <p>Cancel anytime • 30-day money-back guarantee • Sri Lankan Rupees (LKR)</p>
          <p className="mt-2 text-sm">All prices include delivery within Sri Lanka</p>
          <p className="mt-2 text-xs text-gray-400">All transactions processed under TEC Sri Lanka Worldwide (Pvt.) Ltd</p>
        </div>
      </div>
    </div>
  );
};

// Student Analytics Component (same as before but updated for new subscription types)
const StudentAnalytics = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [teacherStats, setTeacherStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [studentsResponse, statsResponse] = await Promise.all([
          axios.get(`${API}/analytics/students`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API}/analytics/teacher-stats`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        setStudents(studentsResponse.data);
        setTeacherStats(statsResponse.data);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, [token]);

  const loadStudentDetails = async (studentId) => {
    try {
      const response = await axios.get(`${API}/analytics/student/${studentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedStudent(response.data);
    } catch (error) {
      console.error('Failed to load student details:', error);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatActivityType = (type) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">📊 Student Analytics</h1>
          
          {/* Teacher Stats Overview */}
          {teacherStats && (
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-blue-500 text-white p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-2">Courses Created</h3>
                <p className="text-3xl font-bold">{teacherStats.courses_created}</p>
              </div>
              <div className="bg-green-500 text-white p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-2">Total Students</h3>
                <p className="text-3xl font-bold">{teacherStats.total_students}</p>
              </div>
              <div className="bg-purple-500 text-white p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-2">Total Enrollments</h3>
                <p className="text-3xl font-bold">{teacherStats.total_enrollments}</p>
              </div>
              <div className="bg-orange-500 text-white p-6 rounded-xl">
                <h3 className="text-lg font-semibold mb-2">Popular Courses</h3>
                <p className="text-3xl font-bold">{teacherStats.popular_courses.length}</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Students List */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">👥 Students Overview</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {students.map(student => (
                <div 
                  key={student.user_id}
                  onClick={() => loadStudentDetails(student.user_id)}
                  className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{student.full_name}</h3>
                      <p className="text-sm text-gray-600">{student.email}</p>
                      <p className="text-xs text-gray-500">
                        Age: {student.age_group} | 
                        {student.subscription_type && (
                          <span className="ml-1 text-blue-600">💎 {student.subscription_type}</span>
                        )}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-medium">{student.total_enrollments} courses</p>
                      <p className="text-gray-600">{formatDuration(student.total_watch_time)}</p>
                      <p className="text-green-600">{student.courses_completed} completed</p>
                    </div>
                  </div>
                  
                  {student.last_login && (
                    <p className="text-xs text-gray-500 mt-2">
                      Last login: {new Date(student.last_login).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Student Details */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4">🔍 Student Details</h2>
            {selectedStudent ? (
              <div>
                <div className="border-b pb-4 mb-4">
                  <h3 className="text-lg font-semibold">{selectedStudent.full_name}</h3>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                  <div className="flex gap-4 mt-2 text-sm">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {selectedStudent.age_group} years
                    </span>
                    {selectedStudent.subscription_type && (
                      <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                        💎 {selectedStudent.subscription_type}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-blue-600">{selectedStudent.total_enrollments}</p>
                    <p className="text-sm text-gray-600">Enrollments</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-green-600">{selectedStudent.courses_completed}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-purple-600">{formatDuration(selectedStudent.total_watch_time)}</p>
                    <p className="text-sm text-gray-600">Watch Time</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded">
                    <p className="text-2xl font-bold text-orange-600">
                      {selectedStudent.last_login ? new Date(selectedStudent.last_login).toLocaleDateString() : 'Never'}
                    </p>
                    <p className="text-sm text-gray-600">Last Login</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">📈 Recent Activities</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedStudent.recent_activities.map(activity => (
                      <div key={activity.id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                        <div>
                          <span className="font-medium">{formatActivityType(activity.activity_type)}</span>
                          {activity.details.course_title && (
                            <span className="text-gray-600 ml-2">- {activity.details.course_title}</span>
                          )}
                        </div>
                        <span className="text-gray-500">
                          {new Date(activity.timestamp).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="text-4xl mb-4">👆</div>
                <p>Select a student from the list to view detailed analytics</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Dashboard Component (same as before)
const Dashboard = () => {
  const { user, isStudent, isTeacher, hasSubscription } = useAuth();
  const [stats, setStats] = useState({ courses: 0, enrollments: 0, videos: 0 });
  const [recentCourses, setRecentCourses] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const coursesResponse = await axios.get(`${API}/courses`);
        setRecentCourses(coursesResponse.data.slice(0, 3));
        setStats(prev => ({ ...prev, courses: coursesResponse.data.length }));

        if (isStudent) {
          const enrollmentsResponse = await axios.get(`${API}/my-enrollments`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setStats(prev => ({ ...prev, enrollments: enrollmentsResponse.data.length }));
        }
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      }
    };

    loadDashboardData();
  }, [isStudent]);

  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Welcome back, {user.full_name}! 👋
          </h1>
          <p className="text-gray-600">Ready to explore AI, creative thinking, and problem-solving?</p>
          
          {isStudent && !hasSubscription && (
            <div className="mt-4 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 p-4 rounded-lg">
              <p className="text-blue-800">
                <span className="font-semibold">⭐ Upgrade to Premium</span> to access all courses and get physical materials!
                <a href="/subscription" className="ml-2 text-blue-600 hover:underline">Subscribe now →</a>
              </p>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Available Courses</h3>
            <p className="text-3xl font-bold">{stats.courses}</p>
          </div>
          {isStudent && (
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
              <h3 className="text-lg font-semibold mb-2">My Enrollments</h3>
              <p className="text-3xl font-bold">{stats.enrollments}</p>
            </div>
          )}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Learning Areas</h3>
            <p className="text-3xl font-bold">3</p>
            <p className="text-sm mt-1">AI • Creative • Problem Solving</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">🚀 Quick Actions</h2>
            <div className="space-y-3">
              {isStudent && (
                <>
                  <a href="/courses" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    📚 Browse Courses
                  </a>
                  <a href="/subscription" className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                    {hasSubscription ? '💎 Manage Subscription' : '📦 Get Premium + Materials'}
                  </a>
                </>
              )}
              {isTeacher && (
                <>
                  <a href="/teacher" className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                    🎬 Create Course
                  </a>
                  <a href="/analytics" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                    📊 View Analytics
                  </a>
                </>
              )}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4">🌟 Featured Courses</h2>
            {recentCourses.length > 0 ? (
              <div className="space-y-3">
                {recentCourses.map(course => (
                  <div key={course.id} className="p-3 border rounded-lg">
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm text-gray-600">
                      {course.subject.replace('_', ' ')} • Ages {course.age_group}
                      {course.is_premium && <span className="ml-2 text-purple-600">💎 Premium</span>}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No courses available yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Course Browser Component (same as before)
const CourseBrowser = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subject: '', age_group: '' });
  const { user, token, hasSubscription } = useAuth();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.subject) params.append('subject', filters.subject);
        if (filters.age_group) params.append('age_group', filters.age_group);
        
        const response = await axios.get(`${API}/courses?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [filters, token]);

  const enrollInCourse = async (courseId) => {
    try {
      await axios.post(`${API}/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Enrolled successfully!');
    } catch (error) {
      if (error.response?.status === 403) {
        alert('Premium subscription required for this course. Please upgrade your plan.');
      } else {
        alert(error.response?.data?.detail || 'Enrollment failed');
      }
    }
  };

  const subjectEmojis = {
    artificial_intelligence: '🤖',
    creative_thinking: '🎨',
    problem_solving: '🧩'
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-48 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">📚 Course Catalog</h1>
          
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <select 
              value={filters.subject}
              onChange={(e) => setFilters({...filters, subject: e.target.value})}
              className="p-2 border rounded-lg"
            >
              <option value="">All Subjects</option>
              <option value="artificial_intelligence">🤖 Artificial Intelligence</option>
              <option value="creative_thinking">🎨 Creative Thinking</option>
              <option value="problem_solving">🧩 Problem Solving</option>
            </select>
            
            <select
              value={filters.age_group}
              onChange={(e) => setFilters({...filters, age_group: e.target.value})}
              className="p-2 border rounded-lg"
            >
              <option value="">All Ages</option>
              <option value="5-8">Ages 5-8</option>
              <option value="9-12">Ages 9-12</option>
              <option value="13-16">Ages 13-16</option>
            </select>
          </div>
        </div>

        {/* Courses Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center mb-3">
                  <span className="text-3xl mr-3">
                    {subjectEmojis[course.subject] || '📚'}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
                      {course.is_premium && <span className="text-purple-600">💎</span>}
                    </div>
                    <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                      Ages {course.age_group}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-3">{course.description}</p>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {course.videos?.length || 0} videos
                  </span>
                  
                  {user?.role === 'student' && (
                    <button
                      onClick={() => {
                        if (course.is_premium && !hasSubscription) {
                          if (confirm('This is a premium course. Would you like to subscribe to access it?')) {
                            window.location.href = '/subscription';
                          }
                        } else {
                          enrollInCourse(course.id);
                        }
                      }}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        course.is_premium && !hasSubscription
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                      }`}
                    >
                      {course.is_premium && !hasSubscription ? '💎 Upgrade to Access' : 'Enroll Now'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">No Courses Found</h2>
            <p className="text-gray-500">Try adjusting your filters or check back later for new courses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Teacher Dashboard Component (same as before)
const TeacherDashboard = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    subject: 'artificial_intelligence',
    age_group: '9-12',
    is_premium: false
  });
  const { token } = useAuth();

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/courses`, courseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Course created successfully!');
      setShowCreateForm(false);
      setCourseData({ 
        title: '', 
        description: '', 
        subject: 'artificial_intelligence', 
        age_group: '9-12',
        is_premium: false 
      });
    } catch (error) {
      alert('Failed to create course');
    }
  };

  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🎬 Teacher Dashboard</h1>
          <p className="text-gray-600">Create and manage your educational content</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Course Management</h2>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors"
            >
              {showCreateForm ? 'Cancel' : '+ Create Course'}
            </button>
          </div>

          {showCreateForm && (
            <form onSubmit={handleCreateCourse} className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <input
                type="text"
                placeholder="Course Title"
                value={courseData.title}
                onChange={(e) => setCourseData({...courseData, title: e.target.value})}
                className="w-full p-3 border rounded-lg"
                required
              />
              
              <textarea
                placeholder="Course Description"
                value={courseData.description}
                onChange={(e) => setCourseData({...courseData, description: e.target.value})}
                className="w-full p-3 border rounded-lg h-24"
                required
              />
              
              <div className="grid md:grid-cols-3 gap-4">
                <select
                  value={courseData.subject}
                  onChange={(e) => setCourseData({...courseData, subject: e.target.value})}
                  className="p-3 border rounded-lg"
                >
                  <option value="artificial_intelligence">🤖 Artificial Intelligence</option>
                  <option value="creative_thinking">🎨 Creative Thinking</option>
                  <option value="problem_solving">🧩 Problem Solving</option>
                </select>
                
                <select
                  value={courseData.age_group}
                  onChange={(e) => setCourseData({...courseData, age_group: e.target.value})}
                  className="p-3 border rounded-lg"
                >
                  <option value="5-8">Ages 5-8</option>
                  <option value="9-12">Ages 9-12</option>
                  <option value="13-16">Ages 13-16</option>
                </select>

                <label className="flex items-center p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    checked={courseData.is_premium}
                    onChange={(e) => setCourseData({...courseData, is_premium: e.target.checked})}
                    className="mr-2"
                  />
                  💎 Premium Course
                </label>
              </div>
              
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white p-3 rounded-lg hover:from-green-700 hover:to-blue-700 transition-colors"
              >
                Create Course
              </button>
            </form>
          )}

          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🎯</div>
            <p>Video upload and advanced course management features coming next!</p>
            <p className="mt-2 text-sm">
              <a href="/analytics" className="text-blue-600 hover:underline">
                📊 View detailed student analytics →
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <div className="App min-h-screen bg-gray-50">
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/courses" element={
              <ProtectedRoute requireRole="student">
                <CourseBrowser />
              </ProtectedRoute>
            } />
            <Route path="/subscription" element={
              <ProtectedRoute requireRole="student">
                <SubscriptionPage />
              </ProtectedRoute>
            } />
            <Route path="/teacher" element={
              <ProtectedRoute requireRole="teacher">
                <TeacherDashboard />
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute requireRole="teacher">
                <StudentAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
      <Footer />
    </AuthProvider>
  );
}

export default App;