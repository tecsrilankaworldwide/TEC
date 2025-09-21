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

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isTeacher: user?.role === 'teacher' || user?.role === 'admin',
    isStudent: user?.role === 'student',
    isAdmin: user?.role === 'admin'
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

// Navigation Component
const Navigation = () => {
  const { user, logout, isTeacher, isStudent } = useAuth();

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">🎓 Steam Lanka Edu</h1>
            <div className="text-sm text-blue-100">AI • Creative • Problem Solving</div>
          </div>
          
          <div className="flex items-center space-x-6">
            <a href="/dashboard" className="hover:text-blue-200 transition-colors">Dashboard</a>
            {isTeacher && (
              <a href="/teacher" className="hover:text-blue-200 transition-colors">Teach</a>
            )}
            {isStudent && (
              <a href="/courses" className="hover:text-blue-200 transition-colors">Courses</a>
            )}
            <div className="flex items-center space-x-3">
              <span className="text-sm">👋 {user.full_name}</span>
              <span className="px-2 py-1 bg-white/20 rounded-full text-xs">{user.role}</span>
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

// Dashboard Component
const Dashboard = () => {
  const { user, isStudent, isTeacher } = useAuth();
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
                <a href="/courses" className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  📚 Browse Courses
                </a>
              )}
              {isTeacher && (
                <a href="/teacher" className="block p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  🎬 Create Course
                </a>
              )}
              {isStudent && (
                <a href="/my-learning" className="block p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  📈 My Learning Progress
                </a>
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
                    <p className="text-sm text-gray-600">{course.subject.replace('_', ' ')} • Ages {course.age_group}</p>
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

// Course Browser Component
const CourseBrowser = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ subject: '', age_group: '' });
  const { user, token } = useAuth();

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const params = new URLSearchParams();
        if (filters.subject) params.append('subject', filters.subject);
        if (filters.age_group) params.append('age_group', filters.age_group);
        
        const response = await axios.get(`${API}/courses?${params}`);
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to load courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [filters]);

  const enrollInCourse = async (courseId) => {
    try {
      await axios.post(`${API}/courses/${courseId}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Enrolled successfully!');
    } catch (error) {
      alert(error.response?.data?.detail || 'Enrollment failed');
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
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{course.title}</h3>
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
                      onClick={() => enrollInCourse(course.id)}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors"
                    >
                      Enroll Now
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

// Simple Teacher Dashboard Component
const TeacherDashboard = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    subject: 'artificial_intelligence',
    age_group: '9-12'
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
      setCourseData({ title: '', description: '', subject: 'artificial_intelligence', age_group: '9-12' });
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
              
              <div className="grid md:grid-cols-2 gap-4">
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
            <p>Course management and video upload features coming next!</p>
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
            <Route path="/teacher" element={
              <ProtectedRoute requireRole="teacher">
                <TeacherDashboard />
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