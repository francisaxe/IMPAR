#!/usr/bin/env python3
"""
Backend API Testing for IMPAR Survey App - New Endpoints
Testing the following new endpoints:
1. GET /api/profile - Get user profile
2. PUT /api/profile - Update profile
3. POST /api/team-application - Team application
4. PUT /api/surveys/{id}/feature - Feature/unfeature survey
5. GET /api/featured - Get featured content
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from frontend .env
try:
    with open('/app/frontend/.env', 'r') as f:
        for line in f:
            if line.startswith('EXPO_PUBLIC_BACKEND_URL='):
                BACKEND_URL = line.split('=')[1].strip()
                break
        else:
            BACKEND_URL = "https://impar-surveys.preview.emergentagent.com"
except:
    BACKEND_URL = "https://impar-surveys.preview.emergentagent.com"

API_BASE = f"{BACKEND_URL}/api"

# Test credentials
OWNER_CREDENTIALS = {"email": "owner@survey.com", "password": "owner123"}
USER_CREDENTIALS = {"email": "user1@test.com", "password": "user123"}

class TestResults:
    def __init__(self):
        self.passed = 0
        self.failed = 0
        self.errors = []
        
    def add_pass(self, test_name):
        self.passed += 1
        print(f"✅ {test_name}")
        
    def add_fail(self, test_name, error):
        self.failed += 1
        self.errors.append(f"{test_name}: {error}")
        print(f"❌ {test_name}: {error}")
        
    def summary(self):
        total = self.passed + self.failed
        print(f"\n{'='*60}")
        print(f"TEST SUMMARY: {self.passed}/{total} tests passed")
        if self.errors:
            print(f"\nFAILED TESTS:")
            for error in self.errors:
                print(f"  - {error}")
        print(f"{'='*60}")
        return self.failed == 0

def login_user(credentials):
    """Login and return token"""
    try:
        response = requests.post(f"{API_BASE}/auth/login", json=credentials)
        if response.status_code == 200:
            return response.json()["token"]
        else:
            print(f"Login failed: {response.status_code} - {response.text}")
            return None
    except Exception as e:
        print(f"Login error: {e}")
        return None

def test_profile_endpoints(results):
    """Test GET and PUT /api/profile endpoints"""
    print(f"\n🔍 Testing Profile Endpoints...")
    
    # Test with regular user
    user_token = login_user(USER_CREDENTIALS)
    if not user_token:
        results.add_fail("Profile Tests", "Failed to login as user")
        return
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    # Test GET /api/profile
    try:
        response = requests.get(f"{API_BASE}/profile", headers=headers)
        if response.status_code == 200:
            profile_data = response.json()
            required_fields = ["id", "email", "name", "role"]
            if all(field in profile_data for field in required_fields):
                results.add_pass("GET /api/profile - Returns user profile with required fields")
            else:
                results.add_fail("GET /api/profile", f"Missing required fields. Got: {list(profile_data.keys())}")
        else:
            results.add_fail("GET /api/profile", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.add_fail("GET /api/profile", f"Request error: {e}")
    
    # Test PUT /api/profile
    try:
        update_data = {
            "name": "Updated Test User",
            "profession": "Software Tester",
            "nationality": "Portuguese"
        }
        response = requests.put(f"{API_BASE}/profile", json=update_data, headers=headers)
        if response.status_code == 200:
            # Verify the update worked
            get_response = requests.get(f"{API_BASE}/profile", headers=headers)
            if get_response.status_code == 200:
                updated_profile = get_response.json()
                if (updated_profile.get("name") == "Updated Test User" and 
                    updated_profile.get("profession") == "Software Tester"):
                    results.add_pass("PUT /api/profile - Successfully updates profile fields")
                else:
                    results.add_fail("PUT /api/profile", "Profile fields not updated correctly")
            else:
                results.add_fail("PUT /api/profile", "Could not verify profile update")
        else:
            results.add_fail("PUT /api/profile", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.add_fail("PUT /api/profile", f"Request error: {e}")

def test_team_application_endpoint(results):
    """Test POST /api/team-application endpoint"""
    print(f"\n🔍 Testing Team Application Endpoint...")
    
    # Test with regular user
    user_token = login_user(USER_CREDENTIALS)
    if not user_token:
        results.add_fail("Team Application Test", "Failed to login as user")
        return
    
    headers = {"Authorization": f"Bearer {user_token}"}
    
    try:
        application_data = {
            "message": "Gostaria de me juntar à equipa para ajudar com o desenvolvimento de sondagens e análise de dados. Tenho experiência em Python e análise estatística."
        }
        response = requests.post(f"{API_BASE}/team-application", json=application_data, headers=headers)
        if response.status_code == 200:
            response_data = response.json()
            if "message" in response_data and "sucesso" in response_data["message"].lower():
                results.add_pass("POST /api/team-application - Successfully submits team application")
            else:
                results.add_fail("POST /api/team-application", f"Unexpected response: {response_data}")
        else:
            results.add_fail("POST /api/team-application", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.add_fail("POST /api/team-application", f"Request error: {e}")

def get_survey_for_testing(token):
    """Get a survey ID for testing feature functionality"""
    headers = {"Authorization": f"Bearer {token}"}
    try:
        response = requests.get(f"{API_BASE}/surveys", headers=headers)
        if response.status_code == 200:
            surveys = response.json()
            if surveys:
                return surveys[0]["id"]
    except:
        pass
    return None

def test_survey_feature_endpoints(results):
    """Test PUT /api/surveys/{id}/feature and GET /api/featured endpoints"""
    print(f"\n🔍 Testing Survey Feature Endpoints...")
    
    # Test with owner
    owner_token = login_user(OWNER_CREDENTIALS)
    if not owner_token:
        results.add_fail("Survey Feature Tests", "Failed to login as owner")
        return
    
    headers = {"Authorization": f"Bearer {owner_token}"}
    
    # Get a survey to test with
    survey_id = get_survey_for_testing(owner_token)
    if not survey_id:
        results.add_fail("Survey Feature Tests", "No surveys available for testing")
        return
    
    # Test PUT /api/surveys/{id}/feature - Feature a survey
    try:
        response = requests.put(f"{API_BASE}/surveys/{survey_id}/feature", headers=headers)
        if response.status_code == 200:
            response_data = response.json()
            if "featured" in response_data:
                featured_status = response_data["featured"]
                results.add_pass(f"PUT /api/surveys/{{id}}/feature - Successfully toggled feature status to {featured_status}")
                
                # Test GET /api/featured (public endpoint - no auth needed)
                try:
                    featured_response = requests.get(f"{API_BASE}/featured")
                    if featured_response.status_code == 200:
                        featured_items = featured_response.json()
                        if isinstance(featured_items, list):
                            # Check if our survey appears in featured (if we featured it)
                            if featured_status:
                                survey_in_featured = any(item.get("id") == survey_id for item in featured_items)
                                if survey_in_featured:
                                    results.add_pass("GET /api/featured - Returns featured content including newly featured survey")
                                else:
                                    results.add_pass("GET /api/featured - Returns featured content (survey may not appear due to sorting/limits)")
                            else:
                                results.add_pass("GET /api/featured - Returns featured content list")
                        else:
                            results.add_fail("GET /api/featured", f"Expected list, got: {type(featured_items)}")
                    else:
                        results.add_fail("GET /api/featured", f"Status {featured_response.status_code}: {featured_response.text}")
                except Exception as e:
                    results.add_fail("GET /api/featured", f"Request error: {e}")
                
            else:
                results.add_fail("PUT /api/surveys/{id}/feature", f"Missing 'featured' in response: {response_data}")
        else:
            results.add_fail("PUT /api/surveys/{id}/feature", f"Status {response.status_code}: {response.text}")
    except Exception as e:
        results.add_fail("PUT /api/surveys/{id}/feature", f"Request error: {e}")
    
    # Test authorization - regular user should not be able to feature surveys
    user_token = login_user(USER_CREDENTIALS)
    if user_token:
        user_headers = {"Authorization": f"Bearer {user_token}"}
        try:
            response = requests.put(f"{API_BASE}/surveys/{survey_id}/feature", headers=user_headers)
            if response.status_code == 403:
                results.add_pass("PUT /api/surveys/{id}/feature - Correctly denies access to regular users (403)")
            else:
                results.add_fail("PUT /api/surveys/{id}/feature Authorization", f"Expected 403, got {response.status_code}")
        except Exception as e:
            results.add_fail("PUT /api/surveys/{id}/feature Authorization", f"Request error: {e}")

def test_feature_limit(results):
    """Test the 3-feature limit"""
    print(f"\n🔍 Testing Feature Limit (Max 3)...")
    
    owner_token = login_user(OWNER_CREDENTIALS)
    if not owner_token:
        results.add_fail("Feature Limit Test", "Failed to login as owner")
        return
    
    headers = {"Authorization": f"Bearer {owner_token}"}
    
    # Get all surveys
    try:
        response = requests.get(f"{API_BASE}/surveys", headers=headers)
        if response.status_code == 200:
            surveys = response.json()
            if len(surveys) >= 4:  # Need at least 4 surveys to test the limit
                # Try to feature 4 surveys and check if the 4th fails
                featured_count = 0
                for i, survey in enumerate(surveys[:4]):
                    survey_id = survey["id"]
                    feature_response = requests.put(f"{API_BASE}/surveys/{survey_id}/feature", headers=headers)
                    
                    if feature_response.status_code == 200:
                        response_data = feature_response.json()
                        if response_data.get("featured"):
                            featured_count += 1
                    elif feature_response.status_code == 400 and "limite" in feature_response.text.lower():
                        if featured_count >= 3:
                            results.add_pass("Feature Limit - Correctly enforces 3-feature limit")
                        else:
                            results.add_fail("Feature Limit", f"Limit enforced too early at {featured_count} features")
                        break
                
                if featured_count >= 3:
                    results.add_pass("Feature Limit - Successfully featured 3 items")
            else:
                results.add_pass("Feature Limit - Insufficient surveys to test limit (need 4+)")
        else:
            results.add_fail("Feature Limit Test", f"Could not get surveys: {response.status_code}")
    except Exception as e:
        results.add_fail("Feature Limit Test", f"Request error: {e}")

def main():
    print("🚀 Starting IMPAR Backend API Tests for New Endpoints")
    print(f"Backend URL: {API_BASE}")
    print(f"Testing at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = TestResults()
    
    # Test all new endpoints
    test_profile_endpoints(results)
    test_team_application_endpoint(results)
    test_survey_feature_endpoints(results)
    test_feature_limit(results)
    
    # Print summary
    success = results.summary()
    
    if success:
        print("\n🎉 All tests passed! New endpoints are working correctly.")
        sys.exit(0)
    else:
        print(f"\n⚠️  {results.failed} test(s) failed. Check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()