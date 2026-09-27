# Interview Defense & Concept Master Guide
## Employee Directory with Role-Based Access Control (RBAC)

This guide is designed to prepare you to defend every architectural decision, code pattern, and interview question regarding this project with confidence.

---

## 1. Authentication vs Authorization (The #1 Question)

| Dimension | Authentication (AuthN) | Authorization (AuthZ) |
| :--- | :--- | :--- |
| **Question answered** | *"Who are you?"* | *"What are you allowed to do?"* |
| **Mechanism** | Email + Password verification, issuing JWT token | Checking user's role (`Admin` vs `Viewer`) against resource |
| **HTTP Failure Code** | **`401 Unauthorized`** (actually means Unauthenticated) | **`403 Forbidden`** (Authenticated, but rights denied) |
| **In this project** | `POST /api/auth/login`, `protect` middleware verifying JWT | `authorize('Admin')` middleware rejecting Viewer mutations |

### Potential Trap Question:
> *"Why did you return HTTP 403 instead of HTTP 401 when a Viewer tries to delete an employee?"*
- **Your Defense**:
  *"HTTP 401 indicates that the client is not authenticated (the token is missing, corrupted, or expired). The user must log in. In contrast, HTTP 403 means the server knows who the user is (they are authenticated), but their permissions (role: 'Viewer') do not grant them rights to mutate this resource. Returning 401 here would incorrectly prompt the user to re-login, when in reality their identity is valid but their role is insufficient."*

---

## 2. JWT (JSON Web Tokens) Deep Dive

### What is a JWT?
A JWT consists of 3 base64url-encoded parts separated by dots (`.`):
`header.payload.signature`

1. **Header**: Algorithmic metadata (e.g., `{"alg": "HS256", "typ": "JWT"}`).
2. **Payload**: Claims and public identity data (e.g., `{ "id": "...", "role": "Admin", "exp": 1718000000 }`).
   - *Note*: Anyone who inspects the token can decode and read the payload. Therefore, **never put sensitive secrets or passwords inside the JWT payload!**
3. **Signature**: Cryptographic proof calculated by taking `HMACSHA256(base64(header) + "." + base64(payload), JWT_SECRET)`.
   - If an attacker tampers with the payload (e.g., changing `"role": "Viewer"` to `"role": "Admin"`), the signature becomes invalid because the attacker does not have `JWT_SECRET`. The backend detects this and throws `JsonWebTokenError`.

### Why Stateless JWT over Stateful Sessions?
- **Sessions**: Require storing session IDs in a central store (like Redis or MongoDB) that must be queried on every single incoming HTTP request.
- **JWT**: Completely stateless. The backend server verifies the cryptographic signature with the secret key locally in CPU memory without needing any database query. This enables seamless horizontal scaling across multiple server instances.

### Token Storage Tradeoffs (Interviewer Favorite):
- **LocalStorage**:
  - *Pros*: Simple, easy to access from JavaScript, immune to CSRF.
  - *Cons*: Vulnerable to XSS (Cross-Site Scripting) if malicious scripts run.
- **HttpOnly Cookies**:
  - *Pros*: JavaScript cannot access the cookie, protecting against XSS token theft.
  - *Cons*: Vulnerable to CSRF (Cross-Site Request Forgery), requiring CSRF tokens or `SameSite: Strict`.
- **In-Memory + Refresh Token**:
  - Store short-lived access token in React state (memory), store long-lived refresh token in HttpOnly cookie.

---

## 3. Password Hashing with Bcrypt

### Why Bcrypt instead of SHA-256 or MD5?
1. **MD5 and SHA-256 are fast cryptographic hashes**: They were engineered for high-speed file checksums. Modern GPUs can calculate billions of SHA-256 hashes per second, making brute-force dictionary attacks and rainbow tables trivial.
2. **Bcrypt is an adaptive key-derivation function**: It includes a **work factor (cost / salt rounds)**. We used `10` rounds, meaning \(2^{10} = 1024\) iterations of the Blowfish cipher. It is intentionally slow (taking ~50-100ms per check), making brute force computationally unfeasible.
3. **Automatic Salt Generation**: Bcrypt prepends a unique random salt to every password before hashing. Even if two users have the exact same password (`Password123!`), their resulting hash strings are completely different.

### Pre-save Hook in Mongoose:
In `User.js`:
```javascript
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
```
- **Why check `this.isModified('password')`?**
  If an Admin updates a user's name or role without changing their password, we must NOT re-hash the already-hashed password, or the user would never be able to log in again!

---

## 4. Backend RBAC Middleware Design

