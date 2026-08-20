<?php

namespace App\Http\Controllers\Api;

use App\Models\PortalSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class StockTickerController
{
    /**
     * Regional configuration definitions for dynamic localization based on timezone & currency settings.
     */
    private const REGIONS = [
        'IN' => [
            'name'     => 'India Market',
            'currency' => 'INR',
            'symbol'   => '₹',
            'stocks'   => [
                '^NSEI'    => 'NIFTY 50',
                '^BSESN'   => 'SENSEX',
                '^NSEBANK' => 'BANK NIFTY',
                'USDINR=X' => 'USD/INR',
                'EURINR=X' => 'EUR/INR',
                'GBPINR=X' => 'GBP/INR',
                'GC=F'     => 'GOLD',
            ],
            'crypto'   => [
                'BTCUSDT' => ['name' => 'BTC/USD'],
                'ETHUSDT' => ['name' => 'ETH/USD'],
            ],
        ],
        'US' => [
            'name'     => 'US Market',
            'currency' => 'USD',
            'symbol'   => '$',
            'stocks'   => [
                '^GSPC'    => 'S&P 500',
                '^IXIC'    => 'NASDAQ',
                '^DJI'     => 'DOW',
                '^RUT'     => 'RUSSELL 2000',
                'EURUSD=X' => 'EUR/USD',
                'GBPUSD=X' => 'GBP/USD',
                'GC=F'     => 'GOLD',
                'CL=F'     => 'CRUDE',
            ],
            'crypto'   => [
                'BTCUSDT' => ['name' => 'BTC/USD'],
                'ETHUSDT' => ['name' => 'ETH/USD'],
                'SOLUSDT' => ['name' => 'SOL/USD'],
            ],
        ],
        'EU' => [
            'name'     => 'UK & Europe Market',
            'currency' => 'EUR',
            'symbol'   => '€',
            'stocks'   => [
                '^FTSE'     => 'FTSE 100',
                '^GDAXI'    => 'DAX 40',
                '^FCHI'     => 'CAC 40',
                '^STOXX50E' => 'STOXX 50',
                'EURUSD=X'  => 'EUR/USD',
                'EURGBP=X'  => 'EUR/GBP',
                'GC=F'      => 'GOLD',
            ],
            'crypto'   => [
                'BTCUSDT' => ['name' => 'BTC/EUR'],
                'ETHUSDT' => ['name' => 'ETH/EUR'],
            ],
        ],
        'APAC' => [
            'name'     => 'Asia Pacific Market',
            'currency' => 'JPY',
            'symbol'   => '¥',
            'stocks'   => [
                '^N225'    => 'NIKKEI 225',
                '^HSI'     => 'HANG SENG',
                '^AXJO'    => 'ASX 200',
                'JPY=X'    => 'USD/JPY',
                'SGD=X'    => 'USD/SGD',
                'AUDUSD=X' => 'AUD/USD',
                'GC=F'     => 'GOLD',
            ],
            'crypto'   => [
                'BTCUSDT' => ['name' => 'BTC/JPY'],
                'ETHUSDT' => ['name' => 'ETH/JPY'],
            ],
        ],
    ];

    /**
     * Return regionalized live ticker data based on setting timezone & currency.
     */
    public function index(): JsonResponse
    {
        $timezone = PortalSetting::where('key', 'timezone')->value('value')
            ?? config('app.timezone', 'Asia/Kolkata');
        $currency = PortalSetting::where('key', 'currency')->value('value')
            ?? 'INR';

        $regionKey = $this->detectRegion($timezone, $currency);
        $regionConfig = self::REGIONS[$regionKey] ?? self::REGIONS['IN'];

        $cacheKey = 'stock_ticker_live_' . strtolower($regionKey);

        $data = Cache::remember($cacheKey, 180, function () use ($regionConfig) {
            $liveQuotes = [];

            // 1. Fetch Stock Indices & Forex for this region
            $stockQuotes = $this->fetchYahooStockTicker($regionConfig['stocks'], $regionConfig['symbol']);
            if (!empty($stockQuotes)) {
                $liveQuotes = array_merge($liveQuotes, $stockQuotes);
            }

            // 2. Fetch Crypto for this region
            $cryptoQuotes = $this->fetchBinanceCryptoTicker($regionConfig['crypto'], $regionConfig['symbol']);
            if (!empty($cryptoQuotes)) {
                $liveQuotes = array_merge($liveQuotes, $cryptoQuotes);
            }

            if (!empty($liveQuotes)) {
                Cache::put('stock_ticker_last_good_' . strtolower($regionConfig['currency']), $liveQuotes, 86400);
                return $liveQuotes;
            }

            return Cache::get('stock_ticker_last_good_' . strtolower($regionConfig['currency']), []);
        });

        if (empty($data)) {
            $data = Cache::get('stock_ticker_last_good_' . strtolower($regionConfig['currency']), []);
        }

        return response()->json([
            'data'     => $data,
            'region'   => $regionConfig['name'],
            'currency' => $regionConfig['currency'],
            'timezone' => $timezone,
            'live'     => !empty($data),
            'updated'  => now()->toIso8601String(),
        ]);
    }

    /**
     * Detect region code based on timezone string & currency.
     */
    private function detectRegion(string $timezone, string $currency): string
    {
        $tz = strtolower($timezone);
        $curr = strtoupper($currency);

        if (str_contains($tz, 'kolkata') || str_contains($tz, 'calcutta') || str_contains($tz, 'india') || $curr === 'INR') {
            return 'IN';
        }

        if (str_contains($tz, 'america') || str_contains($tz, 'us/') || str_contains($tz, 'new_york') || str_contains($tz, 'chicago') || str_contains($tz, 'los_angeles') || $curr === 'USD') {
            return 'US';
        }

        if (str_contains($tz, 'europe') || str_contains($tz, 'london') || str_contains($tz, 'paris') || str_contains($tz, 'berlin') || str_contains($tz, 'rome') || str_contains($tz, 'madrid') || in_array($curr, ['EUR', 'GBP'])) {
            return 'EU';
        }

        if (str_contains($tz, 'tokyo') || str_contains($tz, 'singapore') || str_contains($tz, 'hong_kong') || str_contains($tz, 'shanghai') || str_contains($tz, 'australia') || str_contains($tz, 'sydney') || in_array($curr, ['JPY', 'SGD', 'AUD', 'HKD'])) {
            return 'APAC';
        }

        return 'IN';
    }

    /**
     * Fetch Yahoo stock & forex tickers for specific region.
     */
    private function fetchYahooStockTicker(array $symbolMap, string $currencySymbol): array
    {
        try {
            $symbols = array_keys($symbolMap);
            $responses = Http::pool(function ($pool) use ($symbols) {
                foreach ($symbols as $symbol) {
                    $pool->as($symbol)
                        ->withHeaders([
                            'User-Agent' => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                            'Accept'     => 'application/json',
                        ])
                        ->timeout(6)
                        ->get("https://query1.finance.yahoo.com/v8/finance/chart/{$symbol}", [
                            'interval' => '1d',
                            'range'    => '1d',
                        ]);
                }
            });

            $results = [];
            foreach ($symbols as $symbol) {
                $res = $responses[$symbol] ?? null;
                if ($res && $res->successful()) {
                    $meta = $res->json('chart.result.0.meta', []);
                    $price = $meta['regularMarketPrice'] ?? null;
                    $prevClose = $meta['chartPreviousClose'] ?? $meta['previousClose'] ?? null;

                    if ($price) {
                        $changePercent = 0;
                        if ($prevClose && $prevClose > 0) {
                            $changePercent = (($price - $prevClose) / $prevClose) * 100;
                        }

                        $displayName = $symbolMap[$symbol] ?? $symbol;
                        $formattedValue = $this->formatRegionalPrice($price, $symbol, $currencySymbol);

                        $results[] = [
                            'symbol' => $displayName,
                            'value'  => $formattedValue,
                            'change' => ($changePercent >= 0 ? '+' : '') . number_format($changePercent, 2) . '%',
                            'up'     => $changePercent >= 0,
                        ];
                    }
                }
            }

            return $results;
        } catch (\Throwable $e) {
            Log::debug('Yahoo Regional Stock API fetch failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Fetch Binance Crypto tickers with regional name formatting.
     */
    private function fetchBinanceCryptoTicker(array $cryptoMap, string $currencySymbol): array
    {
        try {
            $symbols = json_encode(array_keys($cryptoMap));
            $response = Http::timeout(5)->get('https://api.binance.com/api/v3/ticker/24hr', [
                'symbols' => $symbols,
            ]);

            if (!$response->successful()) {
                return [];
            }

            $items = $response->json();
            $results = [];

            foreach ($items as $item) {
                $rawSymbol = $item['symbol'] ?? '';
                $config = $cryptoMap[$rawSymbol] ?? null;

                if (!$config) continue;

                $displayName = $config['name'] ?? $rawSymbol;
                $price = floatval($item['lastPrice'] ?? 0);
                $changePercent = floatval($item['priceChangePercent'] ?? 0);

                if ($price > 0) {
                    $results[] = [
                        'symbol' => $displayName,
                        'value'  => ($price > 10 ? number_format($price, 2) : number_format($price, 4)),
                        'change' => ($changePercent >= 0 ? '+' : '') . number_format($changePercent, 2) . '%',
                        'up'     => $changePercent >= 0,
                    ];
                }
            }

            return $results;
        } catch (\Throwable $e) {
            Log::debug('Binance Crypto API fetch failed: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Format regional prices with currency symbol & decimal precision.
     */
    private function formatRegionalPrice(float $price, string $symbol, string $currencySymbol): string
    {
        if (str_contains($symbol, '=X')) {
            return number_format($price, 4);
        }

        return number_format($price, 2);
    }
}
