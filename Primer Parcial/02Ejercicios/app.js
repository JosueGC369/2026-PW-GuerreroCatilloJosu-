const talleres = [
  { nombre: 'Introducción a Python', instructor: 'Ing. María López', cupo: 25, inscritos: 25 },
  { nombre: 'Fundamentos de Redes', instructor: 'Ing. Carlos Ramírez', cupo: 30, inscritos: 18 },
  { nombre: 'Diseño de Bases de Datos', instructor: 'Ing. Ana Torres', cupo: 20, inscritos: 20 },
  { nombre: 'Desarrollo Web con JS', instructor: 'Ing. María López', cupo: 25, inscritos: 10 },
];

function pintarTabla(){

    const tbody = document.querySelector('#tabla-talleres tbody');
    
    if (tbody) {
        tbody.innerHTML = '';

        talleres.forEach(taller => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${taller.nombre}</td>
                <td>${taller.instructor}</td>
                <td>${taller.cupo}</td>
                <td>${taller.inscritos}</td>
            `;
            tbody.appendChild(tr);
        });
    }
}

document.addEventListener('DOMContentLoaded', pintarTabla);

const formArreglos = document.getElementById('formulario-arreglos');
const resultadosArreglos = document.getElementById('resultado de Arreglo');
const selectOperacionArreglo = document.getElementById('operacion-arreglo');

if (formArreglos) {
    formArreglos.addEventListener('submit', (evento) => {
        evento.preventDefault();
        
        const operacion = selectOperacionArreglo.value;
        let resultado;
        
        switch(operacion){
            case 'ForEach':
 
                resultado = talleres.map((t) => `- ${t.nombre} (${t.inscritos}/${t.cupo})`).join('\n');
                break;
                
            case 'map':

                resultado = "Arreglo de nombres: \n" + talleres.map((t) => t.nombre).join(', ');
                break;
                
            case 'filter':

                const llenos = talleres.filter((t) => t.inscritos >= t.cupo);
                resultado = "Talleres sin cupo: \n" + llenos.map((t) => t.nombre).join(', ');
                break;
                
            case 'find':

                const tallerMaria = talleres.find((t) => t.instructor === 'Ing. María López');
                resultado = tallerMaria ? `Primer taller encontrado: ${tallerMaria.nombre}` : 'No encontrado';
                break;
                
            case 'reduce':

                const totalInscritos = talleres.reduce((acumulador, t) => acumulador + t.inscritos, 0);
                resultado = `Total de alumnos inscritos en todos los talleres: ${totalInscritos}`;
                break;
                
            case 'filterMap':

                const disponibles = talleres.filter((t) => t.inscritos < t.cupo).map((t) => t.nombre);
                resultado = "Talleres con cupo disponible: \n" + disponibles.join(', ');
                break;
                
            default:
                resultado = 'Selecciona una operación válida.';
        }

        resultadosArreglos.textContent = resultado;
    });
}