Here is the exact authorization chain in `server/src/middleware/authMiddleware.js`:
```javascript
// 1. Authentication: extract and verify token
const protect = async (req, res, next) => { ... req.user = user; next(); };

// 2. Authorization: verify role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    next();
  };
};
```
In `employeeRoutes.js`:
```javascript
router.use(protect); // All routes require logged in user

// Viewers and Admins can read:
router.get('/', getEmployees);
router.get('/:id', getEmployeeById);

// Only Admins can mutate:
router.post('/', authorize('Admin'), createEmployee);
router.put('/:id', authorize('Admin'), updateEmployee);
router.delete('/:id', authorize('Admin'), deleteEmployee);
```
- **Defense point**: Even if a malicious user bypasses the frontend UI or sends raw curl requests to delete an employee, the backend intercepts the request at `authorize('Admin')` and returns `HTTP 403 Forbidden`. Frontend hiding is just UX; backend middleware is actual security.

---

## 5. Mongoose & Database Error Handling (The Evaluator Trap)

### Handling MongoDB E11000 Duplicate Key Error:
When creating an employee with an existing `employeeId` or `email`, MongoDB throws error code `11000`.
- **Beginner / Lazy AI Code**: Unhandled, results in a `500 Internal Server Error` crash with ugly stack trace.
- **Our Senior Engineering Code**:
  1. We perform an intentional check in controller before writing to return clean feedback.
  2. In `errorHandler.js`, we intercept `err.code === 11000` and translate it into:
     ```json
     {
       "success": false,
       "message": "Duplicate value 'EMP-001' entered for 'employeeId'. Please provide a unique value.",
       "field": "employeeId"
     }
     ```
     with **HTTP 409 Conflict**.

---

## 6. Frontend Architectural Highlights

1. **Axios Interceptors**:
   - `request.use`: Automatically pulls token from `localStorage` and sets `headers.Authorization = 'Bearer ' + token`. No manual header boilerplate across individual API calls.
   - `response.use`: Listens for `401 Unauthorized` responses. If a token expires in the middle of a session, it purges credentials and redirects to `/login?expired=true`.
2. **Protected Route Pattern in React Router v6**:
   - Checks `loading`: Shows a spinner while checking token verification on page refresh so user isn't prematurely kicked to login.
   - Checks `!user`: Redirects to `/login` with `state: { from: location }` so after login they return to the exact page they were trying to visit.
   - Checks `allowedRoles`: Renders a custom 403 Forbidden screen if a Viewer manually types an Admin URL.
3. **Vercel SPA Routing (`vercel.json`)**:
   - Single-Page Applications (SPAs) have only one real HTML file (`index.html`).
   - When a user refreshes `/employees/67890` on Vercel, the server looks for a file named `employees/67890`. Without `vercel.json`, it returns `404 Not Found`.
   - `vercel.json` rewrites all requests `/(.*)` to `/index.html` so React Router can process the route in the browser.

---

## 7. RESTful API Best Practices

- **Status Codes**:
  - `200 OK`: Successful retrieval or modification
  - `201 Created`: Resource successfully created (`POST`)
  - `400 Bad Request`: Client input validation failure
  - `401 Unauthorized`: Missing or invalid authentication token
  - `403 Forbidden`: Authenticated user lacks permission
  - `404 Not Found`: Resource or route doesn't exist
  - `409 Conflict`: Duplicate unique key collision
  - `500 Internal Server Error`: Unhandled server exception
- **Idempotence**:
  - `GET`: Safe & Idempotent (calling it 100 times changes nothing).
  - `PUT`: Idempotent (replacing with same state yields same state).
  - `DELETE`: Idempotent (deleting the same ID repeatedly leaves the resource absent).
  - `POST`: Non-idempotent (calling it 5 times creates 5 records).

---

## 8. Summary of Interview Cheat Sheet

If asked:
- *"How does your app prevent Viewers from editing records?"*
  -> *"Two layers: 1) Frontend UI disables edit/delete buttons and restricts forms to view-only. 2) Backend Express route has `authorize('Admin')` middleware that checks the decoded JWT role in `req.user.role`. If not Admin, it immediately terminates the request with HTTP 403 Forbidden."*
- *"Can anyone make themselves an Admin?"*
  -> *"No. By default, registration assigns the Viewer role. Once an Admin is logged in, they can promote registered users to the Admin role via our `PATCH /api/users/:id/role` endpoint. We also included a safety guard preventing the last Admin from demoting themselves."*
- *"How do you handle search and filters on large datasets?"*
  -> *"We implemented server-side querying using Mongoose with regex search on indexed fields (`fullName`, `employeeId`, `email`, `designation`) alongside exact matches on `department` and `status`, paired with limit-skip pagination so the database only fetches the needed slice of data."*
