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
    message: "Acesse Chess.com para analisar suas partidas",
    buttonState: {
      enabled: false,
      color: 'gray'
    }
  },
  [GameStateType.NO_GAME_DETECTED]: {
    type: GameStateType.NO_GAME_DETECTED,
    message: "Inicie e conclua uma partida para poder analisá-la",
    buttonState: {
      enabled: false,
      color: 'gray'
    }
  },
  [GameStateType.GAME_IN_PROGRESS]: {
    type: GameStateType.GAME_IN_PROGRESS,
    message: "Aguarde o término da partida para análise",
    buttonState: {
      enabled: false,
      color: 'yellow'
    }
  },
  [GameStateType.GAME_FINISHED]: {
    type: GameStateType.GAME_FINISHED,
    message: "Partida concluída! Clique para analisar no Lichess",
    buttonState: {
      enabled: true,
      color: 'green'
    }
  }
};