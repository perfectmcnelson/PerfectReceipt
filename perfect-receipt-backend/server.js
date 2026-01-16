
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const compression = require("compression");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
// const xss = require("xss-clean");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const receiptRoutes = require("./routes/receiptRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const adminRoutes = require("./routes/adminRoutes");
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");
const emailRoutes = require("./routes/emailRoutes")

const app = express();

/* -----------------------------------------------------------
   1️⃣  CONNECT DB
----------------------------------------------------------- */
connectDB();

/* -----------------------------------------------------------
   2️⃣  CORE MIDDLEWARE
----------------------------------------------------------- */
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("dev"));

/* -----------------------------------------------------------
   3️⃣  SECURITY HEADERS
----------------------------------------------------------- */
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginOpenerPolicy: false
  })
);

// Maintain Google OAuth popup flow
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

/* -----------------------------------------------------------
   4️⃣  CORS CONFIG
----------------------------------------------------------- */
// const allowedOrigins = (process.env.FRONTEND_URL  || "", process.env.ADMIN_URL || "")
//   .split(",")
//   .map(o => o.trim())
//   .filter(Boolean);

// const allowedOrigins = [
//   process.env.FRONTEND_URL,
//   process.env.ADMIN_URL
// ].filter(Boolean).flatMap(s => s.split(",")).map(s => s.trim()).filter(Boolean);

//   .filter(Boolean)
//   .join(",")
//   .split(",")
//   .map(o => o.trim());

// app.use(
//   cors({
//     origin: function (origin, callback) {
//       if (!origin) return callback(null, true); // Postman / curl
//       if (allowedOrigins.includes(origin)) return callback(null, true);
//     //   return callback(new Error("CORS not allowed"), false);
//         console.warn(`CORS blocked for origin: ${origin}`);
//         return callback(null, false);
//     },
//     credentials: true,
//     exposedHeaders: ["Content-Disposition"],
//     methods: ["GET","HEAD","PUT","PATCH","POST","DELETE","OPTIONS"],
//     allowedHeaders: ["Content-Type","Authorization","X-Requested-With","Accept"]
//   })
// );

// app.options("*", cors({
//         origin: function (origin, callback) {
//             if (!origin) return callback(null, true); // Postman / curl
//             if (allowedOrigins.includes(origin)) return callback(null, true);
//             //   return callback(new Error("CORS not allowed"), false);
//             console.warn(`CORS blocked for origin: ${origin}`);
//             return callback(null, false);
//         },
//         credentials: true,
//         exposedHeaders: ["Content-Disposition"],
//         methods: ["GET","HEAD","PUT","PATCH","POST","DELETE","OPTIONS"],
//         allowedHeaders: ["Content-Type","Authorization","X-Requested-With","Accept"]
//     })
// );


/* -----------------------------------------------------------
   4️⃣  CORS CONFIG - DEBUGGING VERSION
----------------------------------------------------------- */
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
].filter(Boolean).flatMap(s => s.split(",")).map(s => s.trim()).filter(Boolean);

// 🔍 DEBUG: Log what origins are allowed
console.log("✅ Allowed Origins:", allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    console.log(`📨 Incoming request origin: ${origin}`); // DEBUG
    
    if (!origin) return callback(null, true); // Postman / curl
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    console.warn(`❌ CORS blocked for origin: ${origin}`);
    return callback(null, false);
  },
  credentials: true,
  exposedHeaders: ["Content-Disposition"],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"]
};

app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

/* -----------------------------------------------------------
   5️⃣  UNIVERSAL OPTIONS HANDLER (Express 5 Safe)
----------------------------------------------------------- */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const origin = req.headers.origin;

    if (allowedOrigins.includes(origin)) {
      res.header("Access-Control-Allow-Origin", origin);
    }

    res.header("Access-Control-Allow-Credentials", "true");
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With"
    );
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );

    return res.sendStatus(200);
  }

  next();
});


// --- TRUST PROXY (fixes express-rate-limit X-Forwarded-For error)
// If you're behind one proxy (Render, Heroku, Vercel), set to 1.
// If you're behind multiple proxies, adjust accordingly.
app.set('trust proxy', 1);

/* -----------------------------------------------------------
   6️⃣  RATE LIMITING
----------------------------------------------------------- */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many attempts. Try again later."
});
app.use("/api/auth", authLimiter);

/* -----------------------------------------------------------
   7️⃣  SANITIZATION (safe for Google OAuth)
----------------------------------------------------------- */
const excludeSanitize = ["/api/auth/google"];

app.use((req, res, next) => {
  if (!excludeSanitize.includes(req.path)) {
    mongoSanitize.sanitize(req.body);
    mongoSanitize.sanitize(req.query);
    mongoSanitize.sanitize(req.params);
  }
  next();
});

// app.use((req, res, next) => {
//   if (!excludeSanitize.includes(req.path)) {
//     const sanitizeObj = obj => {
//       if (!obj || typeof obj !== "object") return obj;
//       const clean = {};
//       for (let key in obj) clean[key] = xss(obj[key]);
//       return clean;
//     };

//     req.body = sanitizeObj(req.body);
//     req.query = sanitizeObj(req.query);
//     req.params = sanitizeObj(req.params);
//   }
//   next();
// });

/* -----------------------------------------------------------
   8️⃣  ROUTES
----------------------------------------------------------- */
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);
app.use("/api/email", emailRoutes)

app.get("/", (req, res) => {
  res.send("API running");
});

/* -----------------------------------------------------------
   9️⃣  ERROR HANDLER
----------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err.stack || err.message);
  if (res.headersSent) return next(err);
  res.status(500).json({ message: err.message || "Server error" });
});

/* -----------------------------------------------------------
   🔟 START SERVER
----------------------------------------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
