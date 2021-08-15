const Categorias = require('../models/Categorias');
const Grupos = require('../models/Grupos');

const multer = require('multer');
const shortid = require('shortid');
const fs = require('fs');
const uuid = require('uuid').v4;

const configuracionMulter = {
    limits: { fileSize: 1000000 },
    storage: fileStorage = multer.diskStorage({
        destination: (req,file,next) => {
            next(null, __dirname+'/../public/uploads/grupos/');
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

exports.formNuevoGrupo = async (req,res) => {
    const categorias = await Categorias.findAll();
    res.render('nuevo-grupo' , {
        nombrePagina: 'Crea un nuevo grupo',
        categorias
    })
}

//Almacena los grupos en la bd
exports.crearGrupo = async (req, res) => {
    //Sanitizar
    req.sanitizeBody('nombre');
    req.sanitizeBody('url')
    
    const grupo = req.body;
    grupo.usuarioId = req.user.id;
    grupo.categoriaId = req.body.categoria;

    //Leer la imagen
    if (req.file) {
        grupo.imagen = req.file.filename;    
    }

    grupo.id = uuid();

    try {
        await Grupos.create(grupo);
        req.flash('exito', 'Se ha creado el grupo satisfactoriamente');
        res.redirect('/administracion'); 
    } catch (error) {
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-grupo');
    }
}

exports.formEditarGrupo = async (req,res) => {
    const consultas = [];
    consultas.push( Grupos.findByPk(req.params.grupoId) );
    consultas.push( Categorias.findAll() );

    //Promise con await
    const [grupo, categorias] = await Promise.all(consultas);

    res.render('editar-grupo', {
        nombrePagina: `Editar Grupo: ${grupo.nombre}`,
        grupo,
        categorias
    })
}

exports.editarGrupo = async (req,res,next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id }});

    //Si no existe el grupo o no es el dueño
    if (!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    const { nombre, descripcion, categoria, url } = req.body;

    grupo.nombre = nombre;
    grupo.descripcion = descripcion;
    grupo.categoriaId = categoria;
    grupo.url = url;

    await grupo.save();
    req.flash('exito', 'Cambios almacenados correctamente');
    res.redirect('/administracion');

}

exports.formEditarImagen = async (req,res) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id }});
    
    res.render('imagen-grupo', {
        nombrePagina: `Editar imagen grupo: ${grupo.nombre}`,
        grupo
    })
}

exports.editarImagen = async (req,res,next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId: req.user.id }});

    if (!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/iniciar-sesion');
        return next();
    }

    if (req.file && grupo.imagen) {
        const imagenAnteriorPath = __dirname+`/../public/uploads/grupos/${grupo.imagen}`;

        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
            }
            return;
        })
    }

    if (req.file) {
        grupo.imagen = req.file.filename;
    }

    await grupo.save();
    req.flash('exito', 'Cambios almacenados correctamente');
    res.redirect('/administracion');

}

exports.formEliminarGrupo = async (req,res) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId:req.user.id }});
    
    if (!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion')
        return next();
    }

    res.render('eliminar-grupo', {
        nombrePagina: `Eliminar grupo: ${grupo.nombre}`
    })

}

exports.eliminarGrupo = async (req,res,next) => {
    const grupo = await Grupos.findOne({ where: { id: req.params.grupoId, usuarioId:req.user.id }});
    
    if (!grupo) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion')
        return next();
    }

    if (grupo.imagen) {
        const imagenAnteriorPath = __dirname+`/../public/uploads/grupos/${grupo.imagen}`;

        fs.unlink(imagenAnteriorPath, (error) => {
            if (error) {
                console.log(error);
            }
            return;
        })    
    }

    await Grupos.destroy({
        where: {
            id: req.params.grupoId
        }
    });

    req.flash('exito', 'Grupo eliminado');
    res.redirect('/administracion');

}