import * as React from 'react';
import { Color } from 'chess.js';
import { PromotionPiece, PromotionPieces } from 'src/lib/chess-logic';

interface Props {
	color: Color;
	onSelect: (piece: PromotionPiece) => void;
	onCancel: () => void;
}

const PIECE_GLYPHS: Record<
	PromotionPiece,
	{ w: string; b: string; name: string }
> = {
	q: { w: '♕', b: '♛', name: 'Queen' },
	r: { w: '♖', b: '♜', name: 'Rook' },
	b: { w: '♗', b: '♝', name: 'Bishop' },
	n: { w: '♘', b: '♞', name: 'Knight' },
};

/**
 * Centered overlay shown on top of the board while a pawn promotion
 * is pending. Replaces the previous auto-promote-to-queen behavior so
 * touch users can pick any piece without a right-click menu.
 */
export const PromotionPicker = ({ color, onSelect, onCancel }: Props) => {
	return (
		<div
			className="promotion-picker-backdrop"
			onClick={onCancel}
			role="dialog"
			aria-label="Choose promotion piece"
		>
			<div className="promotion-picker" onClick={(e) => e.stopPropagation()}>
				<div className="promotion-picker-label">Promote to</div>
				<div className="promotion-picker-options">
					{PromotionPieces.map((p) => (
						<button
							key={p}
							type="button"
							className="promotion-picker-option"
							aria-label={`Promote to ${PIECE_GLYPHS[p].name}`}
							onClick={() => onSelect(p)}
						>
							<span className="promotion-picker-piece">{PIECE_GLYPHS[p][color]}</span>
						</button>
					))}
				</div>
			</div>
		</div>
	);
};
