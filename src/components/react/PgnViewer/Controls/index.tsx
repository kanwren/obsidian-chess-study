import {
	ArrowLeft,
	ArrowRight,
	Copy,
	Eraser,
	Pencil,
	Save,
	Undo2,
} from 'lucide-react';
import * as React from 'react';

export interface ControlActions {
	onUndoButtonClick: () => void;
	onBackButtonClick: () => void;
	onForwardButtonClick: () => void;
	onSaveButtonClick: () => void;
	onCopyButtonClick: () => void;
	onToggleDrawMode: () => void;
	onClearShapes: () => void;
	drawMode: boolean;
}

export const Controls = (props: ControlActions) => {
	return (
		<div className="controls">
			<div className="button-section">
				<button
					title="Back"
					aria-label="Back"
					onClick={() => props.onBackButtonClick()}
				>
					<ArrowLeft />
				</button>
				<button
					title="Forward"
					aria-label="Forward"
					onClick={() => props.onForwardButtonClick()}
				>
					<ArrowRight />
				</button>
				<button
					title="Save"
					aria-label="Save"
					onClick={() => props.onSaveButtonClick()}
				>
					<Save strokeWidth={'1px'} />
				</button>
			</div>
			<div className="button-section">
				<button
					title="Copy FEN"
					aria-label="Copy FEN"
					onClick={() => props.onCopyButtonClick()}
				>
					<Copy strokeWidth={'1px'} />
				</button>
				<button
					title="Undo"
					aria-label="Undo"
					onClick={() => props.onUndoButtonClick()}
				>
					<Undo2 />
				</button>
				<button
					title={props.drawMode ? 'Exit draw mode' : 'Draw mode'}
					aria-label={props.drawMode ? 'Exit draw mode' : 'Draw mode'}
					aria-pressed={props.drawMode}
					className={props.drawMode ? 'draw-mode-active' : ''}
					onClick={() => props.onToggleDrawMode()}
				>
					<Pencil strokeWidth={'1px'} />
				</button>
				<button
					title="Clear shapes for this move"
					aria-label="Clear shapes for this move"
					onClick={() => props.onClearShapes()}
				>
					<Eraser strokeWidth={'1px'} />
				</button>
			</div>
		</div>
	);
};
