import requests
import sys
import json
from datetime import datetime

class SteamLankaAPITester:
    def __init__(self, base_url="https://tecfuture.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.teacher_token = None
        self.student_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.created_course_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and len(str(response_data)) < 200:
                        print(f"   Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test basic API health"""
        success, response = self.run_test(
            "API Health Check",
            "GET",
            "",
            200
        )
        return success

    def test_teacher_login(self):
        """Test teacher login with provided credentials"""
        success, response = self.run_test(
            "Teacher Login",
            "POST",
            "login",
            200,
            data={"email": "teacher@steamlanka.edu", "password": "teacher123"}
        )
        if success and 'access_token' in response:
            self.teacher_token = response['access_token']
            print(f"   Teacher token obtained: {self.teacher_token[:20]}...")
            return True
        return False

    def test_student_login(self):
        """Test student login with provided credentials"""
        success, response = self.run_test(
            "Student Login",
            "POST",
            "login",
            200,
            data={"email": "student@steamlanka.edu", "password": "student123"}
        )
        if success and 'access_token' in response:
            self.student_token = response['access_token']
            print(f"   Student token obtained: {self.student_token[:20]}...")
            return True
        return False

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        success, response = self.run_test(
            "Invalid Login",
            "POST",
            "login",
            401,
            data={"email": "invalid@test.com", "password": "wrongpass"}
        )
        return success

    def test_teacher_profile(self):
        """Test getting teacher profile"""
        if not self.teacher_token:
            print("❌ No teacher token available")
            return False
            
        success, response = self.run_test(
            "Teacher Profile",
            "GET",
            "me",
            200,
            token=self.teacher_token
        )
        return success

    def test_student_profile(self):
        """Test getting student profile"""
        if not self.student_token:
            print("❌ No student token available")
            return False
            
        success, response = self.run_test(
            "Student Profile",
            "GET",
            "me",
            200,
            token=self.student_token
        )
        return success

    def test_get_courses(self):
        """Test getting published courses"""
        success, response = self.run_test(
            "Get Published Courses",
            "GET",
            "courses",
            200
        )
        if success:
            print(f"   Found {len(response)} published courses")
        return success

    def test_create_course(self):
        """Test creating a course as teacher"""
        if not self.teacher_token:
            print("❌ No teacher token available")
            return False

        course_data = {
            "title": f"Test Course {datetime.now().strftime('%H%M%S')}",
            "description": "This is a test course for API testing",
            "subject": "artificial_intelligence",
            "age_group": "9-12"
        }
        
        success, response = self.run_test(
            "Create Course",
            "POST",
            "courses",
            200,
            data=course_data,
            token=self.teacher_token
        )
        
        if success and 'id' in response:
            self.created_course_id = response['id']
            print(f"   Created course ID: {self.created_course_id}")
            return True
        return False

    def test_publish_course(self):
        """Test publishing a course"""
        if not self.teacher_token or not self.created_course_id:
            print("❌ No teacher token or course ID available")
            return False

        success, response = self.run_test(
            "Publish Course",
            "PUT",
            f"courses/{self.created_course_id}/publish",
            200,
            token=self.teacher_token
        )
        return success

    def test_get_specific_course(self):
        """Test getting a specific course"""
        if not self.created_course_id:
            print("❌ No course ID available")
            return False

        success, response = self.run_test(
            "Get Specific Course",
            "GET",
            f"courses/{self.created_course_id}",
            200
        )
        return success

    def test_student_enroll(self):
        """Test student enrollment in course"""
        if not self.student_token or not self.created_course_id:
            print("❌ No student token or course ID available")
            return False

        success, response = self.run_test(
            "Student Enrollment",
            "POST",
            f"courses/{self.created_course_id}/enroll",
            200,
            token=self.student_token
        )
        return success

    def test_student_enrollments(self):
        """Test getting student's enrollments"""
        if not self.student_token:
            print("❌ No student token available")
            return False

        success, response = self.run_test(
            "Get Student Enrollments",
            "GET",
            "my-enrollments",
            200,
            token=self.student_token
        )
        if success:
            print(f"   Student has {len(response)} enrollments")
        return success

    def test_unauthorized_access(self):
        """Test unauthorized access to protected endpoints"""
        success, response = self.run_test(
            "Unauthorized Access to Profile",
            "GET",
            "me",
            401
        )
        return success

    def test_student_create_course_forbidden(self):
        """Test that students cannot create courses"""
        if not self.student_token:
            print("❌ No student token available")
            return False

        course_data = {
            "title": "Unauthorized Course",
            "description": "This should fail",
            "subject": "artificial_intelligence",
            "age_group": "9-12"
        }
        
        success, response = self.run_test(
            "Student Create Course (Should Fail)",
            "POST",
            "courses",
            403,
            data=course_data,
            token=self.student_token
        )
        return success

def main():
    print("🚀 Starting Steam Lanka Educational Platform API Tests")
    print("=" * 60)
    
    tester = SteamLankaAPITester()
    
    # Test sequence
    tests = [
        ("Basic API Health", tester.test_health_check),
        ("Teacher Login", tester.test_teacher_login),
        ("Student Login", tester.test_student_login),
        ("Invalid Login", tester.test_invalid_login),
        ("Teacher Profile", tester.test_teacher_profile),
        ("Student Profile", tester.test_student_profile),
        ("Get Courses", tester.test_get_courses),
        ("Create Course", tester.test_create_course),
        ("Publish Course", tester.test_publish_course),
        ("Get Specific Course", tester.test_get_specific_course),
        ("Student Enrollment", tester.test_student_enroll),
        ("Student Enrollments", tester.test_student_enrollments),
        ("Unauthorized Access", tester.test_unauthorized_access),
        ("Student Create Course (Forbidden)", tester.test_student_create_course_forbidden),
    ]
    
    # Run all tests
    for test_name, test_func in tests:
        try:
            test_func()
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
    
    # Print final results
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️  Some tests failed - check backend implementation")
        return 1

if __name__ == "__main__":
    sys.exit(main())