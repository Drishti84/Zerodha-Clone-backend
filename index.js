require('dotenv').config();

const User = require("./model/UserModel");
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const cookieParser = require("cookie-parser");
//const authRoute = require("./Routes/AuthRoute");
const { HoldingsModel } = require("./model/HoldingsModel");
//const {Signup,Login} = require("./Controllers/AuthController");
const {userVerification, requireAuth} = require("./Middlewares/AuthMiddleware");
const { PositionsModel } = require("./model/PositionsModel");
const { OrdersModel } = require("./model/OrdersModel");
const bcrypt = require("bcryptjs");
const YahooFinance = require("yahoo-finance2").default;
const yahooFinance = new YahooFinance({ suppressNotices: ["yahooSurvey"] });
const PORT = 3002;
const uri = process.env.MONGO_URL;
const {createSecretToken} = require("./util/SecretToken");
const app = express();


mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error(err));


  // app.use(
  //   cors({
  //     origin: ["http://localhost:3000"],
  //     methods: ["GET", "POST", "PUT", "DELETE"],
  //     credentials: true,
  //   })
  // );


  const allowedOrigins = [
    'https://zerodha-clone-frontend-vk1h.onrender.com',
    'https://zerodha-clone-dashboard-312i.onrender.com',
    'https://backend-p8j1.onrender.com',
    'http://localhost:3000',
    'http://localhost:3001',
  ];

app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.includes(origin) || !origin) {
      // Allow requests with no origin (e.g., mobile apps or Postman) or from allowed origins
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed methods if needed
  credentials: true,
}));
app.use(bodyParser.json());
app.use(cookieParser());

app.listen(PORT, () => {
  console.log("App started on port " + PORT);
});


app.post('/',userVerification)
app.post('/signup', async (req, res, next) => {
  try {
    const { email, password, username, createdAt } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const user = await User.create({ email, password, username, createdAt });
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      httpOnly: false,
      sameSite: "none",
      secure: true,
    });
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, token, user });
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again.", success: false });
  }
});





app.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Request received:', req.body);
    if(!email || !password ){
      return res.json({message:'All fields are required'})
    }
    const user = await User.findOne({ email });
    if(!user){
      return res.json({message:'Incorrect password or email' }) 
    }
    const auth = await bcrypt.compare(password,user.password)
    if (!auth) {
      return res.json({message:'Incorrect password or email' }) 
    }
     const token = createSecretToken(user._id);
     res.cookie("token", token, {
       withCredentials: true,
       httpOnly: false,
     });
     res.status(201).json({ message: "User logged in successfully", success: true, token });
     next()
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Please try again.", success: false });
  }
})


// app.get("/addHoldings", async (req, res) => {
//   let tempHoldings = [
//     {
//       name: "BHARTIARTL",
//       qty: 2,
//       avg: 538.05,
//       price: 541.15,
//       net: "+0.58%",
//       day: "+2.99%",
//     },
//     {
//       name: "HDFCBANK",
//       qty: 2,
//       avg: 1383.4,
//       price: 1522.35,
//       net: "+10.04%",
//       day: "+0.11%",
//     },
//     {
//       name: "HINDUNILVR",
//       qty: 1,
//       avg: 2335.85,
//       price: 2417.4,
//       net: "+3.49%",
//       day: "+0.21%",
//     },
//     {
//       name: "INFY",
//       qty: 1,
//       avg: 1350.5,
//       price: 1555.45,
//       net: "+15.18%",
//       day: "-1.60%",
//       isLoss: true,
//     },
//     {
//       name: "ITC",
//       qty: 5,
//       avg: 202.0,
//       price: 207.9,
//       net: "+2.92%",
//       day: "+0.80%",
//     },
//     {
//       name: "KPITTECH",
//       qty: 5,
//       avg: 250.3,
//       price: 266.45,
//       net: "+6.45%",
//       day: "+3.54%",
//     },
//     {
//       name: "M&M",
//       qty: 2,
//       avg: 809.9,
//       price: 779.8,
//       net: "-3.72%",
//       day: "-0.01%",
//       isLoss: true,
//     },
//     {
//       name: "RELIANCE",
//       qty: 1,
//       avg: 2193.7,
//       price: 2112.4,
//       net: "-3.71%",
//       day: "+1.44%",
//     },
//     {
//       name: "SBIN",
//       qty: 4,
//       avg: 324.35,
//       price: 430.2,
//       net: "+32.63%",
//       day: "-0.34%",
//       isLoss: true,
//     },
//     {
//       name: "SGBMAY29",
//       qty: 2,
//       avg: 4727.0,
//       price: 4719.0,
//       net: "-0.17%",
//       day: "+0.15%",
//     },
//     {
//       name: "TATAPOWER",
//       qty: 5,
//       avg: 104.2,
//       price: 124.15,
//       net: "+19.15%",
//       day: "-0.24%",
//       isLoss: true,
//     },
//     {
//       name: "TCS",
//       qty: 1,
//       avg: 3041.7,
//       price: 3194.8,
//       net: "+5.03%",
//       day: "-0.25%",
//       isLoss: true,
//     },
//     {
//       name: "WIPRO",
//       qty: 4,
//       avg: 489.3,
//       price: 577.75,
//       net: "+18.08%",
//       day: "+0.32%",
//     },
//   ];

