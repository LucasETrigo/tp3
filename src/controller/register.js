import { usuariosDao } from "../daos/index.js";
import { createHash } from "../utils/crypt.js";
import { sendMailNewUser } from "../utils/nodemailer.js";
import { sendWhatsAppNewUser } from "../utils/twilio.js";

export const postRegisterController = async (req, res) => {
    const usuarios = await usuariosDao.listarAll();
    const email = req.body.email;
    const password = createHash(req.body.password);
    if (usuarios.find((usuario) => usuario.email == email)) {
        req.session.message =
            "Este email ya se encuentra registrado, prueba con otro";
        req.session.route = "register";
        req.session.fileName = req.body.fileName;
        res.redirect("/error");
    } else {
        const newUser = {
            nombre: req.body.nombre,
            direccion: req.body.direccion,
            edad: req.body.edad,
            email: email,
            password: password,
            photo: req.body.fileName,
            phone: "+549" + req.body.telefono,
        };

        await usuariosDao.guardar(newUser).then((res) => {
            sendMailNewUser(newUser);
            sendWhatsAppNewUser(newUser);
        });

        const msg = `NUEVO USUARIO REGISTARDO
        NOMBRE: ${newUser.nombre}
        DIRECCION: ${newUser.direccion}
        EDAD: ${newUser.edad}
        TELEFONO: ${newUser.phone}
        EMAIL: ${newUser.email}
        FOTO PERFIL:  /uploads/${newUser.photo}
        -----------------AQUITERMINA-----------------`;

        res.redirect("/login");
    }
};

export const getRegisterController = (req, res) => {
    res.render("pages/register");
};
