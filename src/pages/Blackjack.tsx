import React, { useState, useEffect } from 'react';
import { showNotification } from '../utils/animations';

// Types
type Card = {
  suit: '♠' | '♣' | '♥' | '♦';
  value: string;
  numericValue: number;
};

type GameStatus = 'idle' | 'playing' | 'playerBust' | 'dealerBust' | 'playerWin' | 'dealerWin' | 'push';

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
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [isDealerTurn, setIsDealerTurn] = useState(false);

  // Initialize game
  useEffect(() => {
    newGame();
  }, []);

  const newGame = () => {
    const newDeck = createDeck();
    const playerInitialHand = [newDeck[0], newDeck[1]];
    const dealerInitialHand = [newDeck[2]];
    
    setDeck(newDeck.slice(3));
    setPlayerHand(playerInitialHand);
    setDealerHand(dealerInitialHand);
    setGameStatus('playing');
    setIsDealerTurn(false);
  };

  const hit = () => {
    if (gameStatus !== 'playing' || isDealerTurn) return;

    const newCard = deck[0];
    const newHand = [...playerHand, newCard];
    const newValue = calculateHandValue(newHand);

    setDeck(deck.slice(1));
    setPlayerHand(newHand);

    if (newValue > 21) {
      setGameStatus('playerBust');
      showNotification('Bust! You went over 21!', 'error');
    }
  };

  const stand = () => {
    if (gameStatus !== 'playing') return;
    setIsDealerTurn(true);
  };

  // Dealer's turn
  useEffect(() => {
    if (!isDealerTurn) return;

    const dealerPlay = () => {
      let currentDealerHand = [...dealerHand];
      let currentDeck = [...deck];
      
      while (calculateHandValue(currentDealerHand) < 17) {
        const newCard = currentDeck[0];
        currentDealerHand.push(newCard);
        currentDeck = currentDeck.slice(1);
      }

      setDealerHand(currentDealerHand);
      setDeck(currentDeck);

      // Determine winner
      const dealerValue = calculateHandValue(currentDealerHand);
      const playerValue = calculateHandValue(playerHand);

      if (dealerValue > 21) {
        setGameStatus('dealerBust');
        showNotification('Dealer bust! You win!', 'success');
      } else if (dealerValue > playerValue) {
        setGameStatus('dealerWin');
        showNotification('Dealer wins!', 'error');
      } else if (dealerValue < playerValue) {
        setGameStatus('playerWin');
        showNotification('You win!', 'success');
      } else {
        setGameStatus('push');
        showNotification("It's a tie!", 'success');
      }
    };

    const timeoutId = setTimeout(dealerPlay, 1000);
    return () => clearTimeout(timeoutId);
  }, [isDealerTurn, dealerHand, deck, playerHand]);

  const renderCard = (card: Card) => {
    const isRed = card.suit === '♥' || card.suit === '♦';
    return (
      <div className={`card ${isRed ? 'text-red-600' : 'text-black'}`}>
        <div className="card-value">{card.value}</div>
        <div className="card-suit">{card.suit}</div>
      </div>
    );
  };

  return (
    <div className="game-container">
      <div className="blackjack-table">
        <div className="dealer-section">
          <h2>Dealer's Hand ({calculateHandValue(dealerHand)})</h2>
          <div className="hand dealer-hand">
            {dealerHand.map((card, index) => (
              <div key={index} className="card-wrapper">
                {renderCard(card)}
              </div>
            ))}
          </div>
        </div>

        <div className="player-section">
          <h2>Your Hand ({calculateHandValue(playerHand)})</h2>
          <div className="hand player-hand">
            {playerHand.map((card, index) => (
              <div key={index} className="card-wrapper">
                {renderCard(card)}
              </div>
            ))}
          </div>
        </div>

        <div className="controls">
          <button
            onClick={hit}
            disabled={gameStatus !== 'playing' || isDealerTurn}
            className="game-button"
          >
            Hit
          </button>
          <button
            onClick={stand}
            disabled={gameStatus !== 'playing' || isDealerTurn}
            className="game-button"
          >
            Stand
          </button>
          <button
            onClick={newGame}
            disabled={gameStatus === 'playing'}
            className="game-button"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
};

export default Blackjack;
