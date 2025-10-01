import React, { useState, useEffect } from "react";
import "../index.css";

const getPieceImage = (piece) => {
  const pieceMap = {
    "♔": "whiteking.png",
    "♕": "whitequeen.png",
    "♖": "whiterook.png",
    "♗": "whitebishop.png",
    "♘": "whiteknight.png",
    "♙": "whitepawn.png",
    "♚": "blackking.png",
    "♛": "blackqueen.png",
    "♜": "blackrook.png",
    "♝": "blackbishop.png",
    "♞": "blackknight.png",
    "♟": "blackpawn.png",
  };

  return pieceMap[piece] ? `/images/${pieceMap[piece]}` : null;
};

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
  return isWhite ? isBlackPiece(target) : isWhitePiece(target);
};


const findKing = (board, king) => {
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      if (board[i][j] === king) return [i, j];
    }
  }
  return [-1, -1];
};


const isKingInCheck = (board, isWhite) => {
  const king = isWhite ? "♔" : "♚";
  const [kingRow, kingCol] = findKing(board, king);

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece && isOpponentPiece(piece, isWhite)) {
        if (isValidMove(piece, i, j, kingRow, kingCol, !isWhite, board)) return true;
      }
    }
  }
  return false;
};




const isCheckmate = (board, isWhite) => {
  if (!isKingInCheck(board, isWhite)) return false;

  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      const piece = board[i][j];
      if (piece && ((isWhite && isWhitePiece(piece)) || (!isWhite && isBlackPiece(piece)))) {
        for (let x = 0; x < 8; x++) {
          for (let y = 0; y < 8; y++) {
            if (isValidMove(piece, i, j, x, y, isWhite, board)) {
              const simulatedBoard = board.map(row => [...row]);
              simulatedBoard[x][y] = piece;
              simulatedBoard[i][j] = null;
              if (!isKingInCheck(simulatedBoard, isWhite)) return false;
            }
          }
        }
      }
    }
  }
  return true;
};


const isValidMove = (piece, startRow, startCol, endRow, endCol, isWhite, board) => {
  const targetPiece = board[endRow][endCol];
  if ((isWhite && isWhitePiece(targetPiece)) || (!isWhite && isBlackPiece(targetPiece))) return false;

  const dr = endRow - startRow;
  const dc = endCol - startCol;

  switch (piece) {
    case "♙": case "♟": {
      const dir = isWhite ? -1 : 1;
      
      // Normal move
      if (dc === 0 && dr === dir && !targetPiece) return true;

      // Initial double move
      if (dc === 0 && dr === 2 * dir && startRow === (isWhite ? 6 : 1) && !targetPiece) {
        const intermediateRow = startRow + dir;
        if (!board[intermediateRow][startCol] && !board[endRow][endCol]) return true;
      }

      // Diagonal capture
      if (Math.abs(dc) === 1 && dr === dir && isOpponentPiece(targetPiece, isWhite)) return true;
      return false;
    }

    case "♖": case "♜": {
      if (dr === 0) return boardPathClear(board, startRow, startCol, endRow, endCol, "horizontal");
      if (dc === 0) return boardPathClear(board, startRow, startCol, endRow, endCol, "vertical");
      return false;
    }

    case "♘": case "♞": return (Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2);
    case "♗": case "♝": return Math.abs(dr) === Math.abs(dc) && boardPathClear(board, startRow, startCol, endRow, endCol, "diagonal");
    
    case "♔": case "♚": {
      if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) {
        const simulatedBoard = JSON.parse(JSON.stringify(board));
        simulatedBoard[endRow][endCol] = piece;
        simulatedBoard[startRow][startCol] = null;
    
        // Prevent the king from moving into check
        if (!isKingInCheck(simulatedBoard, isWhite)) {
          return true;
        }
      }
      return false; // ✔️ king case ends here
    }
      default:
      return false;
    }
  };


const boardPathClear = (board, startRow, startCol, endRow, endCol, type) => {
  const rowStep = endRow > startRow ? 1 : endRow < startRow ? -1 : 0;
  const colStep = endCol > startCol ? 1 : endCol < startCol ? -1 : 0;

  let r = startRow + rowStep;
  let c = startCol + colStep;
  while (r !== endRow || c !== endCol) {
    if (board[r][c]) return false;
    r += rowStep;
    c += colStep;
  }
  return true;
};


let globalBoard = initialBoard();

