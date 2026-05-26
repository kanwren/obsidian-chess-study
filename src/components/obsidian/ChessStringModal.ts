import { App, Modal, Notice, Setting } from 'obsidian';
import { ChessString } from 'src/main';

export class ChessStringModal extends Modal {
	chessString: ChessString;
	onSubmit: (pgn: string) => void;

	constructor(app: App, onSubmit: (pgn: string) => void) {
		super(app);
		this.onSubmit = onSubmit;
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h1', {
			text: 'Paste the full PGN/FEN (leave empty for a new game):',
		});

		let textarea: HTMLTextAreaElement | null = null;
		new Setting(contentEl).setName('PGN/FEN').addTextArea((text) => {
			text.onChange((value) => {
				this.chessString = value;
			});
			// font-size: 16px stops iOS Safari from auto-zooming on focus;
			// 100% width and a generous height work on both phones and
			// desktops without exceeding the modal's own scroll cap.
			text.inputEl.setCssStyles({
				width: '100%',
				minHeight: '180px',
				fontSize: '16px',
			});
			textarea = text.inputEl;
		});

		new Setting(contentEl)
			.addButton((btn) =>
				btn.setButtonText('Paste').onClick(async () => {
					try {
						let pasted = '';
						if (navigator.clipboard?.readText) {
							pasted = await navigator.clipboard.readText();
						}
						if (!pasted) {
							new Notice(
								'Clipboard is empty or unavailable. Long-press the field to paste.'
							);
							return;
						}
						this.chessString = pasted;
						if (textarea) {
							textarea.value = pasted;
							// Trigger the Setting's onChange so internal state syncs
							// for users on older clipboard paths.
							textarea.dispatchEvent(new Event('input'));
						}
					} catch {
						new Notice('Could not read from clipboard.');
					}
				})
			)
			.addButton((btn) =>
				btn
					.setButtonText('Submit')
					.setCta()
					.onClick(() => {
						this.close();
						this.onSubmit(this.chessString);
					})
			);
	}

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
