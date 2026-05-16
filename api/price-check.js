// /api/price-check.js
export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const { ingredient, unit, yourCost } = req.body;
  const prompt = `You are a restaurant supply pricing expert for Atlanta/Marietta GA (Cobb County, 2025).
Phyllis Brunch at 732 Cherokee St NE, Marietta GA 30060 buys:
- Item: ${ingredient}
- Purchase unit: ${unit}
- Current price: ${yourCost > 0 ? "$" + parseFloat(yourCost).toFixed(2) : "not entered"}
Provide 2025 wholesale price estimates from: Restaurant Depot (1803 Roswell Rd Marietta), Costco Business Center, Sam's Club, Gordon Food Service, Sysco Atlanta.
Return ONLY valid JSON:
{"suppliers":[{"name":"Restaurant Depot","price":0.00,"note":"brief note","recommended":false},{"name":"Costco Business Center","price":0.00,"note":"brief note","recommended":false},{"name":"Sam's Club","price":0.00,"note":"brief note","recommended":false},{"name":"Gordon Food Service","price":0.00,"note":"brief note","recommended":false},{"name":"Sysco Atlanta","price":0.00,"note":"brief note","recommended":false}],"tip":"one actionable tip"}
Set recommended:true for best value. Use 0 if unknown.`;
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 800, messages: [{ role: "user", content: prompt }] }),
    });
    const data = await response.json();
    const text = data.content?.find((b) => b.type === "text")?.text || "";
    res.status(200).json(JSON.parse(text.replace(/```json|```/g, "").trim()));
  } catch (e) {
    res.status(500).json({ error: "Failed: " + e.message });
  }
}
