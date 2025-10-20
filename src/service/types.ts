export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  details?: string;
  retryable: boolean;
}

export enum ApiErrorCode {
  NETWORK_ERROR = 'NETWORK_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  SERVER_ERROR = 'SERVER_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INVALID_DATA = 'INVALID_DATA',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN'
}

export interface ChessComGame {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  accuracies?: {
    white: number;
    black: number;
  };
  tcn?: string;
  uuid?: string;
  initial_setup?: string;
  fen?: string;
  white: {
    rating: number;
    result: string;
    username: string;
  };
  black: {
    rating: number;
    result: string;
    username: string;
  };
}

export enum PageType {
  CHESS_COM_GAME = 'CHESS_COM_GAME',
  LICHESS_GAME = 'LICHESS_GAME',
  LICHESS_ANALYZE = 'LICHESS_ANALYZE',
  LICHESS_REVIEW = 'LICHESS_REVIEW',
  OTHER = 'OTHER'
}

