
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://oibmwzevaiwphlskypwm.supabase.co';
const supabaseAnonKey = 'sb_publishable_96q0EOqjrXv63WFSQtH8NQ_e8LzMzUl'; // Using the key from .env

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Seeding products...');
  
  const products = [
    {
      name: 'Gentle Hydrating Cleanser',
      brand: 'DermAl Care',
      description: 'A gentle, non-foaming cleanser that removes impurities without stripping the skin.',
      price_aed: 85,
      category: 'Cleanser',
      suitable_skin_types: ['dry', 'sensitive', 'normal'],
      stock_quantity: 100,
      image_urls: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop'],
      rating: 4.8
    },
    {
      name: 'SPF 50+ Sun Defense',
      brand: 'DermAl Care',
      description: 'Broad-spectrum protection tailored for the intense UAE sun. Water-resistant and oil-free.',
      price_aed: 120,
      category: 'Sunscreen',
      suitable_skin_types: ['oily', 'dry', 'combination', 'sensitive', 'normal'],
      stock_quantity: 50,
      image_urls: ['https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=400&auto=format&fit=crop'],
      rating: 4.9
    },
    {
      name: 'Advanced Retinol Serum',
      brand: 'ProSkin',
      description: 'Night treatment to reduce fine lines and improve skin texture.',
      price_aed: 210,
      category: 'Treatment',
      suitable_skin_types: ['normal', 'combination', 'oily'],
      stock_quantity: 30,
      image_urls: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=400&auto=format&fit=crop'],
      rating: 4.7
    }
  ];

  for (const product of products) {
    const { error } = await supabase.from('products').insert(product);
    if (error) {
      console.error(`Error inserting ${product.name}:`, error.message);
    } else {
      console.log(`Inserted ${product.name}`);
    }
  }

  console.log('Seed complete.');
}

seed();
