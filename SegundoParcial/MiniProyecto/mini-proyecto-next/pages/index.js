import Link from 'next/link';

export default function Home() {
  return (
    <main>
      <h1>Mini-proyecto Next.js</h1>
      <p>Ejercicios de rutas dinámicas, consumo de Express y administración de usuarios.</p>
      <ul>
        <li><Link href="/practica/1">Probar una ruta dinámica</Link></li>
        <li><Link href="/mini-servidor">Probar el servidor Express</Link></li>
        <li><Link href="/admin/usuarios">Administrar usuarios</Link></li>
      </ul>
    </main>
  );
}
