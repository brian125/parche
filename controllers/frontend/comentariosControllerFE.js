const Comentarios = require('../../models/Comentarios');
const Parches = require('../../models/Parches');

exports.agregarComentario = async (req,res,next) => {
    const {comentario} = req.body;

    await Comentarios.create({
        mensaje: comentario,
        usuarioId: req.user.id,
        parcheId: req.params.id
    });

    res.redirect('back');
    next();
}

exports.eliminarComentario = async (req,res,next) => {
    const {comentarioId} = req.body;

    const comentario = await Comentarios.findOne({
        where: {id: comentarioId}
    });

    if(!comentario){
        res.status(404).send('Acción no válida');
        return next();
    }

    const parches = await Parches.findOne({
        where: {id: comentario.parcheId}
    });

    if(comentario.usuarioId === req.user.id || parches.usuarioId === req.user.id){
        await Comentarios.destroy({
            where: {id: comentario.id}
        });

        res.status(200).send('Eliminado correctamente');
        return next();
    }else {
        res.status(403).send('Acción no válida');
        return next();
    }
}