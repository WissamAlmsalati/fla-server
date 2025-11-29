# Flutter API Implementation Guide

This guide details how to implement the authentication flow (Register, OTP Verification, Login) in the Flutter mobile application.

## Base URL
Ensure your API client is configured with the correct base URL.
- Development: `http://<your-local-ip>:3000` (e.g., `http://192.168.1.5:3000`)
- Production: `https://your-domain.com`

## Authentication Flow

### 1. Registration
Initiate the registration process by sending user details. This will trigger an OTP generation (currently logged to server console).

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "mobile": "0912345678"
}
```

**Response (Success - 200):**
```json
{
  "message": "OTP sent successfully"
}
```

**Response (Error - 400):**
```json
{
  "error": "User with this email or mobile already exists"
}
```

**Flutter Implementation Snippet:**
```dart
Future<void> register(String name, String email, String password, String mobile) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/auth/register'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'name': name,
      'email': email,
      'password': password,
      'mobile': mobile,
    }),
  );

  if (response.statusCode == 200) {
    // Navigate to OTP Screen
  } else {
    // Show error message
    print(jsonDecode(response.body)['error']);
  }
}
```

---

### 2. OTP Verification
Verify the OTP sent to the user. If successful, the user account is created.

**Endpoint:** `POST /api/auth/verify-otp`

**Request Body:**
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

**Response (Success - 200):**
```json
{
  "message": "User verified and created successfully",
  "userId": 123
}
```

**Response (Error - 400/404):**
```json
{
  "error": "Invalid OTP" // or "OTP expired", "Registration request not found"
}
```

**Flutter Implementation Snippet:**
```dart
Future<void> verifyOtp(String email, String otp) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/auth/verify-otp'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'email': email,
      'otp': otp,
    }),
  );

  if (response.statusCode == 200) {
    // Navigate to Login Screen or Auto-login
  } else {
    // Show error message
    print(jsonDecode(response.body)['error']);
  }
}
```

---

### 3. Login
Authenticate the user and receive an access token.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (Success - 200):**
```json
{
  "message": "Authenticated",
  "accessToken": "ey...",
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "CUSTOMER",
    "customerId": 45
  }
}
```

**Flutter Implementation Snippet:**
```dart
Future<void> login(String email, String password) async {
  final response = await http.post(
    Uri.parse('$baseUrl/api/auth/login'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'email': email,
      'password': password,
    }),
  );

  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    final token = data['accessToken'];
    // Store token securely (e.g., using flutter_secure_storage)
    // Navigate to Home Screen
  } else {
    // Show error message
    print(jsonDecode(response.body)['error']);
  }
}
```

## Notes
- **OTP Delivery**: Currently, the OTP is logged to the server console. In production, integrate an SMS provider (e.g., Twilio) in `src/app/api/auth/register/route.ts`.
- **Security**: Ensure you use HTTPS in production.
- **Token Management**: The login response includes an `accessToken`. Include this token in the `Authorization` header for protected routes: `Authorization: Bearer <token>`.

---

### 4. Order Statistics
Get statistics about the user's orders, including total count, status breakdown, and country breakdown.

**Important:** This endpoint automatically returns statistics for the authenticated user only (based on the auth token). The API reads the user's ID from the JWT token and calculates statistics for their orders only.

**Endpoint:** `GET /api/orders/stats`

**Headers:**
- `Authorization`: `Bearer <your_access_token>`

**Response (Success - 200):**
```json
{
  "data": {
    "total": 15,
    "byStatus": {
      "purchased": 5,
      "arrived_to_china": 3,
      "shipping_to_libya": 2,
      "arrived_libya": 4,
      "delivered": 1
    },
    "byCountry": {
      "CHINA": 10,
      "TURKEY": 5
    }
  }
}
```

**Flutter Implementation Snippet:**
```dart
Future<Map<String, dynamic>> getOrderStats() async {
  final token = await storage.read(key: 'auth_token'); // Retrieve token
  final response = await http.get(
    Uri.parse('$baseUrl/api/orders/stats'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body)['data'];
  } else {
    throw Exception('Failed to load order stats');
  }
}
```

---

### 5. Get Orders by Status
Fetch a list of orders filtered by a specific status. This is useful when a user clicks on a status statistic (e.g., "Arrived to China") to see the relevant orders.

**Important:** This endpoint automatically returns only the orders belonging to the authenticated user (based on the auth token). You  don't need to pass a user ID - the API reads the user's ID from the JWT token and filters orders accordingly.

**Endpoint:** `GET /api/orders`

**Query Parameters:**
- `status`: The status to filter by (e.g., `purchased`, `arrived_to_china`, `shipping_to_libya`, `arrived_libya`, `delivered`).
- `limit`: (Optional) Number of items per page (default: 20).
- `cursor`: (Optional) ID of the last item from the previous page for pagination.

**Headers:**
- `Authorization`: `Bearer <your_access_token>`

**Example Request:**
`GET /api/orders?status=arrived_to_china`

**Response (Success - 200):**
```json
{
  "data": [
    {
      "id": 101,
      "trackingNumber": "TRK123456",
      "name": "Wireless Headphones",
      "status": "arrived_to_china",
      "usdPrice": 50.0,
      "createdAt": "2023-10-25T10:00:00.000Z",
      // ... other order fields
    },
    // ... more orders
  ],
  "meta": {
    "nextCursor": 95,
    "hasMore": true
  }
}
```

**Flutter Implementation Snippet:**
```dart
Future<List<dynamic>> getOrdersByStatus(String status, {int? cursor}) async {
  final token = await storage.read(key: 'auth_token');
  
  String url = '$baseUrl/api/orders?status=$status';
  if (cursor != null) {
    url += '&cursor=$cursor';
  }

  final response = await http.get(
    Uri.parse(url),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body)['data'];
  } else {
    throw Exception('Failed to load orders');
  }
}
```

---

### 6. Get Wallet Balances
Get the authenticated user's wallet balances for all three currencies (USD, LYD, CNY).

**Important:** This endpoint automatically returns wallet information for the authenticated customer based on the auth token.

**Endpoint:** `GET /api/wallet`

**Headers:**
- `Authorization`: `Bearer <your_access_token>`

**Response (Success - 200):**
```json
{
  "data": {
    "customerId": 45,
    "customerName": "John Doe",
    "customerCode": "KO219-FLL1",
    "wallets": {
      "USD": {
        "currency": "USD",
        "balance": 150.50,
        "symbol": "$"
      },
      "LYD": {
        "currency": "LYD",
        "balance": 500.00,
        "symbol": "د.ل"
      },
      "CNY": {
        "currency": "CNY",
        "balance": 1200.75,
        "symbol": "¥"
      }
    }
  }
}
```

**Flutter Implementation Snippet:**
```dart
Future<Map<String, dynamic>> getWallet() async {
  final token = await storage.read(key: 'auth_token');
  
  final response = await http.get(
    Uri.parse('$baseUrl/api/wallet'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body)['data'];
  } else {
    throw Exception('Failed to load wallet');
  }
}
```

---

### 7. Get Transaction History
Get the authenticated user's transaction history with optional filters.

**Important:** This endpoint automatically returns transactions for the authenticated customer based on the auth token. You don't need to pass a customerId.

**Endpoint:** `GET /api/transactions`

**Query Parameters (all optional):**
- `currency`: Filter by currency (`USD`, `LYD`, or `CNY`)
- `type`: Filter by transaction type (`DEPOSIT` or `WITHDRAWAL`)
- `startDate`: Filter from this date (ISO 8601 format)
- `endDate`: Filter until this date (ISO 8601 format)
- `search`: Search in transaction notes

**Headers:**
- `Authorization`: `Bearer <your_access_token>`

**Example Request:**
`GET /api/transactions?currency=USD&type=DEPOSIT`

**Response (Success - 200):**
```json
[
  {
    "id": 101,
    "customerId": 45,
    "type": "DEPOSIT",
    "amount": 100.00,
    "currency": "USD",
    "balanceBefore": 50.50,
    "balanceAfter": 150.50,
    "notes": "Initial deposit",
    "createdBy": 1,
    "createdAt": "2023-11-25T10:30:00.000Z"
  },
  {
    "id": 100,
    "customerId": 45,
    "type": "WITHDRAWAL",
    "amount": 25.00,
    "currency": "USD",
    "balanceBefore": 75.50,
    "balanceAfter": 50.50,
    "notes": "Order payment",
    "createdBy": 1,
    "createdAt": "2023-11-24T15:20:00.000Z"
  }
]
```

**Flutter Implementation Snippet:**
```dart
Future<List<dynamic>> getTransactions({
  String? currency,
  String? type,
  String? startDate,
  String? endDate,
}) async {
  final token = await storage.read(key: 'auth_token');
  
  String url = '$baseUrl/api/transactions';
  List<String> params = [];
  
  if (currency != null) params.add('currency=$currency');
  if (type != null) params.add('type=$type');
  if (startDate != null) params.add('startDate=$startDate');
  if (endDate != null) params.add('endDate=$endDate');
  
  if (params.isNotEmpty) {
    url += '?${params.join('&')}';
  }

  final response = await http.get(
    Uri.parse(url),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
  );

  if (response.statusCode == 200) {
    return jsonDecode(response.body);
  } else {
    throw Exception('Failed to load transactions');
  }
}
```
