import { motion } from 'framer-motion';
import Curtain from './Curtain';
import CoffeeTable from './CoffeeTable';
import Sofa from './Sofa';
import './CurtainScene.css';

function CurtainScene({ isOpen = false, variant = 'full', className = '', children }) {
  const classes = [
    'curtain-scene',
    `curtain-scene--${variant}`,
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="cinema-wall">
        <div className="cinema-screen">
          {children && (
            <motion.div
              className="cinema-screen-content"
              initial={{ opacity: 0 }}
              animate={{ opacity: isOpen ? 1 : 0.22 }}
              transition={{ duration: 0.45, delay: isOpen ? 1.05 : 0 }}
            >
              {children}
            </motion.div>
          )}
          <Curtain side="left" isOpen={isOpen} />
          <Curtain side="right" isOpen={isOpen} />
        </div>
      </div>
      <CoffeeTable />
      <Sofa />
    </div>
  );
}

export default CurtainScene;
