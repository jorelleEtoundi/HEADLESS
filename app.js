var createError = require('http-errors');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const passport = require("./passport-config");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const sql = require("mssql");
const jwt = require("jsonwebtoken");
const config = require("./config");

const swaggerUi = require("swagger-ui-express");
const { specs } = require("./swagger");

const { ensureRole, authenticate } = require("./middleware");

const { BlobServiceClient } = require("@azure/storage-blob");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });
const blobServiceClient = BlobServiceClient.fromConnectionString(
  "DefaultEndpointsProtocol=https;AccountName=storageapi90;AccountKey=jB+6C35Z0tf9HnPu5DVwb11wujK57tQWPbG9ocXY/SZd8IlkIrIXDfUZ7+O8qWiLFCahJMKVMVzJ+ASt6ggSXw==;EndpointSuffix=core.windows.net"
);
const containerClient = blobServiceClient.getContainerClient("imagecontent");

// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: "secret", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

sql
  .connect(config.db)
  .then((pool) => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });

app.post("/signup", async (req, res) => {
  const { username, password, role } = req.body;
  const allowedRoles = ["user", "content-creator"];
  if (!allowedRoles.includes(role)) {
    return res.status(400).send("Invalid role");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const request = new sql.Request();

  try {
    await request.query(
      `INSERT INTO Users (username, password, role) VALUES ('${username}', '${hashedPassword}', '${role}')`
    );
    res.send("Signup successful");
    console.log(`User ${username} signed up with role ${role}`);
  } catch (err) {
    res.status(500).send("Error signing up");
    console.error("Error signing up:", err);
  }
});

app.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, role: req.user.role },
      "your_jwt_secret"
    );
    res.json({ message: "Login successful", token });
  }
);

app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["https://www.googleapis.com/auth/plus.login"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, role: req.user.role },
      "your_jwt_secret"
    );
    res.json({ message: "Google authentication successful", token });
  }
);

app.get("/", authenticate, async (req, res) => {
  try {
    const contents = await Content.find().populate("author", "username");
    res.json(contents);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const request = new sql.Request();

    try {
      const result = await request.query(
        `SELECT * FROM Users WHERE id = ${req.user.id}`
      );
      const user = result.recordset[0];

      if (!user) {
        return res.status(404).send("User not found");
      }

      res.json(user);
    } catch (err) {
      res.status(500).send("Error fetching profile");
      console.error("Error fetching profile:", err);
    }
  }
);

app.put(
  "/profile",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { username, password } = req.body;
    const request = new sql.Request();
    let updateQuery = `UPDATE Users SET `;

    if (username) {
      updateQuery += `username = '${username}', `;
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += `password = '${hashedPassword}', `;
    }

    // Remove the trailing comma and space
    updateQuery = updateQuery.slice(0, -2);
    updateQuery += ` WHERE id = ${req.user.id}`;

    try {
      await request.query(updateQuery);
      res.send("Profile updated successfully");
    } catch (err) {
      res.status(500).send("Error updating profile");
      console.error("Error updating profile:", err);
    }
  }
);

app.post(
  "/profile/photo",
  passport.authenticate("jwt", { session: false }),
  upload.single("photo"),
  async (req, res) => {
    try {
      const blobName = `profile-photos/${req.user.id}/${req.file.filename}`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadFile(req.file.path);

      // Mettre à jour le chemin de la photo dans la base de données
      const request = new sql.Request();
      await request.query(
        `UPDATE Users SET photoUrl = '${blobName}' WHERE id = ${req.user.id}`
      );

      res.status(200).send("Photo uploaded successfully");
    } catch (err) {
      res.status(500).send("Error uploading photo");
      console.error("Error uploading photo:", err);
    }
  }
);

app.get(
  "/profile/photo",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const request = new sql.Request();
      const result = await request.query(
        `SELECT photoUrl FROM Users WHERE id = ${req.user.id}`
      );
      const user = result.recordset[0];

      if (!user || !user.photoUrl) {
        return res.status(404).send("Photo not found");
      }

      const blockBlobClient = containerClient.getBlockBlobClient(user.photoUrl);
      const downloadBlockBlobResponse = await blockBlobClient.download(0);
      downloadBlockBlobResponse.readableStreamBody.pipe(res);
    } catch (err) {
      res.status(500).send("Error retrieving photo");
      console.error("Error retrieving photo:", err);
    }
  }
);

