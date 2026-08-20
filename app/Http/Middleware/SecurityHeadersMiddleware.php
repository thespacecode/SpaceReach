<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var Response $response */
        $response = $next($request);

        // Clickjacking protection
        $response->headers->set('X-Frame-Options', 'SAMEORIGIN');

        // MIME-type sniffing protection
        $response->headers->set('X-Content-Type-Options', 'nosniff');

        // Cross-Site Scripting (XSS) Filter protection
        $response->headers->set('X-XSS-Protection', '1; mode=block');

        // Referrer Policy
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');

        // Permissions Policy (restrict sensitive hardware devices)
        $response->headers->set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

        // HTTP Strict Transport Security (HSTS) when on HTTPS
        if ($request->isSecure() || $request->header('X-Forwarded-Proto') === 'https') {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }

        // Allow Vite HMR (IPv4 & IPv6), Google Tag Manager, and Fonts
        $isDev = config('app.debug') || app()->environment('local');
        $viteOrigins = $isDev ? "http://localhost:* http://127.0.0.1:* http://[::1]:* ws://localhost:* ws://127.0.0.1:* ws://[::1]:*" : "";

        // Content Security Policy
        $csp = "default-src 'self' https: {$viteOrigins}; " .
               "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://www.googletagmanager.com {$viteOrigins}; " .
               "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com {$viteOrigins}; " .
               "font-src 'self' https://fonts.gstatic.com data: {$viteOrigins}; " .
               "img-src 'self' data: https: blob: {$viteOrigins}; " .
               "connect-src 'self' https: wss: ws: {$viteOrigins}; " .
               "frame-src 'self' https://www.googletagmanager.com; " .
               "frame-ancestors 'self';";
        
        $response->headers->set('Content-Security-Policy', $csp);

        return $response;
    }
}
