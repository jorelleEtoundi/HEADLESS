/**
 * @swagger
 * /signup:
 *   post:
 *     summary: User signup
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [user, content-creator]
 *     responses:
 *       200:
 *         description: Signup successful
 *       400:
 *         description: Invalid role
 *       500:
 *         description: Error signing up
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/x-www-form-urlencoded:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid username or password
 *       500:
 *         description: Error during login
 */

/**
 * @swagger
 * /auth/google:
 *   get:
 *     summary: Authenticate with Google
 *     tags: [Authentication]
 *     responses:
 *       302:
 *         description: Redirects to Google for authentication
 *       500:
 *         description: Error during authentication
 */

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     summary: Google authentication callback
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Google authentication successful
 *         content:
 *           application/x-www-form-urlencoded:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Error during authentication callback
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: Welcome message
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: Welcome to the secure API
 */

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []  # Assuming you are using JWT for authentication
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/x-www-form-urlencoded:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 role:
 *                   type: string
 *                 isPublic:
 *                   type: boolean
 *       404:
 *         description: User not found
 *       500:
 *         description: Error fetching profile
 */

/**
 * @swagger
 * /profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []  # Assuming you are using JWT for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Error updating profile
 */

/**
 * @swagger
 * /profile/public:
 *   post:
 *     summary: Set user profile to public
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []  # Assuming you are using JWT for authentication
 *     responses:
 *       200:
 *         description: Profile set to public successfully
 *       500:
 *         description: Error updating profile
 */

/**
 * @swagger
 * /profile/photo:
 *   post:
 *     summary: Upload a profile photo
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []  # Assuming you are using JWT for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Photo uploaded successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Error uploading photo
 */

/**
 * @swagger
 * /profile/photo:
 *   get:
 *     summary: Get user profile photo
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []  # Assuming you are using JWT for authentication
 *     responses:
 *       200:
 *         description: Photo retrieved successfully
 *         content:
 *           image/jpeg:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Photo not found
 *       500:
 *         description: Error retrieving photo
 */

/**
 * @swagger
 * /invitations:
 *   post:
 *     summary: Send an invitation
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               receiverId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Invitation sent successfully
 *       500:
 *         description: Error sending invitation
 */

/**
 * @swagger
 * /invitations/accept:
 *   post:
 *     summary: Accept an invitation
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invitationId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Invitation accepted successfully
 *       500:
 *         description: Error accepting invitation
 */

/**
 * @swagger
 * /feed:
 *   get:
 *     summary: Get user feed
 *     tags: [Feed]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feed retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: integer
 *                   content:
 *                     type: string
 *       500:
 *         description: Error fetching feed
 */

/**
 * @swagger
 * /invitations/reject:
 *   post:
 *     summary: Reject an invitation
 *     tags: [Invitations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invitationId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Invitation rejected successfully
 *       500:
 *         description: Error rejecting invitation
 */

/**
 * @swagger
 * /profile/private:
 *   post:
 *     summary: Set user profile to private
 *     tags: [Profile]
 *     security:
 *       - bearerAuth: []  # Assuming you are using JWT for authentication
 *     responses:
 *       200:
 *         description: Profile set to private successfully
 *       500:
 *         description: Error updating profile
 */

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: User logout
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []  # Assuming you are using JWT for authentication
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Error during logout
 */

/**
 * @swagger
 * /secure-content:
 *   get:
 *     summary: Access secure content
 *     tags: [Content]
 *     security:
 *       - bearerAuth: []  # Assuming you are using JWT for authentication
 *     responses:
 *       200:
 *         description: Successfully accessed secure content
 *       403:
 *         description: Forbidden - User does not have the required role
 *       500:
 *         description: Error accessing secure content
 */

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []  # Assuming you are using JWT for authentication
 *     responses:
 *       200:
 *         description: A list of users retrieved successfully
 *         content:
 *           application/x-www-form-urlencoded:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   username:
 *                     type: string
 *                   role:
 *                     type: string
 *                   isPublic:
 *                     type: boolean
 *       500:
 *         description: Error fetching users
 */
/**
 * @swagger
 * /upload/photo:
 *   post:
 *     summary: Upload a photo
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - userId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The photo to upload
 *               userId:
 *                 type: integer
 *                 description: ID of the user uploading the photo
 *     responses:
 *       200:
 *         description: Photo uploaded successfully and notification created
 *       400:
 *         description: No Photo uploaded or other bad request
 *       500:
 *         description: Error uploading photo
 */

/**
 * @swagger
 * /upload/video:
 *   post:
 *     summary: Upload a video
 *     tags: [Uploads]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - userId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The Video to upload
 *               userId:
 *                 type: integer
 *                 description: ID of the user uploading the Video
 *     responses:
 *       200:
 *         description: Video uploaded successfully and notification created
 *       400:
 *         description: No Video uploaded or other bad request
 *       500:
 *         description: Error uploading Video
 */


/**
 * @swagger
 * /files/{userId}:
 *   get:
 *     summary: Retrieve files for a specific user
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []  # Assuming you are using JWT for authentication
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         description: ID of the user whose files are to be retrieved
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of files retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 *       403:
 *         description: Forbidden - User does not have access to the files
 *       500:
 *         description: Error fetching files
 */

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Create a notification
 *     tags: [Notifications]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - message
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user to notify
 *               message:
 *                 type: string
 *                 description: Notification message
 *     responses:
 *       201:
 *         description: Notification created successfully
 *       400:
 *         description: Bad Request
 */

/**
 * @swagger
 * /notifications/{userId}:
 *   get:
 *     summary: Get notifications for a user
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   userId:
 *                     type: integer
 *                   message:
 *                     type: string
 *                   read:
 *                     type: boolean
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /notifications/{id}/read:
 *   put:
 *     summary: Mark a notification as read
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID of the notification
 *     responses:
 *       200:
 *         description: Notification marked as read
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search posts by title
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *         required: true
 *         description: Search query to find posts by title
 *     responses:
 *       200:
 *         description: List of posts matching the search query
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   content:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /download/{filename}:
 *   get:
 *     summary: Download a specific file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []  # Assuming you are using JWT for authentication
 *     parameters:
 *       - name: filename
 *         in: path
 *         required: true
 *         description: Name of the file to be downloaded
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File downloaded successfully
 *       403:
 *         description: Forbidden - User does not have the required role
 *       500:
 *         description: Error downloading file
 */

/**
 * @swagger
 * /delete/{filename}:
 *   delete:
 *     summary: Delete a specific file
 *     tags: [Files]
 *     security:
 *       - bearerAuth: []  # Assuming you are using JWT for authentication
 *     parameters:
 *       - name: filename
 *         in: path
 *         required: true
 *         description: Name of the file to be deleted
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       403:
 *         description: Forbidden - User does not have the required role
 *       500:
 *         description: Error deleting file
 */