const ChessBoard = () => {
  const [board, setBoard] = useState(initialBoard());
  const [selected, setSelected] = useState(null);
  const [turn, setTurn] = useState("white");
  const [lastMoved, setLastMoved] = useState("white"); // 👈 Add this here
  const [capturedWhite, setCapturedWhite] = useState([]);
  const [capturedBlack, setCapturedBlack] = useState([]);
  const [gameMode, setGameMode] = useState("2P");
  const [gameStatus, setGameStatus] = useState(null);
  const [validMoves, setValidMoves] = useState([]);


  useEffect(() => { globalBoard = board; }, [board]);

  const handleSquareClick = (row, col) => {
    const piece = board[row][col];
    const isWhite = turn === "white";
    console.log(`Clicked piece: ${piece}, Turn: ${turn}`);
    
    // If the game is over (checkmate or check), return early
    if (!selected) {
      if (piece && ((turn === "white" && isWhitePiece(piece)) || (turn === "black" && isBlackPiece(piece)))) {
        setSelected({ row, col });
    
        const moves = [];
        for (let x = 0; x < 8; x++) {
          for (let y = 0; y < 8; y++) {
            if (isValidMove(piece, row, col, x, y, isWhite, board)) {
              // Simulate move to check if it leaves the king in check
              const simulatedBoard = board.map(r => [...r]);
              simulatedBoard[x][y] = piece;
              simulatedBoard[row][col] = null;
              if (!isKingInCheck(simulatedBoard, isWhite)) {
                moves.push([x, y]);
              }
            }
          }
        }
    
        setValidMoves(moves);
      }
      return;
    }
    
    
    // Handle unselecting the piece if it's the same square
    if (selected.row === row && selected.col === col) {
      return setSelected(null);
    }
    
    const clickedPiece = board[selected.row][selected.col];
    const targetPiece = board[row][col];
    
    if (isValidMove(clickedPiece, selected.row, selected.col, row, col, isWhite, board)) {
      const newBoard = board.map(r => [...r]); // Deep clone the board to avoid mutation
    
      // Perform the move
      newBoard[row][col] = clickedPiece;
      newBoard[selected.row][selected.col] = null;
    
      // Handle pawn promotion if applicable
      console.log(`Checking pawn promotion for piece: ${clickedPiece} at row ${row}, col ${col}`);
      handlePawnPromotion(row, col, clickedPiece, isWhite, newBoard);
    
      // Check if the move results in check or checkmate
      if (!isKingInCheck(newBoard, isWhite)) {
        // Update captured pieces
        if (targetPiece) {
          isWhite ? setCapturedBlack(prev => [...prev, targetPiece]) : setCapturedWhite(prev => [...prev, targetPiece]);
        }
    
        const opponentIsWhite = !isWhite;
        const inCheck = isKingInCheck(newBoard, opponentIsWhite);
        const checkmate = isCheckmate(newBoard, opponentIsWhite);
    
        setGameStatus(checkmate ? "checkmate" : inCheck ? "check" : null);
        setBoard(newBoard);  // Update the board state
        setSelected(null);
        setValidMoves([]);
        setLastMoved(turn);
        setTurn(turn === "white" ? "black" : "white");
      } else {
        setSelected(null);
      }
    }
  };

  
  const handlePawnPromotion = (row, col, piece, isWhite, newBoard) => {
    // Check if it's a pawn and if it has reached the promotion row (0 for white, 7 for black)
    if ((isWhite && piece === "♙" && row === 0) || (!isWhite && piece === "♟" && row === 7)) {
      // Prompt the user for the piece to promote the pawn to
      const promotedPiece = prompt("Promote pawn to (Q, R, B, N):");
      const validPieces = ["Q", "R", "B", "N"];
  
      // Validate the selected piece
      if (promotedPiece && validPieces.includes(promotedPiece.toUpperCase())) {
        // Set the promoted piece at the pawn's position
        newBoard[row][col] = isWhite
          ? (promotedPiece.toUpperCase() === "Q" ? "♕" :
             promotedPiece.toUpperCase() === "R" ? "♖" :
             promotedPiece.toUpperCase() === "B" ? "♗" : "♘")
          : (promotedPiece.toUpperCase() === "Q" ? "♛" :
             promotedPiece.toUpperCase() === "R" ? "♜" :
             promotedPiece.toUpperCase() === "B" ? "♝" : "♞");
  
        console.log("Board after promotion:", newBoard);
  
        // Update the board state with the new promoted piece
        setBoard(newBoard);
      } else {
        alert("Invalid piece selected! Choose Q, R, B, or K.");
      }
    }
  };


  useEffect(() => {

    if (gameMode === "vsComputer" && turn === "black" && gameStatus !== "checkmate") {
      const timer = setTimeout(() => makeComputerMove(), 500);
      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, gameStatus]);



  const makeComputerMove = () => {
    const isWhite = false;
    const moves = [];



    // Generate all valid moves for black pieces

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece && isBlackPiece(piece)) {
          for (let x = 0; x < 8; x++) {
            for (let y = 0; y < 8; y++) {
              if (isValidMove(piece, i, j, x, y, isWhite, board)) {

                // Simulate the move

                const simulatedBoard = JSON.parse(JSON.stringify(board));
                simulatedBoard[x][y] = piece;
                simulatedBoard[i][j] = null;



                // Check if black king is safe after the move

                if (!isKingInCheck(simulatedBoard, false)) {
                  moves.push({ from: { row: i, col: j }, to: { row: x, col: y } });
                }
              }
            }
          }
        }
      }
    }


    if (moves.length === 0) return;


    const move = moves[Math.floor(Math.random() * moves.length)];
    const newBoard = board.map(r => [...r]);
    const movingPiece = board[move.from.row][move.from.col];
    const target = board[move.to.row][move.to.col];
    if (target) setCapturedWhite(prev => [...prev, target]);
    newBoard[move.to.row][move.to.col] = movingPiece;
    newBoard[move.from.row][move.from.col] = null;

    setBoard(newBoard);


    if (gameMode === "vsComputer") {
      const opponentIsWhite = false;
      const inCheck = isKingInCheck(newBoard, opponentIsWhite);
      const checkmate = isCheckmate(newBoard, opponentIsWhite);
      setGameStatus(checkmate ? "checkmate" : inCheck ? "check" : null);
    }



    const inCheck = isKingInCheck(newBoard, true);
    setGameStatus(inCheck ? (isCheckmate(newBoard, true) ? "checkmate" : "check") : null);
    setTurn("white");
    setLastMoved("black");
  };


  const resetGame = () => {
    const fresh = initialBoard();
    setBoard(fresh);
    globalBoard = fresh;
    setCapturedWhite([]);
    setCapturedBlack([]);
    setTurn("white");
    setSelected(null);
    setGameStatus(null);
  };



  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-900 text-white p-6">
      {/* Captured Black Pieces - Top */}
      <div className="captured-pieces flex flex-row justify-start space-x-2 mb-4 w-full max-w-5xl px-4">
        {capturedBlack.map((p, idx) => (
          <div key={idx} className="captured-piece">
            <img
              src={getPieceImage(p)}
              alt={p}
              className="captured-piece-image"
            />
          </div>
        ))}
      </div>
  
      {/* Game Layout: Chessboard + Sidebar */}
      <div className="game-layout flex gap-10 items-start">
        {/* Chessboard */}
        <div className="chessboard">
          {board.map((row, i) =>
            row.map((piece, j) => {
              const isLight = (i + j) % 2 === 0;
              const isSelected = selected && selected.row === i && selected.col === j;
              const isValidMoveSquare = validMoves.some(
                ([r, c]) => r === i && c === j
              );
  
              return (
                <div
                  key={`${i}-${j}`}
                  className={`square ${isLight ? "light" : "dark"} ${
                    isSelected ? "selected" : ""
                  } ${isValidMoveSquare ? "highlight" : ""}`}
                  onClick={() => handleSquareClick(i, j)}
                >
                  {piece && (
                    <img
                      src={getPieceImage(piece)}
                      alt={piece}
                      className="piece-image"
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
  
        {/* Sidebar Controls */}
        <div className="sidebar flex flex-col items-start space-y-4 bg-green-800 p-6 rounded-xl shadow-lg">
        <div className="game-mode-container">
          <div>
          <label className="game-mode-label">Game Mode:</label>
            <select
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              className="game-mode-dropdown"
            >
              <option value="2P">2 Players</option>
              <option value="vsComputer">Play vs Computer</option>
            </select>
          </div>
          </div>
  
          <div className="turn-indicator">
            Turn: {turn}
          </div>
  
          <button
              onClick={resetGame}
              className="reset-button"
            >
              Reset Game
            </button>

  
          {gameStatus === "checkmate" && (
              <div className="banner banner-checkmate">
                ♟️ Checkmate! {lastMoved === "white" ? "White" : "Black"} wins!
              </div>
            )}

            {gameStatus === "check" && (
              <div className="banner banner-check">
                ⚠️ {turn === "white" ? "White" : "Black"} is in check!
              </div>
            )}

        </div>
      </div>
  
      {/* Captured White Pieces - Bottom */}
      <div className="captured-pieces flex flex-row justify-end space-x-2 mt-4 w-full max-w-5xl px-4">
        {capturedWhite.map((p, idx) => (
          <div key={idx} className="captured-piece">
            <img
              src={getPieceImage(p)}
              alt={p}
              className="captured-piece-image"
            />
          </div>
        ))}
      </div>
    </div>
  );
  
  
};

export default ChessBoard;