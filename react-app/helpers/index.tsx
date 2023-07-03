import Blockies from 'react-blockies';

export const identiconTemplate = (address : string) => {
    return <Blockies size={14} // number of pixels square
    scale={4} // width/height of each 'pixel'
    className="identicon border-2 border-white rounded-full" // optional className
    seed={address} // seed used to generate icon data, default: random
    />
}

export const updateStarsColor = (numberStars: number) => {
    const stars = document.querySelectorAll(".stars-input");
    stars.forEach((star, index) => {
      if (index < numberStars) {
        star.classList.add("text-yellow-400");
        star.classList.remove("text-gray-400");
      } else {
        star.classList.remove("text-yellow-400");
        star.classList.add("text-gray-400");
      }
    });
  };