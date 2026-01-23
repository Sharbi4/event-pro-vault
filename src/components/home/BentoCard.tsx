import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Verified, Zap } from 'lucide-react';

interface BentoCardProps {
  id: string;
  title: string;
  vendorName: string;
  image: string;
  price: number;
  priceUnit: string;
  rating?: number;
  reviewCount?: number;
  isVerified?: boolean;
  isInstant?: boolean;
  size?: 'default' | 'tall' | 'wide' | 'featured';
  index?: number;
}

export function BentoCard({
  id,
  title,
  vendorName,
  image,
  price,
  priceUnit,
  rating,
  reviewCount,
  isVerified,
  isInstant,
  size = 'default',
  index = 0,
}: BentoCardProps) {
  const sizeClasses = {
    default: 'col-span-1 row-span-1 aspect-square',
    tall: 'col-span-1 row-span-2 aspect-[3/4] md:aspect-auto',
    wide: 'col-span-2 row-span-1 aspect-video',
    featured: 'col-span-2 row-span-2 aspect-square md:aspect-auto',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/package/${id}`} className={`block ${sizeClasses[size]}`}>
        <div className="bento-card h-full group cursor-pointer">
          {/* Image */}
          <img
            src={image}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          {/* Gradient Overlay */}
          <div className="overlay" />

          {/* Price Pill */}
          <div className="absolute top-4 right-4 price-pill text-sm">
            ${price}<span className="text-white/70 text-xs">/{priceUnit}</span>
          </div>

          {/* Trust Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            {isVerified && (
              <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                <Verified className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-medium text-foreground">Verified</span>
              </div>
            )}
            {isInstant && (
              <div className="flex items-center gap-1 bg-accent/90 backdrop-blur-sm rounded-full px-2.5 py-1">
                <Zap className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-medium text-white">Instant</span>
              </div>
            )}
          </div>

          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
            <div className="space-y-1">
              <p className="text-white/70 text-sm">{vendorName}</p>
              <h3 className="text-white font-semibold text-lg md:text-xl line-clamp-2 group-hover:text-white/90 transition-colors">
                {title}
              </h3>
              
              {rating && reviewCount && (
                <div className="flex items-center gap-1.5 pt-1">
                  <Star className="w-4 h-4 text-trust fill-trust" />
                  <span className="text-white font-medium text-sm">{rating.toFixed(1)}</span>
                  <span className="text-white/60 text-sm">({reviewCount})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
