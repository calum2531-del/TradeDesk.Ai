export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { symbol } = req.query;
  if (!symbol) return res.status(400).json({ error: 'Symbol required' });

  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${process.env.FINNHUB_API_KEY}`
    );
    const data = await response.json();

    // c = current price, pc = previous close, dp = % change
    const price = (data.c && data.c > 0) ? data.c : (data.pc || 0);
    const prevClose = data.pc || price;
    const changePct = prevClose > 0 ? ((price - prevClose) / prevClose * 100) : (data.dp || 0);

    return res.status(200).json({
      symbol,
      price: parseFloat(price.toFixed(2)),
      change: parseFloat(changePct.toFixed(2)),
      high: data.h || price,
      low: data.l || price,
      open: data.o || price,
      prevClose: parseFloat(prevClose.toFixed(2)),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({ error: 'Price fetch failed', message: error.message });
  }
}
