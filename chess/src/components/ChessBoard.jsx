import React, { useState } from "react";
import '../index.css';

const initialBoard = () => {
  const emptyRow = Array(8).fill(null);
  const board = Array(8).fill(null).map(() => [...emptyRow]);

  const blackPieces = ["♜", "♞", "♝", "♛", "♚", "♝", "♞", "♜"];
  const whitePieces = ["♖", "♘", "♗", "♕", "♔", "♗", "♘", "♖"];

  board[0] = blackPieces;
  board[1] = Array(8).fill("♟");
  board[6] = Array(8).fill("♙");
  board[7] = whitePieces;

  return board;
};

const whitePieces = ["♙", "♖", "♘", "♗", "♕", "♔"];
const blackPieces = ["♟", "♜", "♞", "♝", "♛", "♚"];

const isWhitePiece = (p) => whitePieces.includes(p);
const isBlackPiece = (p) => blackPieces.includes(p);

const isOpponentPiece = (target, isWhite) => {
  if (!target) return false;
  return isWhite ? blackPieces.includes(target) : whitePieces.includes(target);
};

const ChessBoard = () => {
  const [board, setBoard] = useState(initialBoard());
  const [selected, setSelected] = useState(null);
  const [turn, setTurn] = useState("white");
  const [capturedWhite, setCapturedWhite] = useState([]);
  const [capturedBlack, setCapturedBlack] = useState([]);

  // HANDLESQUARECLICK

  const handleSquareClick = (row, col) => {
    const clickedPiece = board[row][col];

    if (!selected) {
      if (clickedPiece) {
        const isWhite = isWhitePiece(clickedPiece);
        if ((turn === "white" && isWhite) || (turn === "black" && !isWhite)) {
          setSelected({ row, col });
        }
      }
      return;
    }

    if (selected.row === row && selected.col === col) {
      setSelected(null);
      return;
    }

    const newBoard = board.map((r) => [...r]);
    const piece = board[selected.row][selected.col];
    const isWhite = isWhitePiece(piece);
    const targetPiece = newBoard[row][col];
    

    // Pawn
    if (piece === "♙" || piece === "♟") {
      const direction = isWhite ? -1 : 1;
      const startingRow = isWhite ? 6 : 1;

      const moveForwardOne = row === selected.row + direction && selected.col === col && !targetPiece;
      const moveForwardTwo = row === selected.row + 2 * direction && selected.row === startingRow && selected.col === col && !newBoard[selected.row + direction][col] && !targetPiece;
      const isCapture = Math.abs(col - selected.col) === 1 && row === selected.row + direction && isOpponentPiece(targetPiece, isWhite);

      const valid = moveForwardOne || moveForwardTwo || isCapture;

      if (valid) {
        const isPromotionRow = (isWhite && row === 0) || (!isWhite && row === 7);
        newBoard[row][col] = isPromotionRow ? (isWhite ? "♕" : "♛") : piece;
        newBoard[selected.row][selected.col] = null;

        if (targetPiece) {
          if (isWhite) {
            setCapturedBlack((prev) => [...prev, targetPiece]);
          } else {
            setCapturedWhite((prev) => [...prev, targetPiece]);
          }
        }

        setBoard(newBoard);
        setSelected(null);
        setTurn((prev) => (prev === "white" ? "black" : "white"));
        return;
      }
    }

    // Rook
    if (piece === "♖" || piece === "♜") {
      const isStraight = selected.row === row || selected.col === col;
      if (isStraight) {
        let clear = true;
        if (selected.row === row) {
          const step = selected.col < col ? 1 : -1;
          for (let c = selected.col + step; c !== col; c += step) {
            if (newBoard[row][c]) clear = false;
          }
        } else {
          const step = selected.row < row ? 1 : -1;
          for (let r = selected.row + step; r !== row; r += step) {
            if (newBoard[r][col]) clear = false;
          }
        }
        if (clear && (!targetPiece || isOpponentPiece(targetPiece, isWhite))) {
          if (targetPiece) {
            if (isWhite) {
              setCapturedBlack((prev) => [...prev, targetPiece]);
            } else {
              setCapturedWhite((prev) => [...prev, targetPiece]);
            }
          }

          newBoard[row][col] = piece;
          newBoard[selected.row][selected.col] = null;
          setBoard(newBoard);
          setSelected(null);
          setTurn((prev) => (prev === "white" ? "black" : "white"));
          return;
        }
      }
    }

    // Knight
    if (piece === "♘" || piece === "♞") {
      const dr = Math.abs(row - selected.row);
      const dc = Math.abs(col - selected.col);
      const valid = (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
      if (valid && (!targetPiece || isOpponentPiece(targetPiece, isWhite))) {
        if (targetPiece) {
          if (isWhite) {
            setCapturedBlack((prev) => [...prev, targetPiece]);
          } else {
            setCapturedWhite((prev) => [...prev, targetPiece]);
          }
        }

        newBoard[row][col] = piece;
        newBoard[selected.row][selected.col] = null;
        setBoard(newBoard);
        setSelected(null);
        setTurn((prev) => (prev === "white" ? "black" : "white"));
        return;
      }
    }

    // Bishop
    if (piece === "♗" || piece === "♝") {
      const dr = row - selected.row;
      const dc = col - selected.col;
      if (Math.abs(dr) === Math.abs(dc)) {
        const rowStep = dr > 0 ? 1 : -1;
        const colStep = dc > 0 ? 1 : -1;
        let r = selected.row + rowStep;
        let c = selected.col + colStep;
        let clear = true;

        while (r !== row && c !== col) {
          if (newBoard[r][c]) clear = false;
          r += rowStep;
          c += colStep;
        }

        if (clear && (!targetPiece || isOpponentPiece(targetPiece, isWhite))) {
          if (targetPiece) {
            if (isWhite) {
              setCapturedBlack((prev) => [...prev, targetPiece]);
            } else {
              setCapturedWhite((prev) => [...prev, targetPiece]);
            }
          }

          newBoard[row][col] = piece;
          newBoard[selected.row][selected.col] = null;
          setBoard(newBoard);
          setSelected(null);
          setTurn((prev) => (prev === "white" ? "black" : "white"));
          return;
        }
      }
    }

    // Queen
    if (piece === "♕" || piece === "♛") {
      const dr = row - selected.row;
      const dc = col - selected.col;
      const isStraight = row === selected.row || col === selected.col;
      const isDiagonal = Math.abs(dr) === Math.abs(dc);

      let clear = true;

      if (isStraight) {
        if (row === selected.row) {
          const step = selected.col < col ? 1 : -1;
          for (let c = selected.col + step; c !== col; c += step) {
            if (newBoard[row][c]) clear = false;
          }
        } else {
          const step = selected.row < row ? 1 : -1;
          for (let r = selected.row + step; r !== row; r += step) {
            if (newBoard[r][col]) clear = false;
          }
        }
      } else if (isDiagonal) {
        const rowStep = dr > 0 ? 1 : -1;
        const colStep = dc > 0 ? 1 : -1;
        let r = selected.row + rowStep;
        let c = selected.col + colStep;
        while (r !== row && c !== col) {
          if (newBoard[r][c]) clear = false;
          r += rowStep;
          c += colStep;
        }
      } else {
        clear = false;
      }

      if (clear && (!targetPiece || isOpponentPiece(targetPiece, isWhite))) {
        if (targetPiece) {
          if (isWhite) {
            setCapturedBlack((prev) => [...prev, targetPiece]);
          } else {
            setCapturedWhite((prev) => [...prev, targetPiece]);
          }
        }

        newBoard[row][col] = piece;
        newBoard[selected.row][selected.col] = null;
        setBoard(newBoard);
        setSelected(null);
        setTurn((prev) => (prev === "white" ? "black" : "white"));
        return;
      }
    }

    // King
    if (piece === "♔" || piece === "♚") {
      const dr = Math.abs(row - selected.row);
      const dc = Math.abs(col - selected.col);
      if (dr <= 1 && dc <= 1 && (!targetPiece || isOpponentPiece(targetPiece, isWhite))) {
        if (targetPiece) {
          if (isWhite) {
            setCapturedBlack((prev) => [...prev, targetPiece]);
          } else {
            setCapturedWhite((prev) => [...prev, targetPiece]);
          }
        }

        newBoard[row][col] = piece;
        newBoard[selected.row][selected.col] = null;
        setBoard(newBoard);
        setSelected(null);
        setTurn((prev) => (prev === "white" ? "black" : "white"));
        return;
      }
    }

    // No valid move
    setSelected(null);
  };

  // Reset game function
  const resetGame = () => {
    setBoard(initialBoard());
    setCapturedWhite([]);
    setCapturedBlack([]);
    setTurn("white");
    setSelected(null);
  };

  // CHECKMATE LOGIC 

  const isKingInCheck = (board, isWhite) => {
    const king = isWhite ? "♔" : "♚";
    let kingPosition = null;
  
    // Find the king's position
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j] === king) {
          kingPosition = { row: i, col: j };
          break;
        }
      }
      if (kingPosition) break;
    }
  
    // Check if any opponent pieces can attack the king
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece && isOpponentPiece(piece, isWhite)) {
          if (isValidMove(board, piece, i, j, kingPosition.row, kingPosition.col, isWhite)) {
            return true; // The King is in check
          }
        }
      }
    }
  
    return false;
  };

  const isCheckmate = (board, isWhite) => {
    // Check if the king is in check
    if (!isKingInCheck(board, isWhite)) return false;
  
    // Try all possible moves for the current player
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if ((isWhite && whitePieces.includes(piece)) || (!isWhite && blackPieces.includes(piece))) {
          // Simulate all moves for each piece
          for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
              if (isValidMove(board, piece, i, j, x, y, isWhite)) {
                const newBoard = board.map(row => row.slice());
                newBoard[x][y] = piece;
                newBoard[i][j] = null;
  
                // Check if this move resolves the check
                if (!isKingInCheck(newBoard, isWhite)) {
                  return false; // There's a valid move that escapes the check
                }
              }
            }
          }
        }
      }
    }
  
    return true; // No valid moves to escape check
  };
  

  


  return (
    <div className="flex flex-row items-start space-x-8">
      {/* Captured by Black (White pieces taken) */}
      <div className="flex flex-col items-center">
        <div className="text-sm font-semibold mb-2">Black Captures</div>
        <div className="captured-pieces">
          {capturedBlack.map((p, idx) => (
            <div key={idx}>{p}</div>
          ))}
        </div>
      </div>

      {/* Board */}
      <div className="flex flex-col items-center space-y-4">
        <div className="turn-indicator">Turn: {turn}</div>
        <div className="chessboard">
          {board.map((row, i) =>
            row.map((piece, j) => {
              const isLight = (i + j) % 2 === 0;
              const isSelected = selected && selected.row === i && selected.col === j;

              return (
                <div
                  key={`${i}-${j}`}
                  className={`square ${isLight ? "light" : "dark"} ${isSelected ? "selected" : ""}`}
                  onClick={() => handleSquareClick(i, j)}
                >
                  {piece}
                </div>
              );
            })
          )}
        </div>
        {/* Reset button */}
        <button onClick={resetGame} className="mt-4 p-2 bg-blue-500 text-white rounded">
          Reset Game
        </button>
      </div>

      {/* Captured by White (Black pieces taken) */}
      <div className="flex flex-col items-center">
        <div className="text-sm font-semibold mb-2">White Captures</div>
        <div className="captured-pieces">
          {capturedWhite.map((p, idx) => (
            <div key={idx}>{p}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChessBoard;
