import { fourHourData as data } from './data/4hour'

interface DataPoint {
	timestamp: number
	close: number
	open: number
	high: number
	low: number
	volume: number
	quoteVolume: number
}

interface Trade {
	type: 'buy' | 'sell'
	price: number
	amount: number
	timestamp: number
}

function calculateSMA(data: number[], period: number): number[] {
	const sma: number[] = []
	for (let i = period - 1; i < data.length; i++) {
		const sum = data.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
		sma.push(sum / period)
	}
	return sma
}

function simulateTrades(data: DataPoint[]): Trade[] {
	const trades: Trade[] = []
	const closePrices = data.map((d) => d.close)
	const volumes = data.map((d) => d.volume)
	const priceShortSMA = calculateSMA(closePrices, 10)
	const priceLongSMA = calculateSMA(closePrices, 30)
	const volumeSMA = calculateSMA(volumes, 20)

	let inPosition = false

	for (let i = 30; i < data.length; i++) {
		const currentVolume = data[i].volume
		const averageVolume = volumeSMA[i - 30]

		if (priceShortSMA[i - 20] > priceLongSMA[i - 30] && currentVolume > averageVolume * 1.5 && !inPosition) {
			// Buy signal: price trend is up and volume is significantly above average
			trades.push({
				type: 'buy',
				price: data[i].close,
				amount: 1,
				timestamp: data[i].timestamp,
			})
			inPosition = true
		} else if (
			(priceShortSMA[i - 20] < priceLongSMA[i - 30] || currentVolume < averageVolume * 0.5) &&
			inPosition
		) {
			// Sell signal: price trend is down or volume is significantly below average
			trades.push({
				type: 'sell',
				price: data[i].close,
				amount: 1,
				timestamp: data[i].timestamp,
			})
			inPosition = false
		}
	}

	return trades
}

function calculatePnL(trades: Trade[]): number {
	let pnl = 0
	for (let i = 0; i < trades.length; i += 2) {
		const buy = trades[i]
		const sell = trades[i + 1]
		if (sell) {
			pnl += sell.price - buy.price
		}
	}
	return pnl
}

function mapDataToDataPoint(row: any[]): DataPoint {
	return {
		timestamp: Number(row[0]),
		open: Number(row[1]),
		high: Number(row[2]),
		low: Number(row[3]),
		close: Number(row[4]),
		volume: Number(row[5]),
		quoteVolume: Number(row[6]),
	}
}

// Ensure that 'data' is of type DataPoint[] before passing it to simulateTrades
const simulatedTrades = simulateTrades(data.map(mapDataToDataPoint))
const totalPnL = calculatePnL(simulatedTrades)

console.log('Simulated trades:', simulatedTrades)
console.log('Total PnL:', totalPnL)