//   tempHoldings.forEach((item) => {
//     let newHolding = new HoldingsModel({
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.day,
//       day: item.day,
//     });

//     newHolding.save();
//   });
//   res.send("Done!");
// });

// app.get("/addPositions", async (req, res) => {
//   let tempPositions = [
//     {
//       product: "CNC",
//       name: "EVEREADY",
//       qty: 2,
//       avg: 316.27,
//       price: 312.35,
//       net: "+0.58%",
//       day: "-1.24%",
//       isLoss: true,
//     },
//     {
//       product: "CNC",
//       name: "JUBLFOOD",
//       qty: 1,
//       avg: 3124.75,
//       price: 3082.65,
//       net: "+10.04%",
//       day: "-1.35%",
//       isLoss: true,
//     },
//   ];

//   tempPositions.forEach((item) => {
//     let newPosition = new PositionsModel({
//       product: item.product,
//       name: item.name,
//       qty: item.qty,
//       avg: item.avg,
//       price: item.price,
//       net: item.net,
//       day: item.day,
//       isLoss: item.isLoss,
//     });

//     newPosition.save();
//   });
//   res.send("Done!");
// });

app.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }
  res.json({ username: user.username, email: user.email });
});

app.get("/allHoldings", requireAuth, async (req, res) => {
  let allHoldings = await HoldingsModel.find({ userId: req.userId });
  res.json(allHoldings);
});

app.get("/allPositions", requireAuth, async (req, res) => {
  let allPositions = await PositionsModel.find({ userId: req.userId });
  res.json(allPositions);
});

app.post("/newOrder", requireAuth, async (req, res) => {
  const { name, qty, price, mode } = req.body;
  const numQty = Number(qty);
  const numPrice = Number(price);

  const newOrder = new OrdersModel({
    userId: req.userId,
    name,
    qty: numQty,
    price: numPrice,
    mode,
  });
  await newOrder.save();

  if (mode === "BUY") {
    await User.findByIdAndUpdate(req.userId, { $inc: { balance: -(numQty * numPrice) } });
    const existing = await HoldingsModel.findOne({ userId: req.userId, name });
    if (existing) {
      const totalQty = existing.qty + numQty;
      const newAvg = (existing.avg * existing.qty + numPrice * numQty) / totalQty;
      existing.qty = totalQty;
      existing.avg = parseFloat(newAvg.toFixed(2));
      existing.price = numPrice;
      await existing.save();
    } else {
      await new HoldingsModel({
        userId: req.userId,
        name,
        qty: numQty,
        avg: numPrice,
        price: numPrice,
        net: "0.00%",
        day: "0.00%",
      }).save();
    }
  } else if (mode === "SELL") {
    await User.findByIdAndUpdate(req.userId, { $inc: { balance: numQty * numPrice } });
    const existing = await HoldingsModel.findOne({ userId: req.userId, name });
    if (existing) {
      const newQty = existing.qty - numQty;
      if (newQty <= 0) {
        await HoldingsModel.deleteOne({ userId: req.userId, name });
      } else {
        existing.qty = newQty;
        await existing.save();
      }
    }
  }

  res.send("Order saved!");
});


