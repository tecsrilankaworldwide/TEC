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

  const getLearningLevel = (ageGroup) => {
    const levels = {
      '5-8': 'Foundation',
      '9-12': 'Development', 
      '13-16': 'Mastery'
    };
    return levels[ageGroup] || 'Foundation';
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    getAgeGroupKey,
    getLearningLevel,
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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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
    <footer className="bg-gray-900 text-white py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Information */}
          <div className="col-span-2">
            <h3 className="text-2xl font-bold mb-4">🚀 TEC Future-Ready Learning Platform</h3>
            <p className="text-gray-300 mb-4">
              Preparing Sri Lankan children for tomorrow's world since 1982. Complete educational ecosystem for ages 5-16 with AI, Logical Thinking, Creative Problem Solving, and Future Career Skills.
            </p>
            <div className="bg-gradient-to-r from-purple-800 to-blue-800 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">42 Years of Educational Excellence:</h4>
              <p className="text-lg font-bold text-purple-300">TEC Sri Lanka Worldwide (Pvt.) Ltd</p>
              <p className="text-sm text-gray-300 mt-1">Pioneer in Future-Ready Education Technology</p>
              <div className="text-xs text-gray-400 mt-2">
                <p>🖥️ 1982: Computer Education Pioneer</p>
                <p>🤖 2004: Robotics with LEGO Dacta Denmark</p>
                <p>🚀 2024: AI Future-Ready Learning Platform</p>
              </div>
            </div>
          </div>

          {/* Learning Levels */}
          <div>
            <h4 className="font-semibold mb-4">Learning Levels</h4>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-center">
                <span className="text-2xl mr-3">🌱</span>
                <div>
                  <p className="font-semibold text-green-400">Foundation (5-8)</p>
                  <p className="text-xs">Basic AI & Logic</p>
                </div>
              </li>
              <li className="flex items-center">
                <span className="text-2xl mr-3">🧠</span>
                <div>
                  <p className="font-semibold text-blue-400">Development (9-12)</p>
                  <p className="text-xs">Logical Thinking & Creativity</p>
                </div>
              </li>
              <li className="flex items-center">
                <span className="text-2xl mr-3">🎯</span>
                <div>
                  <p className="font-semibold text-purple-400">Mastery (13-16)</p>
                  <p className="text-xs">Future Career Skills</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Contact & Legal */}
          <div>
            <h4 className="font-semibold mb-4">Contact & Support</h4>
            <ul className="space-y-2 text-gray-300">
              <li className="text-sm">🏢 TEC Sri Lanka Worldwide (Pvt.) Ltd</li>
              <li className="text-sm">🏦 All payments processed under company name</li>
              <li className="text-sm">📧 Support: info@tecfutureready.lk</li>
              <li className="text-sm">🌐 Sri Lanka Nationwide Delivery</li>
              <li className="text-sm">📱 Future-Ready Education Since 1982</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <div className="mb-4">
            <p className="text-gray-300">
              © 2024 <span className="font-semibold">TEC Sri Lanka Worldwide (Pvt.) Ltd</span>. All rights reserved.
            </p>
            <p className="text-sm text-gray-400 mt-1">
              TEC Future-Ready Learning Platform is a registered trademark of TEC Sri Lanka Worldwide (Pvt.) Ltd
            </p>
          </div>
          <div className="flex justify-center space-x-8 text-sm text-gray-400">
            <span>🔒 Secure Payments</span>
            <span>🚀 Future-Ready Skills</span>
            <span>🇱🇰 Made in Sri Lanka</span>
            <span>💎 42 Years Excellence</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Navigation Component
