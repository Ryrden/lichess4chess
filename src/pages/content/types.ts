import { getMessage } from "@src/utils/i18n";

export enum GameStateType {
  NOT_CHESS_SITE = 'NOT_CHESS_SITE',
  NO_GAME_DETECTED = 'NO_GAME_DETECTED',
  GAME_IN_PROGRESS = 'GAME_IN_PROGRESS',
  GAME_FINISHED = 'GAME_FINISHED'
}

export interface GameState {
  type: GameStateType;
  message: string;
  buttonState: {
    enabled: boolean;
    color: 'green' | 'yellow' | 'gray';
  };
}

export const GAME_STATE: Record<GameStateType, GameState> = {
  [GameStateType.NOT_CHESS_SITE]: {
    type: GameStateType.NOT_CHESS_SITE,
    message: "notChessSite",
    buttonState: {
      enabled: false,
      color: 'gray'
    }
  },
  [GameStateType.NO_GAME_DETECTED]: {
    type: GameStateType.NO_GAME_DETECTED,
    message: "noGameDetected",
    buttonState: {
      enabled: false,
      color: 'gray'
    }
  },
  [GameStateType.GAME_IN_PROGRESS]: {
    type: GameStateType.GAME_IN_PROGRESS,
    message: "gameInProgress",
    buttonState: {
      enabled: false,
      color: 'yellow'
    }
  },
  [GameStateType.GAME_FINISHED]: {  
    type: GameStateType.GAME_FINISHED,
    message: "gameDetected",
    buttonState: {
      enabled: true,
      color: 'green'
    }
  }
};