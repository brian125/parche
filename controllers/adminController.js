const Grupos = require("../models/Grupos");
const Parches = require("../models/Parches");
const moment = require("moment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

exports.panelAdministracion = async (req, res) => {
    const consultas = [];
    consultas.push(Grupos.findAll({ where: { usuarioId: req.user.id } }));
    consultas.push(
        Parches.findAll({
            where: {
                usuarioId: req.user.id,
                fecha: { [Op.gte]: moment(new Date()).format("YYYY-MM-DD") },
            },
        })
    );
    consultas.push(
        Parches.findAll({
            where: {
                usuarioId: req.user.id,
                fecha: { [Op.lt]: moment(new Date()).format("YYYY-MM-DD") },
            }, order : [
                ['fecha', 'DESC']
            ]
        })
    );

    const [grupos, parches, anteriores] = await Promise.all(consultas);

    res.render("administracion", {
        nombrePagina: "Panel de administración",
        grupos,
        parches,
        anteriores,
        moment,
    });
};
