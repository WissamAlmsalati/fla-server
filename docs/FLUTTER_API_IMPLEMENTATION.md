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
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
    "data": {
        "total": 15,
        "statusList": [
            {
                "id": "purchased",
                "label": "تم الشراء",
                "count": 5
            },
            {
                "id": "arrived_to_china",
                "label": "وصل إلى المخزن",
                "count": 3
            },
            {
                "id": "shipping_to_libya",
                "label": "قيد الشحن لليبيا",
                "count": 2
            },
            {
                "id": "arrived_libya",
                "label": "وصل إلى ليبيا",
                "count": 1
            },
            {
                "id": "ready_for_pickup",
                "label": "جاهز للاستلام",
                "count": 2
            },
            {
                "id": "delivered",
                "label": "تم التسليم",
                "count": 2
            }
        ],
        "countryList": [
            {
                "id": "CHINA",
                "label": "الصين",
                "count": 10
            },
            {
                "id": "TURKEY",
                "label": "تركيا",
                "count": 3
            },
            {
                "id": "DUBAI",
                "label": "دبي",
                "count": 2
            }
        ],
        // Legacy fields (kept for backward compatibility)
        "byStatus": {
            "purchased": 5,
            "arrived_to_china": 3,
            "shipping_to_libya": 2,
            "arrived_libya": 4,
            "delivered": 1
        },
        "byCountry": {
            "CHINA": 10,
            "TURKEY": 3,
            "DUBAI": 2
        }
    }
}
```

**Flutter Implementation:**

Use `statusList` and `countryList` to build your UI. When a user taps an item, use the `id` field to filter the orders list.

```dart
// Model for stats item
class StatsItem {
  final String id;
  final String label;
  final int count;

  StatsItem({required this.id, required this.label, required this.count});

  factory StatsItem.fromJson(Map<String, dynamic> json) {
    return StatsItem(
      id: json['id'],
      label: json['label'],
      count: json['count'],
    );
  }
}

// In your repository
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

}
```

---

### 8. Chat Implementation (Real-time)
Implement real-time chat functionality for a specific order.

#### A. Get Messages (REST)
Fetch the initial list of messages.

**Endpoint:** `GET /api/orders/:orderId/messages`
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "content": "Hello, when will my order arrive?",
      "imageUrl": null,
      "createdAt": "2023-11-25T10:30:00.000Z",
      "authorId": 45,
      "author": {
        "id": 45,
        "name": "John Doe",
        "role": "CUSTOMER"
      },
      "replyToId": null
    }
  ]
}
```

#### B. Send Message
Send a text message or an image.

**Endpoint:** `POST /api/orders/:orderId/messages`
**Headers:** `Authorization: Bearer <token>`
**Content-Type:** `multipart/form-data`

**Body Fields:**
- `content`: (String) The message text (required if no image).
- `image`: (File) Image file (optional).
- `replyToId`: (Number) ID of the message being replied to (optional).

#### C. Real-time Stream (SSE)
Subscribe to real-time updates for new messages and user presence.

**Endpoint:** `GET /api/orders/:orderId/messages/stream?token=<your_access_token>`

**IMPORTANT:** 
- The auth token MUST be passed as a query parameter `token` (not in headers)
- This is because EventSource/SSE does not support custom headers
- Make sure to URL-encode the token if it contains special characters

**Event Data Format:**
The stream sends a JSON object containing the full list of messages and online users every 3 seconds.
```json
{
  "messages": [ ... ], // Array of message objects (same as REST response)
  "onlineUsers": [ 1, 45 ] // Array of user IDs currently viewing the chat
}
```

**Flutter Implementation:**

**Option 1: Using flutter_client_sse package**

Add to `pubspec.yaml`:
```yaml
dependencies:
  flutter_client_sse: ^2.0.0
```

