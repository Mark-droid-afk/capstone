# ERP User API Contracts

This document outlines the API contracts for the ERP User Authentication and Management system.

## Authentication Endpoints

### Register
Registers a new ERP user.
- **Method:** `POST`
- **URL:** `/api/erp-auth/register`
- **Authorization:** Requires "Admin" role.
- **Request Body:**
  ```json
  {
    "firstName": "String",
    "lastName": "String",
    "email": "String",
    "appAccesses": [
      {
        "appName": "String",
        "modules": [
          {
            "moduleName": "String",
            "canRead": true,
            "canWrite": true,
            "canDelete": true,
            "canExport": true
          }
        ]
      }
    ]
  }
  ```
- **Responses:**
  - **200 OK:**
    ```json
    {
      "message": "User created successfully."
    }
    ```
  - **400 Bad Request:**
    ```json
    {
      "error": "Error message details"
    }
    ```

### Login
Authenticates an ERP user and returns their profile. Sets authentication cookies.
- **Method:** `POST`
- **URL:** `/api/erp-auth/login`
- **Request Body:**
  ```json
  {
    "username": "String",
    "password": "String"
  }
  ```
- **Responses:**
  - **200 OK:**
    ```json
    {
      "user": {
        "id": "Guid",
        "username": "String",
        "firstName": "String",
        "lastName": "String",
        "email": "String",
        "mustChangePassword": true,
        "roles": ["String"],
        "apps": [
          {
            "appName": "String",
            "modules": [
              {
                "moduleName": "String",
                "canRead": true,
                "canWrite": true,
                "canDelete": true,
                "canExport": true
              }
            ]
          }
        ]
      },
      "mustChangePassword": true
    }
    ```
  - **401 Unauthorized:**
    ```json
    {
      "error": "Invalid credentials."
    }
    ```

### Validate
Validates the current session (via cookies) and returns the ERP user's profile.
- **Method:** `GET`
- **URL:** `/api/erp-auth/validate`
- **Responses:**
  - **200 OK:**
    ```json
    {
      "user": {
        "id": "Guid",
        "username": "String",
        "firstName": "String",
        "lastName": "String",
        "email": "String",
        "mustChangePassword": false,
        "roles": ["String"],
        "apps": [...]
      }
    }
    ```
  - **401 Unauthorized:**
    ```json
    {
      "error": "Invalid or expired token."
    }
    ```

### Refresh Token
Refreshes the authentication token using a refresh token cookie.
- **Method:** `POST`
- **URL:** `/api/erp-auth/refresh`
- **Responses:**
  - **200 OK:**
    ```json
    {
      "message": "Token refreshed."
    }
    ```
  - **401 Unauthorized:**
    ```json
    {
      "error": "Invalid or expired refresh token."
    }
    ```

### Logout
Clears authentication cookies and logs out the user.
- **Method:** `POST`
- **URL:** `/api/erp-auth/logout`
- **Responses:**
  - **200 OK:**
    ```json
    {
      "message": "Logged out successfully."
    }
    ```
  - **401 Unauthorized:**
    ```json
    {
      "error": "Invalid or expired token."
    }
    ```

### Change Password
Allows an authenticated user to change their password.
- **Method:** `POST`
- **URL:** `/api/erp-auth/change-password`
- **Authorization:** Required (Authenticated).
- **Request Body:**
  ```json
  {
    "currentPassword": "String",
    "newPassword": "String"
  }
  ```
- **Responses:**
  - **200 OK:**
    ```json
    {
      "message": "Password changed successfully."
    }
    ```
  - **400 Bad Request:**
    ```json
    {
      "error": "Error message details"
    }
    ```
  - **401 Unauthorized:**
    ```json
    {
      "error": "Invalid or expired token."
    }
    ```

### Forgot Password
Initiates the password reset process for an ERP user.
- **Method:** `POST`
- **URL:** `/api/erp-auth/forgot-password`
- **Request Body:**
  ```json
  {
    "email": "String"
  }
  ```
- **Responses:**
  - **200 OK:**
    ```json
    {
      "message": "If the email exists, a reset link has been sent."
    }
    ```

### Reset Password
Resets the ERP user's password using a reset token.
- **Method:** `POST`
- **URL:** `/api/erp-auth/reset-password`
- **Request Body:**
  ```json
  {
    "email": "String",
    "token": "String",
    "newPassword": "String"
  }
  ```
- **Responses:**
  - **200 OK:**
    ```json
    {
      "message": "Password reset successfully."
    }
    ```
  - **400 Bad Request:**
    ```json
    {
      "error": "Error message details"
    }
    ```

## Admin Management Endpoints
*Note: These endpoints require "Admin" role authorization.*

### Get All ERP Users
Retrieves a list of all ERP users.
- **Method:** `GET`
- **URL:** `/api/erp-auth/users`
- **Responses:**
  - **200 OK:**
    ```json
    {
      "users": [
        {
          "id": "Guid",
          "username": "String",
          "firstName": "String",
          "lastName": "String",
          "email": "String",
          "mustChangePassword": true,
          "roles": ["String"],
          "apps": [...]
        }
      ]
    }
    ```

### Get ERP User By ID
Retrieves details for a specific ERP user.
- **Method:** `GET`
- **URL:** `/api/erp-auth/users/{id}`
- **Responses:**
  - **200 OK:**
    ```json
    {
      "user": {
        "id": "Guid",
        "username": "String",
        "firstName": "String",
        "lastName": "String",
        "email": "String",
        "mustChangePassword": true,
        "roles": ["String"],
        "apps": [...]
      }
    }
    ```
  - **404 Not Found:**
    ```json
    {
      "error": "User not found."
    }
    ```

### Update ERP User
Updates an ERP user's information and access rights.
- **Method:** `PATCH`
- **URL:** `/api/erp-auth/users/{id}`
- **Request Body:**
  ```json
  {
    "firstName": "String",
    "lastName": "String",
    "email": "String",
    "isActive": true,
    "roles": ["String"],
    "appAccesses": [
      {
        "appName": "String",
        "modules": [
          {
            "moduleName": "String",
            "canRead": true,
            "canWrite": true,
            "canDelete": true,
            "canExport": true
          }
        ]
      }
    ]
  }
  ```
- **Responses:**
  - **200 OK:**
    ```json
    {
      "message": "User updated successfully."
    }
    ```
  - **400 Bad Request:**
    ```json
    {
      "error": "Error message details"
    }
    ```

### Delete ERP User
Deactivates an ERP user.
- **Method:** `DELETE`
- **URL:** `/api/erp-auth/users/{id}`
- **Responses:**
  - **200 OK:**
    ```json
    {
      "message": "User deactivated successfully."
    }
    ```
  - **404 Not Found:**
    ```json
    {
      "error": "User not found."
    }
    ```
