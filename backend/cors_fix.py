"""
CORS Fix for Job Portal API

This script helps diagnose and fix CORS issues in the Job Portal API.
Run this script to check for common CORS configuration issues and apply fixes.
"""

import os
import sys
import re

def check_app_py():
    """Check app.py for CORS configuration issues"""
    print("Checking app.py for CORS configuration...")
    
    try:
        with open('app.py', 'r') as f:
            content = f.read()
        
        # Check for CORS import
        if 'from flask_cors import CORS' not in content:
            print("❌ Missing CORS import")
            return False
        
        # Check for CORS initialization
        if 'CORS(app' not in content:
            print("❌ Missing CORS initialization")
            return False
        
        # Check for supports_credentials
        if 'supports_credentials=True' not in content:
            print("❌ Missing supports_credentials=True in CORS configuration")
            return False
        
        # Check for after_request handler
        if '@app.after_request' not in content or 'Access-Control-Allow-Credentials' not in content:
            print("❌ Missing or incomplete after_request handler for CORS headers")
            return False
        
        # Check for OPTIONS handling in endpoints
        if "request.method == 'OPTIONS'" not in content:
            print("❌ Missing OPTIONS request handling in endpoints")
            return False
        
        print("✅ CORS configuration looks good!")
        return True
    except Exception as e:
        print(f"❌ Error checking app.py: {str(e)}")
        return False

def fix_cors_configuration():
    """Fix CORS configuration in app.py"""
    print("Fixing CORS configuration in app.py...")
    
    try:
        with open('app.py', 'r') as f:
            content = f.read()
        
        # Add CORS import if missing
        if 'from flask_cors import CORS' not in content:
            content = re.sub(
                r'from flask import (.*)',
                r'from flask import \1\nfrom flask_cors import CORS',
                content
            )
        
        # Fix CORS initialization
        cors_config = """
# Enable CORS for all routes
CORS(app, 
     origins=["https://job-portal-frontend.onrender.com", "http://localhost:3000"],
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     expose_headers=["Content-Type", "Authorization"])

# Add CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    # Only add headers if it's not an OPTIONS preflight request that already has CORS headers
    if request.method != 'OPTIONS' or 'Access-Control-Allow-Origin' not in response.headers:
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response
"""
        
        # Replace existing CORS configuration
        if 'CORS(app' in content:
            content = re.sub(
                r'# Enable CORS.*?return response\n',
                cors_config,
                content,
                flags=re.DOTALL
            )
        else:
            # Add CORS configuration after app initialization
            content = re.sub(
                r'app = Flask\(.*?\)',
                r'\g<0>\n\n' + cors_config,
                content
            )
        
        # Add OPTIONS handling to endpoints
        endpoints = [
            ('@app.route(\'/api/jobs\'', 'def get_jobs():'),
            ('@app.route(\'/api/profile\'', 'def get_profile():'),
            ('@app.route(\'/api/profile\', methods=[\'PUT\'', 'def update_profile():')
        ]
        
        for route, func in endpoints:
            # Check if the endpoint exists and doesn't already handle OPTIONS
            if route in content and func in content:
                # Add OPTIONS to methods if not already there
                if 'OPTIONS' not in content[content.find(route):content.find(func)]:
                    content = content.replace(
                        route,
                        route.replace('\'GET\'', '\'GET\', \'OPTIONS\'').replace('[\'PUT\'', '[\'PUT\', \'OPTIONS\'')
                    )
                
                # Add OPTIONS handling if not already there
                options_handler = """
    # Handle preflight OPTIONS request
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        return response
    """
                
                if 'request.method == \'OPTIONS\'' not in content[content.find(func):content.find(func) + 500]:
                    content = content.replace(
                        func + '\n',
                        func + '\n' + options_handler
                    )
        
        # Write the updated content back to app.py
        with open('app.py', 'w') as f:
            f.write(content)
        
        print("✅ CORS configuration fixed!")
        return True
    except Exception as e:
        print(f"❌ Error fixing CORS configuration: {str(e)}")
        return False

def main():
    """Main function"""
    print("=== CORS Fix for Job Portal API ===")
    
    # Check if we're in the right directory
    if not os.path.exists('app.py'):
        print("❌ app.py not found in current directory")
        print("Please run this script from the backend directory")
        return
    
    # Check CORS configuration
    if check_app_py():
        print("CORS configuration is already correct!")
    else:
        print("Fixing CORS configuration...")
        if fix_cors_configuration():
            print("CORS configuration fixed successfully!")
            print("Please restart the Flask server for changes to take effect.")
        else:
            print("Failed to fix CORS configuration.")
            print("Please check app.py manually.")
    
    print("\nTo test CORS configuration:")
    print("1. Restart the Flask server")
    print("2. Open the browser console")
    print("3. Try accessing the API endpoints from the frontend")
    print("4. Check for CORS errors in the console")

if __name__ == "__main__":
    main()