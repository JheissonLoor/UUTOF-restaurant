import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center text-center px-4">
      <p className="font-heading text-7xl font-bold text-primary mb-4">404</p>
      <h1 className="font-heading text-2xl font-bold mb-2">Página no encontrada</h1>
      <p className="text-muted-foreground mb-8">La página que buscas no existe o fue movida.</p>
      <Link
        to="/"
        className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground text-sm font-semibold hover:brightness-110 transition shadow-md shadow-primary/20"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
