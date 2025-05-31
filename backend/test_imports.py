"""
Test script to verify that all imports are working correctly.
"""

def test_flask_jwt_extended_imports():
    """Test Flask-JWT-Extended imports"""
    print("Testing Flask-JWT-Extended imports...")
    try:
        from flask_jwt_extended import (
            JWTManager, 
            create_access_token, 
            jwt_required, 
            get_jwt_identity, 
            verify_jwt_in_request,
            decode_token
        )
        print("✅ All Flask-JWT-Extended imports successful!")
        return True
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
        return False

def test_flask_imports():
    """Test Flask imports"""
    print("Testing Flask imports...")
    try:
        from flask import Flask, request, jsonify, send_from_directory, render_template
        print("✅ All Flask imports successful!")
        return True
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
        return False

def test_flask_sqlalchemy_imports():
    """Test Flask-SQLAlchemy imports"""
    print("Testing Flask-SQLAlchemy imports...")
    try:
        from flask_sqlalchemy import SQLAlchemy
        print("✅ All Flask-SQLAlchemy imports successful!")
        return True
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
        return False

def test_flask_cors_imports():
    """Test Flask-CORS imports"""
    print("Testing Flask-CORS imports...")
    try:
        from flask_cors import CORS
        print("✅ All Flask-CORS imports successful!")
        return True
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
        return False

def test_werkzeug_imports():
    """Test Werkzeug imports"""
    print("Testing Werkzeug imports...")
    try:
        from werkzeug.security import generate_password_hash, check_password_hash
        print("✅ All Werkzeug imports successful!")
        return True
    except ImportError as e:
        print(f"❌ Import error: {str(e)}")
        return False

def main():
    """Main function"""
    print("=== Testing imports ===")
    
    all_tests_passed = (
        test_flask_imports() and
        test_flask_jwt_extended_imports() and
        test_flask_sqlalchemy_imports() and
        test_flask_cors_imports() and
        test_werkzeug_imports()
    )
    
    if all_tests_passed:
        print("\n✅ All imports are working correctly!")
    else:
        print("\n❌ Some imports failed. Please check the error messages above.")
        print("You may need to install missing packages using pip:")
        print("pip install flask flask-jwt-extended flask-sqlalchemy flask-cors werkzeug")

if __name__ == "__main__":
    main()