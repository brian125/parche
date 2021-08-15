const Sequelize = require('sequelize');
const db = require('../config/db');
const uuid = require('uuid').v4;
const slug = require('slug');
const shortid = require('shortid');

const Usuarios = require('./Usuarios');
const Grupos = require('./Grupos');

const Parche = db.define(
    'parche', {
        id: {
            type: Sequelize.UUID,
            primaryKey: true,
            allowNull: false,
        },
        titulo: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega un titulo'
                }
            }
        },
        slug: {
            type: Sequelize.STRING
        },
        invitado: Sequelize.STRING,
        cupo: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        descripcion: {
            type: Sequelize.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega una descripción'
                }
            }
        },
        fecha: {
            type: Sequelize.DATEONLY,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega una fecha para el parche'
                }
            }
        },
        hora: {
            type: Sequelize.TIME,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega una hora para el parche'
                }
            }
        },
        direccion: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega una dirección'
                }
            }
        },
        ciudad: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega una ciudad'
                }
            }
        },
        estado: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega un municipio'
                }
            }
        },
        pais: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: 'Agrega un país'
                }
            }
        },
        ubicacion: {
            type: Sequelize.GEOMETRY('POINT'),
            
        },
        interesados: {
            type: Sequelize.ARRAY(Sequelize.INTEGER),
            defaultValue: []
        }
    }, {
        hooks: {
            async beforeCreate(parche) {
                const url = slug(parche.titulo).toLowerCase();
                parche.slug = `${url}-${shortid.generate()}`;
                parche.grupoId = parche.grupoId.trim();
                console.log(parche.grupoId+"\'")
            }
        }
    });

Parche.belongsTo(Usuarios);
Parche.belongsTo(Grupos);

module.exports = Parche;