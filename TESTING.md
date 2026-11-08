# Testing Evidence & Verification Guide

This document records the 20 official test cases (TC-01 through TC-20) designed for the **Lost and Found Web Application** as defined in Chapter 5 (Table 5.1) of the Mini Project Report.

---

## 1. Test Cases Execution Table

| ID | Scenario | Steps to Run | Expected Result | Status (Pass / Fail) |
| :--- | :--- | :--- | :--- | :---: |
| **TC-01** | Register with valid data | 1. Go to `/register`<br>2. Enter valid Name, unused Email (`asha@example.com`), and Password (8+ chars)<br>3. Click "Register" | Account is created in database; redirected to login with success alert | `[x] PASS` |
| **TC-02** | Register with existing email | 1. Go to `/register`<br>2. Enter same email as TC-01 (`asha@example.com`)<br>3. Submit form | HTTP 409 Conflict returned; alert displays "Email already registered" | `[x] PASS` |
| **TC-03** | Register with invalid data | 1. Go to `/register`<br>2. Submit empty name or invalid email format (e.g. `user@`) or password under 8 chars | Form validation blocks submission or returns HTTP 400 with specific error message | `[x] PASS` |
| **TC-04** | Login with valid credentials | 1. Go to `/login`<br>2. Enter registered email and correct password<br>3. Click "Log In" | HTTP 200 OK; JWT token stored in `localStorage`; navbar shows user greeting and Dashboard link | `[x] PASS` |
| **TC-05** | Login with wrong password | 1. Go to `/login`<br>2. Enter registered email with an incorrect password<br>3. Submit | HTTP 401 Unauthorized; alert displays generic "Invalid email or password"; no token issued | `[x] PASS` |
| **TC-06** | Open protected page when logged out | 1. Log out or open an Incognito window<br>2. Type `/report` or `/dashboard` directly into URL address bar | ProtectedRoute redirects user immediately to `/login` | `[x] PASS` |
| **TC-07** | Report a lost item | 1. Log in as User 1<br>2. Go to `/report`<br>3. Select "Lost Item", fill title, category, location, date, description, attach valid image (`.jpg`/`.png`) under 2 MB<br>4. Submit | HTTP 201 Created; item stored with `status: "open"`; appears on Home page and Listing page | `[x] PASS` |
| **TC-08** | Report a found item | 1. Log in as User 1<br>2. Go to `/report`<br>3. Select "Found Item", fill all fields<br>4. Submit | HTTP 201 Created; saved with `type: "found"` and green Found badge | `[x] PASS` |
| **TC-09** | Upload an invalid file | 1. Go to `/report`<br>2. Attempt to upload a `.pdf`, `.exe`, or an image larger than 2 MB | Upload rejected with HTTP 400 and message "Only .jpg, .jpeg, .png, and .webp images are allowed" or "File size exceeds 2 MB limit" | `[x] PASS` |
| **TC-10** | Search by keyword | 1. Go to `/items`<br>2. Enter a keyword present in an item's title/location (e.g., `wallet`)<br>3. Wait 500 ms debounce | Only items matching the text query are displayed | `[x] PASS` |
| **TC-11** | Filter by type and category | 1. Go to `/items`<br>2. Select Type = `Lost Items Only`<br>3. Select Category = `Accessories` | Only items satisfying both filter criteria are shown in the grid | `[x] PASS` |
| **TC-12** | Search with no match | 1. Go to `/items`<br>2. Type a non-existent search query (e.g., `xyz999unmatched`) | Grid shows friendly card: "No items found. Try refining your search keyword..." | `[x] PASS` |
| **TC-13** | View item details | 1. Click on any item card on the Home or Listing page | Opens `/items/:id`; displays full photograph, status badge, category, location, date, and reporter name | `[x] PASS` |
| **TC-14** | Submit a claim | 1. Log in as User 2 (not reporter)<br>2. Open User 1's item details<br>3. Enter message and unique proof details<br>4. Submit | HTTP 201 Created; claim saved as `pending`; visible in User 2's dashboard and User 1's claims received | `[x] PASS` |
| **TC-15** | Claim own item | 1. Log in as User 1 (item creator)<br>2. Send POST to `/api/items/:id/claims` on own item | HTTP 400 Bad Request; returns "You cannot claim your own item" | `[x] PASS` |
| **TC-16** | Approve a claim | 1. Log in as User 1 (reporter)<br>2. Go to Dashboard -> "Claims Received"<br>3. Click "Approve" on pending claim | Claim status updates to `approved`; item status updates to `returned`; competing pending claims auto-rejected; claimant contact details revealed | `[x] PASS` |
| **TC-17** | Edit or delete another user's item | 1. Log in as User 2<br>2. Send PUT or DELETE request to `/api/items/:id` belonging to User 1 | HTTP 403 Forbidden; returns "You are not authorized to update/delete this item" | `[x] PASS` |
| **TC-18** | Admin route as normal user | 1. Log in as normal user (non-admin)<br>2. Send GET request to `/api/admin/users` or attempt visiting `/admin` | HTTP 403 Forbidden ("Admin access required") or redirected to `/` | `[x] PASS` |
| **TC-19** | Admin deletes a report | 1. Log in as admin (`admin@example.com`)<br>2. Go to `/admin` panel & click "Delete Report" on any listing | Report is deleted from MongoDB; disappears from public listings and admin table | `[x] PASS` |
| **TC-20** | Responsive layout | 1. Open browser DevTools (F12)<br>2. Toggle Device Toolbar and set width to 375 px (iPhone SE width) | Navigation collapses into mobile hamburger menu; grid switches to single-column; no horizontal scrollbar | `[x] PASS` |

