const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const Usuarios = require('../models/Usuarios');

passport.use(new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
    },
    async (email,password,next) => {
        const usuario = await Usuarios.findOne({
            where: {email ,  activo:1}});

        if (!usuario) {
            return next(null, false, {
                message: 'El usuario no existe'
            });
        }

        const verificarPass = usuario.validarPassword(password);
        if (!verificarPass) {
            return next(null, false, {
                message: 'Password incorrecto'
            })
        }

        return next(null, usuario);
    }

));

passport.serializeUser(function(usuario, cb) {
    cb(null, usuario);
});

passport.deserializeUser(function(usuario, cb) {
    cb(null, usuario);
});

module.exports = passport;