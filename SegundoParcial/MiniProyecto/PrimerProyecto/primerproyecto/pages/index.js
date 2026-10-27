import Link from 'next/link';

export default function Home() {
    return (
        <main>
            <h1>Registro de Asistencia a Talleres - CECyT 9</h1>
            <p>
                <Link href="/talleres">Ver Talleres</Link>
            </p>
            <p>
                <Link href="/perfil">Mi perfil</Link>
            </p>
            <p>
                <Link href="/practica/1">Ir a Práctica 1</Link>
            </p>
        </main>
    );
}
