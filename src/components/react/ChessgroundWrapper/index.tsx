import { Chess, Move } from 'chess.js';
import { Chessground as ChessgroundApi } from 'chessground';
import { Api } from 'chessground/api';
import { Config } from 'chessground/config';
import { DrawShape } from 'chessground/draw';
import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { TouchInteractionMode } from 'src/components/obsidian/SettingsTab';
import {
	PromotionPiece,
	isPromotionMove,
	playOtherSide,
	toColor,
	toDests,
} from 'src/lib/chess-logic';
import { PromotionPicker } from './PromotionPicker';

export interface ChessgroundProps {
	api: Api | null;
	setApi: React.Dispatch<React.SetStateAction<Api>>;
	chess: Chess;
	addMoveToHistory: (move: Move) => void;
	syncShapes: (shapes: DrawShape[]) => void;
	isViewOnly: boolean;
	shapes: DrawShape[];
	config?: Config;
	boardColor?: 'brown' | 'green';
	drawMode?: boolean;
	touchInteractionMode?: TouchInteractionMode;
}

export const ChessgroundWrapper = React.memo(
	({
		api,
		setApi,
		chess,
		addMoveToHistory,
		syncShapes: setShapes,
		isViewOnly,
		shapes,
		boardColor = 'green',
		config = {},
		drawMode = false,
		touchInteractionMode = 'drag',
	}: ChessgroundProps) => {
		const ref = useRef<HTMLDivElement>(null);
		const [pendingPromotion, setPendingPromotion] = useState<{
			from: string;
			to: string;
			color: 'w' | 'b';
		} | null>(null);

		//Chessground Init
		useEffect(() => {
			if (ref.current && !api) {
				const chessgroundApi = ChessgroundApi(ref.current, {
					fen: chess.fen(),
					animation: { enabled: true, duration: 100 },
					check: chess.isCheck(),
					movable: {
						free: false,
						color: toColor(chess),
						dests: toDests(chess),
					},
					highlight: {
						check: true,
					},
					drawable: {
						onChange: (shapes) => {
							setShapes(shapes);
						},
					},
					turnColor: toColor(chess),
					...config,
				});

				setApi(chessgroundApi);
			} else if (ref.current && api) {
				api.set(config);
			}
		}, [addMoveToHistory, api, chess, config, setApi, setShapes]);

		//Sync Chess Logic
		useEffect(() => {
			api?.set({
				movable: {
					events: {
						//Hook up the Chessground UI changes to our App State
						after: (orig, dest, _metadata) => {
							const promotion = isPromotionMove(chess, orig, dest);
							if (promotion) {
								// Defer the move until the user picks a promotion
								// piece; the picker calls back into completePromotion.
								setPendingPromotion({
									from: orig,
									to: dest,
									color: promotion.color,
								});
								return;
							}

							const handler = playOtherSide(api, chess);
							addMoveToHistory(handler(orig, dest));
						},
					},
				},
			});
		}, [addMoveToHistory, api, chess]);

		const completePromotion = (piece: PromotionPiece) => {
			if (!api || !pendingPromotion) return;
			const handler = playOtherSide(api, chess);
			addMoveToHistory(handler(pendingPromotion.from, pendingPromotion.to, piece));
			setPendingPromotion(null);
		};

		const cancelPromotion = () => {
			if (!api) {
				setPendingPromotion(null);
				return;
			}
			// Roll back the pawn to its origin since chessground has already
			// rendered the half-move visually.
			api.set({ fen: chess.fen() });
			setPendingPromotion(null);
		};

		//Sync View Only
		useEffect(() => {
			api?.set({ viewOnly: isViewOnly || drawMode });
		}, [isViewOnly, drawMode, api]);

		// Force tap-tap mode if configured
		useEffect(() => {
			api?.set({
				draggable: { enabled: touchInteractionMode !== 'tap-tap' },
				selectable: { enabled: true },
			});
		}, [api, touchInteractionMode]);

		// Chessground only draws on right click/drag, so manually listen and
		// draw here
		useEffect(() => {
			if (!api || !drawMode || !ref.current) return;

			const boardEl = ref.current;
			let origSquare: ReturnType<Api['getKeyAtDomPos']> = undefined;

			const onPointerDown = (e: PointerEvent) => {
				// Only react to the primary input; allow right-click etc. to
				// fall through to chessground's normal handling.
				if (e.button !== 0 && e.pointerType === 'mouse') return;
				origSquare = api.getKeyAtDomPos([e.clientX, e.clientY]);
				if (!origSquare) return;
				// Stop the browser from interpreting the drag as a scroll.
				e.preventDefault();
				// Keep receiving pointermove/up even when the finger leaves
				// the original target during the drag.
				const target = e.target as Element | null;
				if (target && 'setPointerCapture' in target) {
					try {
						(
							target as Element & {
								setPointerCapture: (id: number) => void;
							}
						).setPointerCapture(e.pointerId);
					} catch {
						/* ignore */
					}
				}
			};

			const onPointerUp = (e: PointerEvent) => {
				if (!origSquare) return;
				const dest = api.getKeyAtDomPos([e.clientX, e.clientY]);
				const from = origSquare;
				origSquare = undefined;
				if (!dest) return;

				const isCircle = from === dest;
				const next = shapes.slice();
				const existingIdx = next.findIndex((s) =>
					isCircle ? s.orig === from && !s.dest : s.orig === from && s.dest === dest
				);

				if (existingIdx >= 0) {
					// Toggle off — equivalent to eraseOnClick.
					next.splice(existingIdx, 1);
				} else if (isCircle) {
					next.push({ orig: from, brush: 'green' });
				} else {
					next.push({ orig: from, dest, brush: 'green' });
				}

				setShapes(next);
				e.preventDefault();
			};

			boardEl.addEventListener('pointerdown', onPointerDown);
			boardEl.addEventListener('pointerup', onPointerUp);
			return () => {
				boardEl.removeEventListener('pointerdown', onPointerDown);
				boardEl.removeEventListener('pointerup', onPointerUp);
			};
		}, [api, drawMode, shapes, setShapes]);

		// Load Shapes
		useEffect(() => {
			if (shapes) {
				api?.setShapes([...shapes]);
			}
		}, [api, shapes]);

		// Chessground caches piece sizes, so redraw the board when its
		// container resizes
		useEffect(() => {
			if (!api || !ref.current || typeof ResizeObserver === 'undefined') {
				return;
			}

			const observer = new ResizeObserver(() => {
				api.redrawAll();
			});
			observer.observe(ref.current);
			return () => observer.disconnect();
		}, [api]);

		return (
			<div
				className={`${boardColor}-board height-width-100 table chessground-board-host${
					drawMode ? ' draw-mode' : ''
				}`}
			>
				<div ref={ref} className={`height-width-100`} />
				{pendingPromotion && (
					<PromotionPicker
						color={pendingPromotion.color}
						onSelect={completePromotion}
						onCancel={cancelPromotion}
					/>
				)}
			</div>
		);
	}
);

ChessgroundWrapper.displayName = 'ChessgroundWrapper';
