const express = require('express')
const router = express.Router()
const QRCode = require('qrcode')
const User = require('../model/user')

const Investment = require('../model/investment')
const Contact = require('../model/contact')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const authMiddleware = require('../middleware/auth')
User.hasMany(Investment, {foreignKey:'user_id', sourceKey:'id'})
Investment.belongsTo(User, {targetKey:'id', foreignKey:'user_id'})

const diffDate = (start,end)=>{
    const date1 = new Date(start);
    const date2 = new Date(end);
    const diffTime = Math.abs(date2 - date1);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24)); 
}
const generateQR = async text => {
    try {
     return await QRCode.toDataURL(text)
    } catch (err) {
      console.error(err)
    }
  }
const getPagination = (page, size) => {
    const limit = size ? +size : 3;
    const offset = page ? page * limit : 0;
  
    return { limit, offset };
  };
  
const getPagingData = (data, page, limit) => {
    const { count: totalItems, rows: investments } = data;
    
    const currentPage = page ? +page : 0;
    const totalPages = Math.ceil(totalItems / limit);
  
    return { totalItems, investments, totalPages, currentPage };
  };
  
router.get('/', (req,res)=>{
    res.render('index');
})
router.get('/about-us', (req,res)=>{
    res.render('about');
})
router.get('/contact-us', (req,res)=>{
    res.render('contact', {message:req.flash('message')});
})
router.post('/contact', async(req,res)=>{
    const {name, email,message} =req.body
    if(!name)
    {
        req.flash('message', 'Your name is required')
        return res.redirect('/contact-us')
    }
    else if(!email)
    {
        req.flash('message', 'Your email is required')
        return res.redirect('/contact-us')
    }
    if(!message)
    {
        req.flash('message', 'Your message is required')
        return res.redirect('/contact-us')
    }
    try{
        const ms = await Contact.create({
            name,
            email,
            message
        })
        if(ms)
        {
            req.flash('message', 'Thank you for contacting us')
            return res.redirect('/contact-us')
        }
        else
        {
            req.flash('message', 'Failed to deliver')
            return res.redirect('/contact-us')
        }
    }
    catch(e){console.log(e)}
})
router.get('/faq', (req,res)=>{
    res.render('faq');
})
router.get('/rules', (req,res)=>{
    res.render('rules');
})
router.get('/login', (req,res)=>{
    if(req.user)
    return res.redirect('dashboard')
    res.render('account/login',{message:req.flash('message')});
})
router.post('/login', passport.authenticate('local', {
    successRedirect:'/dashboard',
    successMessage:'Successfully logged in',
    failureRedirect:'/login',
    failureFlash: {
        type: 'message',
        message: 'Invalid email or password.'
      },
}))
router.get('/register', (req,res)=>{
    if(req.user)
    return res.redirect('dashboard')
    res.render('account/register', {message:req.flash('message')});
})
router.get('/dashboard', authMiddleware, async(req,res)=>{
    let invested = 0;
    let profit = 0;
    let today = new Date()
    let collected = 0;
    let percent =0;
    const { limit, offset } = getPagination(0, 10);
    const paging = await Investment.findAndCountAll({where:{user_id:req.user.id},limit:limit,offset:offset})
    const response = getPagingData(paging, 1, limit);
    const investments = await Investment.findAll({where:{user_id:req.user.id}})
    if(res.locals.basic)
    percent =res.locals.basic.percent
    investments.forEach(investment=>{
        if(!investment.type){
            invested += investment.amount
            profit += investment.amount*((percent - (today<new Date(investment.end)?diffDate(today, investment.end):0))/percent)
        }
        else{
            collected += investment.amount
        }
    })
    res.render('account/dashboard', {invested:invested, profit:profit, collected:collected, investments:response});
})
router.post('/register', async(req,res)=>{
    const {fullname, email, phone, password, password2} = req.body
    try{
        let user = await User.findOne({where:{email:email}})
        if(user){
            req.flash('message', 'User already exist this email.')
            return res.redirect('register')
        }
        else{
            if(password.length<8){
                req.flash('message', 'Password length must be at least 8 characters')
                return res.redirect('register');
            }
            if(password != password2){
                req.flash('message', 'Password does not match.')
                return res.redirect('register');
            }
            const hash = await bcrypt.hash(password, 10)
             user = await User.create({
                fullname,
                email,
                phone,
                password:hash
            })
            if(user){
                req.login({id:user.id, fullname:user.fullname, email:user.email, phone:user.phone}, (err)=>{
                    if(err)
                    throw err
                    return res.redirect('dashboard')
                })
            }
        }
        
    }
    catch(e){
        console.log(e)
    }

    
})

