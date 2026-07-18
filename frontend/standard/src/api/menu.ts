import { apiClient } from '@/api/client';
import type { Categoria, Dish, PlatillosPage } from '@/types';

import menuAppetizer from '@/assets/menu-appetizer.jpg';
import menuSalad from '@/assets/menu-salad.jpg';
import menuSteak from '@/assets/menu-steak.jpg';
import menuPasta from '@/assets/menu-pasta.jpg';
import menuDessert from '@/assets/menu-dessert.jpg';
import menuDrink from '@/assets/menu-drink.jpg';

// Imágenes de respaldo cuando el platillo no trae imagen_url desde el backend.
const fallbackImages = [menuAppetizer, menuSalad, menuSteak, menuPasta, menuDessert, menuDrink];

const descriptions = [
  'Receta peruana de la casa, servida al momento.',
  'Sabor criollo con insumos frescos y punto exacto.',
  'Preparación especial de UTTOF para compartir.',
  'Clásico peruano con presentación contemporánea.',
];

export async function getCategorias(): Promise<Categoria[]> {
  const response = await apiClient.get<Categoria[]>('/menu/categorias');
  return response.data;
}

export async function getDishes(): Promise<Dish[]> {
  const [categorias, platillos] = await Promise.all([
    getCategorias(),
    apiClient.get<PlatillosPage>('/menu/platillos', { params: { limit: 50 } }),
  ]);
  const categoryById = new Map(categorias.map((categoria) => [categoria.id_categoria, categoria.nombre]));
  return platillos.data.data.map((platillo, index) => ({
    id_platillo: platillo.id_platillo,
    id_categoria: platillo.id_categoria,
    categoria: platillo.id_categoria ? categoryById.get(platillo.id_categoria) ?? 'Carta' : 'Carta',
    nombre: platillo.nombre,
    descripcion: descriptions[index % descriptions.length],
    precio: Number(platillo.precio),
    imagen_url: platillo.imagen_url ?? fallbackImages[index % fallbackImages.length],
    disponible: Boolean(platillo.disponible),
  }));
}