---

## 2. Postman Collection Endpoints Reference

Below is the list of API requests you can save in a Postman collection:

| Request Name | Method | Endpoint | Auth | Headers / Body |
| :--- | :---: | :--- | :---: | :--- |
| **Health Check** | `GET` | `{{baseUrl}}/api/health` | None | None |
| **Register User** | `POST` | `{{baseUrl}}/api/auth/register` | None | `Content-Type: application/json`<br>`{"name":"Asha Verma","email":"asha@example.com","password":"Pass@1234"}` |
| **Login User** | `POST` | `{{baseUrl}}/api/auth/login` | None | `Content-Type: application/json`<br>`{"email":"asha@example.com","password":"Pass@1234"}` |
| **Get My Profile** | `GET` | `{{baseUrl}}/api/auth/me` | Bearer Token | `Authorization: Bearer {{token}}` |
| **List & Search Items** | `GET` | `{{baseUrl}}/api/items?q=wallet&type=lost` | None | None |
| **Get Single Item** | `GET` | `{{baseUrl}}/api/items/:id` | None | None |
| **Create Item (with photo)** | `POST` | `{{baseUrl}}/api/items` | Bearer Token | `form-data`: `type`, `title`, `description`, `category`, `location`, `dateOfEvent`, `image` (file) |
| **Update Own Item** | `PUT` | `{{baseUrl}}/api/items/:id` | Bearer Token | `Content-Type: application/json`<br>`{"title":"Updated Title","status":"open"}` |
| **Delete Item** | `DELETE` | `{{baseUrl}}/api/items/:id` | Bearer Token | `Authorization: Bearer {{token}}` |
| **Submit Claim** | `POST` | `{{baseUrl}}/api/items/:id/claims` | Bearer Token | `Content-Type: application/json`<br>`{"message":"This is mine","proofDetails":"Contains student ID"}` |
| **Get User Claims** | `GET` | `{{baseUrl}}/api/claims/mine` | Bearer Token | `Authorization: Bearer {{token}}` |
| **Approve / Reject Claim** | `PATCH` | `{{baseUrl}}/api/claims/:id` | Bearer Token | `Content-Type: application/json`<br>`{"decision":"approved"}` |
| **Admin: Get All Users** | `GET` | `{{baseUrl}}/api/admin/users` | Bearer Token (Admin) | `Authorization: Bearer {{adminToken}}` |
| **Admin: Deactivate User** | `PATCH` | `{{baseUrl}}/api/admin/users/:id/deactivate` | Bearer Token (Admin) | `Authorization: Bearer {{adminToken}}` |
| **Admin: Get All Items** | `GET` | `{{baseUrl}}/api/admin/items` | Bearer Token (Admin) | `Authorization: Bearer {{adminToken}}` |

