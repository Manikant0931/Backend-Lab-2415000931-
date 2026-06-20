require("dotenv").config();
const express=require("express");
const session=require("express-session");
const cookieParser=require("cookie-parser");

const app = express();

// Use an environment variable for secrets, fallback to a default in development
const SESSION_SECRET = process.env.SESSION_SECRET || "default_dev_secret_key_123";
const COOKIE_SECRET = process.env.COOKIE_SECRET || "default_dev_cookie_secret_123";

app.use(express.json());
app.use(express.urlencoded({extended:true}));
// Enable signed cookies by passing a secret
app.use(cookieParser(COOKIE_SECRET));

app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false, // Do not save uninitialized sessions
    cookie: {
      httpOnly: true, // Prevent client-side JS from accessing the cookie
      secure: process.env.NODE_ENV === "production" // Require HTTPS in production
    }
}));


app.get("/",(req, res)=>{
  // Check for signed cookies to prevent spoofing
  if (req.signedCookies.user && !req.session.user) {
    res.send("welcome back " + req.signedCookies.user);
  } else {
    res.send("welcome");
  }
});

app.post("/login",(req,res)=>{
  if (!req.body.username || !req.body.role) {
    return res.status(400).send("username and role are required");
  }

  req.session.user={
    name:req.body.username,
    role:req.body.role,
  };

  // Set as signed cookie and httpOnly
  res.cookie("user", req.body.username, { signed: true, httpOnly: true });
  res.send("user is logged in");
});


app.get("/courses",(req,res) => {
  if(req.session.user){
    res.send("here you can view courses");
  }else{
    res.status(401).send("login is required...");
  }
});

app.get("/create-course",(req, res)=>{
  if(!req.session.user){
    res.status(401).send("login first then go ahead");
  }else if(req.session.user.role === "teacher") {
    res.send("course created");
  }else{
    res.status(403).send("access is denied");
  }
});

app.get("/profile",(req,res)=>{
  if(req.session.user){
    res.send(req.session.user.name+"-"+req.session.user.role);
  }else {
    res.status(401).send("try to login first.");
  }
});

app.get("/logout",(req, res)=>{
  // Destroy the entire session instead of just setting the user to null
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("failed to log out");
    }
    res.clearCookie("user");
    res.send("logged out successfully.");
  });
});

app.listen(3000);
console.log("app is running at http://localhost:3000");
