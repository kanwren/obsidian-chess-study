import { App, PluginSettingTab, Setting } from 'obsidian';
import ChessStudyPlugin from 'src/main';

export type BoardSize = 'auto' | 's' | 'm' | 'l';
export type TouchInteractionMode = 'drag' | 'tap-tap';

export interface ChessStudyPluginSettings {
	boardOrientation: 'white' | 'black';
	boardColor: 'green' | 'brown';
	viewComments: true | false;
	boardSize: BoardSize;
	touchInteractionMode: TouchInteractionMode;
}

export const DEFAULT_SETTINGS: ChessStudyPluginSettings = {
	boardOrientation: 'white',
	boardColor: 'green',
	viewComments: true,
	boardSize: 'auto',
	touchInteractionMode: 'drag',
};

export class SettingsTab extends PluginSettingTab {
	plugin: ChessStudyPlugin;

	constructor(app: App, plugin: ChessStudyPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Board orientation')
			.setDesc('Sets the default orientation of the board')
			.addDropdown((dropdown) => {
				dropdown.addOption('white', 'White');
				dropdown.addOption('black', 'Black');

				dropdown
					.setValue(this.plugin.settings.boardOrientation)
					.onChange((orientation) => {
						this.plugin.settings.boardOrientation = orientation as 'white' | 'black';
						this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Board color')
			.setDesc('Sets the default color of the board')
			.addDropdown((dropdown) => {
				dropdown.addOption('green', 'Green');
				dropdown.addOption('brown', 'Brown');

				dropdown
					.setValue(this.plugin.settings.boardColor)
					.onChange((boardColor) => {
						this.plugin.settings.boardColor = boardColor as 'green' | 'brown';
						this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('View Comments')
			.setDesc('Sets the default view of the comments')
			.addDropdown((dropdown) => {
				dropdown.addOption('true', 'True');
				dropdown.addOption('false', 'False');
				dropdown
					.setValue(this.plugin.settings.viewComments.toString())
					.onChange((viewComments) => {
						this.plugin.settings.viewComments = viewComments === 'true';
						this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName('Board size')
			.setDesc(
				'Cap the rendered board width. Auto fills the available column; ' +
					'set a fixed size to keep the board compact on tablets and ' +
					'wide notes.'
			)
			.addDropdown((dropdown) => {
				dropdown.addOption('auto', 'Auto');
				dropdown.addOption('s', 'Small');
				dropdown.addOption('m', 'Medium');
				dropdown.addOption('l', 'Large');
				dropdown.setValue(this.plugin.settings.boardSize).onChange((boardSize) => {
					this.plugin.settings.boardSize = boardSize as BoardSize;
					this.plugin.saveSettings();
				});
			});

		new Setting(containerEl)
			.setName('Touch interaction mode')
			.setDesc(
				'How pieces are moved on touch devices. Drag is the default ' +
					'(press and slide). Tap-tap selects the source square first, ' +
					'then the destination — handy if drags accidentally trigger ' +
					'edge-swipe gestures.'
			)
			.addDropdown((dropdown) => {
				dropdown.addOption('drag', 'Drag');
				dropdown.addOption('tap-tap', 'Tap-tap');
				dropdown
					.setValue(this.plugin.settings.touchInteractionMode)
					.onChange((mode) => {
						this.plugin.settings.touchInteractionMode = mode as TouchInteractionMode;
						this.plugin.saveSettings();
					});
			});
	}
}
