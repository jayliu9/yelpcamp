const User = require('../models/user')

module.exports.registerForm = (req, res)=>{
    res.render('users/register')
}

module.exports.createUser = async (req, res)=>{
    try{
     const{email, username, password} = req.body;
     const user = await new User({email, username});
     const registerUser = await User.register(user, password);
     req.login(registerUser, err=>{
         if(err) return next(err);
         req.flash('success',`Welcome to Yelp Camp! ${username}`)
         res.redirect('/campgrounds')
     })
    }catch(e){
     req.flash('error', e.message)   
     res.redirect('/register')
 }}

module.exports.loginForm = (req, res)=>{
    res.render('users/login')
}

module.exports.login =(req, res)=>{
    req.flash('success', `welcome back! ${req.body.username}`);
    const redirectUrl = req.session.returnTo || '/campgrounds'
    delete req.session.returnTo
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res) =>{
    req.logout();
    req.flash('success', 'Goodbye!')
    res.redirect('/campgrounds')
}