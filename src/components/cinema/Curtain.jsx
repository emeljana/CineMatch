import { motion } from 'framer-motion';

const curtainVariants = {
  closed: { x: '0%' },
  openLeft: { x: '-92%' },
  openRight: { x: '92%' },
};

function Curtain({ side, isOpen }) {
  const openState = side === 'left' ? 'openLeft' : 'openRight';

  return (
    <motion.div
      className={`cinema-curtain cinema-curtain--${side}`}
      initial="closed"
      animate={isOpen ? openState : 'closed'}
      variants={curtainVariants}
      transition={{ duration: 1.2, ease: 'easeInOut' }}
    />
  );
}

export default Curtain;
