import { useNavigate } from 'react-router-dom';
import apartmentImg from '@/assets/home/occasion-apartment.jpg';
import officeImg from '@/assets/home/occasion-office.jpg';
import birthdayImg from '@/assets/home/occasion-birthday.jpg';
import weddingImg from '@/assets/home/occasion-wedding.jpg';
import graduationImg from '@/assets/home/occasion-graduation.jpg';
import corporateImg from '@/assets/home/occasion-corporate.jpg';
import schoolImg from '@/assets/home/occasion-school.jpg';
import neighborhoodImg from '@/assets/home/occasion-neighborhood.jpg';

const OCCASIONS = [
  { title: 'Apartment event', q: 'apartment', image: apartmentImg },
  { title: 'Office lunch', q: 'office lunch', image: officeImg },
  { title: 'Birthday party', q: 'birthday', image: birthdayImg },
  { title: 'Wedding', q: 'wedding', image: weddingImg },
  { title: 'Graduation', q: 'graduation', image: graduationImg },
  { title: 'Corporate event', q: 'corporate', image: corporateImg },
  { title: 'School event', q: 'school', image: schoolImg },
  { title: 'Neighborhood', q: 'neighborhood', image: neighborhoodImg },
];

export function OccasionGrid() {
  const navigate = useNavigate();

  return (
    <section className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-2">
          What are you planning?
        </h2>
        <p className="text-muted-foreground mb-8">Browse Event Pros by event type.</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {OCCASIONS.map((o) => (
            <button
              key={o.title}
              onClick={() => navigate(`/browse?q=${encodeURIComponent(o.q)}`)}
              className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all"
            >
              <img
                src={o.image}
                alt={o.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <div className="text-white font-display font-semibold text-base md:text-lg">
                  {o.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
