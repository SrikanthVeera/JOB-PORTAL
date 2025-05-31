from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS with specific configuration
CORS(app, supports_credentials=True, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
}, expose_headers=["Content-Type", "Authorization"])

# Add CORS headers to all responses
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Credentials'] = 'true'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    return response

@app.route('/cors-test', methods=['GET', 'OPTIONS'])
def cors_test():
    if request.method == 'OPTIONS':
        return '', 200
    return jsonify({
        'message': 'CORS test successful',
        'status': 'OK',
        'headers_received': dict(request.headers)
    })

@app.route('/api/jobs', methods=['GET'])
def get_jobs():
    return jsonify({
        'jobs': [
            {
                'id': 1,
                'company': 'Test Company',
                'title': 'Test Job',
                'description': 'This is a test job',
                'location': 'Remote',
                'salary': '$100,000',
                'tags': ['test', 'job'],
                'date_posted': '01 Jan, 2023',
                'admin_id': 1
            }
        ]
    })

if __name__ == '__main__':
    from flask import request
    app.run(host='0.0.0.0', port=5001, debug=True)