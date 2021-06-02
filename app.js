const express = require('express')
const db = require('./db/config')
const fileUpload = require('express-fileupload');
const web = require('./routes/web')
const path = require('path')
const http = require('http')
const cors = require('cors')
const dotEnv = require('dotenv')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const SequelizeStore = require("connect-session-sequelize")(session.Store);
const flash = require('connect-flash');
const User = require('./model/user')
const Basic = require('./model/basic')
const bcrypt = require('bcryptjs')

dotEnv.config()
db.sync()
.then(()=>console.log('db is connected'))
.catch(e=>console.log(e))
const app = express()
const server = http.createServer(app)
app.use(fileUpload());
app.use(cors({origin:true}))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')))
app.use(cookieParser())
const options ={
  secret: process.env.SESSION_SECRET,
  resave: false,
  store: new SequelizeStore({
    db: db,
  }),
  saveUninitialized: false,
}
if(process.env.NODE_ENV == 'production')
options.cookie={ secure: true }
app.use(session(options))
app.use(passport.initialize());
app.use(passport.session());
app.use(flash())
app.use(async(req,res,next)=>{
  const basic = await Basic.findByPk(1)
  res.locals.isAuthenticated = req.isAuthenticated()
  res.locals.user = req.user
  res.locals.basic = basic
  next()
})
app.use('/',web)
passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
},async(email, password, done)=>{
    try{
      const user = await User.findOne({ where:{ email: email }})
      if (!user) {
        return done(null, false, { message: 'Incorrect Email.' });
      }
      const validPassword = await bcrypt.compare(password, user.password) 
      if (!validPassword) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, {id:user.id, fullname:user.fullname, email:user.email, phone:user.phone});
    }
    catch(err){return done(err);}
  }
));
app.use((req, res, next) => {
    res.status(404).send("Sorry can't find that!");
  });
  
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
server.listen(9000, ()=>console.log('server is running on port 5000'))