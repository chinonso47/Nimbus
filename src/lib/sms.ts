const SMS_ENDPOINT = import.meta.env.VITE_SMS_ENDPOINT as string;
const SMS_TOKEN = import.meta.env.VITE_SMS_SHARED_TOKEN as string;

export async function sendSms(to: string, message: string) {
  const res = await fetch(SMS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ to, body: message, token: SMS_TOKEN }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
