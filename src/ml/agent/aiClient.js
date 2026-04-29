
export const generateAIResponse = async ({ prompt, model, userId }) => {

  try {
    const baseUrl = import.meta.env.PROD ? "" : "http://localhost:3002";
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    
    const response = await fetch(`${baseUrl}/api/ai`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt, model, userId }),
    signal: controller.signal,
  });
  clearTimeout(timeoutId);

  const data = await response.json();
  
  if(!response.ok) {
    const error = new Error(data.message || "AI request failed");
    error.code = data.error;
    throw error;
  }
  
  const text = await data.text;

  return JSON.parse(text);

} catch (err) {
    throw err;
  }
}