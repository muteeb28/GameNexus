import bullsEyeEmoji from '../assets/bulls-eye.webp';
import thumbsUpEmoji from '../assets/thumbs-up.webp';
import mehEmoji from '../assets/meh.webp';
import { Image, ImageProps } from '@chakra-ui/react';

type Props = {
  rating: number;
}

const Emoji = ({ rating }: Props) => {
  const emojiMap: { [key: number]: ImageProps } = {
    3: { src: mehEmoji, alt: 'meh', boxSize: '25px' },
    4: { src: thumbsUpEmoji, alt: 'recommended', boxSize: '25px' },
    5: { src: bullsEyeEmoji, alt: 'exceptional', boxSize: '35px' },
  }

  if (rating < 3) return null;
  return (
    <Image {...emojiMap[rating]} />
  )
}

export default Emoji