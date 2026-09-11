import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';

import { getConfiguracionPublica, getDishes } from '@/api/cliente';
import { ArrowIcon, CalendarIcon, CameraIcon, MenuIcon } from '@/components/icons';
import { formatCurrency } from '@/lib/format';


const heroImage = 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=1800&q=88';

export function LandingPage(): JSX.Element {
  const configQuery = useQuery({ queryKey: ['public', 'config'], queryFn: getConfiguracionPublica });
  const dishesQuery = useQuery({ queryKey: ['public', 'dishes'], queryFn: getDishes });
  const config = configQuery.data?.restaurante;
  const featured = (dishesQuery.data ?? []).slice(0, 3);

  return (
    <div className="min-h-screen bg-cream-bg text-ink-900">
      <header className="absolute inset-x-0 top-0 z-20 border-b border-white/15 bg-ink-900/45 text-white backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center px-5 lg:px-8">
          <Link to="/" className="font-serif text-2xl font-bold">UTTOF</Link>
          <nav className="ml-auto hidden items-center gap-7 text-sm font-semibold sm:flex">
            <Link to="/carta">Carta</Link>
            <Link to="/reservar">Reservar</Link>
            <Link to="/login">Iniciar sesión</Link>
          </nav>
          <Link to="/registro" className="ml-4 inline-flex min-h-11 items-center rounded-md bg-coral px-4 text-sm font-semibold text-white">
            Crear cuenta
          </Link>
        </div>
      </header>

      <main>
        <section className="relative flex min-h-[calc(100svh-80px)] items-end overflow-hidden text-white">
          <img src={heroImage} alt="Plato peruano servido en UTTOF" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/55" />
          <div className="relative mx-auto w-full max-w-6xl px-5 pb-16 pt-32 lg:px-8 lg:pb-20">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/75">Restaurante peruano · Miraflores</p>
            <h1 className="mt-4 max-w-3xl font-serif text-5xl font-semibold leading-[1.04] sm:text-6xl lg:text-7xl">UTTOF Restaurante</h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/80 sm:text-lg">Reserva tu mesa, descubre nuestra carta peruana y pide desde tu lugar cuando llegues.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/reservar" className="inline-flex min-h-12 items-center gap-2 rounded-md bg-coral px-5 text-sm font-semibold text-white">
                <CalendarIcon size={17} /> Reservar mesa
              </Link>
              <Link to="/carta" className="inline-flex min-h-12 items-center gap-2 rounded-md border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur">
                <MenuIcon size={17} /> Ver la carta
              </Link>
              <Link to="/carta" className="inline-flex min-h-12 items-center gap-2 px-2 text-sm font-semibold text-white/85">
                Continuar como invitado <ArrowIcon size={15} />
              </Link>
            </div>
          </div>
        </section>

        <section className="border-b border-[rgba(31,26,20,0.08)] bg-cream-surface py-14">
          <div className="mx-auto grid max-w-6xl gap-8 px-5 md:grid-cols-3 lg:px-8">
            {[
              { Icon: MenuIcon, title: 'Explora la carta', body: 'Platos peruanos con precios claros en soles.' },
              { Icon: CameraIcon, title: 'Escanea tu mesa', body: 'El QR físico inicia una visita segura, incluso sin cuenta.' },
              { Icon: CalendarIcon, title: 'Reserva con anticipación', body: 'Recibe tu folio y QR de reserva al confirmar.' },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="border-l-2 border-coral pl-4">
                <Icon className="text-coral-600" size={22} />
                <h2 className="mt-3 font-serif text-2xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-500">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-6xl px-5 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-coral-600">Favoritos de la casa</p>
                <h2 className="mt-2 font-serif text-4xl font-semibold">Sabores que sí hablan de Perú</h2>
              </div>
              <Link to="/carta" className="hidden items-center gap-2 text-sm font-semibold text-coral-600 sm:flex">Carta completa <ArrowIcon size={15} /></Link>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {featured.map((dish) => (
                <article key={dish.id_platillo} className="overflow-hidden rounded-xl bg-cream-surface shadow-soft">
                  <img src={dish.imagen_url} alt={dish.nombre} className="aspect-[4/3] w-full object-cover" />
                  <div className="p-4">
                    <h3 className="font-serif text-2xl font-semibold">{dish.nombre}</h3>
                    <p className="mt-2 text-sm leading-6 text-ink-500">{dish.descripcion}</p>
                    <p className="mt-4 font-serif text-xl font-bold text-coral-600">{formatCurrency(dish.precio)}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-ink-900 py-14 text-white">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 md:flex-row md:items-end md:justify-between lg:px-8">
            <div>
              <p className="text-sm text-white/55">Visítanos</p>
              <h2 className="mt-2 font-serif text-3xl font-semibold">{config?.direccion ?? 'Av. Larco 123, Miraflores, Lima'}</h2>
              <p className="mt-3 text-sm text-white/65">Atención de {config?.horario_apertura ?? '12:00'} a {config?.horario_cierre ?? '23:00'} · {config?.telefono ?? '+51 999 999 999'}</p>
            </div>
            <Link to="/mesa/escanear" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-coral px-5 text-sm font-semibold text-white">
              <CameraIcon size={17} /> Ya estoy en UTTOF
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
