import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, UtensilsCrossed } from 'lucide-react';

import heroFood from '@/assets/hero-food.jpg';

export default function LandingPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={heroFood} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      </div>

      <div className="relative container mx-auto px-4 py-24 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 bg-card/80 backdrop-blur border rounded-full px-4 py-1.5 mb-6"
        >
          <UtensilsCrossed className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider">Restaurante · Perú</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="font-heading text-4xl sm:text-6xl font-bold max-w-3xl mb-5"
        >
          Sabor peruano, servido al instante
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground text-lg max-w-xl mb-9"
        >
          Reserva tu mesa, explora la carta y pide desde tu lugar. Todo en soles, todo desde una sola app.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-3 justify-center"
        >
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold hover:brightness-110 transition shadow-lg shadow-primary/25"
          >
            Iniciar sesión <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/registro"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-card border font-semibold hover:bg-muted transition"
          >
            Crear cuenta
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
