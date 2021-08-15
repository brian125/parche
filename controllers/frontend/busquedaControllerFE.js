const Parche = require('../../models/Parches');
const Grupos = require('../../models/Grupos');
const Usuarios = require('../../models/Usuarios');

const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const moment = require('moment');

exports.resultadosBusqueda = async (req,res) => {
    const { categoria, titulo, ciudad, pais } = req.query;

    let query;
    if(categoria === ''){
        query = '';
    }else {
        query = `where: { 
            categoriaId: { [Op.eq]: ${categoria} }
         }`
    }


    const parches = await Parche.findAll({
        where: { 
            titulo: { [Op.iLike] : '%' + titulo + '%' },
            ciudad: { [Op.iLike] : '%' + ciudad + '%' },
            pais: { [Op.iLike] : '%' + pais + '%' }
         },
         include: [
            {
                model: Grupos,
                query
            },
            {
                model: Usuarios,
                attributes:['id','nombre','imagen']
            }
        ]
    });

    res.render('busqueda', {
        nombrePagina: 'Resultado Búsqueda',
        parches,
        moment
    })



}