app.get("/allOrders", requireAuth, async(req, res) =>{
  let allOrders = await OrdersModel.find({ userId: req.userId });
  res.json(allOrders);
});

app.get("/historical", async (req, res) => {
  const symbol = (req.query.symbol || "").trim();
  const period = req.query.period || "1mo";

  if (!symbol) return res.status(400).json({ error: "symbol is required" });

  const now = new Date();
  const period1 = new Date(now);
  if (period === "1mo") period1.setMonth(now.getMonth() - 1);
  else if (period === "3mo") period1.setMonth(now.getMonth() - 3);
  else if (period === "6mo") period1.setMonth(now.getMonth() - 6);
  else if (period === "1y") period1.setFullYear(now.getFullYear() - 1);
  else period1.setMonth(now.getMonth() - 1);

  try {
    const data = await yahooFinance.historical(`${symbol}.NS`, {
      period1: period1.toISOString().split("T")[0],
      period2: now.toISOString().split("T")[0],
      interval: "1d",
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch historical data" });
  }
});

app.get("/fundamentals", async (req, res) => {
  const symbol = (req.query.symbol || "").trim();
  if (!symbol) return res.status(400).json({ error: "symbol required" });
  try {
    const q = await yahooFinance.quote(`${symbol}.NS`);
    res.json({
      name: symbol,
      longName: q.longName || q.shortName || symbol,
      price: q.regularMarketPrice,
      change: q.regularMarketChange,
      changePercent: q.regularMarketChangePercent,
      marketCap: q.marketCap,
      pe: q.trailingPE,
      fiftyTwoWeekHigh: q.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: q.fiftyTwoWeekLow,
      volume: q.regularMarketVolume,
      avgVolume: q.averageVolume,
      dividendYield: q.trailingAnnualDividendYield,
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch fundamentals" });
  }
});

app.get("/funds", requireAuth, async (req, res) => {
  let user = await User.findById(req.userId);
  if (user.balance == null) {
    user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { balance: 100000 } },
      { new: true }
    );
  }
  const holdings = await HoldingsModel.find({ userId: req.userId });
  const totalInvestment = holdings.reduce((s, h) => s + h.avg * h.qty, 0);
  const currentValue = holdings.reduce((s, h) => s + h.price * h.qty, 0);
  res.json({
    balance: user.balance,
    totalInvestment,
    currentValue,
    pnl: currentValue - totalInvestment,
  });
});

app.post("/addFunds", requireAuth, async (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
  await User.findByIdAndUpdate(req.userId, { $inc: { balance: amount } });
  res.json({ success: true, added: amount });
});

app.post("/withdrawFunds", requireAuth, async (req, res) => {
  const amount = Number(req.body.amount);
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
  const user = await User.findById(req.userId);
  if (user.balance < amount) return res.status(400).json({ error: "Insufficient balance" });
  await User.findByIdAndUpdate(req.userId, { $inc: { balance: -amount } });
  res.json({ success: true, withdrawn: amount });
});

app.get("/quotes", async (req, res) => {
  const symbols = (req.query.symbols || "").split(",").map((s) => s.trim()).filter(Boolean);

  const quotes = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const quote = await yahooFinance.quote(`${symbol}.NS`);
        return {
          name: symbol,
          price: quote.regularMarketPrice,
          percent: `${quote.regularMarketChangePercent >= 0 ? "+" : ""}${quote.regularMarketChangePercent.toFixed(2)}%`,
          isDown: quote.regularMarketChangePercent < 0,
        };
      } catch (error) {
        return { name: symbol, error: "Failed to fetch quote" };
      }
    })
  );

  res.json(quotes);
});

