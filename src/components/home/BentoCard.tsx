import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

interface BentoCardProps {
  title: string;
  subtitle?: string;
  price?: string;
  image: string;
  href: string;
  size?: 'tall' | 'wide' | 'square';
  index?: number;
}

export function BentoCard({ 
  title, 
  subtitle, 
  price, 
  image, 
  href, 
  size = 'square',
  index = 0 
}: BentoCardProps) {
  const sizeClasses = {
    tall: 'row-span-2',
    wide: 'col-span-2',
    square: '',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
    >
      <Link 
        to={href}
        className={`group relative block overflow-hidden rounded-3xl ${sizeClasses[size]} aspect-square`}
      >
        {/* Image */}
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Price Pill */}
        {price && (
          <div className="price-pill">
            {price}
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bento-overlay opacity-80 group-hover:opacity-90 transition-opacity duration-300" />

        {/* Content */}
        <div className="absolute inset-x-0 bottom-0 p-6">
          <h3 className="text-white text-xl font-semibold mb-1">
            {title}
          </h3>
          {subtitle && (
            <p className="text-white/70 text-sm">
              {subtitle}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
