import { useEffect, useRef } from 'react';
import Browser from 'webextension-polyfill';
import { detectGameState } from '../content/gameState';
import { GameState } from '../content/types';

export const useGameStateObserver = (): {
  handleStateChange: () => void;
  currentState: GameState;
} => {
  const stateRef = useRef<GameState>(detectGameState());
  const observerRef = useRef<MutationObserver | null>(null);

  const handleStateChange = () => {
    const newState = detectGameState();
    
    if (newState.type !== stateRef.current.type) {
      stateRef.current = newState;
      Browser.runtime.sendMessage({
          action: "updateGameState",
          newState,
        });
    }
  };

  useEffect(() => {
    const initialState = detectGameState();
    stateRef.current = initialState;
    Browser.runtime.sendMessage({
      action: "updateGameState",
      initialState,
    });

    observerRef.current = new MutationObserver(() => {
      handleStateChange();
    });

    const targetNode = document.body;
    const config = { childList: true, subtree: true };
    // TODO: Review this to avoid performance issues
    observerRef.current.observe(targetNode, config);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
    };
  }, []);

  return {
    handleStateChange,
    currentState: stateRef.current
  };
};