app.post(
  "/invitations",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { receiverId } = req.body;
    const request = new sql.Request();

    try {
      await request.query(
        `INSERT INTO Invitations (senderId, receiverId) VALUES (${req.user.id}, ${receiverId})`
      );
      res.send("Invitation sent successfully");
    } catch (err) {
      res.status(500).send("Error sending invitation");
    }
  }
);

app.post(
  "/invitations/accept",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { invitationId } = req.body;
    const request = new sql.Request();

    try {
      await request.query(
        `UPDATE Invitations SET status = 'accepted' WHERE id = ${invitationId} AND receiverId = ${req.user.id}`
      );
      res.send("Invitation accepted successfully");
    } catch (err) {
      res.status(500).send("Error accepting invitation");
    }
  }
);

app.get(
  "/feed",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const request = new sql.Request();

    try {
      // Récupérer les contenus des utilisateurs publics
      const publicContents = await request.query(`
        SELECT Users.id AS userId, Contents.content 
        FROM Contents
        JOIN Users ON Contents.userId = Users.id
        WHERE Users.isPublic = 1
      `);

      // Récupérer les contenus des utilisateurs privés acceptés
      const privateContents = await request.query(`
        SELECT Users.id AS userId, Contents.content 
        FROM Contents
        JOIN Users ON Contents.userId = Users.id
        JOIN Invitations ON Invitations.receiverId = Users.id AND Invitations.senderId = ${req.user.id}
        WHERE Users.isPublic = 0 AND Invitations.status = 'accepted'
      `);

      const feed = [...publicContents.recordset, ...privateContents.recordset];

      res.status(200).json(feed);
    } catch (err) {
      res.status(500).send("Error fetching feed");
    }
  }
);

app.get(
  "/feed",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const request = new sql.Request();

    try {
      // Récupérer les contenus des utilisateurs publics
      const publicContents = await request.query(`
        SELECT Users.id AS userId, Contents.content 
        FROM Contents
        JOIN Users ON Contents.userId = Users.id
        WHERE Users.isPublic = 1
      `);

      // Récupérer les contenus des utilisateurs privés acceptés
      const privateContents = await request.query(`
        SELECT Users.id AS userId, Contents.content 
        FROM Contents
        JOIN Users ON Contents.userId = Users.id
        JOIN Invitations ON Invitations.receiverId = Users.id AND Invitations.senderId = ${req.user.id}
        WHERE Users.isPublic = 0 AND Invitations.status = 'accepted'
      `);

      const feed = [...publicContents.recordset, ...privateContents.recordset];

      res.status(200).json(feed);
    } catch (err) {
      res.status(500).send("Error fetching feed");
    }
  }
);

app.post(
  "/invitations/reject",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const { invitationId } = req.body;
    const request = new sql.Request();

    try {
      await request.query(
        `UPDATE Invitations SET status = 'rejected' WHERE id = ${invitationId} AND receiverId = ${req.user.id}`
      );
      res.send("Invitation rejected successfully");
    } catch (err) {
      res.status(500).send("Error rejecting invitation");
      console.error("Error rejecting invitation:", err);
    }
  }
);

app.post(
  "/profile/public",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const request = new sql.Request();

    try {
      await request.query(
        `UPDATE Users SET isPublic = 1 WHERE id = ${req.user.id}`
      );
      res.send("Profile set to public");
    } catch (err) {
      res.status(500).send("Error updating profile");
      console.error("Error updating profile:", err);
    }
  }
);

app.post(
  "/profile/private",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const request = new sql.Request();

    try {
      await request.query(
        `UPDATE Users SET isPublic = 0 WHERE id = ${req.user.id}`
      );
      res.send("Profile set to private");
    } catch (err) {
      res.status(500).send("Error updating profile");
      console.error("Error updating profile:", err);
    }
  }
);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// Utiliser le middleware pour vérifier le rôle de l'utilisateur
app.get("/secure-content", ensureRole("content-creator"), (req, res) => {
  res.send("This is a secure content area for content creators");
});

app.get("/users", async (req, res) => {
  const request = new sql.Request();
  try {
    const result = await request.query("SELECT * FROM Users");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send("Error fetching users");
  }
});

