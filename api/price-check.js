export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { ingredient, unit, yourCost } = req.body;

  const prompt = `You are a restaurant supply pricing expert for the Atlanta/Marietta GA market (Cobb County, 2025).

Phyllis Brunch at 732 Cherokee St NE, Marietta GA 30060 currently buys:
- Item: ${ingredient}
- Purchase unit: ${unit}
- Their current price paid: ${yourCost > 0 ? "$" + parseFloat(yourCost).toFixed(2) + " per " + unit : "not yet entered"}

Provide realistic 2025 wholesale/bulk price estimates for this exact item from:
1. Restaurant Depot (1803 Roswell Rd, Marietta GA)
2. Costco Business Center (nearest to Marietta)
3. Sam's Club (nearest to Marietta)
4. Gordon Food Service (GFS) - Atlanta area
5. Sysco Atlanta

Also suggest ONE specific money-saving purchasing tip for this item.

Return ONLY valid JSON (no markdown, no explanation):
{
  "suppliers":[
    {"name":"Restaurant Depot","price":0.00,"note":"brief note","recommended":false},
    {"name":"Costco Business Center","price":0.00,"note":"brief note","recommended":false},
    {"name":"Sam's Club","price":0.00,"note":"brief note","recommended":false},
    {"name":"Gordon Food Service","price":0.00,"note":"brief note","recommended":false},
    {"name":"Sysco Atlanta","price":0.00,"note":"brief note","recommended":false}
  ],
  "tip":"one actionable tip for a brunch restaurant in Marietta GA"
}
Set recommended:true for the best value supplier. Use 0 if price truly unknown.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.find((b) => b.type === "text")?.text || "";
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch prices: " + e.message });
  }
}
