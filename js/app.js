
document.addEventListener("DOMContentLoaded", function () {
    const secciones = document.querySelectorAll("main section");
    const botonesNavegacion = document.querySelectorAll("[data-seccion]");
    const botonesEmociones = document.querySelectorAll(".emotion");

    const formulario = document.getElementById("formularioRegistro");
    const comentario = document.getElementById("comentario");
    const contador = document.getElementById("contadorCaracteres");
    const mensaje = document.getElementById("mensaje");
    const historial = document.getElementById("listaHistorial");

    const CLAVE_REGISTROS = "registrosEmocionales";
    let emocionSeleccionada = "";

    function mostrarSeccion(id) {
        secciones.forEach(function (seccion) {
            seccion.classList.toggle("hidden", seccion.id !== id);
        });

        window.scrollTo({ top: 0, behavior: "smooth" });

        if (id === "historial") {
            mostrarHistorial();
        }
    }

    botonesNavegacion.forEach(function (boton) {
        boton.addEventListener("click", function () {
            mostrarSeccion(boton.dataset.seccion);
        });
    });

    botonesEmociones.forEach(function (boton) {
        boton.addEventListener("click", function () {
            botonesEmociones.forEach(function (otroBoton) {
                otroBoton.classList.remove("selected");
            });

            boton.classList.add("selected");
            emocionSeleccionada = boton.dataset.emocion;
            ocultarMensaje();
        });
    });

    function mostrarMensaje(texto, tipo) {
        mensaje.textContent = texto;
        mensaje.className = "message " + tipo;
    }

    function ocultarMensaje() {
        mensaje.textContent = "";
        mensaje.className = "message";
    }

    function obtenerRegistros() {
        try {
            const datos = localStorage.getItem(CLAVE_REGISTROS);
            const registros = datos ? JSON.parse(datos) : [];
            return Array.isArray(registros) ? registros : [];
        } catch (error) {
            return [];
        }
    }

    function mostrarHistorial() {
        historial.replaceChildren();

        const registros = obtenerRegistros();

        if (registros.length === 0) {
            const texto = document.createElement("p");
            texto.textContent = "Todavía no tienes registros emocionales.";
            historial.appendChild(texto);
            return;
        }

        registros.slice().reverse().forEach(function (registro) {
            const tarjeta = document.createElement("article");
            tarjeta.className = "record";

            const fecha = document.createElement("p");
            fecha.textContent = "Fecha: " + registro.fecha;

            const emocion = document.createElement("p");
            emocion.textContent = "Estado de ánimo: " + registro.emocion;

            const detalle = document.createElement("p");
            detalle.textContent = registro.comentario;

            tarjeta.append(fecha, emocion, detalle);
            historial.appendChild(tarjeta);
        });
    }

    comentario.addEventListener("input", function () {
        contador.textContent = comentario.value.length + "/250";
    });

    formulario.addEventListener("submit", function (evento) {
        evento.preventDefault();

        if (!emocionSeleccionada) {
            mostrarMensaje(
                "Por favor, selecciona tu estado de ánimo.",
                "error"
            );
            return;
        }

        const textoComentario = comentario.value.trim();

        if (!textoComentario) {
            mostrarMensaje(
                "Por favor, escribe un comentario sobre tu día.",
                "error"
            );
            comentario.focus();
            return;
        }

        if (textoComentario.length > 250) {
            mostrarMensaje(
                "El comentario no puede superar los 250 caracteres.",
                "error"
            );
            return;
        }

        const registros = obtenerRegistros();

        registros.push({
            fecha: new Date().toLocaleDateString("es-CO"),
            emocion: emocionSeleccionada,
            comentario: textoComentario
        });

        try {
            localStorage.setItem(CLAVE_REGISTROS, JSON.stringify(registros));
        } catch (error) {
            mostrarMensaje(
                "No fue posible guardar el registro en este navegador.",
                "error"
            );
            return;
        }

        mostrarMensaje(
            "¡Tu registro emocional se guardó correctamente!",
            "success"
        );

        formulario.reset();
        emocionSeleccionada = "";

        botonesEmociones.forEach(function (boton) {
            boton.classList.remove("selected");
        });

        contador.textContent = "0/250";
        mostrarHistorial();
    });

    mostrarSeccion("inicio");
    mostrarHistorial();
});
