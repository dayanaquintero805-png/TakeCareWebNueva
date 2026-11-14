document.addEventListener("DOMContentLoaded", function () {

    console.log("Take Care: JavaScript cargado correctamente");

    // ==========================================
    // CONFIGURACIÓN GENERAL
    // ==========================================

    const API_URL = "https://take-care-of-your-mind-health.onrender.com/api";

    const secciones = document.querySelectorAll("main section");
    const botonesNavegacion = document.querySelectorAll("[data-seccion]");

    const botonesEmociones = document.querySelectorAll(".emotion");

    const formularioCuenta = document.getElementById("formularioCuenta");
    const formularioSesion = document.getElementById("formularioSesion");
    const formularioRegistro = document.getElementById("formularioRegistro");

    const usuarioRegistro = document.getElementById("usuarioRegistro");
    const contrasenaRegistro = document.getElementById("contrasenaRegistro");
    const usuarioSesion = document.getElementById("usuarioSesion");
    const contrasenaSesion = document.getElementById("contrasenaSesion");

    const comentario = document.getElementById("comentario");
    const contador = document.getElementById("contadorCaracteres");
    const historial = document.getElementById("listaHistorial");

    const botonCerrarSesion = document.getElementById("btnCerrarSesion");

    const mensaje = document.getElementById("mensaje");
    const mensajeCuenta = document.getElementById("mensajeCuenta");
    const mensajeSesion = document.getElementById("mensajeSesion");

    let emocionSeleccionada = "";
    let usuarioActual = "";

    // ==========================================
    // NAVEGACIÓN ENTRE SECCIONES
    // ==========================================

    function mostrarSeccion(id) {

        const seccionesPrivadas = [
            "registro",
            "historial",
            "actividades",
            "recursos",
            "recordatorios",
            "perfil",
            "ajustes"
        ];

        if (seccionesPrivadas.includes(id) && !usuarioActual) {
            alert("Debes iniciar sesión para acceder a esta sección.");
            id = "inicio";
        }

        secciones.forEach(function (seccion) {
            seccion.classList.toggle("hidden", seccion.id !== id);
        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        if (id === "historial" && usuarioActual) {
            mostrarHistorial();
        }

        if (id === "perfil" && usuarioActual) {
            mostrarPerfil();
        }

        if (id === "recordatorios" && usuarioActual) {
            cargarRecordatorio();
        }

        if (id === "ajustes") {
            actualizarEstadoNotificaciones();
        }
    }

    botonesNavegacion.forEach(function (boton) {

        boton.addEventListener("click", function () {
            mostrarSeccion(boton.dataset.seccion);
        });

    });

    // ==========================================
    // MENSAJES
    // ==========================================

    function mostrarMensaje(elemento, texto, tipo) {

        if (!elemento) return;

        elemento.textContent = texto;
        elemento.className = "message " + tipo;
    }

    function limpiarMensaje(elemento) {

        if (!elemento) return;

        elemento.textContent = "";
        elemento.className = "message";
    }

    // ==========================================
    // CONEXIÓN CON EL SERVIDOR
    // ==========================================

    async function enviarSolicitud(url, datos) {

        const respuesta = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos)
        });

        let resultado = {};

        try {
            resultado = await respuesta.json();
        } catch (error) {
            resultado = {};
        }

        if (!respuesta.ok) {
            throw new Error(
                resultado.mensaje || "No fue posible completar la solicitud."
            );
        }

        return resultado;
    }

    // ==========================================
    // CREAR CUENTA
    // ==========================================

    if (formularioCuenta) {

        formularioCuenta.addEventListener("submit", async function (evento) {

            evento.preventDefault();
            limpiarMensaje(mensajeCuenta);

            const usuario = usuarioRegistro.value.trim();
            const contrasena = contrasenaRegistro.value;
            const correo = document.getElementById("correoRegistro").value.trim();

            if (!usuario || !correo || !contrasena) {

                mostrarMensaje(
                    mensajeCuenta,
                    "Completa el usuario, el correo y la contraseña.",
                    "error"
                );

                return;
            }

            if (contrasena.length < 8 || contrasena.length > 72) {

                mostrarMensaje(
                    mensajeCuenta,
                    "La contraseña debe tener entre 8 y 72 caracteres.",
                    "error"
                );

                return;
            }

            try {

                const resultado = await enviarSolicitud(
                    API_URL + "/auth/registro",
                    {
                        usuario: usuario,
                        correo: correo,
                        contrasena: contrasena
                    }
                );

                mostrarMensaje(
                    mensajeCuenta,
                    resultado.mensaje || "Cuenta creada correctamente.",
                    "success"
                );

                formularioCuenta.reset();

            } catch (error) {

                mostrarMensaje(
                    mensajeCuenta,
                    error.message.includes("Failed to fetch")
                        ? "No se pudo conectar con el servidor. Inténtalo nuevamente."
                        : error.message,
                    "error"
                );

            }

        });

    }

    // ==========================================
    // INICIAR SESIÓN
    // ==========================================

    if (formularioSesion) {

        formularioSesion.addEventListener("submit", async function (evento) {

            evento.preventDefault();
            limpiarMensaje(mensajeSesion);

            const usuario = usuarioSesion.value.trim();
            const contrasena = contrasenaSesion.value;

            if (!usuario || !contrasena) {

                mostrarMensaje(
                    mensajeSesion,
                    "Ingresa tu usuario y contraseña.",
                    "error"
                );

                return;
            }

            try {

                const resultado = await enviarSolicitud(
                    API_URL + "/auth/login",
                    {
                        usuario: usuario,
                        contrasena: contrasena
                    }
                );

                usuarioActual = usuario;

                if (botonCerrarSesion) {
                    botonCerrarSesion.hidden = false;
                }

                mostrarMensaje(
                    mensajeSesion,
                    resultado.mensaje || "Inicio de sesión correcto.",
                    "success"
                );

                formularioSesion.reset();

                mostrarPerfil();
                cargarRecordatorio();

                mostrarSeccion("registro");

            } catch (error) {

                mostrarMensaje(
                    mensajeSesion,
                    error.message.includes("Failed to fetch")
                        ? "No se pudo conectar con el servidor. Inténtalo nuevamente."
                        : error.message,
                    "error"
                );

            }

        });

    }

    // ==========================================
    // CERRAR SESIÓN
    // ==========================================

    if (botonCerrarSesion) {

        botonCerrarSesion.addEventListener("click", function () {

            usuarioActual = "";
            emocionSeleccionada = "";

            botonCerrarSesion.hidden = true;

            botonesEmociones.forEach(function (boton) {
                boton.classList.remove("selected");
            });

            if (formularioRegistro) {
                formularioRegistro.reset();
            }

            if (contador) {
                contador.textContent = "0/250";
            }

            if (historial) {
                historial.replaceChildren();
            }

            mostrarSeccion("inicio");

            mostrarMensaje(
                mensaje,
                "Sesión cerrada correctamente.",
                "success"
            );

        });

    }

    // ==========================================
    // SELECCIÓN DE EMOCIONES
    // ==========================================

    botonesEmociones.forEach(function (boton) {

        boton.addEventListener("click", function () {

            botonesEmociones.forEach(function (otroBoton) {
                otroBoton.classList.remove("selected");
            });

            boton.classList.add("selected");

            emocionSeleccionada = boton.dataset.emocion;

            limpiarMensaje(mensaje);

        });

    });

    // ==========================================
    // FECHA ACTUAL
    // ==========================================

    function obtenerFechaActual() {

        const hoy = new Date();

        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");

        return anio + "-" + mes + "-" + dia;
    }

    // ==========================================
    // CONTADOR DE CARACTERES
    // ==========================================

    if (comentario && contador) {

        comentario.addEventListener("input", function () {

            contador.textContent = comentario.value.length + "/250";

        });

    }

    // ==========================================
    // GUARDAR REGISTRO EMOCIONAL
    // ==========================================

    if (formularioRegistro) {

        formularioRegistro.addEventListener("submit", async function (evento) {

            evento.preventDefault();
            limpiarMensaje(mensaje);

            if (!usuarioActual) {

                mostrarMensaje(
                    mensaje,
                    "Para guardar un registro, primero inicia sesión.",
                    "error"
                );

                mostrarSeccion("iniciarSesion");

                return;
            }

            const textoComentario = comentario.value.trim();

            const errorValidacion = validarRegistro(
                emocionSeleccionada,
                textoComentario
            );

            if (errorValidacion) {

                mostrarMensaje(
                    mensaje,
                    errorValidacion,
                    "error"
                );

                return;
            }

            try {

                const respuesta = await fetch(API_URL + "/registros", {

                    method: "POST",
                    credentials: "include",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        nombreUsuario: usuarioActual,
                        fecha: obtenerFechaActual(),
                        estadoAnimo: emocionSeleccionada,
                        comentario: textoComentario

                    })

                });

                let resultado = {};

                try {
                    resultado = await respuesta.json();
                } catch (error) {
                    resultado = {};
                }

                if (!respuesta.ok) {

                    throw new Error(
                        resultado.mensaje || "No se pudo guardar el registro."
                    );

                }

                mostrarMensaje(
                    mensaje,
                    "¡Tu registro emocional se guardó en el servidor!",
                    "success"
                );

                formularioRegistro.reset();

                emocionSeleccionada = "";

                botonesEmociones.forEach(function (boton) {
                    boton.classList.remove("selected");
                });

                contador.textContent = "0/250";

                await mostrarHistorial();

            } catch (error) {

                mostrarMensaje(
                    mensaje,
                    error.message.includes("Failed to fetch")
                        ? "No se pudo conectar con el servidor. Inténtalo nuevamente."
                        : error.message,
                    "error"
                );

            }

        });

    }
        // ==========================================
    // CONSULTAR HISTORIAL EMOCIONAL
    // ==========================================

    async function mostrarHistorial() {

        if (!historial) return;

        historial.replaceChildren();

        if (!usuarioActual) {

            const texto = document.createElement("p");

            texto.textContent =
                "Inicia sesión para consultar tu historial.";

            historial.appendChild(texto);

            return;
        }

        try {

            const respuesta = await fetch(
                API_URL + "/registros/" + encodeURIComponent(usuarioActual),
                {
                    credentials: "include"
                }
            );

            if (!respuesta.ok) {
                throw new Error("No fue posible consultar el historial.");
            }

            const registros = await respuesta.json();

            if (!Array.isArray(registros) || registros.length === 0) {

                const texto = document.createElement("p");

                texto.textContent =
                    "Todavía no tienes registros emocionales.";

                historial.appendChild(texto);

                return;
            }

            registros.forEach(function (registro) {

                const tarjeta = document.createElement("article");
                tarjeta.className = "record";

                const fecha = document.createElement("p");
                fecha.textContent = "Fecha: " + registro.fecha;

                const emocion = document.createElement("p");
                emocion.textContent =
                    "Estado de ánimo: " + registro.estadoAnimo;

                const detalle = document.createElement("p");
                detalle.textContent = registro.comentario || "";

                tarjeta.append(fecha, emocion, detalle);

                historial.appendChild(tarjeta);

            });

        } catch (error) {

            const texto = document.createElement("p");

            texto.textContent =
                "No se pudo cargar el historial. Comprueba que el servidor esté funcionando.";

            historial.appendChild(texto);

        }

    }

    // ==========================================
    // ACTIVIDAD DE RESPIRACIÓN
    // ==========================================

    const btnIniciarRespiracion =
        document.getElementById("btnIniciarRespiracion");

    const btnDetenerRespiracion =
        document.getElementById("btnDetenerRespiracion");

    const instruccionRespiracion =
        document.getElementById("instruccionRespiracion");

    const tiempoFase =
        document.getElementById("tiempoFase");

    const tiempoRestante =
        document.getElementById("tiempoRestante");

    const circuloRespiracion =
        document.getElementById("circuloRespiracion");

    const mensajeRespiracion =
        document.getElementById("mensajeRespiracion");

    let temporizadorRespiracion = null;
    let tiempoTotalRespiracion = 60;
    let segundoFase = 0;
    let faseRespiracion = "inhalar";

    function detenerRespiracion(texto) {

        if (temporizadorRespiracion !== null) {

            clearInterval(temporizadorRespiracion);

            temporizadorRespiracion = null;

        }

        btnIniciarRespiracion.disabled = false;

        instruccionRespiracion.textContent = "¿Empezamos?";

        tiempoFase.textContent =
            "Cuando quieras, puedes volver a intentarlo.";

        circuloRespiracion.classList.remove("respirando");

        mensajeRespiracion.textContent = texto;

    }

    function actualizarFaseRespiracion() {

        if (faseRespiracion === "inhalar") {

            instruccionRespiracion.textContent = "Inhala suavemente";

            tiempoFase.textContent =
                "Inspira durante 4 segundos, sin forzar.";

            circuloRespiracion.classList.add("respirando");

        } else {

            instruccionRespiracion.textContent = "Exhala suavemente";

            tiempoFase.textContent =
                "Suelta el aire durante 4 segundos.";

            circuloRespiracion.classList.remove("respirando");

        }

    }

    if (
        btnIniciarRespiracion &&
        btnDetenerRespiracion &&
        instruccionRespiracion &&
        tiempoFase &&
        tiempoRestante &&
        circuloRespiracion &&
        mensajeRespiracion
    ) {

        btnIniciarRespiracion.addEventListener("click", function () {

            if (temporizadorRespiracion !== null) return;

            tiempoTotalRespiracion = 60;
            segundoFase = 0;
            faseRespiracion = "inhalar";

            tiempoRestante.textContent = tiempoTotalRespiracion;

            mensajeRespiracion.textContent = "";

            btnIniciarRespiracion.disabled = true;

            actualizarFaseRespiracion();

            temporizadorRespiracion = setInterval(function () {

                tiempoTotalRespiracion--;
                segundoFase++;

                tiempoRestante.textContent = tiempoTotalRespiracion;

                if (segundoFase >= 4) {

                    segundoFase = 0;

                    faseRespiracion =
                        faseRespiracion === "inhalar"
                            ? "exhalar"
                            : "inhalar";

                    actualizarFaseRespiracion();

                }

                if (tiempoTotalRespiracion <= 0) {

                    detenerRespiracion(
                        "¡Actividad finalizada! Tómate un momento para notar cómo te sientes."
                    );

                    tiempoRestante.textContent = "0";

                    instruccionRespiracion.textContent = "¡Muy bien!";

                    tiempoFase.textContent =
                        "Has completado el minuto de respiración.";

                }

            }, 1000);

        });

        btnDetenerRespiracion.addEventListener("click", function () {

            detenerRespiracion(
                "Actividad detenida. Puedes retomarla cuando quieras."
            );

            tiempoTotalRespiracion = 60;

            tiempoRestante.textContent = "60";

        });

    }

    // ==========================================
    // GUARDAR Y CONSULTAR REFLEXIONES
    // ==========================================

    const btnGuardarReflexion =
        document.getElementById("btnGuardarReflexion");

    const reflexionActividad =
        document.getElementById("reflexionActividad");

    const mensajeReflexion =
        document.getElementById("mensajeReflexion");

    const btnVerReflexiones =
        document.getElementById("btnVerReflexiones");

    const listaReflexiones =
        document.getElementById("listaReflexiones");

    const btnOcultarReflexiones =
        document.getElementById("btnOcultarReflexiones");

    if (btnOcultarReflexiones) {

        btnOcultarReflexiones.addEventListener("click", function () {

            listaReflexiones.hidden = true;

            btnOcultarReflexiones.hidden = true;

        });

    }

    if (btnVerReflexiones) {

        btnVerReflexiones.addEventListener("click", async function () {

            if (!usuarioActual) {

                listaReflexiones.textContent =
                    "Debes iniciar sesión para consultar tus reflexiones.";

                return;
            }

            listaReflexiones.hidden = false;

            btnOcultarReflexiones.hidden = false;

            btnVerReflexiones.disabled = true;

            listaReflexiones.textContent = "Cargando tus reflexiones...";

            try {

                const respuesta = await fetch(
                    API_URL + "/reflexiones/" + encodeURIComponent(usuarioActual)
                {
                    credentials: "include"
                }

                );

                if (!respuesta.ok) {

                    throw new Error(
                        "No se pudieron consultar las reflexiones."
                    );

                }

                const reflexiones = await respuesta.json();

                listaReflexiones.replaceChildren();

                if (!Array.isArray(reflexiones) || reflexiones.length === 0) {

                    listaReflexiones.textContent =
                        "Todavía no tienes reflexiones guardadas.";

                    return;
                }

                reflexiones.forEach(function (reflexion) {

                    const tarjeta = document.createElement("article");

                    tarjeta.className = "resource";

                    const titulo = document.createElement("h4");

                    titulo.textContent = "Mi reflexión";

                    const contenido = document.createElement("p");

                    contenido.textContent = reflexion.contenido;

                    const fecha = document.createElement("small");

                    fecha.textContent = reflexion.fecha
                        ? "Fecha: " + new Date(reflexion.fecha).toLocaleString()
                        : "Fecha no disponible";

                    tarjeta.append(titulo, contenido, fecha);

                    listaReflexiones.appendChild(tarjeta);

                });

            } catch (error) {

                console.error(
                    "Error al consultar reflexiones:",
                    error
                );

                listaReflexiones.textContent =
                    "No se pudieron cargar las reflexiones. Verifica que el servidor esté funcionando.";

            } finally {

                btnVerReflexiones.disabled = false;

            }

        });

    }

    if (btnGuardarReflexion) {

        btnGuardarReflexion.addEventListener("click", async function () {

            if (!usuarioActual) {

                mensajeReflexion.textContent =
                    "Inicia sesión para guardar tu reflexión.";

                return;
            }

            const contenido = reflexionActividad.value.trim();

            if (!contenido) {

                mensajeReflexion.textContent =
                    "Escribe una reflexión antes de continuar.";

                return;
            }

            if (contenido.length > 250) {

                mensajeReflexion.textContent =
                    "La reflexión no puede superar los 250 caracteres.";

                return;
            }

            btnGuardarReflexion.disabled = true;

            mensajeReflexion.textContent = "Guardando reflexión...";

            try {

                const respuesta = await fetch(
                    API_URL + "/reflexiones",
                    {
                        method: "POST",
                        credentials: "include",
                        
                        headers: {
                            "Content-Type": "application/json"
                        },

                        body: JSON.stringify({

                            nombreUsuario: usuarioActual,

                            contenido: contenido

                        })
                    }
                );

                let resultado = {};

                try {
                    resultado = await respuesta.json();
                } catch (error) {
                    resultado = {};
                }

                if (!respuesta.ok) {

                    throw new Error(
                        resultado.mensaje || "No se pudo guardar la reflexión."
                    );

                }

                mensajeReflexion.textContent =
                    "¡Tu reflexión se guardó correctamente! 💗";

                reflexionActividad.value = "";

            } catch (error) {

                console.error(
                    "Error al guardar la reflexión:",
                    error
                );

                mensajeReflexion.textContent =
                    "No se pudo guardar. Verifica que el backend esté funcionando.";

            } finally {

                btnGuardarReflexion.disabled = false;

            }

        });

    }
        // ==========================================
    // MOMENTO DE TRANQUILIDAD
    // ==========================================

    const opcionesTranquilidad = document.querySelectorAll(
        'input[name="actividadTranquila"]'
    );

    const mensajeTranquilidad =
        document.getElementById("mensajeTranquilidad");

    opcionesTranquilidad.forEach(function (opcion) {

        opcion.addEventListener("change", function () {

            mensajeTranquilidad.textContent =
                "Elegiste: " + opcion.value +
                ". ¡Reserva unos minutos para disfrutarlo!";

        });

    });

    // ==========================================
    // MI PERFIL
    // ==========================================

    const perfilUsuario =
        document.getElementById("perfilUsuario");

    const mensajePerfil =
        document.getElementById("mensajePerfil");

    function mostrarPerfil() {

        if (!perfilUsuario) return;

        if (usuarioActual) {

            perfilUsuario.value = usuarioActual;

            mensajePerfil.textContent =
                "Tu sesión está iniciada correctamente.";

        } else {

            perfilUsuario.value = "";

            mensajePerfil.textContent =
                "Inicia sesión para consultar tu perfil.";

        }

    }

    // ==========================================
    // RECORDATORIOS
    // ==========================================

    const horaRecordatorio =
        document.getElementById("horaRecordatorio");

    const activarRecordatorio =
        document.getElementById("activarRecordatorio");

    const btnGuardarRecordatorio =
        document.getElementById("btnGuardarRecordatorio");

    const mensajeRecordatorio =
        document.getElementById("mensajeRecordatorio");

    const CLAVE_RECORDATORIO = "takeCareRecordatorio_";

    function obtenerClaveRecordatorio() {

        return CLAVE_RECORDATORIO + usuarioActual;

    }

    function cargarRecordatorio() {

        if (!usuarioActual || !horaRecordatorio || !activarRecordatorio) {
            return;
        }

        const guardado = localStorage.getItem(
            obtenerClaveRecordatorio()
        );

        if (guardado) {

            try {

                const datos = JSON.parse(guardado);

                horaRecordatorio.value = datos.hora || "";

                activarRecordatorio.checked = datos.activo === true;

                mensajeRecordatorio.textContent = datos.activo
                    ? "Tu recordatorio está activado."
                    : "Tu recordatorio está desactivado.";

            } catch (error) {

                horaRecordatorio.value = "";

                activarRecordatorio.checked = false;

            }

        } else {

            horaRecordatorio.value = "";

            activarRecordatorio.checked = false;

            mensajeRecordatorio.textContent =
                "Todavía no has configurado un recordatorio.";

        }

    }

    if (btnGuardarRecordatorio) {

        btnGuardarRecordatorio.addEventListener("click", function () {

            if (!usuarioActual) {

                mensajeRecordatorio.textContent =
                    "Debes iniciar sesión para guardar un recordatorio.";

                return;
            }

            const hora = horaRecordatorio.value;

            if (!hora) {

                mensajeRecordatorio.textContent =
                    "Selecciona una hora para tu recordatorio.";

                return;
            }

            const datos = {

                hora: hora,

                activo: activarRecordatorio.checked

            };

            localStorage.setItem(
                obtenerClaveRecordatorio(),
                JSON.stringify(datos)
            );

            mensajeRecordatorio.textContent = datos.activo
                ? "¡Tu recordatorio quedó activado correctamente!"
                : "Tu recordatorio quedó guardado y desactivado.";

        });

    }

    // ==========================================
    // COMPROBAR RECORDATORIOS
    // ==========================================

    function comprobarRecordatorios() {

        if (!usuarioActual) return;

        const guardado = localStorage.getItem(
            obtenerClaveRecordatorio()
        );

        if (!guardado) return;

        try {

            const datos = JSON.parse(guardado);

            if (!datos.activo || !datos.hora) return;

            const ahora = new Date();

            const horaActual =
                String(ahora.getHours()).padStart(2, "0") +
                ":" +
                String(ahora.getMinutes()).padStart(2, "0");

            const fechaActual = obtenerFechaActual();

            const claveUltimoAviso =
                "takeCareUltimoAviso_" + usuarioActual;

            const ultimoAviso =
                localStorage.getItem(claveUltimoAviso);

            if (
                horaActual === datos.hora &&
                ultimoAviso !== fechaActual
            ) {

                localStorage.setItem(
                    claveUltimoAviso,
                    fechaActual
                );

                if ("Notification" in window &&
                    Notification.permission === "granted") {

                    new Notification("Take Care Of Your Mind Health", {
                        body: "Tienes un recordatorio de Take Care. 💗"
                    });

                }

                if (mensajeRecordatorio) {

                    mensajeRecordatorio.textContent =
                        "¡Llegó la hora de tu recordatorio! 💗";

                }

            }

        } catch (error) {

            console.error(
                "No se pudo comprobar el recordatorio:",
                error
            );

        }

    }

    // Comprobar la hora periódicamente mientras la página esté abierta.
    setInterval(comprobarRecordatorios, 15000);

    // ==========================================
    // AJUSTES Y NOTIFICACIONES
    // ==========================================

    const btnPermitirNotificaciones =
        document.getElementById("btnPermitirNotificaciones");

    const estadoNotificaciones =
        document.getElementById("estadoNotificaciones");

    function actualizarEstadoNotificaciones() {

        if (!estadoNotificaciones) return;

        if (!("Notification" in window)) {

            estadoNotificaciones.textContent =
                "Este navegador no permite utilizar notificaciones.";

            return;
        }

        if (Notification.permission === "granted") {

            estadoNotificaciones.textContent =
                "Las notificaciones están permitidas.";

        } else if (Notification.permission === "denied") {

            estadoNotificaciones.textContent =
                "Las notificaciones están bloqueadas. Puedes revisar los permisos del sitio en tu navegador.";

        } else {

            estadoNotificaciones.textContent =
                "Todavía no has concedido permiso para recibir notificaciones.";

        }

    }

    if (btnPermitirNotificaciones) {

        btnPermitirNotificaciones.addEventListener(
            "click",
            async function () {

                if (!("Notification" in window)) {

                    estadoNotificaciones.textContent =
                        "Tu navegador no admite notificaciones.";

                    return;
                }

                try {

                    const permiso =
                        await Notification.requestPermission();

                    actualizarEstadoNotificaciones();

                    if (permiso === "granted") {

                        estadoNotificaciones.textContent =
                            "¡Permiso concedido! Ya puedes recibir notificaciones.";

                    }

                } catch (error) {

                    estadoNotificaciones.textContent =
                        "No fue posible solicitar el permiso de notificaciones.";

                }

            }
        );

    }

    // ==========================================
    // INICIAR APLICACIÓN
    // ==========================================

    mostrarSeccion("inicio");

    actualizarEstadoNotificaciones();

});
