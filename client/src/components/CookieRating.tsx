import { useState } from "react";
import { GiCookie } from "react-icons/gi";
import "./CookieRating.css";

interface CookieRatingProps {
  rating: number | null;
  onChange: (rating: number | null) => void;
}

export default function CookieRating({ rating, onChange }: CookieRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);

  const active = hovered ?? rating ?? 0;

  const handleClick = (value: number) => {
    onChange(rating === value ? null : value);
  };

  return (
    <div className="cookie-rating" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          className={`cookie ${active >= value ? "filled" : ""}`}
          onMouseEnter={() => setHovered(value)}
          onClick={() => handleClick(value)}
          aria-label={`Rate ${value} out of 5`}
        >
          <GiCookie size={20} />
        </button>
      ))}
    </div>
  );
}
