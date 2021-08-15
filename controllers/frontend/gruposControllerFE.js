const Grupos = require('../../models/Grupos');
const Parche = require('../../models/Parches');
const moment = require('moment');

exports.mostrarGrupo = async (req,res, next) => {
    const consultas = [];
    consultas.push(Grupos.findOne({where: {id: req.params.id}}));
    consultas.push(Parche.findAll({where: {grupoId: req.params.id},
        order: [
            ['fecha','ASC']
        ]
    }));

    const [grupo,parches] = await Promise.all(consultas);

    if(!grupo){
        res.redirect('/')
        return next();
    }

    res.render('mostrar-grupo', {
        nombrePagina: `Grupo ${grupo.nombre}`,
        grupo,
        parches,
        moment
    })

}