const Grupos = require('../models/Grupos');
const Parche = require('../models/Parches');

const uuid = require('uuid').v4;

exports.formNuevoParche = async(req,res) => {
    const grupos = await Grupos.findAll({where: {usuarioId: req.user.id}});
    
    res.render('nuevo-parche', {
        nombrePagina: 'Crear nuevo parche',
        grupos
    })
}

exports.crearParche = async (req,res) => {
    const parche = req.body;
    parche.usuarioId = req.user.id;
    const point = { type:'Point', coordinates: [ parseFloat(req.body.lat), parseFloat(req.body.lng) ]};
    parche.ubicacion = point;

    if(req.body.cupo ===  ''){
        parche.cupo = 0;
    }

    parche.id = uuid();

    try {
        await Parche.create(parche);
        req.flash('exito', 'Se ha creado el parche correctamente');
        res.redirect('/administracion');
    } catch (error) {
        console.log(error);
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-parche');
    }
}

exports.sanitizarParche = (req,res,next) => {
    req.sanitizeBody('titulo');
    req.sanitizeBody('invitado');
    req.sanitizeBody('cupo');
    req.sanitizeBody('fecha');
    req.sanitizeBody('hora');
    req.sanitizeBody('direccion');
    req.sanitizeBody('ciudad');
    req.sanitizeBody('estado');
    req.sanitizeBody('pais');
    req.sanitizeBody('lat');
    req.sanitizeBody('lng');
    req.sanitizeBody('grupoId');

    next();

}

exports.formEditarParche = async (req,res,next) => {
    const consultas = [];
    consultas.push( Grupos.findAll({ where: {usuarioId: req.user.id}}));
    consultas.push( Parche.findByPk(req.params.id));

    const [grupos, parches] = await Promise.all(consultas);

    if (!grupos || !parches) {
        req.flash('error', 'Operación no válida');
        req.redirect('/administracion');
        return next()
    }

    res.render('editar-parche',{
        nombrePagina: `Editar parche: ${parches.titulo}`,
        grupos,
        parches
    })
}

exports.editarParche = async (req,res,next) => {
    const parche = await Parche.findOne({where: { id: req.params.id, usuarioId: req.user.id}});
    
    if (!parche) {
        req.flash('error', 'Operación no válida');
        req.redirect('/administracion');
        return next();
    }

    const {grupoId, titulo, invitado , fecha , hora, cupo , descripcion, direccion , ciudad, estado, pais , lat , lng} = req.body

    parche.grupoId = parche.grupoId.trim();
    parche.titulo = titulo;
    parche.invitado = invitado;
    parche.fecha = fecha;
    parche.hora = hora;
    parche.cupo = cupo;
    parche.descripcion = descripcion;
    parche.direccion = direccion;
    parche.ciudad = ciudad;
    parche.estado = estado;
    parche.pais = pais;

    const point = { type: 'Point', coordinates: [parseFloat(lat), parseFloat(lng)]};
    parche.ubicacion = point;

    console.log(parche);

    await parche.save();
    req.flash('exito', 'Cambios guardados correctamente');
    res.redirect('/administracion');

}

exports.formEliminarParche = async (req,res,next) => {
    const parche = await Parche.findOne({where: {id: req.params.id, usuarioId: req.user.id}});

    if (!parche) {
        req.flash('error', 'Operación no válida');
        res.redirect('/administracion');
        return next();
    }

    res.render('eliminar-parche', {
        nombrePagina: `Eliminar parche: ${parche.titulo}`

    })
}

exports.eliminarParche = async (req,res) => {
    await Parche.destroy({
        where: {
            id: req.params.id
        }
    })

    req.flash('exito', 'Parche eliminado');
    res.redirect('/administracion')
}