# Backend API Routes

Base URL: `/api`

- **Auth Router**: `/api/auth` (src/routes/auth.ts)
- **Plant Classifier Router**: `/api/plant-classifier` (src/routes/plantClassifier.ts)
- **Users Router**: `/api/users` (src/routes/user.ts)
- **Admin Router**: `/api/admin` (src/routes/admin.ts)
- **Species Router**: `/api/species` (src/routes/species.ts)

## Auth

- **GET /api/auth/google**
  - **Handler**: `googleLogin`
  - **Description**: Initiates Google OAuth; redirects to Google.
  - **Payload**: Query `redirectTo` (optional)
  - **Mock response**: HTTP 302 redirect

- **GET /api/auth/google/callback**
  - **Handler**: `googleCallback`
  - **Description**: Google OAuth callback; redirects to frontend with JWTs.
  - **Payload**: Query `state` (internal)
  - **Mock response**: Redirect to `<FRONTEND_URL>/upload?accessToken=...&refreshToken=...`

- **POST /api/auth/login**
  - **Handler**: `localLogin`
  - **Description**: Email/password login, returns access token.
  - **Payload**:
    ```json
    { "email": "user@example.com", "password": "Secret123" }
    ```
  - **Mock response**:
    ```json
    {
      "message": "Login successful",
      "user": { "id": "u_123", "email": "user@example.com", "role": "USER" },
      "accessToken": "<jwt>"
    }
    ```

- **POST /api/auth/register**
  - **Handler**: `localRegister`
  - **Description**: Creates a user and returns access token.
  - **Payload**:
    ```json
    { "fullName": "Jane Doe", "email": "jane@example.com", "password": "Secret123", "phone": "+57..." }
    ```
  - **Mock response**:
    ```json
    {
      "status": "success",
      "message": "Registration successful",
      "user": { "id": "u_123", "email": "jane@example.com" },
      "accessToken": "<jwt>"
    }
    ```

- **GET /api/auth/logout**
  - **Handler**: `logout`
  - **Description**: Ends session.
  - **Mock response**: `"Logged out"`

- **GET /api/auth/me**
  - **Handler**: `isAuthenticated`
  - **Description**: Returns current user and a fresh access token.
  - **Mock response**:
    ```json
    { "user": { "id": "u_123", "email": "user@example.com" }, "accessToken": "<jwt>" }
    ```

- **POST /api/auth/refresh-token**
  - **Handler**: `refreshToken`
  - **Description**: Issues new access and refresh tokens.
  - **Payload**:
    ```json
    { "refreshToken": "<jwt>" }
    ```
  - **Mock response**:
    ```json
    { "accessToken": "<new-jwt>", "refreshToken": "<new-refresh>" }
    ```

## Plant Classifier

- **POST /api/plant-classifier/upload**
  - **Handler**: `uploadImage`
  - **Description**: Uploads an image, runs classification, stores file (R2 or local) and DB entry.
  - **Payload**: multipart/form-data `image` (file)
  - **Mock response**:
    ```json
    {
      "message": "Image uploaded and classified successfully",
      "classification": { "id": "cls_123", "species": "mangifera_indica", "shape": "ovate" },
      "storageType": "R2",
      "imageUrl": "https://.../key.jpg"
    }
    ```

- **GET /api/plant-classifier/upload/{id}**
  - **Handler**: `getUpload`
  - **Description**: Returns a single upload owned by the user.
  - **Mock response**:
    ```json
    { "result": { "id": "cls_123", "imagePath": "...", "userId": "u_123" } }
    ```

- **GET /api/plant-classifier/classifications**
  - **Handler**: `getClassifications`
  - **Description**: Paginated list of classifications (own by default; admin can filter by userId).
  - **Query**: `page`, `limit`, `sortBy`, `sortOrder`, `status`, `isArchived`, `isHealthy`, `search`, `createdAt_gte`, `createdAt_lte`, `userId (admin)`, `originalFilename`, `classification`
  - **Mock response**:
    ```json
    { "count": 25, "pages": 3, "results": [ { "id": "cls_123", "species": "..." } ] }
    ```

