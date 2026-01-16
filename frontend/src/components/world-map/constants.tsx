// components/world-map/constants.tsx
import { Volume2, Combine, Scissors, ArrowLeftRight } from 'lucide-react';

export const CONTINENT_GAMES = [
  { 
    id: 'twin-letters', 
    continent: 'North America',
    title: 'Twin Letters', 
    icon: <ArrowLeftRight size={24} />,
    position: { top: 83, left: 17 }, 
    color: '#8B5FBF',
    hoverColor: '#B98FD6'
  },
  { 
    id: 'sound-slicer', 
    continent: 'South America',
    title: 'Sound Slicer', 
    icon: <Scissors size={24} />,
    position: { top: 33, left: 30 },
    color: '#35A853',
    hoverColor: '#5BD17C'
  },
  { 
    id: 'sound-safari', 
    continent: 'Africa',
    title: 'Sound Safari', 
    icon: <Volume2 size={24} />,
    position: { top: 47, left: 58 },
    color: '#FF6B35',
    hoverColor: '#FF8A5C'
  },
  { 
    id: 'word-builder', 
    continent: 'Asia',
    title: 'Word Builder', 
    icon: <Combine size={24} />,
    position: { top: 19, left: 68 },
    color: '#2B9EB3',
    hoverColor: '#4ECDC4'
  },
];