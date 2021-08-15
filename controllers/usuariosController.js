const Usuarios = require('../models/Usuarios');
const enviarEmail = require('../handlers/emails');


const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');

const configuracionMulter = {
    limits: { fileSize: 1000000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req,file,next) => {
            next(null, __dirname+'/../public/uploads/perfiles/');
        },
        filename: (req,file,next) => {
            const extension = file.mimetype.split('/')[1];
            next(null, `${shortid.generate()}.${extension}`);
        }
    }),
    fileFilter(req,file,next) {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            next(null, true);
        }else {
            next(new Error('Formato no válido'), false);
        }
    }
}

const upload = multer(configuracionMulter).single('imagen');

exports.subirImagen = (req,res,next) => {
    upload(req,res, function(error){
        if (error) {
            if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                    req.flash('error', 'La imagen es muy grande');
                }else {
                    req.flash('error', error.message);
                }
            } else if(error.hasOwnProperty('message')) {
                req.flash('error', error.message);
            }
        res.redirect('back');
        return;
        } else {
            next();
        }
    })
}

exports.formCrearCuenta = (req,res) => {
    res.render('crear-cuenta', {
        nombrePagina: 'Crea tu Cuenta'
    });
}

exports.crearNuevaCuenta = async(req,res) => {
    const usuario = req.body;

    req.checkBody('confirmar', 'El password confirmado no puede ir vacío').notEmpty();
    req.checkBody('confirmar', 'El password es diferente').equals(req.body.password);

    //leer los errores de express
    const erroresExpress = req.validationErrors();

    try {
        await Usuarios.create(usuario);

        //Url de confirmación
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`

        //Enviar Email de confirmación
        await enviarEmail.enviarEmail({
            usuario,
            url,
            subject: 'Confirma tu cuenta de Parche',
            archivo: 'confirmar-cuenta'
        })

        //Flash message y redireccionar
        req.flash('exito', 'Hemos enviado un E-mail, ¡Confirma tu cuenta!');
        res.redirect('/iniciar-sesion');
    } catch (error) {
        
        if (error.errors) {
            const erroresSequelize = error.errors.map(err => err.message);
            const  listaErrores = [...erroresSequelize];
            req.flash('error', listaErrores);
            res.redirect('/crear-cuenta');
        }else {
            const errExp = erroresExpress.map(err => err.msg );
            const  listaErrores = [...errExp];
            req.flash('error', listaErrores);
            res.redirect('/crear-cuenta');
        } 
    }
}

//Confirma la suscripción del usuario
exports.confirmarCuenta = async (req,res,next) => {
    //Verificar que el usuario existe
    const usuario = await Usuarios.findOne({where: { email: req.params.correo }});

    //Si no existe, redireccionar
    if (!usuario) {
        req.flash('error', 'No existe esa cuenta');
        res.redirect('/crear-cuenta');
        return next();
    }

    //si existe, confirmar suscripción y redireccionar
    usuario.activo = 1;
    await usuario.save();

    req.flash('exito', 'La cuenta se ha confirmado, ya puedes iniciar sesión');
    res.redirect('/iniciar-sesion');
}

//Formulario para iniciar sesion
exports.formIniciarSesion = (req,res) => {
    res.render('iniciar-sesion', {
        nombrePagina: 'Iniciar sesion'
    });
}


//***Editar perfiles ***//


exports.formEditarPerfil = async (req, res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('editar-perfil', {
        nombrePagina: 'Editar Perfil',
        usuario
    })
}

exports.editarPerfil = async (req,res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    req.sanitizeBody('nombre');
    req.sanitizeBody('email');

    const { nombre, descripcion,  email } = req.body;

    usuario.nombre = nombre;
    usuario.descripcion = descripcion;
    usuario.email = email;

    await usuario.save();
    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');
}

exports.formCambiarPassword = async (req,res) => {
    res.render('cambiar-password',{
        nombrePagina: 'Cambiar password'
    })
}

exports.cambiarPassword = async (req,res,next) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    if (!usuario.validarPassword(req.body.anterior)) {
        req.flash('error', 'El password actual es incorrecto');
        res.redirect('/administracion');
        return next();
    }

    const hash = usuario.hashPassword(req.body.nuevo);

    usuario.password = hash;

    await usuario.save();


    req.logout();
    req.flash('exito', 'Password Modificado correctamente, vuelve a iniciar sesión');
    res.redirect('/iniciar-sesion');

}

exports.formSubirImagenPerfil = async(req,res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    res.render('imagen-prefil',{
        nombrePagina: 'Subir imagen perfil',
        usuario
    })
}


exports.guardarImagenPerfil = async (req,res) => {
    const usuario = await Usuarios.findByPk(req.user.id);

    if (req.file && usuario.imagen) {
        const imagenAnteriorPath = __dirname+`/../public/uploads/perfiles/${usuario.imagen}`;

        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
            }
            return;
        })
    }

    if (req.file) {
        usuario.imagen = req.file.filename;
    }

    await usuario.save();
    req.flash('exito', 'Cambios almacenados correctamente');
    res.redirect('/administracion');

}