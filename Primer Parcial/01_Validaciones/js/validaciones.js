/*
Las validaciones de formulario son expresiones regulares, las cuales en este momento las podemos dividir en tres partes:

1.- Para el texto (nombre)
2.- Para el número de boleta (boleta)
3.- Para la fecha (fecha)

Una expresión regular, es un patron donde se identifica que elementos serán validados vs cuales no, son reglas mediante las cuales realizamos La validación de los datos ingresados por el usuario, en este caso, en un formulario.

*/

const patrones = {
    nombre : /^[A-Za-zÁÉÍÓÚÑáéíóúñüÜ\s{2,60}]$/,
    boleta : /^\d{10}$/,
    fecha : /^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/
};

const mensajes = {
    nombre : "Solo letras y espacios, entre 2 y 60 caracteres.",
    boleta : "Debe tener exactamente 10 dígitos.",
    fecha : "Formato esoerado : DD/MM/AAAA (ej 01/01/2023)"
}

function validarCampo(campo, valor){
    return patrones[campo].test()(valor.trim());
}

//Necesitamos ver el resto del archivo DOOM,

if (typeof document !== 'undefined') {
    const formulario = document.getElementById('form-registro');

    formulario.addEventListener('submit', function(evento) => {
        evento.preventDefault(); //Evita que el formulario se envie automaricamente


        let formularioValido = true;

        //tenemos que validar campo por campo
        for (const campo of Object.keys(patrones)) {
            const input = document.getElementById(campo);
            const spanError = document.getElementById(`error-${campo}`);
            const esValido = validarCampo(campo, input.value);

            input.classList.toggle('invalido', !esValido);
            spanError.textContent = esValido ? '' : mensajes[campo];
            if (!esValido) formularioValido = false;
        }

        const mensajeExitoso = document.getElementById('mensaje-exitoso');
        mensajeExito.textContent = formularioValido ? 'Registro exitoso!' : '';
    })

    
}