```dart
import 'package:flutter_client_sse/flutter_client_sse.dart';

class ChatService {
  StreamSubscription? _sseSubscription;

  // Subscribe to Stream
  void subscribeToChat(int orderId, Function(List<Message>, List<int>) onUpdate) async {
    final token = await storage.read(key: 'auth_token');
    
    // Unsubscribe from previous connection if any
    _sseSubscription?.cancel();
    
    _sseSubscription = SSEClient.subscribeToSSE(
      method: SSERequestType.GET,
      url: '$baseUrl/api/orders/$orderId/messages/stream?token=$token',
      header: {
        'Accept': 'text/event-stream',
      },
    ).listen(
      (event) {
        print('SSE Event received: ${event.data}');
        if (event.data != null && event.data!.isNotEmpty) {
          try {
            final data = jsonDecode(event.data!);
            
            // Parse messages
            final messages = (data['messages'] as List)
                .map((m) => Message.fromJson(m))
                .toList();
                
            // Parse online users
            final onlineUsers = (data['onlineUsers'] as List).cast<int>();
            
            onUpdate(messages, onlineUsers);
          } catch (e) {
            print('Error parsing SSE data: $e');
          }
        }
      },
      onError: (error) {
        print('SSE Error: $error');
      },
    );
  }
  
  // Unsubscribe
  void unsubscribe() {
    _sseSubscription?.cancel();
    _sseSubscription = null;
  }
}
```

**Option 2: Using http package with manual streaming (More reliable)**

```dart
import 'dart:async';
import 'dart:convert';
import 'package:http/http.dart' as http;

class ChatService {
  http.Client? _client;
  StreamSubscription? _streamSubscription;

  // Subscribe to Stream
  Future<void> subscribeToChat(
    int orderId, 
    Function(List<Message>, List<int>) onUpdate
  ) async {
    final token = await storage.read(key: 'auth_token');
    
    // Close previous connection
    await unsubscribe();
    
    _client = http.Client();
    
    final request = http.Request(
      'GET',
      Uri.parse('$baseUrl/api/orders/$orderId/messages/stream?token=$token'),
    );
    
    request.headers['Accept'] = 'text/event-stream';
    request.headers['Cache-Control'] = 'no-cache';
    
    final response = await _client!.send(request);
    
    if (response.statusCode == 200) {
      _streamSubscription = response.stream
          .transform(utf8.decoder)
          .transform(LineSplitter())
          .listen(
            (line) {
              if (line.startsWith('data: ')) {
                final jsonData = line.substring(6); // Remove 'data: ' prefix
                try {
                  final data = jsonDecode(jsonData);
                  
                  final messages = (data['messages'] as List)
                      .map((m) => Message.fromJson(m))
                      .toList();
                      
                  final onlineUsers = (data['onlineUsers'] as List).cast<int>();
                  
                  onUpdate(messages, onlineUsers);
                } catch (e) {
                  print('Error parsing SSE data: $e');
                }
              }
            },
            onError: (error) {
              print('Stream error: $error');
            },
            onDone: () {
              print('Stream closed');
            },
          );
    } else {
      print('Failed to connect to SSE: ${response.statusCode}');
    }
  }
  
  // Unsubscribe
  Future<void> unsubscribe() async {
    await _streamSubscription?.cancel();
    _streamSubscription = null;
    _client?.close();
    _client = null;
  }
}
```

**Option 3: Send Message**
  Future<void> sendMessage(int orderId, String content, {File? image, int? replyToId}) async {
    final token = await storage.read(key: 'auth_token');
    var request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/api/orders/$orderId/messages'),
    );

    request.headers['Authorization'] = 'Bearer $token';
    request.fields['content'] = content;
    
    if (replyToId != null) {
      request.fields['replyToId'] = replyToId.toString();
    }

    if (image != null) {
      request.files.add(await http.MultipartFile.fromPath('image', image.path));
    }

    final response = await request.send();
    if (response.statusCode != 201) {
      throw Exception('Failed to send message');
    }
  }

  // 2. Subscribe to Stream
  void subscribeToChat(int orderId, Function(List<Message>, List<int>) onUpdate) async {
    final token = await storage.read(key: 'auth_token');
    
    SSEClient.subscribeToSSE(
      method: SSEMethod.GET,
      url: '$baseUrl/api/orders/$orderId/messages/stream?token=$token',
      header: {},
    ).listen((event) {
      if (event.data != null && event.data!.isNotEmpty) {
        final data = jsonDecode(event.data!);
        
        // Parse messages
        final messages = (data['messages'] as List)
            .map((m) => Message.fromJson(m))
            .toList();
            
        // Parse online users
        final onlineUsers = (data['onlineUsers'] as List).cast<int>();
        
        onUpdate(messages, onlineUsers);
      }
    });
  }
  
  // 3. Unsubscribe
  void unsubscribe() {
    SSEClient.unsubscribeFromSSE();
  }
}
```
