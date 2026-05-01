const express=require("express");
const session=require("express-session");
const cookieParser=require("cookie-parser");

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());

app.use(session({
    secret:"PRIVATEKEY123",
    resave:false,
    saveUninitialized:true
}));


app.get("/",(req, res)=>{
  if (req.cookies.user && !req.session.user) {
    res.send("welcome back" + req.cookies.user);
  }else{
    res.send("welcome");
  }
});

app.post("/login",(req,res)=>{
  req.session.user={
    name:req.body.username,
    role:req.body.role,
  };
  res.cookie("user",req.body.username);
  res.send("user is logged in");
});


app.get("/courses",(req,res) => {
  if(req.session.user){
    res.send("here you can view courses");
  }else{
    res.send("login is required...");
  }
});
app.get("/create-course",(req, res)=>{
  if(!req.session.user){
    res.send("login first then go ahead");
  }else if(req.session.user.role === "teacher") {
    res.send("course created");
  }else{
    res.send("access is denied");
  }
});

app.get("/profile",(req,res)=>{
  if(req.session.user){
    res.send(req.session.user.name+"-"+req.session.user.role);
  }else {
    res.send("try to login first.");
  }
});
app.get("/logout",(req, res)=>{
    req.session.user = null;
    res.clearCookie("user");
  res.send("logged out successfully.");
});

app.listen(3000);
console.log("app is running at http://localhost:3000")