- **PATCH /api/plant-classifier/classifications/{id}**
  - **Handler**: `updateClassification`
  - **Description**: Update your own classification tags or archive.
  - **Payload**:
    ```json
    { "taggedSpecies": "mangifera_indica", "taggedShape": "ovate", "taggedHealthy": true, "isArchived": false }
    ```
  - **Mock response**:
    ```json
    { "message": "Classification updated successfully", "results": { "id": "cls_123" } }
    ```

## Users

- **GET /api/users/{id}**
  - **Handler**: `getUser`
  - **Description**: Fetch a user by id (self or admin).
  - **Mock response**:
    ```json
    { "user": { "id": "u_123", "email": "user@example.com" } }
    ```

- **PATCH /api/users/{id}/update**
  - **Handler**: `updateUser`
  - **Description**: Update profile fields or request contributor status.
  - **Payload**:
    ```json
    {
      "fullName": "Jane Doe",
      "email": "jane@example.com",
      "phone": "+57...",
      "institution": "UTB",
      "department": "Biology",
      "location": "Cartagena",
      "bio": "Researcher",
      "password": "OptionalNewPass",
      "emailNotifications": true,
      "requestedContributorStatus": true
    }
    ```
  - **Mock response**:
    ```json
    { "user": { "id": "u_123", "fullName": "Jane Doe" } }
    ```

## Admin

- **GET /api/admin/classifications**
  - **Handler**: `getClassificationsAdmin`
  - **Description**: Paginated classifications with totals; filterable.
  - **Mock response**:
    ```json
    {
      "count": 120,
      "pages": 12,
      "totalVerifiedCount": 30,
      "totalPendingCount": 80,
      "totalArchivedCount": 10,
      "results": [ { "id": "cls_123", "user": { "id": "u_1" } } ]
    }
    ```

- **GET /api/admin/classification/{id}**
  - **Handler**: `getClassificationAdmin`
  - **Description**: Get one classification by id.
  - **Mock response**:
    ```json
    { "message": "Classification fetched successfully", "results": { "id": "cls_123" } }
    ```

- **PUT /api/admin/classification/{id}**
  - **Handler**: `updateClassificationAdmin`
  - **Description**: Update tags/status/archive; only ADMIN can set `VERIFIED`.
  - **Payload**:
    ```json
    { "taggedSpecies": "...", "taggedShape": "...", "taggedHealthy": true, "status": "PENDING|VERIFIED", "isArchived": false }
    ```
  - **Mock response**:
    ```json
    { "message": "Classification updated successfully", "results": { "id": "cls_123" } }
    ```

- **DELETE /api/admin/classification/{id}**
  - **Handler**: `deleteClassificationAdmin`
  - **Description**: Delete a classification.
  - **Mock response**:
    ```json
    { "message": "Classification deleted successfully", "results": { "id": "cls_123" } }
    ```

- **GET /api/admin/users**
  - **Handler**: `getUsersAdmin`
  - **Description**: Paginated users with counts; filterable.
  - **Mock response**:
    ```json
    { "count": 42, "requestedContributorCount": 5, "pages": 5, "results": [ { "id": "u_1", "classificationCount": 10 } ] }
    ```

- **GET /api/admin/user/{id}**
  - **Handler**: `getUserAdmin`
  - **Description**: Get one user and classification count.
  - **Mock response**:
    ```json
    { "message": "User fetched successfully", "results": { "id": "u_1" }, "classificationCount": 10 }
    ```

- **PUT /api/admin/user/{id}**
  - **Handler**: `updateUserAdmin`
  - **Description**: Update user fields, including `role`, `isArchived`.
  - **Payload**: Same as user update plus `role`, `isArchived`.
  - **Mock response**:
    ```json
    { "user": { "id": "u_1", "role": "MODERATOR" } }
    ```
