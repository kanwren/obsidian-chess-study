export async function copyTextToClipboard(text: string): Promise<boolean> {
	// Prefer the async Clipboard API when available.
	if (
		typeof navigator !== 'undefined' &&
		navigator.clipboard &&
		typeof navigator.clipboard.writeText === 'function'
	) {
		try {
			await navigator.clipboard.writeText(text);
			return true;
		} catch {}
	}

	// fallback: temporary textarea + document.execCommand('copy').
	try {
		if (typeof document === 'undefined') {
			return false;
		}

		const textarea = document.createElement('textarea');
		textarea.value = text;
		// Avoid scroll jump and visual flash.
		textarea.setAttribute('readonly', '');
		textarea.style.position = 'fixed';
		textarea.style.top = '0';
		textarea.style.left = '0';
		textarea.style.width = '1px';
		textarea.style.height = '1px';
		textarea.style.padding = '0';
		textarea.style.border = 'none';
		textarea.style.outline = 'none';
		textarea.style.boxShadow = 'none';
		textarea.style.background = 'transparent';
		textarea.style.opacity = '0';

		document.body.appendChild(textarea);
		textarea.focus();
		textarea.select();
		textarea.setSelectionRange(0, text.length);

		const ok = document.execCommand('copy');
		document.body.removeChild(textarea);

		return ok;
	} catch {
		return false;
	}
}
