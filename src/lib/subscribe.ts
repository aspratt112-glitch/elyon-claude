// Adds a sign-up form's details to the Klaviyo list set in Keystatic's Site settings.
// Uses Klaviyo's client API, which only needs the public key, so it's safe in the browser.
// Each form carries data-klaviyo-key, data-klaviyo-list and data-source, plus an email
// field and optional firstName / lastName fields.

const ENDPOINT = 'https://a.klaviyo.com/client/subscriptions';
const REVISION = '2024-10-15';

export async function subscribe(form: HTMLFormElement) {
	const { klaviyoKey, klaviyoList, source } = form.dataset;
	if (!klaviyoKey || !klaviyoList) throw new Error('Klaviyo is not set up in Site settings');

	const data = new FormData(form);
	const text = (name: string) => String(data.get(name) ?? '').trim() || undefined;

	const response = await fetch(`${ENDPOINT}?company_id=${encodeURIComponent(klaviyoKey)}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/vnd.api+json', revision: REVISION },
		body: JSON.stringify({
			data: {
				type: 'subscription',
				attributes: {
					custom_source: source,
					profile: {
						data: {
							type: 'profile',
							attributes: {
								email: text('email'),
								first_name: text('firstName'),
								last_name: text('lastName'),
							},
						},
					},
				},
				relationships: { list: { data: { type: 'list', id: klaviyoList } } },
			},
		}),
	});

	if (!response.ok) throw new Error(`Klaviyo sign-up failed (${response.status})`);
}

/** Wires a form to Klaviyo: disables the button while sending and reports the outcome. */
export function handleSignup(
	form: HTMLFormElement,
	{ onSuccess, onError }: { onSuccess: () => void; onError: () => void },
) {
	const button = form.querySelector<HTMLButtonElement>('[type="submit"]');

	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		const label = button?.textContent ?? '';
		if (button) {
			button.disabled = true;
			button.textContent = 'Joining…';
		}

		try {
			await subscribe(form);
			onSuccess();
		} catch (error) {
			console.error(error);
			onError();
		} finally {
			if (button) {
				button.disabled = false;
				button.textContent = label;
			}
		}
	});
}
