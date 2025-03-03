import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, DollarSign, Wallet, PiggyBank, Award, ChevronDown, X, HandCoins, TrendingUp } from 'lucide-react';
import { showNotification } from '../utils/animations';
import { 
  playAmbientSound, 
  playCardSound, 
  playChipSound, 
  playWinSound, 
  playLoseSound,
  playPushSound,
  playCashSound,
  stopSound
} from '../utils/sounds';

// Types
type Card = {
  suit: '♠' | '♣' | '♥' | '♦';
  value: string;
  numericValue: number;
};

type GameStatus = 'betting' | 'playing' | 'finished';

interface LoanOffer {
  amount: number;
  interestRate: number;
  dueInDays: number;
}

// Helper functions
const createDeck = (): Card[] => {
  const suits: Card['suit'][] = ['♠', '♣', '♥', '♦'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: Card[] = [];

  for (const suit of suits) {
    for (const value of values) {
      const numericValue = value === 'A' ? 11 : ['J', 'Q', 'K'].includes(value) ? 10 : parseInt(value);
      deck.push({ suit, value, numericValue });
    }
  }

  return shuffle(deck);
};

const shuffle = (deck: Card[]): Card[] => {
  const newDeck = [...deck];
  for (let i = newDeck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
  }
  return newDeck;
};

const calculateHandValue = (hand: Card[]): number => {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.value === 'A') {
      aces += 1;
    }
    value += card.numericValue;
  }

  while (value > 21 && aces > 0) {
    value -= 10;
    aces -= 1;
  }

  return value;
};

// Add these helper functions to render proper suit symbols
const getSuitSymbol = (suit: string) => {
  switch(suit) {
    case '♥': return '♥';
    case '♦': return '♦';
    case '♠': return '♠';
    case '♣': return '♣';
    default: return suit;
  }
};

const getSuitClass = (suit: string) => {
  switch(suit) {
    case '♥': 
    case '♦': 
      return 'hearts';
    case '♠': 
    case '♣': 
      return 'spades';
    default: 
      return '';
  }
};

