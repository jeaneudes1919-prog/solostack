import { Star } from 'lucide-react';

const StarRating = ({ rating, size = 16 }) => {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          size={size} 
          className={`${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} 
        />
      ))}
    </div>
  );
};

export default StarRating;