const Navigation = () => {
  const { user, logout, isTeacher, isStudent, hasSubscription, getLearningLevel } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-purple-700 via-blue-600 to-indigo-700 text-white shadow-xl">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-6">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <span className="mr-2">🚀</span>
                TEC Future-Ready Learning
              </h1>
              <div className="text-xs text-purple-100">Building Tomorrow's Minds Since 1982</div>
            </div>
            <div className="hidden md:flex text-sm text-purple-100 bg-white/10 px-4 py-2 rounded-full">
              AI • Logic • Creative • Problem Solving • Future Skills
            </div>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="/dashboard" className="hover:text-purple-200 transition-colors font-medium">Dashboard</a>
            {isTeacher && (
              <>
                <a href="/teacher" className="hover:text-purple-200 transition-colors">Create Content</a>
                <a href="/analytics" className="hover:text-purple-200 transition-colors">Analytics</a>
              </>
            )}
            {isStudent && (
              <>
                <a href="/learning-path" className="hover:text-purple-200 transition-colors">My Learning Path</a>
                <a href="/courses" className="hover:text-purple-200 transition-colors">All Courses</a>
                <a href="/subscription" className="hover:text-purple-200 transition-colors">
                  {hasSubscription ? '💎 Premium' : '⭐ Subscribe'}
                </a>
              </>
            )}
            
            {user && (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-medium">👋 {user.full_name}</div>
                  <div className="flex items-center space-x-2 text-xs">
                    <span className="px-2 py-1 bg-white/20 rounded-full">
                      {user.role}
                    </span>
                    {user.age_group && (
                      <span className="px-2 py-1 bg-purple-500/30 rounded-full">
                        {getLearningLevel(user.age_group)} Level
                      </span>
                    )}
                    {hasSubscription && isStudent && <span className="text-yellow-300">💎</span>}
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="bg-red-500 hover:bg-red-600 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            )}
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-purple-100">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🚀</div>
          <h1 className="text-3xl font-bold text-gray-800">TEC Future-Ready Learning</h1>
          <p className="text-purple-600 mt-2 font-medium">Preparing Tomorrow's Minds Today</p>
          <p className="text-sm text-gray-500 mt-2">Complete Educational Platform • Ages 5-16</p>
          <div className="mt-3 bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-lg">
            <p className="text-xs text-purple-800 font-medium">🏢 TEC Sri Lanka Worldwide (Pvt.) Ltd</p>
            <p className="text-xs text-gray-600">42 Years of Educational Excellence</p>
          </div>
        </div>

        <div className="flex mb-6">
          <button
            type="button"
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 px-4 rounded-l-lg transition-colors font-medium ${
              isLogin ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 px-4 rounded-r-lg transition-colors font-medium ${
              !isLogin ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700'
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
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
          )}
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />
          
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            required
          />

          {!isLogin && (
            <>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher / Educator</option>
              </select>

              {formData.role === 'student' && (
                <select
                  name="age_group"
                  value={formData.age_group}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="5-8">🌱 Foundation Level (Ages 5-8)</option>
                  <option value="9-12">🧠 Development Level (Ages 9-12)</option>
                  <option value="13-16">🎯 Mastery Level (Ages 13-16)</option>
                </select>
              )}
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 font-medium"
          >
            {loading ? 'Please wait...' : (isLogin ? 'Login to Learning Platform' : 'Join TEC Community')}
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

// Future-Ready Dashboard Component
const Dashboard = () => {
  const { user, isStudent, isTeacher, hasSubscription, getLearningLevel } = useAuth();
  const [stats, setStats] = useState({ courses: 0, enrollments: 0, videos: 0 });
  const [recentCourses, setRecentCourses] = useState([]);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const coursesResponse = await axios.get(`${API}/courses`);
        setRecentCourses(coursesResponse.data.slice(0, 4));
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

  const getLevelInfo = (ageGroup) => {
    const levels = {
      '5-8': {
        name: 'Foundation Level',
        icon: '🌱',
        color: 'from-green-500 to-emerald-600',
        description: 'Building blocks of future thinking',
        skills: ['Basic AI Concepts', 'Simple Logic', 'Creative Expression', 'Problem Recognition']
      },
      '9-12': {
        name: 'Development Level', 
        icon: '🧠',
        color: 'from-blue-500 to-cyan-600',
        description: 'Expanding logical and creative thinking',
        skills: ['Logical Reasoning', 'AI Applications', 'Design Thinking', 'Complex Problem Solving']
      },
      '13-16': {
        name: 'Mastery Level',
        icon: '🎯', 
        color: 'from-purple-500 to-indigo-600',
        description: 'Future career and leadership preparation',
        skills: ['Advanced AI', 'Innovation Methods', 'Systems Thinking', 'Future Career Skills']
      }
    };
    return levels[ageGroup] || levels['9-12'];
  };

  const levelInfo = getLevelInfo(user?.age_group);

  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 text-white rounded-2xl p-8 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Welcome back, {user.full_name}! 👋
                </h1>
                <p className="text-purple-100 text-lg mb-4">
                  Ready to build tomorrow's skills today?
                </p>
                {isStudent && (
                  <div className="flex items-center space-x-4">
                    <div className="bg-white/20 px-4 py-2 rounded-full">
                      <span className="text-2xl mr-2">{levelInfo.icon}</span>
                      <span className="font-semibold">{levelInfo.name}</span>
                    </div>
                    <div className="text-sm text-purple-100">
                      {levelInfo.description}
                    </div>
                  </div>
                )}
              </div>
              <div className="text-6xl opacity-20">
                🚀
              </div>
            </div>
          </div>
          
          {isStudent && !hasSubscription && (
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border-l-4 border-yellow-500 p-6 rounded-lg">
              <div className="flex items-center">
                <span className="text-3xl mr-4">⭐</span>
                <div>
                  <h3 className="font-bold text-yellow-800 text-lg">Unlock Your Complete Learning Journey!</h3>
                  <p className="text-yellow-700">
                    Get access to all courses, physical learning materials, and future-ready career guidance.
                    <a href="/subscription" className="ml-2 text-yellow-600 hover:underline font-semibold">
                      Subscribe now →
                    </a>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats Dashboard */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Available Courses</h3>
                <p className="text-3xl font-bold">{stats.courses}</p>
              </div>
              <span className="text-4xl opacity-20">📚</span>
            </div>
          </div>
          
          {isStudent && (
            <div className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white p-6 rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold mb-2">My Enrollments</h3>
                  <p className="text-3xl font-bold">{stats.enrollments}</p>
                </div>
                <span className="text-4xl opacity-20">🎯</span>
              </div>
            </div>
          )}
          
          <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Skill Areas</h3>
                <p className="text-3xl font-bold">4</p>
                <p className="text-sm mt-1 opacity-80">AI • Logic • Creative • Problem Solving</p>
              </div>
              <span className="text-4xl opacity-20">🧠</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Future Ready</h3>
                <p className="text-3xl font-bold">42</p>
                <p className="text-sm mt-1 opacity-80">Years of Excellence</p>
              </div>
              <span className="text-4xl opacity-20">🚀</span>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <span className="mr-2">⚡</span>
                Quick Actions
              </h2>
              <div className="space-y-4">
                {isStudent && (
                  <>
                    <a href="/learning-path" className="block p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg hover:from-purple-100 hover:to-indigo-100 transition-colors border border-purple-200">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🛤️</span>
                        <div>
                          <p className="font-semibold text-gray-800">My Learning Path</p>
                          <p className="text-sm text-gray-600">{levelInfo.name} Journey</p>
                        </div>
                      </div>
                    </a>
                    <a href="/courses" className="block p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-colors border border-blue-200">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">📚</span>
                        <div>
                          <p className="font-semibold text-gray-800">Browse All Courses</p>
                          <p className="text-sm text-gray-600">Explore future skills</p>
                        </div>
                      </div>
                    </a>
                    <a href="/subscription" className="block p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg hover:from-yellow-100 hover:to-orange-100 transition-colors border border-yellow-200">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{hasSubscription ? '💎' : '⭐'}</span>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {hasSubscription ? 'Premium Access' : 'Get Premium Access'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {hasSubscription ? 'Manage subscription' : 'Unlock all features'}
                          </p>
                        </div>
                      </div>
                    </a>
                  </>
                )}
                {isTeacher && (
                  <>
                    <a href="/teacher" className="block p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg hover:from-green-100 hover:to-emerald-100 transition-colors border border-green-200">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">🎬</span>
                        <div>
                          <p className="font-semibold text-gray-800">Create Content</p>
                          <p className="text-sm text-gray-600">Build future-ready courses</p>
                        </div>
                      </div>
                    </a>
                    <a href="/analytics" className="block p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-colors border border-blue-200">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">📊</span>
                        <div>
                          <p className="font-semibold text-gray-800">Student Analytics</p>
                          <p className="text-sm text-gray-600">Track learning progress</p>
                        </div>
                      </div>
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Skill Development Areas */}
            {isStudent && (
              <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mt-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <span className="mr-2">🎯</span>
                  Your Skill Areas
                </h2>
                <div className="space-y-3">
                  {levelInfo.skills.map((skill, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-3"></span>
                      <span className="text-sm font-medium text-gray-700">{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Featured Content */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <span className="mr-2">🌟</span>
                Featured Learning Content
              </h2>
              {recentCourses.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {recentCourses.map(course => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {course.subject === 'artificial_intelligence' ? '🤖' : 
                             course.subject === 'creative_thinking' ? '🎨' : '🧩'}
                          </span>
                          <div>
                            <h3 className="font-semibold text-gray-800">{course.title}</h3>
                            <p className="text-sm text-gray-500">Ages {course.age_group}</p>
                          </div>
                        </div>
                        {course.is_premium && <span className="text-purple-600 text-sm">💎</span>}
                      </div>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">
                          {course.videos?.length || 0} lessons
                        </span>
                        <button className="text-purple-600 hover:text-purple-700 text-sm font-medium">
                          Explore →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Coming Soon!</h3>
                  <p className="text-gray-500">Future-ready courses are being prepared just for you.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Simplified Teacher Dashboard for now
const TeacherDashboard = () => {
  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="text-3xl font-bold mb-4">Teacher Content Creation</h1>
          <p className="text-gray-600 mb-8">Advanced course creation tools coming soon!</p>
          <p className="text-purple-600">Building the future of educational content creation.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Simplified Analytics Dashboard
const AnalyticsDashboard = () => {
  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📊</div>
          <h1 className="text-3xl font-bold mb-4">Student Analytics</h1>
          <p className="text-gray-600 mb-8">Advanced analytics dashboard coming soon!</p>
          <p className="text-purple-600">Tracking future-ready learning progress.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Simplified Learning Path
const LearningPath = () => {
  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🛤️</div>
          <h1 className="text-3xl font-bold mb-4">Your Learning Path</h1>
          <p className="text-gray-600 mb-8">Personalized learning journey coming soon!</p>
          <p className="text-purple-600">Tailored for your future success.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Simplified Courses page
const CoursesPage = () => {
  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📚</div>
          <h1 className="text-3xl font-bold mb-4">All Courses</h1>
          <p className="text-gray-600 mb-8">Future-ready course catalog coming soon!</p>
          <p className="text-purple-600">Complete learning ecosystem in development.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

// Simplified Subscription page
const SubscriptionPage = () => {
  return (
    <div>
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20">
          <div className="text-6xl mb-4">💎</div>
          <h1 className="text-3xl font-bold mb-4">Premium Subscription</h1>
          <p className="text-gray-600 mb-8">Future-ready learning plans coming soon!</p>
          <p className="text-purple-600">Age-based pricing with physical materials.</p>
        </div>
      </div>
      <Footer />
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
            <Route path="/learning-path" element={
              <ProtectedRoute requireRole="student">
                <LearningPath />
              </ProtectedRoute>
            } />
            <Route path="/courses" element={
              <ProtectedRoute requireRole="student">
                <CoursesPage />
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
                <AnalyticsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </div>
    </AuthProvider>
  );
}

export default App;