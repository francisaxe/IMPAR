#!/usr/bin/env python3
"""
Comprehensive Backend Testing for Survey App
Tests all API endpoints with proper authentication and authorization
"""

import requests
import json
import sys
from datetime import datetime
from typing import Dict, Any, Optional

# Backend URL from frontend .env
BACKEND_URL = "https://quick-polls-3.preview.emergentagent.com/api"

# Test accounts
OWNER_EMAIL = "owner@survey.com"
OWNER_PASSWORD = "owner123"
USER_EMAIL = "user1@test.com"
USER_PASSWORD = "user123"

# Test survey ID
TEST_SURVEY_ID = "6924b85f6d3548a7f9f95bb5"

class SurveyAppTester:
    def __init__(self):
        self.owner_token = None
        self.user_token = None
        self.test_results = []
        self.created_survey_id = None
        
    def log_test(self, test_name: str, success: bool, message: str, details: Any = None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "details": details,
            "timestamp": datetime.now().isoformat()
        })
        
        if not success:
            if details:
                print(f"   Details: {details}")
    
    def make_request(self, method: str, endpoint: str, token: Optional[str] = None, 
                    data: Optional[Dict] = None, params: Optional[Dict] = None) -> requests.Response:
        """Make HTTP request with proper headers"""
        url = f"{BACKEND_URL}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, params=params, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            raise
    
    def test_user_registration(self):
        """Test user registration endpoint"""
        print("\n=== Testing User Registration ===")
        
        # Test new user registration
        new_user_data = {
            "email": f"testuser_{datetime.now().timestamp()}@test.com",
            "password": "testpass123",
            "name": "Test User New"
        }
        
        try:
            response = self.make_request("POST", "/auth/register", data=new_user_data)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    self.log_test("User Registration", True, "New user registered successfully")
                else:
                    self.log_test("User Registration", False, "Missing token or user in response", data)
            else:
                self.log_test("User Registration", False, f"Registration failed with status {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("User Registration", False, f"Registration request failed: {str(e)}")
        
        # Test duplicate email registration
        try:
            response = self.make_request("POST", "/auth/register", data=new_user_data)
            
            if response.status_code == 400:
                self.log_test("Duplicate Email Prevention", True, "Correctly prevented duplicate email registration")
            else:
                self.log_test("Duplicate Email Prevention", False, f"Should have returned 400, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Duplicate Email Prevention", False, f"Duplicate check failed: {str(e)}")
    
    def test_user_login(self):
        """Test user login endpoints"""
        print("\n=== Testing User Login ===")
        
        # Test owner login
        owner_credentials = {
            "email": OWNER_EMAIL,
            "password": OWNER_PASSWORD
        }
        
        try:
            response = self.make_request("POST", "/auth/login", data=owner_credentials)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    self.owner_token = data["token"]
                    if data["user"]["role"] == "owner":
                        self.log_test("Owner Login", True, "Owner logged in successfully")
                    else:
                        self.log_test("Owner Login", False, f"Expected owner role, got {data['user']['role']}")
                else:
                    self.log_test("Owner Login", False, "Missing token or user in response", data)
            else:
                self.log_test("Owner Login", False, f"Owner login failed with status {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Owner Login", False, f"Owner login request failed: {str(e)}")
        
        # Test regular user login
        user_credentials = {
            "email": USER_EMAIL,
            "password": USER_PASSWORD
        }
        
        try:
            response = self.make_request("POST", "/auth/login", data=user_credentials)
            
            if response.status_code == 200:
                data = response.json()
                if "token" in data and "user" in data:
                    self.user_token = data["token"]
                    if data["user"]["role"] == "user":
                        self.log_test("User Login", True, "Regular user logged in successfully")
                    else:
                        self.log_test("User Login", False, f"Expected user role, got {data['user']['role']}")
                else:
                    self.log_test("User Login", False, "Missing token or user in response", data)
            else:
                self.log_test("User Login", False, f"User login failed with status {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("User Login", False, f"User login request failed: {str(e)}")
        
        # Test invalid credentials
        invalid_credentials = {
            "email": "invalid@test.com",
            "password": "wrongpassword"
        }
        
        try:
            response = self.make_request("POST", "/auth/login", data=invalid_credentials)
            
            if response.status_code == 401:
                self.log_test("Invalid Login Prevention", True, "Correctly rejected invalid credentials")
            else:
                self.log_test("Invalid Login Prevention", False, f"Should have returned 401, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Invalid Login Prevention", False, f"Invalid login test failed: {str(e)}")
    
    def test_auth_me(self):
        """Test /auth/me endpoint"""
        print("\n=== Testing Auth Me Endpoint ===")
        
        if not self.owner_token:
            self.log_test("Auth Me", False, "No owner token available for testing")
            return
        
        try:
            response = self.make_request("GET", "/auth/me", token=self.owner_token)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "email" in data and "role" in data:
                    self.log_test("Auth Me", True, "Successfully retrieved user info")
                else:
                    self.log_test("Auth Me", False, "Missing required fields in response", data)
            else:
                self.log_test("Auth Me", False, f"Auth me failed with status {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Auth Me", False, f"Auth me request failed: {str(e)}")
        
        # Test without token
        try:
            response = self.make_request("GET", "/auth/me")
            
            if response.status_code == 403:
                self.log_test("Auth Me Without Token", True, "Correctly rejected request without token")
            else:
                self.log_test("Auth Me Without Token", False, f"Should have returned 403, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Auth Me Without Token", False, f"Auth me without token test failed: {str(e)}")
    
    def test_survey_listing(self):
        """Test survey listing endpoint"""
        print("\n=== Testing Survey Listing ===")
        
        # Test with owner token
        if self.owner_token:
            try:
                response = self.make_request("GET", "/surveys", token=self.owner_token)
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        self.log_test("Survey Listing (Owner)", True, f"Retrieved {len(data)} surveys")
                        
                        # Check survey structure
                        if data and len(data) > 0:
                            survey = data[0]
                            required_fields = ["id", "title", "description", "has_answered"]
                            if all(field in survey for field in required_fields):
                                self.log_test("Survey Structure", True, "Survey objects have required fields")
                            else:
                                self.log_test("Survey Structure", False, f"Missing fields in survey object", survey)
                    else:
                        self.log_test("Survey Listing (Owner)", False, "Response is not a list", data)
                else:
                    self.log_test("Survey Listing (Owner)", False, f"Survey listing failed with status {response.status_code}", response.text)
                    
            except Exception as e:
                self.log_test("Survey Listing (Owner)", False, f"Survey listing request failed: {str(e)}")
        
        # Test with user token
        if self.user_token:
            try:
                response = self.make_request("GET", "/surveys", token=self.user_token)
                
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, list):
                        self.log_test("Survey Listing (User)", True, f"User retrieved {len(data)} surveys")
                    else:
                        self.log_test("Survey Listing (User)", False, "Response is not a list", data)
                else:
                    self.log_test("Survey Listing (User)", False, f"User survey listing failed with status {response.status_code}", response.text)
                    
            except Exception as e:
                self.log_test("Survey Listing (User)", False, f"User survey listing request failed: {str(e)}")
    
    def test_survey_details(self):
        """Test survey details endpoint"""
        print("\n=== Testing Survey Details ===")
        
        if not self.user_token:
            self.log_test("Survey Details", False, "No user token available for testing")
            return
        
        try:
            response = self.make_request("GET", f"/surveys/{TEST_SURVEY_ID}", token=self.user_token)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["id", "title", "description", "questions", "has_answered"]
                if all(field in data for field in required_fields):
                    self.log_test("Survey Details", True, f"Retrieved survey details for '{data.get('title', 'Unknown')}'")
                    
                    # Check questions structure
                    questions = data.get("questions", [])
                    if questions and len(questions) > 0:
                        question = questions[0]
                        if "type" in question and "text" in question:
                            self.log_test("Question Structure", True, f"Questions have proper structure ({len(questions)} questions)")
                        else:
                            self.log_test("Question Structure", False, "Questions missing required fields", question)
                else:
                    self.log_test("Survey Details", False, "Missing required fields in survey details", data)
            else:
                self.log_test("Survey Details", False, f"Survey details failed with status {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Survey Details", False, f"Survey details request failed: {str(e)}")
        
        # Test with invalid survey ID
        try:
            response = self.make_request("GET", "/surveys/invalid_id", token=self.user_token)
            
            if response.status_code == 400 or response.status_code == 404:
                self.log_test("Invalid Survey ID", True, "Correctly handled invalid survey ID")
            else:
                self.log_test("Invalid Survey ID", False, f"Should have returned 400/404, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Invalid Survey ID", False, f"Invalid survey ID test failed: {str(e)}")
    
    def test_survey_response_submission(self):
        """Test survey response submission"""
        print("\n=== Testing Survey Response Submission ===")
        
        if not self.user_token:
            self.log_test("Survey Response", False, "No user token available for testing")
            return
        
        # Sample response data for the test survey
        response_data = {
            "answers": [
                {"question_index": 0, "answer": "Very Satisfied"},
                {"question_index": 1, "answer": ["Quality", "Price"]},
                {"question_index": 2, "answer": "Great service and fast delivery!"},
                {"question_index": 3, "answer": "I love the variety of products available. The website is easy to navigate and the checkout process is smooth."},
                {"question_index": 4, "answer": 5}
            ]
        }
        
        try:
            response = self.make_request("POST", f"/surveys/{TEST_SURVEY_ID}/respond", 
                                       token=self.user_token, data=response_data)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data:
                    self.log_test("Survey Response Submission", True, "Successfully submitted survey response")
                else:
                    self.log_test("Survey Response Submission", False, "Missing message in response", data)
            elif response.status_code == 400 and "already answered" in response.text:
                self.log_test("Survey Response Submission", True, "User has already answered (duplicate prevention working)")
            else:
                self.log_test("Survey Response Submission", False, f"Response submission failed with status {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Survey Response Submission", False, f"Response submission request failed: {str(e)}")
        
        # Test duplicate response prevention
        try:
            response = self.make_request("POST", f"/surveys/{TEST_SURVEY_ID}/respond", 
                                       token=self.user_token, data=response_data)
            
            if response.status_code == 400 and "already answered" in response.text:
                self.log_test("Duplicate Response Prevention", True, "Correctly prevented duplicate response")
            else:
                self.log_test("Duplicate Response Prevention", False, f"Should have prevented duplicate, got {response.status_code}")
                
        except Exception as e:
            self.log_test("Duplicate Response Prevention", False, f"Duplicate prevention test failed: {str(e)}")
    
    def test_survey_results(self):
        """Test survey results endpoint"""
        print("\n=== Testing Survey Results ===")
        
        if not self.user_token:
            self.log_test("Survey Results", False, "No user token available for testing")
            return
        
        try:
            response = self.make_request("GET", f"/surveys/{TEST_SURVEY_ID}/results", token=self.user_token)
            
            if response.status_code == 200:
                data = response.json()
                required_fields = ["survey_id", "title", "total_responses", "aggregated_results"]
                if all(field in data for field in required_fields):
                    self.log_test("Survey Results", True, f"Retrieved results with {data.get('total_responses', 0)} responses")
                    
                    # Check aggregated results structure
                    results = data.get("aggregated_results", [])
                    if results and len(results) > 0:
                        result = results[0]
                        if "question_text" in result and "results" in result:
                            self.log_test("Results Structure", True, "Results have proper aggregation structure")
                        else:
                            self.log_test("Results Structure", False, "Results missing required fields", result)
                else:
                    self.log_test("Survey Results", False, "Missing required fields in results", data)
            elif response.status_code == 403:
                self.log_test("Survey Results", True, "User hasn't answered yet - access correctly restricted")
            else:
                self.log_test("Survey Results", False, f"Survey results failed with status {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Survey Results", False, f"Survey results request failed: {str(e)}")
    
    def test_owner_responses(self):
        """Test owner-only individual responses endpoint"""
        print("\n=== Testing Owner Individual Responses ===")
        
        if not self.owner_token:
            self.log_test("Owner Responses", False, "No owner token available for testing")
            return
        
        # Test with owner token
        try:
            response = self.make_request("GET", f"/surveys/{TEST_SURVEY_ID}/responses", token=self.owner_token)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("Owner Individual Responses", True, f"Owner retrieved {len(data)} individual responses")
                    
                    # Check response structure
                    if data and len(data) > 0:
                        resp = data[0]
                        required_fields = ["id", "user_name", "answers", "submitted_at"]
                        if all(field in resp for field in required_fields):
                            self.log_test("Response Structure", True, "Individual responses have proper structure")
                        else:
                            self.log_test("Response Structure", False, "Response missing required fields", resp)
                else:
                    self.log_test("Owner Individual Responses", False, "Response is not a list", data)
            else:
                self.log_test("Owner Individual Responses", False, f"Owner responses failed with status {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Owner Individual Responses", False, f"Owner responses request failed: {str(e)}")
        
        # Test with regular user token (should be forbidden)
        if self.user_token:
            try:
                response = self.make_request("GET", f"/surveys/{TEST_SURVEY_ID}/responses", token=self.user_token)
                
                if response.status_code == 403:
                    self.log_test("User Access to Individual Responses", True, "Correctly denied user access to individual responses")
                else:
                    self.log_test("User Access to Individual Responses", False, f"Should have returned 403, got {response.status_code}")
                    
            except Exception as e:
                self.log_test("User Access to Individual Responses", False, f"User access test failed: {str(e)}")
    
    def test_my_responses(self):
        """Test my responses endpoint"""
        print("\n=== Testing My Responses ===")
        
        if not self.user_token:
            self.log_test("My Responses", False, "No user token available for testing")
            return
        
        try:
            response = self.make_request("GET", "/my-responses", token=self.user_token)
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_test("My Responses", True, f"User has {len(data)} answered surveys")
                    
                    # Check response structure
                    if data and len(data) > 0:
                        resp = data[0]
                        required_fields = ["survey_id", "survey_title", "submitted_at"]
                        if all(field in resp for field in required_fields):
                            self.log_test("My Responses Structure", True, "My responses have proper structure")
                        else:
                            self.log_test("My Responses Structure", False, "My response missing required fields", resp)
                else:
                    self.log_test("My Responses", False, "Response is not a list", data)
            else:
                self.log_test("My Responses", False, f"My responses failed with status {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("My Responses", False, f"My responses request failed: {str(e)}")
    
    def test_create_survey(self):
        """Test survey creation (owner only)"""
        print("\n=== Testing Survey Creation ===")
        
        if not self.owner_token:
            self.log_test("Create Survey", False, "No owner token available for testing")
            return
        
        # Test survey data with all question types
        survey_data = {
            "title": f"Test Survey {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "description": "A comprehensive test survey with all question types",
            "questions": [
                {
                    "type": "multiple_choice_single",
                    "text": "What is your favorite color?",
                    "options": ["Red", "Blue", "Green", "Yellow"]
                },
                {
                    "type": "multiple_choice_multiple",
                    "text": "Which programming languages do you know?",
                    "options": ["Python", "JavaScript", "Java", "C++", "Go"]
                },
                {
                    "type": "text_short",
                    "text": "What is your name?"
                },
                {
                    "type": "text_long",
                    "text": "Please describe your experience with our service."
                },
                {
                    "type": "rating",
                    "text": "How would you rate our service?",
                    "max_rating": 5
                }
            ]
        }
        
        # Test with owner token
        try:
            response = self.make_request("POST", "/surveys", token=self.owner_token, data=survey_data)
            
            if response.status_code == 200:
                data = response.json()
                if "id" in data and "title" in data:
                    self.created_survey_id = data["id"]
                    self.log_test("Create Survey (Owner)", True, f"Successfully created survey: {data['title']}")
                else:
                    self.log_test("Create Survey (Owner)", False, "Missing id or title in response", data)
            else:
                self.log_test("Create Survey (Owner)", False, f"Survey creation failed with status {response.status_code}", response.text)
                
        except Exception as e:
            self.log_test("Create Survey (Owner)", False, f"Survey creation request failed: {str(e)}")
        
        # Test with regular user token (should be forbidden)
        if self.user_token:
            try:
                response = self.make_request("POST", "/surveys", token=self.user_token, data=survey_data)
                
                if response.status_code == 403:
                    self.log_test("User Create Survey Prevention", True, "Correctly denied user access to create surveys")
                else:
                    self.log_test("User Create Survey Prevention", False, f"Should have returned 403, got {response.status_code}")
                    
            except Exception as e:
                self.log_test("User Create Survey Prevention", False, f"User create survey test failed: {str(e)}")
    
    def run_all_tests(self):
        """Run all backend tests in order"""
        print("🚀 Starting Comprehensive Backend Testing for Survey App")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Run tests in order
        self.test_user_registration()
        self.test_user_login()
        self.test_auth_me()
        self.test_survey_listing()
        self.test_survey_details()
        self.test_survey_response_submission()
        self.test_survey_results()
        self.test_owner_responses()
        self.test_my_responses()
        self.test_create_survey()
        
        # Print summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result["success"])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   ❌ {result['test']}: {result['message']}")
        
        print("\n" + "=" * 60)
        return failed_tests == 0

if __name__ == "__main__":
    tester = SurveyAppTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)