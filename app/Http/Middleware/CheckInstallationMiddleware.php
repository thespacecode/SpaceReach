<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckInstallationMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $isInstalled = file_exists(storage_path('.installed')) || 
                      file_exists(base_path('.installed')) || 
                      (env('APP_INSTALLED', false) && !empty(env('APP_KEY')));

        $isInstallRoute = $request->is('install*');

        if (!$isInstalled && !$isInstallRoute) {
            return redirect()->route('install.index');
        }

        if ($isInstalled && $isInstallRoute) {
            return redirect()->route('dashboard');
        }

        return $next($request);
    }
}
