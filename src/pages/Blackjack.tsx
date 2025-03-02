import React, { useState, useEffect } from 'react';
import { RefreshCw, DollarSign, Wallet, PiggyBank } from 'lucide-react';
import { showNotification } from '../utils/animations';

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

  const LOAN_OFFERS: LoanOffer[] = [
    { amount: 500, interestRate: 0.1, dueInDays: 7 },
    { amount: 1000, interestRate: 0.15, dueInDays: 14 },
    { amount: 2000, interestRate: 0.2, dueInDays: 30 },
  ];

  // Initialize game
  useEffect(() => {
    initializeDeck();
  }, []);

  const initializeDeck = () => {
    const newDeck = createDeck();
    const playerInitialHand = [newDeck[0], newDeck[1]];
    const dealerInitialHand = [newDeck[2]];
    
    setDeck(newDeck.slice(3));
    setPlayerHand(playerInitialHand);
    setDealerHand(dealerInitialHand);
    setGameStatus('playing');
    setMessage('');
  };

  const drawCard = (): Card => {
    const card = deck[0];
    setDeck(deck.slice(1));
    return card;
  };

  const handleBet = (amount: number) => {
    if (amount > playerBalance) {
      setMessage("You don't have enough money for this bet!");
      return;
    }
    
    setCurrentBet(amount);
    setPlayerBalance(prev => prev - amount);
    startNewGame();
  };

  const handleCustomBet = () => {
    const amount = parseInt(customBetAmount);
    if (isNaN(amount) || amount <= 0) {
      setMessage('Please enter a valid bet amount!');
      return;
    }
    handleBet(amount);
  };

  const startNewGame = () => {
    const newPlayerHand = [drawCard(), drawCard()];
    const newDealerHand = [drawCard(), drawCard()];
    
    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setGameStatus('playing');
    setMessage('');
  };

  const handleHit = () => {
    const newHand = [...playerHand, drawCard()];
    setPlayerHand(newHand);
    
    const value = calculateHandValue(newHand);
    if (value > 21) {
      handleDealerTurn(newHand);
    }
  };

  const handleStand = () => {
    handleDealerTurn(playerHand);
  };

  const handleDoubleDown = () => {
    if (playerBalance < currentBet) {
      setMessage("You don't have enough money to double down!");
      return;
    }

    setPlayerBalance(prev => prev - currentBet);
    setCurrentBet(prev => prev * 2);
    
    const newHand = [...playerHand, drawCard()];
    setPlayerHand(newHand);
    handleDealerTurn(newHand);
  };

  const handleDealerTurn = (finalPlayerHand: Card[]) => {
    let currentDealerHand = [...dealerHand];
    const playerValue = calculateHandValue(finalPlayerHand);

    while (calculateHandValue(currentDealerHand) < 17 && playerValue <= 21) {
      currentDealerHand = [...currentDealerHand, drawCard()];
    }

    setDealerHand(currentDealerHand);
    determineWinner(finalPlayerHand, currentDealerHand);
  };

  const determineWinner = (finalPlayerHand: Card[], finalDealerHand: Card[]) => {
    const playerValue = calculateHandValue(finalPlayerHand);
    const dealerValue = calculateHandValue(finalDealerHand);

    let resultMessage = '';
    let winnings = 0;

    if (playerValue > 21) {
      resultMessage = 'Bust! You lose!';
    } else if (dealerValue > 21) {
      resultMessage = 'Dealer busts! You win!';
      winnings = currentBet * 2;
    } else if (playerValue > dealerValue) {
      resultMessage = 'You win!';
      winnings = currentBet * 2;
    } else if (playerValue < dealerValue) {
      resultMessage = 'Dealer wins!';
    } else {
      resultMessage = 'Push!';
      winnings = currentBet;
    }

    setPlayerBalance(prev => prev + winnings);
    setMessage(resultMessage);
    setGameStatus('finished');
  };

  const takeLoan = (offer: LoanOffer) => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + offer.dueInDays);
    
    setLoans(prev => [...prev, {
      amount: offer.amount,
      dueDate: dueDate,
      interest: offer.amount * offer.interestRate
    }]);
    
    setPlayerBalance(prev => prev + offer.amount);
    setShowLoanModal(false);
  };

  // Replace renderHand function with this improved version
  const renderHand = (hand: Card[], isDealer: boolean = false) => (
    <div className="flex gap-2 flex-wrap justify-center">
      {hand.map((card, index) => (
        <div
          key={index}
          className={`playing-card ${getSuitClass(card.suit)} ${index > 0 ? 'deal-animation' : ''}`}
          style={{ animationDelay: `${index * 0.2}s` }}
        >
          {isDealer && index === 1 && gameStatus === 'playing' ? (
            <div className="card-back"></div>
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
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex justify-between items-center">
        <div className="balance-display">
          <Wallet className="text-green-400" size={24} />
          <span>${playerBalance.toLocaleString()}</span>
        </div>
        
        {currentBet > 0 && (
          <div className="bet-display">
            <DollarSign className="text-yellow-400" size={24} />
            <span>Current Bet: ${currentBet}</span>
          </div>
        )}
        
        <button
          onClick={() => setShowLoanModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg hover:from-purple-700 hover:to-purple-900 transition-all transform hover:scale-105 shadow-lg"
        >
          <PiggyBank size={20} />
          Loan Options
        </button>
      </div>

      <div className="blackjack-table">
        {gameStatus === 'betting' ? (
          <div className="betting-controls py-10">
            <h2 className="text-3xl font-bold text-center text-white mb-8 drop-shadow-md">Place Your Bet</h2>
            
            <div className="flex justify-center gap-4 mb-8">
              {[10, 25, 50, 100].map(amount => (
                <button
                  key={amount}
                  onClick={() => handleBet(amount)}
                  className="chip-animation"
                  style={{ animationDelay: `${amount * 0.002}s` }}
                  disabled={amount > playerBalance}
                >
                  <div className={`chip chip-${amount} ${amount > playerBalance ? 'opacity-50' : ''}`}>
                    ${amount}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="flex justify-center gap-2 max-w-md mx-auto">
              <input
                type="number"
                value={customBetAmount}
                onChange={(e) => setCustomBetAmount(e.target.value)}
                placeholder="Custom bet"
                className="custom-bet-input"
                min="1"
                max={playerBalance}
              />
              <button
                onClick={handleCustomBet}
                className="bet-button"
                disabled={!customBetAmount || parseInt(customBetAmount) <= 0 || parseInt(customBetAmount) > playerBalance}
              >
                Place Bet
              </button>
            </div>
          </div>
        ) : (
          <div className="game-board">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-white drop-shadow-md">Dealer's Hand</h2>
              {renderHand(dealerHand, true)}
              {gameStatus === 'finished' && (
                <p className="mt-2 text-center text-white text-lg">
                  Value: {calculateHandValue(dealerHand)}
                </p>
              )}
            </div>
            
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 text-white drop-shadow-md">Your Hand</h2>
              {renderHand(playerHand)}
              <p className="mt-2 text-center text-white text-lg">
                Value: {calculateHandValue(playerHand)}
              </p>
            </div>

            {gameStatus === 'playing' && (
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleHit}
                  className="game-button button-hit"
                >
                  Hit
                </button>
                <button
                  onClick={handleStand}
                  className="game-button button-stand"
                >
                  Stand
                </button>
                {playerHand.length === 2 && (
                  <button
                    onClick={handleDoubleDown}
                    className="game-button button-double"
                    disabled={playerBalance < currentBet}
                  >
                    Double Down
                  </button>
                )}
              </div>
            )}

            {gameStatus === 'finished' && (
              <div className="mt-8 flex flex-col items-center">
                <div className={`result-message ${
                  message.includes('win') ? 'message-win' : 
                  message.includes('lose') || message.includes('Bust') ? 'message-lose' : 
                  'message-push'
                }`}>
                  {message}
                </div>
                
                <button
                  onClick={() => {
                    initializeDeck();
                    setGameStatus('betting');
                  }}
                  className="game-button button-new-game mt-6 flex items-center gap-2"
                >
                  <RefreshCw size={20} />
                  New Game
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {showLoanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="loan-modal">
            <h2 className="text-2xl font-bold mb-6 text-white border-b border-yellow-500 pb-4">Casino Loans</h2>
            <div className="space-y-4 mb-6">
              {LOAN_OFFERS.map((offer, index) => (
                <div
                  key={index}
                  className="loan-option"
                  onClick={() => takeLoan(offer)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="loan-amount">${offer.amount}</span>
                    <span className="loan-details">
                      {offer.interestRate * 100}% interest
                    </span>
                  </div>
                  <div className="loan-details">
                    Due in {offer.dueInDays} days
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowLoanModal(false)}
              className="w-full p-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blackjack;
