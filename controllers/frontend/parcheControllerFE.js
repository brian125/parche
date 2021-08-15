const Parche = require('../../models/Parches');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');
const Categorias = require('../../models/Categorias');
const Comentarios = require('../../models/Comentarios');
const moment = require('moment');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

exports.mostrarParche = async (req,res,next) => {
    const parche = await Parche.findOne({
        where: {
            slug: req.params.slug
        },
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes:['id','nombre','imagen']
            }
        ]
    });

    if (!parche) {
        res.redirect('/')
    }

    //Parches cercanos
    const ubicacion = Sequelize.literal(`ST_GeomFromText( 'POINT( ${parche.ubicacion.coordinates[0]} ${parche.ubicacion.coordinates[1]} )' )`);

    //ST_DISTANCE_Sphere ---> Retorna una linea en metros
    const distancia = Sequelize.fn('ST_DistanceSphere', Sequelize.col('ubicacion'), ubicacion);

    //Encontrar parches cercanos
    const cercanos = await Parche.findAll({
        order: distancia, //Los ordena del mas cercano a lejano
        where: Sequelize.where(distancia, { [Op.lte]: 2000 }), //Dos kilometros
        limit: 4,
        include: [
            {
                model: Grupos
            },
            {
                model: Usuarios,
                attributes:['id','nombre','imagen']
            }
        ]
    });

    console.log(cercanos);

    const comentarios = await Comentarios.findAll({
        where: {parcheId: parche.id},
        include: [
            {
                model: Usuarios,
                attributes:['id','nombre','imagen']
            }
        ]
    })

    res.render('mostrar-parche',{
        nombrePagina: parche.titulo,
        parche,
        comentarios,
        cercanos,
        moment
    })
}

exports.confirmarAsistencia = async(req,res) => {
    
    const {accion} = req.body;
    if (accion === 'confirmar') {
        Parche.update(
            {'interesados': Sequelize.fn('array_append', Sequelize.col('interesados'),req.user.id)},
            {'where': {'slug': req.params.slug}}
            );
        res.send('Has confirmado tu asistencia');
    } else {
        Parche.update(
            {'interesados': Sequelize.fn('array_remove', Sequelize.col('interesados'),req.user.id)},
            {'where': {'slug': req.params.slug}}
            );
        res.send('Has cancelado tu asistencia');
    }
        
}


exports.mostrarAsistentes = async (req,res) => {
    const parche = await Parche.findOne({where: 
        {slug: req.params.slug},
        attributes: ['interesados', 'titulo']
    });

    const {interesados, titulo} = parche;
    const asistentes = await Usuarios.findAll({
        attributes: ['nombre','imagen'],
        where:{ id: interesados}
    });

    res.render('asistentes-parche', {
        nombrePagina: `Listado asistentes a ${titulo}`,
        asistentes
    })
}

exports.mostrarCategoria = async(req,res,next) => {
    const categoria = await Categorias.findOne({
        attributes: ['id', 'nombre'],
        where: {slug: req.params.categoria}
    });
    const parches = await Parche.findAll({
        order: [['fecha', 'ASC'], ['hora','ASC']],
        include: [
            {
                model: Grupos,
                where: {categoriaId: categoria.id}
            },
            {
                model: Usuarios
            }
        ]
    });

    res.render('categoria', {
        nombrePagina: `Categoria ${categoria.nombre}`,
        parches,
        moment
    })
}