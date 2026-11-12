
document.addEventListener("DOMContentLoaded", function () {


    console.log("Take Care: JavaScript cargado correctamente");

    // ==========================================
    // CONFIGURACIÓN GENERAL
    // ==========================================

    // ==========================================
    // CONFIGURACIÓN GENERAL
    // ==========================================

    const API_URL = "https://take-care-of-your-mind-health.onrender.com/api";

    let usuarioActual = "";
    let emocionSeleccionada = "";
    let temporizadorRespiracion = null;
    let temporizadorMensajeSesion = null;

    const secciones = document.querySelectorAll("main section");

    const mensajeSesion = document.getElementById("mensajeSesion");
    const mensajeRegistro = document.getElementById("mensajeRegistro");

    const formularioCuenta = document.getElementById("formularioRegistro");
    const formularioSesion = document.getElementById("formularioSesion");
    const formularioEmocional = document.getElementById("formularioEmocional");

    const usuarioRegistro = document.getElementById("correoRegistro");
    const contrasenaRegistro = document.getElementById("contrasenaRegistro");

    const usuarioSesion = document.getElementById("correoSesion");
    const contrasenaSesion = document.getElementById("contrasenaSesion");

    const comentario = document.getElementById("comentario");
    const contador = document.getElementById("contadorCaracteres");

    const mensajeRegistroEmocional =
        document.getElementById("mensajeRegistroEmocional");

    // ==========================================
    // FUNCIONES GENERALES
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

    function obtenerFechaActual() {
        const hoy = new Date();
        const anio = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, "0");
        const dia = String(hoy.getDate()).padStart(2, "0");

        return anio + "-" + mes + "-" + dia;
    }

    async function enviarSolicitud(url, datos) {

        const respuesta = await fetch(url, {
            method: "POST",
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

    // ==========================================
    // AVISO VISIBLE DE RECORDATORIOS
    // ==========================================

    function mostrarAvisoRecordatorio(texto) {
        let aviso = document.getElementById("avisoRecordatorioGlobal");

        if (!aviso) {
            aviso = document.createElement("div");
            aviso.id = "avisoRecordatorioGlobal";

            aviso.style.position = "fixed";
            aviso.style.bottom = "20px";
            aviso.style.right = "20px";
            aviso.style.left = "20px";
            aviso.style.maxWidth = "450px";
            aviso.style.marginLeft = "auto";
            aviso.style.padding = "18px";
            aviso.style.background = "#c85a83";
            aviso.style.color = "#ffffff";
            aviso.style.borderRadius = "12px";
            aviso.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
            aviso.style.zIndex = "9999";
            aviso.style.fontWeight = "bold";
            aviso.style.textAlign = "center";

            document.body.appendChild(aviso);
        }

        aviso.textContent = texto;
        aviso.style.display = "block";

        setTimeout(function () {
            if (aviso) {
                aviso.style.display = "none";
            }
        }, 15000);
    }

    // ==========================================
    // NAVEGACIÓN
    // ==========================================

    function mostrarSeccion(id) {

        if (id === "inicio") {
            if (temporizadorMensajeSesion !== null) {
                clearTimeout(temporizadorMensajeSesion);
                temporizadorMensajeSesion = null;
            }

            limpiarMensaje(mensajeSesion);
        }

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

        if (id === "historial" && usuarioActual) {
            mostrarHistorial();
            consultarReflexiones();
        }

        if (id === "perfil" && usuarioActual) {
            mostrarPerfil();
        }

        if (id === "recordatorios" && usuarioActual) {
            cargarRecordatorio();
        }

        if (id === "ajustes") {
            cargarPreferencias();
            actualizarEstadoNotificaciones();
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    document.querySelectorAll("[data-seccion]").forEach(function (boton) {
        boton.addEventListener("click", function () {
            mostrarSeccion(boton.dataset.seccion);
        });
    });

    // ==========================================
    // CREAR CUENTA
    // ==========================================

    if (formularioCuenta) {
        formularioCuenta.addEventListener("submit", async function (evento) {

            evento.preventDefault();
            limpiarMensaje(mensajeRegistro);

            const usuario = usuarioRegistro.value.trim();
            const contrasena = contrasenaRegistro.value;
            const usuario = usuarioRegistro.value.trim();
            const contrasena = contrasenaRegistro.value;

            if (!usuario || !contrasena) {
                mostrarMensaje(
                    mensajeRegistro,
                    "Completa el correo electrónico y la contraseña.",
                    "error"
                );
                return;
            }

            if (contrasena.length < 8 || contrasena.length > 72) {
                mostrarMensaje(
                    mensajeRegistro,
                    "La contraseña debe tener entre 8 y 72 caracteres.",
                    "error"
                );
                return;
            }

            try {
                await enviarSolicitud(API_URL + "/auth/registro", {
                    usuario: usuario,
                    contrasena: contrasena
                });

                mostrarMensaje(
                    mensajeRegistro,
                    "Cuenta creada correctamente. Ya puedes iniciar sesión.",
                    "success"
                );

                formularioCuenta.reset();

            } catch (error) {
                mostrarMensaje(
                    mensajeRegistro,
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
            const usuario = usuarioSesion.value.trim();
            const contrasena = contrasenaSesion.value;

            if (!usuario || !contrasena) {
                mostrarMensaje(
                    mensajeSesion,
                    "Ingresa tu correo electrónico y contraseña.",
                    "error"
                );
                return;
            }

            const boton = formularioSesion.querySelector(
                'button[type="submit"]'
            );

            if (boton) {
                boton.disabled = true;
                boton.textContent = "Ingresando...";
            }

            try {
                await enviarSolicitud(API_URL + "/auth/login", {
                    usuario: usuario,
                    contrasena: contrasena
                });

                usuarioActual = usuario;

                mostrarMensaje(
                    mensajeSesion,
                    "Autenticación satisfactoria",
                    "success"
                );

                formularioSesion.reset();

                mostrarPerfil();
                cargarRecordatorio();

                if (temporizadorMensajeSesion !== null) {
                    clearTimeout(temporizadorMensajeSesion);
                }

                temporizadorMensajeSesion = setTimeout(function () {

                    limpiarMensaje(mensajeSesion);
                    temporizadorMensajeSesion = null;

                    mostrarSeccion("registro");

                }, 2000);

            } catch (error) {
                mostrarMensaje(
                    mensajeSesion,
                    error.message.includes("Failed to fetch")
                        ? "No se pudo conectar con el servidor. Inténtalo nuevamente."
                        : error.message,
                    "error"
                );

            } finally {
                if (boton) {
                    boton.disabled = false;
                    boton.textContent = "Iniciar sesión";
                }
            }
        });
    }

    // ==========================================
    // CERRAR SESIÓN
    // ==========================================

    function cerrarSesion() {

        usuarioActual = "";
        emocionSeleccionada = "";

        if (temporizadorMensajeSesion !== null) {
            clearTimeout(temporizadorMensajeSesion);
            temporizadorMensajeSesion = null;
        }

        limpiarMensaje(mensajeSesion);
        limpiarMensaje(mensajeRegistroEmocional);

        if (formularioSesion) {
            formularioSesion.reset();
        }

        if (formularioEmocional) {
            formularioEmocional.reset();
        }

        if (contador) {
            contador.textContent = "0/250";
        }

        mostrarSeccion("inicio");
    }

    const botonCerrarSesion = document.getElementById("btnCerrarSesion");
    const btnCerrarSesionPerfil = document.getElementById("btnCerrarSesionPerfil");

    if (botonCerrarSesion) {
        botonCerrarSesion.addEventListener("click", cerrarSesion);
    }

    if (btnCerrarSesionPerfil) {
        btnCerrarSesionPerfil.addEventListener("click", cerrarSesion);
    }

    // ==========================================
    // REGISTRO EMOCIONAL
    // ==========================================

    const emocionSelect = document.getElementById("emocionSeleccionada");

    const botonesEmociones = document.querySelectorAll(".emotion");

    botonesEmociones.forEach(function (boton) {

        boton.addEventListener("click", function () {

            botonesEmociones.forEach(function (otro) {
                otro.classList.remove("selected");
            });

            boton.classList.add("selected");
            emocionSeleccionada = boton.dataset.emocion;
        });
    });

    // ==========================================
    // FECHA ACTUAL
    // ==========================================

    if (emocionSelect) {
        emocionSelect.addEventListener("change", function () {
            emocionSeleccionada = emocionSelect.value;
        });
    }

    if (comentario && contador) {
        comentario.addEventListener("input", function () {
            contador.textContent = comentario.value.length + "/250";
        });
    }

    if (formularioEmocional) {
        formularioEmocional.addEventListener("submit", async function (evento) {

            evento.preventDefault();
            limpiarMensaje(mensajeRegistroEmocional);

            if (!usuarioActual) {
                mostrarMensaje(
                    mensajeRegistroEmocional,
                    "Debes iniciar sesión para guardar un registro.",
                    "error"
                );
                mostrarSeccion("inicio");
                return;
            }

            const emocion = emocionSelect
                ? emocionSelect.value
                : emocionSeleccionada;

            const textoComentario = comentario
                ? comentario.value.trim()
                : "";

            if (!emocion || !textoComentario) {
                mostrarMensaje(
                    mensajeRegistroEmocional,
                    "Selecciona una emoción y escribe un comentario.",
                    "error"
                );
                return;
            }

            if (textoComentario.length > 250) {
                mostrarMensaje(
                    mensajeRegistroEmocional,
                    "El comentario no puede superar los 250 caracteres.",
                    "error"
                );
                return;
            }

            try {
                await enviarSolicitud(API_URL + "/registros", {
                    nombreUsuario: usuarioActual,
                    fecha: obtenerFechaActual(),
                    estadoAnimo: emocion,
                    comentario: textoComentario
                });

                mostrarMensaje(
                    mensajeRegistroEmocional,
                    "¡Tu registro emocional se guardó correctamente!",
                    "success"
                );

                formularioEmocional.reset();
                emocionSeleccionada = "";

                botonesEmociones.forEach(function (boton) {
                    boton.classList.remove("selected");
                });
                botonesEmociones.forEach(function (boton) {
                    boton.classList.remove("selected");
                });

                if (contador) {
                    contador.textContent = "0/250";
                }

            } catch (error) {
                mostrarMensaje(
                    mensajeRegistroEmocional,
                    error.message,
                    "error"
                );
            }
        });
    }

    // ==========================================
    // HISTORIAL EMOCIONAL
    // ==========================================

    const historial = document.getElementById("contenedorRegistros");

    async function mostrarHistorial() {

        if (!historial || !usuarioActual) return;

        historial.replaceChildren();

        try {

            const respuesta = await fetch(
                API_URL + "/registros/" + encodeURIComponent(usuarioActual)
            );

            if (!respuesta.ok) {
                throw new Error("No fue posible consultar el historial.");
            }

            const registros = await respuesta.json();

            if (!Array.isArray(registros) || registros.length === 0) {
                historial.textContent = "Todavía no tienes registros emocionales.";
                return;
            }

            registros.forEach(function (registro) {


                const tarjeta = document.createElement("article");
                tarjeta.className = "record";

                const fecha = document.createElement("p");
                fecha.textContent = "Fecha: " + registro.fecha;

                const emocion = document.createElement("p");
                emocion.textContent = "Estado de ánimo: " + registro.estadoAnimo;

                const detalle = document.createElement("p");
                detalle.textContent = registro.comentario || "";

                tarjeta.append(fecha, emocion, detalle);
                historial.appendChild(tarjeta);
            });


        } catch (error) {
            historial.textContent =
                "No se pudo cargar el historial. Inténtalo nuevamente.";

            console.error(error);
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

    const temporizadorRespiracionTexto =
        document.getElementById("temporizadorRespiracion");

    let segundosRespiracion = 60;
    let faseRespiracion = "inhalar";
    let segundosFase = 0;

    if (btnIniciarRespiracion && temporizadorRespiracionTexto) {

        btnIniciarRespiracion.addEventListener("click", function () {


            if (temporizadorRespiracion !== null) return;

            segundosRespiracion = 60;
            segundosFase = 0;
            faseRespiracion = "inhalar";

            btnIniciarRespiracion.disabled = true;

            temporizadorRespiracionTexto.textContent =
                "Tiempo restante: 60 segundos";

            if (instruccionRespiracion) {
                instruccionRespiracion.textContent = "Inhala suavemente";
            }

            temporizadorRespiracion = setInterval(function () {

                segundosRespiracion--;
                segundosFase++;

                temporizadorRespiracionTexto.textContent =
                    "Tiempo restante: " + segundosRespiracion + " segundos";

                if (segundosFase >= 4) {

                    segundosFase = 0;

                    faseRespiracion =
                        faseRespiracion === "inhalar"
                            ? "exhalar"
                            : "inhalar";

                    if (instruccionRespiracion) {
                        instruccionRespiracion.textContent =
                            faseRespiracion === "inhalar"
                                ? "Inhala suavemente"
                                : "Exhala suavemente";
                    }
                }

                if (segundosRespiracion <= 0) {

                    clearInterval(temporizadorRespiracion);
                    temporizadorRespiracion = null;

                    btnIniciarRespiracion.disabled = false;
                    temporizadorRespiracionTexto.textContent =
                        "¡Actividad finalizada!";

                    if (instruccionRespiracion) {
                        instruccionRespiracion.textContent =
                            "Has completado el ejercicio.";
                    }
                }

            }, 1000);
        });
    }

    if (btnDetenerRespiracion) {
        btnDetenerRespiracion.addEventListener("click", function () {

            if (temporizadorRespiracion !== null) {
                clearInterval(temporizadorRespiracion);
                temporizadorRespiracion = null;
            }

            if (btnIniciarRespiracion) {
                btnIniciarRespiracion.disabled = false;
            }

            if (temporizadorRespiracionTexto) {
                temporizadorRespiracionTexto.textContent = "Actividad detenida.";
            }

            if (instruccionRespiracion) {
                instruccionRespiracion.textContent =
                    "Puedes volver a intentarlo cuando quieras.";
            }
        });
    }

    // ==========================================
    // ACTIVIDADES DE CALMA
    // ==========================================

    const formularioActividad =
        document.getElementById("formularioActividad");

    const mensajeActividad =
        document.getElementById("mensajeActividad");

    if (formularioActividad) {
        formularioActividad.addEventListener("submit", function (evento) {

            evento.preventDefault();

            const seleccion = formularioActividad.querySelector(
                'input[name="actividadCalma"]:checked'
            );

            if (!seleccion) {
                mostrarMensaje(
                    mensajeActividad,
                    "Selecciona una actividad.",
                    "error"
                );
                return;
            }

            mostrarMensaje(
                mensajeActividad,
                "Actividad seleccionada: " + seleccion.value,
                "success"
            );
        });
    }

    // ==========================================
    // REFLEXIONES
    // ==========================================

    const formularioReflexion =
        document.getElementById("formularioReflexion");

    const textoReflexion =
        document.getElementById("textoReflexion");

    const mensajeReflexion =
        document.getElementById("mensajeReflexion");

    const contenedorReflexiones =
        document.getElementById("contenedorReflexiones");

    if (formularioReflexion) {
        formularioReflexion.addEventListener("submit", async function (evento) {

            evento.preventDefault();

            if (!usuarioActual) {
                mostrarMensaje(
                    mensajeReflexion,
                    "Inicia sesión para guardar tu reflexión.",
                    "error"
                );
                return;
            }

            const contenido = textoReflexion.value.trim();

            if (!contenido || contenido.length > 500) {
                mostrarMensaje(
                    mensajeReflexion,
                    "Escribe una reflexión de máximo 500 caracteres.",
                    "error"
                );
                return;
            }

            try {
                await enviarSolicitud(API_URL + "/reflexiones", {
                    nombreUsuario: usuarioActual,
                    contenido: contenido
                });

                mostrarMensaje(
                    mensajeReflexion,
                    "¡Tu reflexión se guardó correctamente!",
                    "success"
                );

                formularioReflexion.reset();
                consultarReflexiones();

            } catch (error) {
                mostrarMensaje(mensajeReflexion, error.message, "error");
            }
        });
    }

    async function consultarReflexiones() {

        if (!usuarioActual || !contenedorReflexiones) return;

        contenedorReflexiones.replaceChildren();

        try {
            const respuesta = await fetch(
                API_URL + "/reflexiones/" + encodeURIComponent(usuarioActual)
            );

            if (!respuesta.ok) {
                throw new Error("No fue posible consultar las reflexiones.");
            }

            const reflexiones = await respuesta.json();

            if (!Array.isArray(reflexiones) || reflexiones.length === 0) {
                contenedorReflexiones.textContent =
                    "Todavía no tienes reflexiones guardadas.";
                return;
            }

            reflexiones.forEach(function (reflexion) {

                const tarjeta = document.createElement("article");
                tarjeta.className = "resource";

                const contenido = document.createElement("p");
                contenido.textContent = reflexion.contenido || "";

                const fecha = document.createElement("small");
                fecha.textContent = reflexion.fecha
                    ? "Fecha: " + reflexion.fecha
                    : "";

                tarjeta.append(contenido, fecha);
                contenedorReflexiones.appendChild(tarjeta);
            });

        } catch (error) {
            contenedorReflexiones.textContent =
                "No se pudieron consultar las reflexiones.";

            console.error(error);
        }
    }

    // ==========================================
    // PERFIL
    // ==========================================

    const nombrePerfilEditar =
        document.getElementById("nombrePerfilEditar");

    const nombrePerfil =
        document.getElementById("nombrePerfil");

    const mensajePerfil =
        document.getElementById("mensajePerfil");

    const totalRegistros =
        document.getElementById("totalRegistros");

    const totalReflexiones =
        document.getElementById("totalReflexiones");

    const ultimoRegistro =
        document.getElementById("ultimoRegistro");

    const formularioPerfil =
        document.getElementById("formularioPerfil");

    function mostrarPerfil() {

        if (!usuarioActual) return;

        const nombreGuardado = localStorage.getItem(
            "takeCareNombreVisible_" + usuarioActual
        );

        if (nombrePerfil) {
            nombrePerfil.textContent = nombreGuardado || usuarioActual;
        }

        if (nombrePerfilEditar) {
            nombrePerfilEditar.value = nombreGuardado || usuarioActual;
        }

        consultarEstadisticasPerfil();
    }

    if (formularioPerfil) {
        formularioPerfil.addEventListener("submit", function (evento) {

            evento.preventDefault();

            if (!usuarioActual || !nombrePerfilEditar) return;

            const nombre = nombrePerfilEditar.value.trim();

            if (!nombre || nombre.length > 100) {
                mostrarMensaje(
                    mensajePerfil,
                    "Escribe un nombre válido.",
                    "error"
                );
                return;
            }

            localStorage.setItem(
                "takeCareNombreVisible_" + usuarioActual,
                nombre
            );

            if (nombrePerfil) {
                nombrePerfil.textContent = nombre;
            }

            mostrarMensaje(
                mensajePerfil,
                "Tu información se guardó correctamente.",
                "success"
            );
        });
    }

    async function consultarEstadisticasPerfil() {

        if (!usuarioActual) return;

        try {
            const respuestas = await Promise.all([
                fetch(API_URL + "/registros/" + encodeURIComponent(usuarioActual)),
                fetch(API_URL + "/reflexiones/" + encodeURIComponent(usuarioActual))
            ]);

            if (!respuestas[0].ok || !respuestas[1].ok) {
                throw new Error("No se pudieron consultar las estadísticas.");
            }

            const registros = await respuestas[0].json();
            const reflexiones = await respuestas[1].json();

            const listaRegistros = Array.isArray(registros) ? registros : [];
            const listaReflexiones = Array.isArray(reflexiones) ? reflexiones : [];

            if (totalRegistros) {
                totalRegistros.textContent = listaRegistros.length;
            }

            if (totalReflexiones) {
                totalReflexiones.textContent = listaReflexiones.length;
            }

            if (ultimoRegistro) {
                if (listaRegistros.length > 0) {
                    ultimoRegistro.textContent =
                        listaRegistros[0].fecha + " · " +
                        listaRegistros[0].estadoAnimo;
                } else {
                    ultimoRegistro.textContent =
                        "Todavía no tienes registros emocionales.";
                }
            }

        } catch (error) {
            console.error("Error al consultar el perfil:", error);

            if (totalRegistros) totalRegistros.textContent = "—";
            if (totalReflexiones) totalReflexiones.textContent = "—";

            if (ultimoRegistro) {
                ultimoRegistro.textContent =
                    "No se pudo consultar tu actividad.";
            }
        }
    }

    // ==========================================
    // RECORDATORIOS CON FECHA Y HORA
    // ==========================================

    const formularioRecordatorio =
        document.getElementById("formularioRecordatorio");

    const fechaRecordatorio =
        document.getElementById("fechaRecordatorio");

    const horaRecordatorio =
        document.getElementById("horaRecordatorio");

    const recordatorioActivo =
        document.getElementById("recordatorioActivo");

    const mensajeRecordatorio =
        document.getElementById("mensajeRecordatorio");

    function obtenerClaveRecordatorio() {
        return "takeCareRecordatorio_" + usuarioActual;
    }

    function cargarRecordatorio() {

        if (!usuarioActual) return;

        if (fechaRecordatorio) {
            fechaRecordatorio.min = obtenerFechaActual();
        }

        const guardado = localStorage.getItem(obtenerClaveRecordatorio());

        if (!guardado) {

            if (fechaRecordatorio) fechaRecordatorio.value = "";
            if (recordatorioActivo) recordatorioActivo.checked = false;

            if (mensajeRecordatorio) {
                mensajeRecordatorio.textContent =
                    "Todavía no has configurado un recordatorio.";
            }

            return;
        }

        try {
            const datos = JSON.parse(guardado);

            if (fechaRecordatorio) {
                fechaRecordatorio.value = datos.fecha || "";
            }

            if (horaRecordatorio) {
                horaRecordatorio.value = datos.hora || "08:00";
            }

            if (recordatorioActivo) {
                recordatorioActivo.checked = datos.activo === true;
            }

            if (mensajeRecordatorio) {
                mensajeRecordatorio.textContent = datos.activo
                    ? "Recordatorio programado para el " +
                      datos.fecha + " a las " + datos.hora + "."
                    : "Tu recordatorio está desactivado.";
            }

        } catch (error) {
            console.error("Error al cargar el recordatorio:", error);

            if (mensajeRecordatorio) {
                mensajeRecordatorio.textContent =
                    "No se pudo cargar el recordatorio.";
            }
        }
    }

    if (formularioRecordatorio) {
        formularioRecordatorio.addEventListener("submit", function (evento) {

            evento.preventDefault();

            if (!usuarioActual) {
                mostrarMensaje(
                    mensajeRecordatorio,
                    "Debes iniciar sesión para guardar un recordatorio.",
                    "error"
                );
                return;
            }

            const fecha = fechaRecordatorio.value;
            const hora = horaRecordatorio.value;
            const activo = recordatorioActivo.checked;

            if (!fecha || !hora) {
                mostrarMensaje(
                    mensajeRecordatorio,
                    "Selecciona una fecha y una hora.",
                    "error"
                );
                return;
            }

            if (fecha < obtenerFechaActual()) {
                mostrarMensaje(
                    mensajeRecordatorio,
                    "La fecha no puede ser anterior al día de hoy.",
                    "error"
                );
                return;
            }

            const fechaProgramada = new Date(fecha + "T" + hora + ":00");

            if (activo && fechaProgramada.getTime() <= Date.now()) {
                mostrarMensaje(
                    mensajeRecordatorio,
                    "Selecciona una hora futura para activar el recordatorio.",
                    "error"
                );
                return;
            }

            const datos = {
                fecha: fecha,
                hora: hora,
                activo: activo
            };

            localStorage.setItem(
                obtenerClaveRecordatorio(),
                JSON.stringify(datos)
            );

            // Reinicia el control para que el recordatorio nuevo
            // pueda generar su propio aviso.
            localStorage.removeItem(
                "takeCareUltimoAviso_" + usuarioActual
            );

            mostrarMensaje(
                mensajeRecordatorio,
                activo
                    ? "¡Recordatorio guardado para el " +
                      fecha + " a las " + hora + "!"
                    : "El recordatorio quedó guardado, pero está desactivado.",
                "success"
            );
        });
    }

    // ==========================================
    // COMPROBAR RECORDATORIOS
    // ==========================================

    function comprobarRecordatorios() {

        if (!usuarioActual) return;

        const guardado = localStorage.getItem(obtenerClaveRecordatorio());

        if (!guardado) return;

        try {
            const datos = JSON.parse(guardado);

            if (!datos.activo || !datos.fecha || !datos.hora) {
                return;
            }

            const ahora = new Date();
            const fechaActual = obtenerFechaActual();

            const fechaHoraRecordatorio =
                new Date(datos.fecha + "T" + datos.hora + ":00");

            const claveAviso =
                "takeCareUltimoAviso_" + usuarioActual;

            const identificador = datos.fecha + "_" + datos.hora;

            const ultimoAviso = localStorage.getItem(claveAviso);

            if (
                ahora.getTime() >= fechaHoraRecordatorio.getTime() &&
                fechaActual === datos.fecha &&
                ultimoAviso !== identificador
            ) {

                localStorage.setItem(claveAviso, identificador);

                const textoAviso =
                    "¡Llegó la hora de tu recordatorio! Recuerda registrar cómo te sientes.";

                if (mensajeRecordatorio) {
                    mensajeRecordatorio.textContent = textoAviso;
                }

                mostrarAvisoRecordatorio(textoAviso);

                if (
                    "Notification" in window &&
                    Notification.permission === "granted"
                ) {
                    try {
                        new Notification(
                            "Take Care Of Your Mind Health",
                            {
                                body: textoAviso
                            }
                        );
                    } catch (error) {
                        console.error("No se pudo mostrar la notificación:", error);
                    }
                }
            }

        } catch (error) {
            console.error("Error al comprobar recordatorios:", error);
        }
    }

    setInterval(comprobarRecordatorios, 10000);

    // ==========================================
    // AJUSTES DE APARIENCIA
    // ==========================================

    const temaAplicacion =
        document.getElementById("temaAplicacion");

    const tamanoTexto =
        document.getElementById("tamanoTexto");

    const btnGuardarPreferencias =
        document.getElementById("btnGuardarPreferencias");

    const btnRestablecerAjustes =
        document.getElementById("btnRestablecerAjustes");

    const mensajeAjustes =
        document.getElementById("mensajeAjustes");

    const CLAVE_TEMA = "takeCareTema";
    const CLAVE_TAMANO = "takeCareTamanoTexto";

    function aplicarTema(tema) {

        document.body.classList.remove("tema-claro", "tema-oscuro");

        if (tema === "claro") {
            document.body.classList.add("tema-claro");
        }

        if (tema === "oscuro") {
            document.body.classList.add("tema-oscuro");
        }

        if (temaAplicacion) {
            temaAplicacion.value = tema;
        }
    }

    function aplicarTamanoTexto(tamano) {

        document.body.classList.remove(
            "texto-grande",
            "texto-muy-grande"
        );

        if (tamano === "grande") {
            document.body.classList.add("texto-grande");
        }

        if (tamano === "muy-grande") {
            document.body.classList.add("texto-muy-grande");
        }

        if (tamanoTexto) {
            tamanoTexto.value = tamano;
        }
    }

    function cargarPreferencias() {

        const tema = localStorage.getItem(CLAVE_TEMA) || "rosa";
        const tamano = localStorage.getItem(CLAVE_TAMANO) || "normal";

        aplicarTema(tema);
        aplicarTamanoTexto(tamano);
    }

    if (temaAplicacion) {
        temaAplicacion.addEventListener("change", function () {

            aplicarTema(temaAplicacion.value);

            if (mensajeAjustes) {
                mensajeAjustes.textContent =
                    "Vista previa del tema. Guarda tus preferencias para conservarlo.";
            }
        });
    }

    if (tamanoTexto) {
        tamanoTexto.addEventListener("change", function () {

            aplicarTamanoTexto(tamanoTexto.value);

            if (mensajeAjustes) {
                mensajeAjustes.textContent =
                    "Vista previa del texto. Guarda tus preferencias para conservarlo.";
            }
        });
    }

    if (btnGuardarPreferencias) {
        btnGuardarPreferencias.addEventListener("click", function () {

            const tema = temaAplicacion ? temaAplicacion.value : "rosa";
            const tamano = tamanoTexto ? tamanoTexto.value : "normal";

            localStorage.setItem(CLAVE_TEMA, tema);
            localStorage.setItem(CLAVE_TAMANO, tamano);

            aplicarTema(tema);
            aplicarTamanoTexto(tamano);

            if (mensajeAjustes) {
                mensajeAjustes.textContent =
                    "¡Tus preferencias se guardaron correctamente!";
            }
        });
    }

    if (btnRestablecerAjustes) {
        btnRestablecerAjustes.addEventListener("click", function () {

            localStorage.removeItem(CLAVE_TEMA);
            localStorage.removeItem(CLAVE_TAMANO);

            aplicarTema("rosa");
            aplicarTamanoTexto("normal");

            if (mensajeAjustes) {
                mensajeAjustes.textContent =
                    "Los ajustes volvieron a sus valores iniciales.";
            }
        });
    }

    // ==========================================
    // NOTIFICACIONES DEL NAVEGADOR
    // ==========================================

    const btnPermitirNotificaciones =
        document.getElementById("btnPermitirNotificaciones");

    const estadoNotificaciones =
        document.getElementById("estadoNotificaciones");

    function actualizarEstadoNotificaciones() {

        if (!estadoNotificaciones) return;

        if (!("Notification" in window)) {
            estadoNotificaciones.textContent =
                "Este navegador no permite notificaciones.";
            return;
        }

        if (!window.isSecureContext) {
            estadoNotificaciones.textContent =
                "Las notificaciones requieren una conexión HTTPS.";
            return;
        }

        if (Notification.permission === "granted") {
            estadoNotificaciones.textContent =
                "Permiso concedido. Mantén abierta la aplicación para recibir los recordatorios.";
        } else if (Notification.permission === "denied") {
            estadoNotificaciones.textContent =
                "El permiso está bloqueado. Revisa la configuración del navegador.";
        } else {
            estadoNotificaciones.textContent =
                "Todavía no has concedido permiso para recibir notificaciones.";
        }
    }

    if (btnPermitirNotificaciones) {
        btnPermitirNotificaciones.addEventListener("click", async function () {

            if (!("Notification" in window) || !window.isSecureContext) {
                actualizarEstadoNotificaciones();
                return;
            }

            try {
                await Notification.requestPermission();
                actualizarEstadoNotificaciones();
            } catch (error) {
                console.error("Error en las notificaciones:", error);
                actualizarEstadoNotificaciones();
            }
        });
    }

    // ==========================================
    // INICIAR APLICACIÓN
    // ==========================================

    if (fechaRecordatorio) {
        fechaRecordatorio.min = obtenerFechaActual();
    }

    cargarPreferencias();
    actualizarEstadoNotificaciones();
    mostrarSeccion("inicio");

    console.log("Take Care: módulos inicializados correctamente");

});