router.get('/withdraw',authMiddleware, (req,res)=>{
    return res.render('account/withdraw', {message:req.flash('message')});
})
router.get('/cash',authMiddleware, (req,res)=>{
    return res.render('account/cash', {message:req.flash('message')});
})
router.post('/cash',authMiddleware, async(req,res)=>{
    const {amount, bank, account, password, password2} = req.body
    if(!amount){
        req.flash('message', 'Amount to withdraw is required.')
        return res.redirect('cash')
    }
    else if(!bank){
        req.flash('message', 'Bank is required.')
        return res.redirect('cash')
    }
    else if(!account){
        req.flash('message', 'Account number is required.')
        return res.redirect('cash')
    }
    else if(password != password2){
        req.flash('message', 'Password does not match.')
        return res.redirect('cash')
    }
    try{
        let invested = 0;
        let profit = 0;
        let collected = 0;
        let percent = 0;
        let today = new Date()
        if(res.locals.basic)
        percent =res.locals.basic.percent
        const investments = await Investment.findAll({where:{user_id:req.user.id}, include:User})
        investments.forEach(investment=>{
            if(!investment.type){
                invested += investment.amount
                profit += investment.amount*((percent - (today<new Date(investment.end)?diffDate(today, investment.end):0))/percent)
            }
            else{
                collected += investment.amount
            }
        })
        if(amount > (invested+profit-collected)){
            req.flash('message', 'Insulficient balance.')
            return res.redirect('cash')
        }
        if(investments[0].user){
            const validPassword = await bcrypt.compare(password, investments[0].user.password)
            if(!validPassword)
            {
                req.flash('message', 'Invalid Password supplied')
                return res.redirect('cash')
            }
            const withdraw = await Investment.create({
                user_id:req.user.id,
                amount:amount,
                bank:bank,
                account:account,
                type:1,
            })
            if(withdraw)
            return res.redirect('dashboard')
        }
      
    }
    catch(e){console.log(e)}
})
router.post('/withdraw',authMiddleware, async(req,res)=>{
    const {amount, wallet, password, password2} = req.body
    if(!amount){
        req.flash('message', 'Amount to withdraw is required.')
        return res.redirect('withdraw')
    }
    else if(!wallet){
        req.flash('message', 'Wallet is required.')
        return res.redirect('withdraw')
    }
    else if(password != password2){
        req.flash('message', 'Password does not match.')
        return res.redirect('withdraw')
    }
    try{
        let invested = 0;
        let profit = 0;
        let collected = 0;
        let percent = 0;
        let today = new Date()
        if(res.locals.basic)
        percent =res.locals.basic.percent
        const investments = await Investment.findAll({where:{user_id:req.user.id}, include:User})
        investments.forEach(investment=>{
            if(!investment.type){
                invested += investment.amount
                profit += investment.amount*((percent - (today<new Date(investment.end)?diffDate(today, investment.end):0))/percent)
            }
            else{
                collected += investment.amount
            }
        })
        if(amount > (invested+profit-collected)){
            req.flash('message', 'Insulficient balance.')
            return res.redirect('withdraw')
        }
        if(investments[0].user){
            const validPassword = await bcrypt.compare(password, investments[0].user.password)
            if(!validPassword)
            {
                req.flash('message', 'Invalid Password supplied')
                return res.redirect('withdraw')
            }
            const withdraw = await Investment.create({
                user_id:req.user.id,
                amount:amount,
                wallet:wallet,
                type:1,
            })
            if(withdraw)
            return res.redirect('dashboard')
        }
      
    }
    catch(e){console.log(e)}
})
router.get('/deposit',authMiddleware, async(req,res)=>{
    let qr =''
    let wallet=''
    if(res.locals.basic){
        wallet=res.locals.basic.wallet
        qr = await generateQR(wallet)
        
    }
    return res.render('account/deposit', {qr:qr, wallet:wallet});
})
router.get('/invest', authMiddleware,(req,res)=>{
    return res.render('account/invest', {message:req.flash('message')});
})
router.post('/invest',authMiddleware, async(req,res)=>{
    const {amount,hash} = req.body
    const date = new Date();
    date.setDate(date.getDate() + 30); 
    date.setHours(24,59,59,59)
    if(!amount)
        {
            req.flash('message', 'Amount cannot be empty')
            return res.redirect('invest')
        }
    else if(!hash){
        req.flash('message', 'Transaction hash is required')
        return res.redirect('invest')
    }
    try{
       const investment =  await Investment.create({
            user_id:req.user.id,
            amount:amount,
            end:date,
            hash:hash,
            type:0
        })
        if(investment)
        return res.redirect('dashboard');
    }
    catch(e){console.log(e)}
    
})
router.get('/logout', authMiddleware,(req,res)=>{
    req.logout()
    req.session.destroy()
    return res.redirect('login');
})

passport.serializeUser(function(user, done) {
    done(null, user);
  });
  
passport.deserializeUser(function(user, done) {
    done(null, user);
});

module.exports=router