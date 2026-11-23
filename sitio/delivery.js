// Use the public FormSubmit identifier after the recipient activates the form.
export const formId = '';

export async function deliverEvaluation(payload) {
  const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(formId)}`, {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(25000),
  });
  const result = await response.json();
  if (!response.ok || (result.success !== true && result.success !== 'true')) {
    throw new Error('Entrega no confirmada');
  }
}
