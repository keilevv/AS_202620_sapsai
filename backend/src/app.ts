import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import "../src/lib/passport";
import authRoutes from "./routes/auth";
import plantClassifierRoutes from "./routes/plantClassifier";
import userRoutes from "./routes/user";
import adminRoutes from "./routes/admin";
import speciesRoutes from "./routes/species";
import notificationsRoutes from "./routes/notifications";
import webhookRoutes from "./routes/webhook";
import prisma from "./lib/prisma";
import {
  createDefaultAdmin,
  createDefaultSpecies,
  updateEntriedSpecies,
  updateTaggedHealthy,
} from "./utils";

// Create default admin user if none exists
createDefaultAdmin()
  .catch((error) => {
    console.error("Error creating default admin user:", error);
  })
  .then(() => {
    createDefaultSpecies()
      .catch((error) => {
        console.error("Error creating default species:", error);
      })
      .then(() => {
      });
  });

const app = express();

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit();
});

// CORS middleware (adjust origin as needed)
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173",
      "http://plantai.lab.utb.edu.co", // dominio web
      "capacitor://localhost", // app Android/iOS con Capacitor
      "ionic://localhost", // por si usas Ionic
      "http://localhost", // pruebas locales
      "http://127.0.0.1", // alternativa local
    ],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.route("/").get((req, res) => {
  res.send("Hello World from leaf classifier!");
});

app.use("/api/auth", authRoutes);
app.use("/api/plant-classifier", plantClassifierRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/species", speciesRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/internal/webhook", webhookRoutes);

export default app;
