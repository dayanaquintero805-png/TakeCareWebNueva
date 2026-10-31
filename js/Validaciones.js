
function validarRegistro(emocion, comentario) {
    if (!emocion) {
        return "Por favor, selecciona tu estado de ánimo.";
    }

    const texto = comentario.trim();

    if (!texto) {
        return "Por favor, escribe un comentario sobre tu día.";
    }

    if (texto.length > 250) {
        return "El comentario no puede superar los 250 caracteres.";
    }

    return "";
}

function crearRegistro(emocion, comentario, fecha) {
    return {
        fecha: fecha,
        emocion: emocion,
        comentario: comentario.trim()
    };
}
