# MySQL Admin Login for Job Portal

This document provides instructions for setting up and using MySQL for admin login in the Job Portal application.

## Overview

The Job Portal application has been updated to use MySQL for admin authentication. This provides several benefits:

1. **Enhanced Security**: Admin credentials are stored in a separate MySQL database
2. **Better Performance**: MySQL is optimized for high-performance authentication
3. **Scalability**: MySQL can handle a large number of users and authentication requests

## Setup Instructions

### 1. Install MySQL

If you don't have MySQL installed, you can download it from the [official MySQL website](https://dev.mysql.com/downloads/mysql/).

### 2. Create MySQL Database and Tables

Run the provided batch file to initialize the MySQL database and tables:

```
init-mysql.bat
```

This will:
- Prompt you for MySQL credentials
- Create a database named `jobportal` (or the name you specify)
- Create all necessary tables
- Create an admin user with email `srikanthveera160@gmail.com`
- Create a sample job

### 3. Start the Application with MySQL

Use the provided batch file to start the application with MySQL:

```
start-with-mysql.bat
```

This will:
- Prompt you for MySQL credentials
- Set the necessary environment variables
- Start the backend server with MySQL support
- Start the frontend server

### 4. Start the Application with SQLite (Fallback)

If you encounter issues with MySQL or prefer to use SQLite, you can use:

```
start-with-sqlite.bat
```

This will start the application using SQLite instead of MySQL.

### 5. Manual Configuration

You can manually configure the MySQL connection by setting environment variables:

- `MYSQL_USER`: MySQL username (default: root)
- `MYSQL_PASSWORD`: MySQL password (default: empty)
- `MYSQL_HOST`: MySQL host (default: localhost)
- `MYSQL_PORT`: MySQL port (default: 3306)
- `MYSQL_DATABASE`: MySQL database name (default: jobportal)
- `USE_MYSQL`: Set to 'true' to use MySQL, 'false' to use SQLite (default: false)

Example:

```
set MYSQL_USER=root
set MYSQL_PASSWORD=your_password
set MYSQL_HOST=localhost
set MYSQL_PORT=3306
set MYSQL_DATABASE=jobportal
set USE_MYSQL=true
```

## How It Works

The application now uses a hybrid approach for authentication:

1. **Admin Login**: Uses direct MySQL connection for authentication
   - Checks if admin exists in MySQL database
   - Creates admin user if it doesn't exist
   - Falls back to SQLAlchemy if MySQL connection fails

2. **Regular User Login**: Uses SQLAlchemy (unchanged)
   - Regular users are still authenticated using SQLAlchemy and SQLite

## Troubleshooting

### MySQL Connection Issues

If you encounter MySQL connection issues:

1. **Check MySQL Server**: Make sure MySQL server is running
2. **Check Credentials**: Verify MySQL username and password
3. **Check Database**: Ensure the `jobportal` database exists
4. **Check Permissions**: Ensure the MySQL user has appropriate permissions

### Admin Login Issues

If you have issues with admin login:

1. **Reset Admin Password**: You can reset the admin password by running:
   ```sql
   UPDATE user SET password = 'new_hashed_password' WHERE email = 'srikanthveera160@gmail.com';
   ```
   (Use `generate_password_hash` to create the hashed password)

2. **Check Admin User**: Verify the admin user exists in the MySQL database:
   ```sql
   SELECT * FROM user WHERE email = 'srikanthveera160@gmail.com';
   ```

3. **Check Admin Role**: Ensure the admin user has the correct role and permissions:
   ```sql
   UPDATE user SET is_admin = 1, role = 'Super Admin' WHERE email = 'srikanthveera160@gmail.com';
   ```

## Manual Database Setup

If you prefer to set up the database manually, you can use the following SQL commands:

```sql
-- Create database
CREATE DATABASE IF NOT EXISTS jobportal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use database
USE jobportal;

-- Create user table
CREATE TABLE IF NOT EXISTS user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    full_name VARCHAR(120),
    phone VARCHAR(30),
    location VARCHAR(120),
    role VARCHAR(50) DEFAULT 'User',
    resume_headline VARCHAR(255) DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create admin user
INSERT INTO user (email, password, is_admin, full_name, role, resume_headline)
VALUES ('srikanthveera160@gmail.com', 'hashed_password', 1, 'Srikanth Veera', 'Super Admin', '');
```

Replace `'hashed_password'` with the actual hashed password generated using `generate_password_hash('Srikanth@123')`.

## Security Considerations

1. **Password Storage**: Passwords are stored as hashed values using Werkzeug's `generate_password_hash` function
2. **Connection Security**: Consider using SSL/TLS for MySQL connections in production
3. **Environment Variables**: Store sensitive information like database credentials in environment variables
4. **Firewall Rules**: Restrict access to the MySQL server using firewall rules