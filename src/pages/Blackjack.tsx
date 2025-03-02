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

  const renderHand = (hand: Card[], isDealer: boolean = false) => (
    <div className="flex gap-2">
      {hand.map((card, index) => (
        <div
          key={index}
          className={`card ${card.suit === '♥' || card.suit === '♦' ? 'text-red-500' : 'text-black'} 
            bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md`}
        >
          {isDealer && index === 1 && gameStatus === 'playing' ? 
            '🂠' : 
            `${card.value}${card.suit}`}
        </div>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Wallet className="text-green-500" />
          <span className="text-lg font-bold">Balance: ${playerBalance}</span>
        </div>
        <button
          onClick={() => setShowLoanModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
        >
          <PiggyBank size={20} />
          Take Loan
        </button>
      </div>

      {gameStatus === 'betting' && (
        <div className="betting-controls mb-4">
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => handleBet(10)}
              className="bet-button"
            >
              Bet $10
            </button>
            <button
              onClick={() => handleBet(25)}
              className="bet-button"
            >
              Bet $25
            </button>
            <button
              onClick={() => handleBet(50)}
              className="bet-button"
            >
              Bet $50
            </button>
            <button
              onClick={() => handleBet(100)}
              className="bet-button"
            >
              Bet $100
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={customBetAmount}
              onChange={(e) => setCustomBetAmount(e.target.value)}
              placeholder="Enter custom bet"
              className="p-2 border rounded"
            />
            <button
              onClick={handleCustomBet}
              className="bet-button"
            >
              Place Bet
            </button>
          </div>
        </div>
      )}

      {gameStatus !== 'betting' && (
        <div className="game-board">
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-2">Dealer's Hand</h2>
            {renderHand(dealerHand, true)}
          </div>
          
          <div className="mb-4">
            <h2 className="text-lg font-bold mb-2">Your Hand</h2>
            {renderHand(playerHand)}
            <p className="mt-2">Value: {calculateHandValue(playerHand)}</p>
          </div>

          {gameStatus === 'playing' && (
            <div className="flex gap-2">
              <button
                onClick={handleHit}
                className="game-button"
              >
                Hit
              </button>
              <button
                onClick={handleStand}
                className="game-button"
              >
                Stand
              </button>
              {playerHand.length === 2 && (
                <button
                  onClick={handleDoubleDown}
                  className="game-button"
                  disabled={playerBalance < currentBet}
                >
                  Double Down
                </button>
              )}
            </div>
          )}

          {gameStatus === 'finished' && (
            <div className="mt-4">
              <p className="text-lg font-bold mb-2">{message}</p>
              <button
                onClick={() => {
                  initializeDeck();
                  setGameStatus('betting');
                }}
                className="game-button flex items-center gap-2"
              >
                <RefreshCw size={20} />
                New Game
              </button>
            </div>
          )}
        </div>
      )}

      {showLoanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Available Loans</h2>
            <div className="space-y-4">
              {LOAN_OFFERS.map((offer, index) => (
                <div
                  key={index}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => takeLoan(offer)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">${offer.amount}</span>
                    <span className="text-sm text-gray-500">
                      {offer.interestRate * 100}% interest
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Due in {offer.dueInDays} days
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowLoanModal(false)}
              className="mt-4 w-full p-2 bg-gray-200 dark:bg-gray-600 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded">
          {message}
        </div>
      )}
    </div>
  );
};

export default Blackjack;
