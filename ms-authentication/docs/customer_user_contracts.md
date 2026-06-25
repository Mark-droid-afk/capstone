# Customer User API Contracts

This document outlines the API contracts for the Customer Authentication and Management system.

## Authentication Endpoints

### Register
Registers a new customer user.
- **Method:** `POST`
- **URL:** `/api/customer-auth/register`
- **Request Body:**
  ```json
  {
    "firstName": "String",
    "lastName": "String",
    "email": "String",
    "password": "String"
  }
  ```
- **Responses:**
  - **200 OK:**
    ```json
    {
      "message": "Registration successful. Please check your email to confirm your account."
    }
    ```
  - **400 Bad Request:**
    ```json
    {
      "error": "Error message details"
    }
    ```

### Confirm Email
Confirms a customer's email address using a token.
- **Method:** `GET`
- **URL:** `/api/customer-auth/confirm-email`
- **Query Parameters:**
  - `email`: Customer's email address
  - `token`: Confirmation token sent via email
- **Responses:**
  - **200 OK:**
    ```json
    {
      "message": "Email confirmed successfully."
    }
    ```
  - **400 Bad Request:**
    ```json
    {
      "error": "Invalid token or email"
    }
    ```

### Login
Authenticates a customer and returns their profile. Sets authentication cookies.
- **Method:** `POST`
- **URL:** `/api/customer-auth/login`
- **Request Body:**
  ```json
  {
    "email": "String",
    "password": "String"
  }
  ```
- **Responses:**
  - **200 OK:**
    ```json
    {
      "customer": {
        "id": "Guid",
        "firstName": "String",
        "lastName": "String",
        "email": "String",
        "emailConfirmed": true
      }
    }
    ```
  - **401 Unauthorized:**
    ```json
    {
      "error": "Invalid credentials or email not confirmed."
    }
    ```

### Validate
Validates the current session (via cookies) and returns the customer's profile.
- **Method:** `GET`
- **URL:** `/api/customer-auth/validate`
- **Responses:**
  - **200 OK:**
    ```json
    {
      "customer": {
        "id": "Guid",
        "firstName": "String",
        "lastName": "String",
        "email": "String",
        "emailConfirmed": true
      }
    }
    ```
  - **401 Unauthorized:** (No body)

### Refresh Token
Refreshes the authentication token using a refresh token cookie.
- **Method:** `POST`
- **URL:** `/api/customer-auth/refresh`
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
- **URL:** `/api/customer-auth/logout`
- **Responses:**
  - **200 OK:**
    ```json
    {
      "message": "Logged out successfully."
    }
    ```

### Forgot Password
Initiates the password reset process by sending an email.
- **Method:** `POST`
- **URL:** `/api/customer-auth/forgot-password`
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
Resets the customer's password using a reset token.
- **Method:** `POST`
- **URL:** `/api/customer-auth/reset-password`
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

### Google Login
Redirects the user to Google for authentication.
- **Method:** `GET`
- **URL:** `/api/customer-auth/google`
- **Responses:**
  - **302 Found:** Redirects to Google login page.

### Google Callback
Callback endpoint for Google authentication.
- **Method:** `GET`
- **URL:** `/api/customer-auth/google/callback`
- **Responses:**
  - **302 Found:** Redirects back to the frontend application callback URL.
  - **401 Unauthorized:**
    ```json
    {
      "error": "Google authentication failed."
    }
    ```

## Admin Management Endpoints
*Note: These endpoints require "Admin" role authorization.*

### Get All Customers
Retrieves a list of all registered customers.
- **Method:** `GET`
- **URL:** `/api/customer-auth/customers`
- **Responses:**
  - **200 OK:**
    ```json
    {
      "customers": [
        {
          "id": "Guid",
          "firstName": "String",
          "lastName": "String",
          "email": "String",
          "emailConfirmed": true
        }
      ]
    }
    ```

### Get Customer By ID
Retrieves details for a specific customer.
- **Method:** `GET`
- **URL:** `/api/customer-auth/customers/{id}`
- **Responses:**
  - **200 OK:**
    ```json
    {
      "customer": {
        "id": "Guid",
        "firstName": "String",
        "lastName": "String",
        "email": "String",
        "emailConfirmed": true
      }
    }
    ```
  - **404 Not Found:**
    ```json
    {
      "error": "Customer not found."
    }
    ```

### Update Customer
Updates a customer's information.
- **Method:** `PATCH`
- **URL:** `/api/customer-auth/customers/{id}`
- **Request Body:**
  ```json
  {
    "firstName": "String",
    "lastName": "String",
    "email": "String"
  }
  ```
- **Responses:**
  - **200 OK:**
    ```json
    {
      "message": "Customer updated successfully."
    }
    ```
  - **400 Bad Request:**
    ```json
    {
      "error": "Error message details"
    }
    ```

### Delete Customer
Deactivates a customer account.
- **Method:** `DELETE`
- **URL:** `/api/customer-auth/customers/{id}`
- **Responses:**
  - **200 OK:**
    ```json
    {
      "message": "Customer deactivated successfully."
    }
    ```
  - **404 Not Found:**
    ```json
    {
      "error": "Customer not found."
    }
    ```
