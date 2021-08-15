const express = require('express');
const router = express.Router();

const homeController = require('../controllers/homeController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');
const adminController = require('../controllers/adminController');
const gruposController = require('../controllers/gruposController');
const parcheController = require('../controllers/parcheController');

const parcheControllerFE = require('../controllers/frontend/parcheControllerFE');
const usuariosControllerFE = require('../controllers/frontend/usuariosControllerFE');
const gruposControllerFE = require('../controllers/frontend/gruposControllerFE');
const comentariosControllerFE = require('../controllers/frontend/comentariosControllerFE');
const busquedaControllerFE = require('../controllers/frontend/busquedaControllerFE');



module.exports = function() {
    router.get('/', homeController.home);

    router.get('/parche/:slug',parcheControllerFE.mostrarParche);

    router.post('/confirmar-asistencia/:slug',parcheControllerFE.confirmarAsistencia);

    router.get('/asistentes/:slug', parcheControllerFE.mostrarAsistentes);

    router.post('/parche/:id', comentariosControllerFE.agregarComentario);
    router.post('/eliminar-comentario', comentariosControllerFE.eliminarComentario)

    router.get('/usuarios/:id',usuariosControllerFE.mostrarUsuario);

    router.get('/grupos/:id', gruposControllerFE.mostrarGrupo);

    router.get('/categoria/:categoria', parcheControllerFE.mostrarCategoria);

    router.get('/busqueda', busquedaControllerFE.resultadosBusqueda);

    router.get('/crear-cuenta', usuariosController.formCrearCuenta);
    router.post('/crear-cuenta', usuariosController.crearNuevaCuenta);
    router.get('/confirmar-cuenta/:correo', usuariosController.confirmarCuenta);

    router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
    router.post('/iniciar-sesion', authController.autenticarUsuario);

    router.get('/cerrar-sesion',
        authController.usuarioAutenticado,
        authController.cerrarSesion
    );

    router.get('/administracion',
        authController.usuarioAutenticado,
        adminController.panelAdministracion);

    router.get('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.formNuevoGrupo
    );
    router.post('/nuevo-grupo',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.crearGrupo
    );

    router.get('/editar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarGrupo
    );
    router.post('/editar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.editarGrupo
    );

    router.get('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEditarImagen
    );
    router.post('/imagen-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.subirImagen,
        gruposController.editarImagen
    );

    router.get('/eliminar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.formEliminarGrupo
    );
    router.post('/eliminar-grupo/:grupoId',
        authController.usuarioAutenticado,
        gruposController.eliminarGrupo
    );

    router.get('/nuevo-parche',
        authController.usuarioAutenticado,
        parcheController.formNuevoParche
    );
    router.post('/nuevo-parche',
        authController.usuarioAutenticado,
        parcheController.sanitizarParche,
        parcheController.crearParche
    );

    router.get('/editar-parche/:id',
        authController.usuarioAutenticado,
        parcheController.formEditarParche
    );
    router.post('/editar-parche/:id',
        authController.usuarioAutenticado,
        parcheController.editarParche
    );
    router.get('/eliminar-parche/:id',
        authController.usuarioAutenticado,
        parcheController.formEliminarParche
    );
    router.post('/eliminar-parche/:id',
        authController.usuarioAutenticado,
        parcheController.eliminarParche
    );

    router.get('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.formEditarPerfil
    );
    router.post('/editar-perfil',
        authController.usuarioAutenticado,
        usuariosController.editarPerfil
    );

    router.get('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.formCambiarPassword
    );
    router.post('/cambiar-password',
        authController.usuarioAutenticado,
        usuariosController.cambiarPassword
    );

    router.get('/imagen-perfil',
        authController.usuarioAutenticado,
        usuariosController.formSubirImagenPerfil
    );
    router.post('/imagen-perfil',
        authController.usuarioAutenticado,
        usuariosController.subirImagen,
        usuariosController.guardarImagenPerfil
    );

    return router;
}

