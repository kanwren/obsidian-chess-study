import { Chess, PieceSymbol, Color, QUEEN, SQUARES, Square } from 'chess.js';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';

export function toColor(chess: Chess) {
	return chess.turn() === 'w' ? 'white' : 'black';
}

export function toDests(chess: Chess): Map<Square, Square[]> {
	const dests = new Map();
	SQUARES.forEach((s) => {
		const ms = chess.moves({ square: s, verbose: true });
		if (ms.length)
			dests.set(
				s,
				ms.map((m) => m.to)
			);
	});
	return dests;
}


export const PromotionPieces = ['q', 'r', 'b', 'n'] as const;
export type PromotionPiece = Extract<PieceSymbol, (typeof PromotionPieces)[keyof typeof PromotionPieces]>;

export function isPromotionMove(
	chess: Chess,
	orig: string,
	dest: string
): false | { color: Color } {
	const piece = chess.get(orig as Square);
	if (!piece || piece.type !== 'p') {
		return false
	};
	const lastRank = dest[1];
	const reachedLastRank =
		(piece.color === 'w' && lastRank === '8') ||
		(piece.color === 'b' && lastRank === '1');
	if (!reachedLastRank) {
		return false
	};
	return { color: piece.color };
}

export function playOtherSide(cg: Api, chess: Chess) {
	return (orig: string, dest: string, promotion: PromotionPiece = QUEEN) => {
		const move = chess.move({ from: orig, to: dest, promotion });

		const commonTurnProperties: Partial<Config> = {
			turnColor: toColor(chess),
			movable: {
				color: toColor(chess),
				dests: toDests(chess),
			},
			check: chess.isCheck(),
		};

		if (move.flags === 'e' || move.promotion) {
			//Handle En Passant && Promote to Queen by default
			cg.set({
				fen: chess.fen(),
				...commonTurnProperties,
			});
		} else {
			cg.set(commonTurnProperties);
		}

		return move;
	};
}
