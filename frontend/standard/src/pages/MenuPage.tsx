import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Trash2, X, Search, Sparkles, MapPin } from 'lucide-react';
import { toast } from 'sonner';

import { getDishes } from '@/api/menu';
import { enviarPedido } from '@/api/pedidos';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useOrder } from '@/order/useOrder';
import { ErrorState } from '@/components/ErrorState';
import { MenuSkeleton } from '@/components/MenuSkeleton';
import type { Dish } from '@/types';

export default function MenuPage() {
  const { data: dishes, isLoading, isError, refetch } = useQuery({ queryKey: ['menu'], queryFn: getDishes });
  const { cart, cartTotal, cartCount, addToCart, updateQty, removeFromCart, clearCart, mesa, setActivePedidoId } =
    useOrder();
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const enviarMutation = useMutation({
    mutationFn: (idMesa: number) => enviarPedido(idMesa, cart),
    onSuccess: (res) => {
      setActivePedidoId(res.id_pedido);
      clearCart();
      setCartOpen(false);
      toast.success('¡Pedido enviado a cocina!');
      navigate('/mis-pedidos');
    },
    onError: () => toast.error('No se pudo enviar el pedido. Intenta de nuevo.'),
  });

  const categories = useMemo(() => {
    if (!dishes) return [];
    return Array.from(new Set(dishes.map((d) => d.categoria)));
  }, [dishes]);

  const currentCategory = activeCategory ?? categories[0] ?? null;

  const filteredDishes = useMemo(() => {
    if (!dishes) return [];
    return dishes.filter((dish) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return dish.nombre.toLowerCase().includes(q) || dish.descripcion.toLowerCase().includes(q);
      }
      return dish.categoria === currentCategory;
    });
  }, [dishes, searchQuery, currentCategory]);

  const handleAdd = (dish: Dish) => {
    addToCart(dish);
    toast.success(`${dish.nombre} agregado`, { duration: 1500 });
  };

  const handleConfirm = () => {
    if (cart.length === 0) {
      toast.error('Tu carrito está vacío');
      return;
    }
    if (!mesa) {
      toast.info('Primero elige tu mesa');
      setCartOpen(false);
      navigate('/mesa');
      return;
    }
    enviarMutation.mutate(mesa.id_mesa);
  };

  if (isLoading) return <MenuSkeleton />;
  if (isError) return <ErrorState message="No se pudo cargar la carta." onRetry={() => refetch()} />;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-heading text-3xl font-bold mb-1">Nuestra Carta</h1>
          <p className="text-muted-foreground text-sm flex items-center gap-1.5">
            {mesa ? (
              <>
                <MapPin className="h-3.5 w-3.5" /> Mesa #{mesa.numero} · {mesa.zona}
              </>
            ) : (
              'Descubre nuestros platos favoritos'
            )}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCartOpen(true)}
          className="relative p-3 rounded-2xl bg-primary text-primary-foreground hover:brightness-110 transition shadow-md"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <motion.span
              key={cartCount}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center shadow-sm"
            >
              {cartCount}
            </motion.span>
          )}
        </motion.button>
      </div>

      <div className="relative mb-5">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl border bg-card text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
          placeholder="Buscar platillos, bebidas, postres..."
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {!searchQuery && categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all capitalize',
                cat === currentCategory
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                  : 'bg-card border text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {searchQuery && (
        <p className="text-sm text-muted-foreground mb-4">
          {filteredDishes.length} resultado{filteredDishes.length !== 1 ? 's' : ''} para "{searchQuery}"
        </p>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredDishes.map((dish, i) => {
            const inCart = cart.find((c) => c.id_platillo === dish.id_platillo);
            return (
              <motion.div
                key={dish.id_platillo}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.04 }}
                className="bg-card rounded-3xl border overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={dish.imagen_url}
                    alt={dish.nombre}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {inCart && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-3 right-3 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-lg"
                    >
                      {inCart.cantidad}
                    </motion.div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-heading font-semibold text-lg mb-1">{dish.nombre}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{dish.descripcion}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-heading font-bold text-primary">{formatCurrency(dish.precio)}</span>
                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(dish.id_platillo, inCart.cantidad - 1)}
                          className="w-9 h-9 rounded-xl border flex items-center justify-center hover:bg-muted transition"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="text-sm font-bold w-5 text-center">{inCart.cantidad}</span>
                        <button
                          onClick={() => updateQty(dish.id_platillo, inCart.cantidad + 1)}
                          className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 transition"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAdd(dish)}
                        className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:brightness-110 transition flex items-center gap-1.5 shadow-sm"
                      >
                        <Plus className="h-4 w-4" /> Agregar
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredDishes.length === 0 && (
        <div className="text-center py-16">
          <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">No se encontraron platillos</p>
        </div>
      )}

      {cartCount > 0 && !cartOpen && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 md:hidden p-4 bg-card/95 backdrop-blur-lg border-t z-40"
        >
          <button
            onClick={() => setCartOpen(true)}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-3 shadow-lg shadow-primary/30"
          >
            <ShoppingCart className="h-5 w-5" />
            Ver pedido ({cartCount}) · {formatCurrency(cartTotal)}
          </button>
        </motion.div>
      )}

      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCartOpen(false)}
              className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card border-l z-50 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b">
                <div>
                  <h2 className="font-heading text-xl font-bold">Tu Pedido</h2>
                  <p className="text-xs text-muted-foreground">
                    {mesa ? `Mesa #${mesa.numero} · ` : ''}
                    {cartCount} producto{cartCount !== 1 ? 's' : ''}
                  </p>
                </div>
                <button onClick={() => setCartOpen(false)} className="p-2 rounded-xl hover:bg-muted transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-16">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-muted-foreground">Tu carrito está vacío</p>
                    <p className="text-xs text-muted-foreground mt-1">Agrega productos desde el menú</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {cart.map((item) => (
                      <motion.div
                        key={item.id_platillo}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0 }}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-background border"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item.nombre}</p>
                          <p className="text-sm text-primary font-bold mt-0.5">
                            {formatCurrency(item.precio * item.cantidad)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateQty(item.id_platillo, item.cantidad - 1)}
                            className="w-8 h-8 rounded-xl border flex items-center justify-center hover:bg-muted transition"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold w-6 text-center">{item.cantidad}</span>
                          <button
                            onClick={() => updateQty(item.id_platillo, item.cantidad + 1)}
                            className="w-8 h-8 rounded-xl border flex items-center justify-center hover:bg-muted transition"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id_platillo)}
                          className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t p-5 space-y-4 bg-card">
                  {!mesa && (
                    <div className="rounded-2xl bg-accent/10 text-accent-foreground/90 text-xs px-4 py-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-accent shrink-0" />
                      Elige tu mesa para enviar el pedido a cocina.
                    </div>
                  )}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatCurrency(cartTotal)}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={clearCart}
                      className="px-4 py-3 rounded-2xl border text-sm font-medium text-muted-foreground hover:text-destructive hover:border-destructive/30 transition"
                    >
                      Vaciar
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleConfirm}
                      disabled={enviarMutation.isPending}
                      className="flex-1 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition flex items-center justify-center gap-2 shadow-md shadow-primary/20 disabled:opacity-70"
                    >
                      {enviarMutation.isPending ? (
                        <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          {mesa ? 'Confirmar Pedido' : 'Elegir mesa'}
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