// Route pour uploader un fichier
app.post(
  "/upload/photos",
  authenticate,
  // ensureRole("content-creator"),
  upload.single("photo"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      const blobName = req.file.filename;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadFile(req.file.path);

      const userId = req.body.userId; // Assumons que userId est passé dans le body de la requête
      const message = `User ${userId} has uploaded a new file: ${req.file.originalname}`;
      await sql.query`INSERT INTO Notifications (userId, message) VALUES (${userId}, ${message})`;

      res.status(200).json({
        message: "File uploaded successfully and notification created",
        fileName: blobName,
        url: blockBlobClient.url,
      });
    } catch (err) {
      res.status(500).send("Error uploading file");
      console.error("Error uploading file:", err);
    }
  }
);

app.post(
  "/upload/videos",
  authenticate,
  // ensureRole("content-creator"),
  upload.single("video"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded.");
      }

      const blobName = req.file.filename;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);
      await blockBlobClient.uploadFile(req.file.path);

      // Créer une notification pour l'upload
      const userId = req.body.userId; // Assumons que userId est passé dans le body de la requête
      const message = `User ${userId} has uploaded a new file: ${req.file.originalname}`;
      await sql.query`INSERT INTO Notifications (userId, message) VALUES (${userId}, ${message})`;

      res.status(200).json({
        message: "File uploaded successfully and notification created",
        fileName: blobName,
        url: blockBlobClient.url,
      });
    } catch (err) {
      res.status(500).send("Error uploading file");
      console.error("Error uploading file:", err);
    }
  }
);
// Route pour obtenir les fichiers
app.get("/files/:userId", async (req, res) => {
  const request = new sql.Request();
  const userId = req.params.userId;

  try {
    const userResult = await request.query(
      `SELECT isPublic FROM Users WHERE id = ${userId}`
    );
    const user = userResult.recordset[0];

    if (!user || (!user.isPublic && req.user.id !== userId)) {
      return res.status(403).send("Forbidden");
    }

    const files = [];
    for await (const blob of containerClient.listBlobsFlat({
      prefix: `${userId}/`,
    })) {
      files.push(blob.name);
    }

    res.status(200).json(files);
  } catch (err) {
    res.status(500).send("Error fetching files");
    console.error("Error fetching files:", err);
  }
});

// Route pour télécharger un fichier
app.get(
  "/download/:filename",
  ensureRole("content-creator"),
  async (req, res) => {
    try {
      const blockBlobClient = containerClient.getBlockBlobClient(
        req.params.filename
      );
      const downloadBlockBlobResponse = await blockBlobClient.download(0);
      downloadBlockBlobResponse.readableStreamBody.pipe(res);
    } catch (err) {
      res.status(500).send("Error downloading file");
      console.error("Error downloading file:", err);
    }
  }
);

// Route pour supprimer un fichier

app.delete(
  "/delete/:filename",
  ensureRole("content-creator"),
  async (req, res) => {
    try {
      const blockBlobClient = containerClient.getBlockBlobClient(
        req.params.filename
      );
      await blockBlobClient.delete();
      res.status(200).send("File deleted successfully");
    } catch (err) {
      res.status(500).send("Error deleting file");
      console.error("Error deleting file:", err);
    }
  }
);

app.post("/comments", async (req, res) => {
  const { postId, userId, content } = req.body;
  try {
    const result =
      await sql.query`INSERT INTO Comments (postId, userId, content) VALUES (${postId}, ${userId}, ${content})`;
    res
      .status(201)
      .json({ id: result.recordset.insertId, postId, userId, content });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/comments/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const result =
      await sql.query`SELECT * FROM Comments WHERE postId = ${postId} AND approved = 1`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/comments/:id/approve", async (req, res) => {
  const { id } = req.params;
  try {
    const result =
      await sql.query`UPDATE Comments SET approved = 1 WHERE id = ${id}`;
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get("/search", async (req, res) => {
  const { query } = req.query;
  try {
    const result =
      await sql.query`SELECT * FROM Posts WHERE title LIKE '%' + ${query} + '%'`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/notifications", async (req, res) => {
  const { userId, message } = req.body;
  try {
    const result =
      await sql.query`INSERT INTO Notifications (userId, message) VALUES (${userId}, ${message})`;
    res.status(201).json({ id: result.recordset.insertId, userId, message });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/notifications/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const result =
      await sql.query`SELECT * FROM Notifications WHERE userId = ${userId} AND read = 0`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put("/notifications/:id/read", async (req, res) => {
  const { id } = req.params;
  try {
    const result =
      await sql.query`UPDATE Notifications SET read = 1 WHERE id = ${id}`;
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
