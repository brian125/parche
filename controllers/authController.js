const passport = require('passport');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect: '/administracion',
    failureRedirect: '/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
});

//Revisa si el usuario está autenticado o no
exports.usuarioAutenticado = (req,res,next) => {
    if(req.isAuthenticated()) {
        return next();
    }

    return res.redirect('/iniciar-sesion');
}


exports.cerrarSesion = (req,res,next) => {
    req.logout();
    req.flash('exito','Cerraste sesión satisfactoriamente');
    res.redirect('/iniciar-sesion');
    next();
}