const Blackjack: React.FC = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('betting');
  const [message, setMessage] = useState<string>('');
  const [playerBalance, setPlayerBalance] = useState<number>(1000); // Start with $1000
  const [currentBet, setCurrentBet] = useState<number>(0);
  const [customBetAmount, setCustomBetAmount] = useState<string>('');
  const [loans, setLoans] = useState<{ amount: number; dueDate: Date; interest: number }[]>([]);
  const [showLoanModal, setShowLoanModal] = useState<boolean>(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanOffer | null>(null);
  const [dealerScore, setDealerScore] = useState<number>(0);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [showDealerScore, setShowDealerScore] = useState<boolean>(false);
  const [cardDealing, setCardDealing] = useState<boolean>(false);
  const tableSoundRef = useRef<HTMLAudioElement | null>(null);

  const LOAN_OFFERS: LoanOffer[] = [
    { amount: 500, interestRate: 0.1, dueInDays: 7 },
    { amount: 1000, interestRate: 0.15, dueInDays: 14 },
    { amount: 2000, interestRate: 0.2, dueInDays: 30 },
  ];

  // Play ambient casino sounds
  useEffect(() => {
    tableSoundRef.current = playAmbientSound();
    
    return () => {
      if (tableSoundRef.current) {
        stopSound(tableSoundRef.current);
        tableSoundRef.current = null;
      }
    };
  }, []);

  // Initialize game
  useEffect(() => {
    initializeDeck();
  }, []);

  // Update scores when hands change
  useEffect(() => {
    setPlayerScore(calculateHandValue(playerHand));
    setDealerScore(calculateHandValue(dealerHand));
  }, [playerHand, dealerHand]);

  const initializeDeck = () => {
    const newDeck = createDeck();
    setDeck(newDeck);
    setPlayerHand([]);
    setDealerHand([]);
    setGameStatus('playing');
    setMessage('');
    setShowDealerScore(false);
    
    // Deal cards with animation
    setCardDealing(true);
    setTimeout(() => {
      setPlayerHand([newDeck[0]]);
      setTimeout(() => {
        setDealerHand([newDeck[1]]);
        setTimeout(() => {
          setPlayerHand(prev => [...prev, newDeck[2]]);
          setDeck(newDeck.slice(3));
          setCardDealing(false);
        }, 600);
      }, 600);
    }, 600);
  };

  const drawCard = (): Card => {
    const card = deck[0];
    setDeck(deck.slice(1));
    return card;
  };

  const handleBet = (amount: number) => {
    if (amount > playerBalance) {
      setMessage("You don't have enough money for this bet!");
      showNotification("Insufficient funds!", "error");
      return;
    }
    
    playChipSound();
    
    setCurrentBet(amount);
    setPlayerBalance(prev => prev - amount);
    startNewGame();
  };

  const handleCustomBet = () => {
    const amount = parseInt(customBetAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid bet amount!');
      showNotification("Invalid bet amount!", "error");
      return;
    }
    handleBet(amount);
  };

  const startNewGame = () => {
    const newDeck = createDeck();
    setDeck(newDeck);
    setPlayerHand([]);
    setDealerHand([]);
    setGameStatus('playing');
    setMessage('');
    setShowDealerScore(false);
    
    // Deal cards with animation
    setCardDealing(true);
    setTimeout(() => {
      setPlayerHand([newDeck[0]]);
      setTimeout(() => {
        setDealerHand([newDeck[1]]);
        setTimeout(() => {
          setPlayerHand(prev => [...prev, newDeck[2]]);
          setDeck(newDeck.slice(3));
          setCardDealing(false);
        }, 600);
      }, 600);
    }, 600);
  };

  const handleHit = () => {
    const card = drawCard();
    
    playCardSound();
    
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);

    if (calculateHandValue(newHand) > 21) {
      setTimeout(() => {
        setShowDealerScore(true);
        determineWinner(newHand, dealerHand);
      }, 1000);
    }
  };

  const handleStand = () => {
    setShowDealerScore(true);
    handleDealerTurn(playerHand);
  };

  const handleDoubleDown = () => {
    if (playerBalance < currentBet) {
      showNotification("Not enough funds to double down!", "error");
      return;
    }
    
    playChipSound();
    
    setPlayerBalance(prev => prev - currentBet);
    setCurrentBet(prev => prev * 2);
    
    const card = drawCard();
    const newHand = [...playerHand, card];
    setPlayerHand(newHand);
    
    setTimeout(() => {
      setShowDealerScore(true);
      handleDealerTurn(newHand);
    }, 1000);
  };

  const handleDealerTurn = (finalPlayerHand: Card[]) => {
    let currentDealerHand = [...dealerHand];
    const dealerDrawCards = () => {
      if (calculateHandValue(currentDealerHand) < 17) {
        setTimeout(() => {
          const card = deck[0];
          setDeck(deck.slice(1));
          
          playCardSound();
          
          currentDealerHand = [...currentDealerHand, card];
          setDealerHand(currentDealerHand);
          dealerDrawCards();
        }, 800);
      } else {
        setTimeout(() => determineWinner(finalPlayerHand, currentDealerHand), 800);
      }
    };
    
    dealerDrawCards();
  };

  const determineWinner = (finalPlayerHand: Card[], finalDealerHand: Card[]) => {
    const playerValue = calculateHandValue(finalPlayerHand);
    const dealerValue = calculateHandValue(finalDealerHand);
    
    let winnings = 0;
    
    if (playerValue > 21) {
      setMessage("Bust! You went over 21 and lost!");
      playLoseSound();
    } else if (dealerValue > 21) {
      setMessage("Dealer bust! You win!");
      winnings = currentBet * 2;
      playWinSound();
    } else if (playerValue === 21 && finalPlayerHand.length === 2) {
      setMessage("Blackjack! You win!");
      winnings = currentBet * 2.5; // Blackjack pays 3:2
      playWinSound();
    } else if (playerValue > dealerValue) {
      setMessage("You win!");
      winnings = currentBet * 2;
      playWinSound();
    } else if (playerValue === dealerValue) {
      setMessage("Push! It's a tie.");
      winnings = currentBet;
      playPushSound();
    } else {
      setMessage("Dealer wins!");
      playLoseSound();
    }
    
    if (winnings > 0) {
      showNotification(`Won $${winnings}!`, "success");
      setPlayerBalance(prev => prev + winnings);
    }
    
    setGameStatus('finished');
  };

  const takeLoan = (offer: LoanOffer) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + offer.dueInDays);
    
    const loan = {
      amount: offer.amount,
      dueDate,
      interest: offer.interestRate
    };
    
    setLoans([...loans, loan]);
    setPlayerBalance(prev => prev + offer.amount);
    
    playCashSound();
    
    showNotification(`Loan of $${offer.amount} approved!`, "success");
    setShowLoanModal(false);
  };

  // Replace renderHand function with this improved version
  const renderHand = (hand: Card[], isDealer: boolean = false) => (
    <div className="flex flex-wrap justify-center gap-3 relative z-10">
      {hand.map((card, index) => (
        <motion.div
          key={index}
          className={`playing-card ${getSuitClass(card.suit)}`}
          initial={{ scale: 0.5, y: -50, opacity: 0, rotateY: 180 }}
          animate={{ 
            scale: 1, 
            y: 0, 
            opacity: 1, 
            rotateY: 0,
            x: index > 0 ? index * 5 : 0 // Slightly offset cards
          }}
          transition={{ 
            type: "spring", 
            stiffness: 300, 
            damping: 15,
            delay: index * 0.2
          }}
        >
          {isDealer && index === 0 && gameStatus === 'playing' && !showDealerScore ? (
            <div className="card-back">
              <div className="card-pattern"></div>
            </div>
          ) : (
            <div className="playing-card-inner">
              <div className="flex flex-col">
                <span className="card-value-top">{card.value}</span>
                <span className="card-suit-top">{getSuitSymbol(card.suit)}</span>
              </div>
              <span className="card-suit-center">{getSuitSymbol(card.suit)}</span>
              <div className="flex flex-col">
                <span className="card-value-bottom">{card.value}</span>
                <span className="card-suit-bottom">{getSuitSymbol(card.suit)}</span>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -right-10 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-10 left-1/4 w-80 h-80 bg-green-500/10 rounded-full blur-3xl"></div>
      </div>
      
      <div className="mb-8 relative z-10">
        <div className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-xl p-4 shadow-xl border border-gray-700/50">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <motion.div 
              className="balance-display flex items-center gap-2 bg-gradient-to-r from-green-900/50 to-green-800/50 p-3 rounded-lg"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300, damping: 15 }}
            >
              <Wallet className="text-green-400" size={24} />
              <span className="text-xl font-bold text-green-200">${playerBalance.toLocaleString()}</span>
            </motion.div>
            
            {currentBet > 0 && (
              <motion.div 
                className="bet-display flex items-center gap-2 bg-gradient-to-r from-yellow-900/50 to-yellow-800/50 p-3 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <DollarSign className="text-yellow-400" size={24} />
                <span className="text-xl font-bold text-yellow-200">Bet: ${currentBet}</span>
              </motion.div>
            )}
            
            <motion.button
              onClick={() => setShowLoanModal(true)}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-700 to-purple-900 text-white rounded-lg shadow-lg hover:shadow-purple-500/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <PiggyBank size={20} />
              Casino Loans
            </motion.button>
          </div>
        </div>
      </div>

      <div className="blackjack-table relative z-10">
        {gameStatus === 'betting' ? (
          <motion.div 
            className="betting-controls p-10 rounded-2xl bg-gradient-to-b from-gray-800/90 to-gray-900/90 shadow-2xl border border-gray-700/50 backdrop-blur-lg"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500 mb-10">Place Your Bet</h2>
            
            <div className="flex justify-center gap-6 mb-12">
              {[10, 25, 50, 100].map((amount, index) => (
                <motion.button
                  key={amount}
                  onClick={() => handleBet(amount)}
                  disabled={amount > playerBalance}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, type: "spring" }}
                  whileHover={{ y: -10, scale: 1.1 }}
                  whileTap={{ y: 0, scale: 0.9 }}
                >
                  <div className={`chip chip-${amount} ${amount > playerBalance ? 'opacity-40' : ''} relative`}>
                    <div className="absolute inset-0 bg-white/10 rounded-full blur-sm"></div>
                    <span className="relative z-10 text-white font-bold drop-shadow-md">${amount}</span>
                  </div>
                </motion.button>
              ))}
            </div>
            
            <div className="flex justify-center gap-2 max-w-md mx-auto relative">
              <div className="custom-bet-group w-full relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={customBetAmount}
                  onChange={(e) => setCustomBetAmount(e.target.value)}
                  placeholder="Enter custom bet amount"
                  className="custom-bet-input pl-10"
                  min="1"
                  max={playerBalance}
                />
              </div>
              <motion.button
                onClick={handleCustomBet}
                className="bet-button"
                disabled={!customBetAmount || parseInt(customBetAmount) <= 0 || parseInt(customBetAmount) > playerBalance}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Place Bet
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="game-board p-8 rounded-2xl bg-gradient-to-b from-gray-800/90 to-gray-900/90 shadow-2xl border border-gray-700/50 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="dealer-section mb-12 relative">
              <div className="flex items-center justify-center mb-4 gap-3">
                <h2 className="text-2xl font-bold text-white drop-shadow-md">Dealer's Hand</h2>
                {showDealerScore && (
                  <motion.div 
                    className="px-3 py-1 bg-gray-800/80 rounded-full text-gray-200"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    {dealerScore} points
                  </motion.div>
                )}
              </div>
              
              {/* Green felt area for dealer's cards */}
              <div className="p-6 rounded-xl bg-green-900/30 shadow-inner border border-green-800/30 min-h-[180px] flex justify-center items-center relative">
                {dealerHand.length > 0 ? renderHand(dealerHand, true) : (
                  <div className="text-gray-400 italic">Dealer waiting...</div>
                )}
                
                {/* Dealer chip stack decoration */}
                <div className="absolute -top-4 right-4 flex flex-col-reverse items-center">
                  <div className="w-10 h-1 bg-slate-700/50 rounded-full shadow-md"></div>
                  <div className="w-10 h-10 rounded-full bg-black border-2 border-red-800 shadow-lg transform -translate-y-1"></div>
                  <div className="w-10 h-10 rounded-full bg-black border-2 border-red-800 shadow-lg transform -translate-y-1"></div>
                </div>
              </div>
            </div>
            
            <div className="player-section mb-8 relative">
              <div className="flex items-center justify-center mb-4 gap-3">
                <h2 className="text-2xl font-bold text-white drop-shadow-md">Your Hand</h2>
                <motion.div 
                  className="px-3 py-1 bg-gray-800/80 rounded-full text-gray-200"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {playerScore} points
                </motion.div>
              </div>
              
              {/* Green felt area for player's cards */}
              <div className="p-6 rounded-xl bg-green-900/30 shadow-inner border border-green-800/30 min-h-[180px] flex justify-center items-center">
                {playerHand.length > 0 ? renderHand(playerHand) : (
                  <div className="text-gray-400 italic">Waiting for deal...</div>
                )}
              </div>
            </div>

            {gameStatus === 'playing' && (
              <div className="flex flex-wrap gap-4 justify-center">
                <motion.button
                  onClick={handleHit}
                  className="game-button button-hit"
                  whileHover={{ scale: 1.05, backgroundColor: "#4b5563" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Hit
                </motion.button>
                <motion.button
                  onClick={handleStand}
                  className="game-button button-stand"
                  whileHover={{ scale: 1.05, backgroundColor: "#4b5563" }}
                  whileTap={{ scale: 0.95 }}
                >
                  Stand
                </motion.button>
                {playerHand.length === 2 && (
                  <motion.button
                    onClick={handleDoubleDown}
                    className="game-button button-double"
                    disabled={playerBalance < currentBet}
                    whileHover={{ scale: playerBalance >= currentBet ? 1.05 : 1, backgroundColor: playerBalance >= currentBet ? "#4b5563" : undefined }}
                    whileTap={{ scale: playerBalance >= currentBet ? 0.95 : 1 }}
                  >
                    Double Down
                  </motion.button>
                )}
              </div>
            )}

            {gameStatus === 'finished' && (
              <div className="mt-12 flex flex-col items-center">
                <motion.div 
                  className={`result-message ${
                    message.includes('win') || message.includes('Blackjack') ? 'message-win' : 
                    message.includes('lose') || message.includes('Bust') ? 'message-lose' : 
                    'message-push'
                  }`}
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                  {message}
                </motion.div>
                
                <motion.button
                  onClick={() => {
                    setGameStatus('betting');
                  }}
                  className="game-button button-new-game mt-8 flex items-center gap-2"
                  whileHover={{ scale: 1.05, backgroundColor: "#4b5563" }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw size={20} />
                  Play Again
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Loan modal with improved visuals */}
      <AnimatePresence>
        {showLoanModal && (
          <motion.div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLoanModal(false)}
          >
            <motion.div 
              className="loan-modal max-w-md w-full bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl p-6 border border-purple-800/30 shadow-xl"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-purple-500/30 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-800/50 p-2 rounded-lg">
                    <HandCoins size={24} className="text-purple-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Casino Loans</h2>
                </div>
                <button 
                  onClick={() => setShowLoanModal(false)}
                  className="p-2 rounded-full hover:bg-gray-700/50"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4 mb-6">
                {LOAN_OFFERS.map((offer, index) => (
                  <motion.div
                    key={index}
                    className="loan-option bg-gradient-to-r from-gray-800/80 to-gray-900/80 rounded-xl p-4 border border-gray-700/50 cursor-pointer transition-all"
                    onClick={() => takeLoan(offer)}
                    whileHover={{ scale: 1.02, backgroundColor: "#1f2937" }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="loan-amount text-2xl font-bold text-green-400">${offer.amount}</span>
                      <div className="loan-details flex items-center gap-2 text-yellow-400">
                        <TrendingUp size={16} />
                        {(offer.interestRate * 100).toFixed(0)}% interest
                      </div>
                    </div>
                    <div className="loan-details flex justify-between text-gray-400">
                      <span>Repay in {offer.dueInDays} days</span>
                      <span>Total: ${(offer.amount * (1 + offer.interestRate)).toFixed(0)}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="text-sm text-gray-400 mb-6 border-t border-gray-700/30 pt-4">
                <p>Loans must be repaid by the due date. Failure to repay may affect your casino reputation.</p>
              </div>
              
              <button
                onClick={() => setShowLoanModal(false)}
                className="w-full p-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-colors"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Blackjack;
