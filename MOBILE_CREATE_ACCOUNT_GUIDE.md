# Mobile Create Account Implementation Guide

This guide explains how to implement the **Create Account** flow in the mobile application. The process consists of two steps:
1.  **Registration Request**: Send user details to the server. The server verifies uniqueness and sends an OTP (currently logged to server console).
2.  **OTP Verification**: Submit the received OTP to create the account.

## API Overview

### Step 1: Request Registration

**Endpoint:** `POST /api/auth/register`

**Body:**
```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "securePassword",
  "mobile": "0912345678"
}
```

**Response:**
*   Success (200): `{ "message": "OTP sent successfully" }`
*   Error (400): `{ "error": "User with this email or mobile already exists" }`

### Step 2: Verify OTP

**Endpoint:** `POST /api/auth/verify-otp`

**Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Response:**
*   Success (200): `{ "message": "User verified and created successfully", "userId": 123 }`
*   Error (400): `{ "error": "Invalid OTP" }`

---

## Flutter Implementation

Below is a complete example of a `RegisterScreen` that handles both steps (Form Input -> OTP Input).

### Dependencies
Ensure you have the `http` package in your `pubspec.yaml`:
```yaml
dependencies:
  http: ^1.2.0
```

### Code Example

```dart
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  // Base URL - Change this to your server IP
  final String baseUrl = 'http://192.168.1.XX:3000'; 
  
  final _formKey = GlobalKey<FormState>();
  
  // Controllers
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _mobileController = TextEditingController();
  final _passwordController = TextEditingController();
  final _otpController = TextEditingController();

  // State
  bool _isLoading = false;
  bool _isOtpSent = false;
  String? _errorMessage;

  // Step 1: Send Registration Request
  Future<void> _register() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'name': _nameController.text,
          'email': _emailController.text,
          'password': _passwordController.text,
          'mobile': _mobileController.text,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        setState(() {
          _isOtpSent = true;
          _isLoading = false;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('OTP sent! Check server console.')),
        );
      } else {
        setState(() {
          _errorMessage = data['error'] ?? 'Registration failed';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Network error: $e';
        _isLoading = false;
      });
    }
  }

  // Step 2: Verify OTP
  Future<void> _verifyOtp() async {
    if (_otpController.text.length != 6) {
      setState(() => _errorMessage = 'OTP must be 6 digits');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final response = await http.post(
        Uri.parse('$baseUrl/api/auth/verify-otp'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': _emailController.text,
          'otp': _otpController.text,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        // Success! Navigate to Login or Home
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Account Created Successfully!')),
        );
        // Navigator.pushReplacementNamed(context, '/login');
      } else {
        setState(() {
          _errorMessage = data['error'] ?? 'Verification failed';
        });
      }
    } catch (e) {
      setState(() {
        _errorMessage = 'Network error: $e';
      });
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Account')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (_errorMessage != null)
                Padding(
                  padding: const EdgeInsets.only(bottom: 16.0),
                  child: Text(
                    _errorMessage!,
                    style: const TextStyle(color: Colors.red),
                    textAlign: TextAlign.center,
                  ),
                ),
              
              if (!_isOtpSent) ...[
                // Registration Form
                TextFormField(
                  controller: _nameController,
                  decoration: const InputDecoration(labelText: 'Full Name'),
                  validator: (v) => v!.isEmpty ? 'Required' : null,
                ),
                TextFormField(
                  controller: _emailController,
                  decoration: const InputDecoration(labelText: 'Email'),
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) => v!.contains('@') ? null : 'Invalid email',
                ),
                TextFormField(
                  controller: _mobileController,
                  decoration: const InputDecoration(labelText: 'Mobile'),
                  keyboardType: TextInputType.phone,
                  validator: (v) => v!.length >= 10 ? null : 'Min 10 digits',
                ),
                TextFormField(
                  controller: _passwordController,
                  decoration: const InputDecoration(labelText: 'Password'),
                  obscureText: true,
                  validator: (v) => v!.length >= 6 ? null : 'Min 6 chars',
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _isLoading ? null : _register,
                  child: _isLoading 
                    ? const CircularProgressIndicator() 
                    : const Text('Next'),
                ),
              ] else ...[
                // OTP Verification Form
                Text(
                  'Enter OTP sent to ${_emailController.text}',
                  textAlign: TextAlign.center,
                  style: Theme.of(context).textTheme.titleMedium,
                ),
                const SizedBox(height: 20),
                TextFormField(
                  controller: _otpController,
                  decoration: const InputDecoration(
                    labelText: '6-Digit OTP',
                    letterSpacing: 4,
                  ),
                  keyboardType: TextInputType.number,
                  maxLength: 6,
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: _isLoading ? null : _verifyOtp,
                  child: _isLoading 
                    ? const CircularProgressIndicator() 
                    : const Text('Verify & Create Account'),
                ),
                TextButton(
                  onPressed: () => setState(() => _isOtpSent = false),
                  child: const Text('Back to details'),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
```
