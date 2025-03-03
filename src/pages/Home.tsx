import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Diamond, Gamepad2, ArrowRight, Github } from 'lucide-react';
import { showNotification } from '../utils/animations';
import { playSound } from '../utils/sounds';

// Component for game cards
const GameCard: React.FC<{
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  color: string;
  delay: number;
}> = ({ title, description, icon, path, color, delay }) => {
  const handleHover = () => {
    playSound('/assets/sounds/ui-hover.mp3', 0.15);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="game-card relative overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 p-6 shadow-xl backdrop-blur-sm"
      onMouseEnter={handleHover}
    >
      <div className={`absolute -right-8 -top-8 h-24 w-24 rounded-full ${color} opacity-10 blur-xl`} />
      <div className={`mb-4 inline-flex rounded-lg p-3 ${color} bg-opacity-20`}>
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-white">{title}</h3>
      <p className="mb-4 text-sm text-slate-300">{description}</p>
      <Link
        to={path}
        className={`group inline-flex items-center text-sm font-medium ${color.replace('bg-', 'text-')} hover:underline`}
      >
        Play Now
        <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </motion.div>
  );
};

const Home: React.FC = () => {
  useEffect(() => {
    document.title = 'Games Collection - Home';
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="home-container pb-20">
      {/* Hero Section */}
      <motion.div 
        className="hero-section relative overflow-hidden py-20 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-950/40 via-indigo-950/30 to-transparent" />
        <div className="absolute inset-0 -z-20">
          <div className="absolute inset-0 bg-[url('/assets/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-2 flex items-center justify-center"
        >
          <Sparkles className="mr-2 text-blue-400" size={24} />
          <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-4xl font-bold text-transparent sm:text-5xl">
            Games Collection
          </h1>
          <Sparkles className="ml-2 text-blue-400" size={24} />
        </motion.div>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mx-auto mt-4 max-w-xl text-lg text-slate-300"
        >
          Welcome to your premium collection of classic games reimagined with modern design and smooth animations.
        </motion.p>
      </motion.div>

      {/* Games Grid Section */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <motion.h2 
          className="mb-10 text-center text-2xl font-bold text-white"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          Choose your game
        </motion.h2>

        <motion.div 
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <GameCard
            title="Minesweeper"
            description="Test your memory and deduction skills by clearing the minefield without setting off any explosives."
            icon={<Diamond size={24} className="text-emerald-400" />}
            path="/minesweeper"
            color="bg-emerald-500"
            delay={0.1}
          />

          <GameCard
            title="Blackjack"
            description="Try your luck against the dealer in this classic card game. Get as close to 21 as possible without going over."
            icon={<Gamepad2 size={24} className="text-red-400" />}
            path="/blackjack"
            color="bg-red-500"
            delay={0.2}
          />
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div 
        className="features-section mx-auto max-w-6xl px-4 py-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <h2 className="mb-12 text-center text-2xl font-bold text-white">Amazing Features</h2>
        
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Beautiful Design",
              description: "Modern UI with smooth animations and transitions make playing even more enjoyable",
              icon: "✨"
            },
            {
              title: "Ambient Sounds",
              description: "Immersive audio effects enhance your gaming experience and create atmosphere",
              icon: "🔊"
            },
            {
              title: "Responsive Layout",
              description: "Play on any device with a fully responsive design that adapts to your screen",
              icon: "📱"
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
              className="feature-card rounded-lg border border-slate-800 bg-slate-900/50 p-6"
            >
              <div className="mb-4 text-3xl">{feature.icon}</div>
              <h3 className="mb-2 text-lg font-medium text-white">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Call to Action */}
      <motion.div
        className="cta-section mx-auto mt-10 max-w-4xl rounded-2xl bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-10 text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <h2 className="mb-4 text-2xl font-bold text-white">Ready to Play?</h2>
        <p className="mb-6 text-slate-300">Choose a game from the sidebar and start having fun now!</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link 
            to="/minesweeper"
            className="inline-flex items-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-800"
            onClick={() => playSound('/assets/sounds/ui-click.mp3', 0.2)}
          >
            <Diamond size={18} className="mr-2" />
            Play Minesweeper
          </Link>
          <Link 
            to="/blackjack"
            className="inline-flex items-center rounded-lg bg-red-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-800"
            onClick={() => playSound('/assets/sounds/ui-click.mp3', 0.2)}
          >
            <Gamepad2 size={18} className="mr-2" />
            Play Blackjack
          </Link>
        </div>
      </motion.div>

      {/* Footer */}
      <motion.div
        className="footer-section mt-20 text-center text-sm text-slate-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        <p>Created with 💙 for a modern gaming experience</p>
        <a 
          href="https://github.com/yourusername/games-collection"
          className="mt-2 inline-flex items-center text-slate-400 hover:text-slate-200"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github size={16} className="mr-1" />
          View on GitHub
        </a>
      </motion.div>
    </div>
  );
};

export default Home; 