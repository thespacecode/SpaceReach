<?php

namespace App\Http\Controllers;

use Database\Seeders\CoreSeeder;
use Database\Seeders\DemoSeeder;
use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;
use PDO;

class InstallController extends Controller
{
    private function ensureNotInstalled()
    {
        $isInstalled = file_exists(storage_path('.installed')) || 
                      file_exists(base_path('.installed')) || 
                      config('app.installed', false);

        if ($isInstalled) {
            abort(403, 'Portal is already installed. Setup wizard is locked for security.');
        }
    }

    public function index(Request $request): Response
    {
        $this->ensureNotInstalled();

        $requirements = $this->getSystemRequirements();
        $permissions = $this->getPermissions();

        return Inertia::render('Install/Wizard', [
            'requirements' => $requirements,
            'permissions' => $permissions,
            'defaultAppUrl' => $request->schemeAndHttpHost(),
        ]);
    }

    public function checkRequirements(): JsonResponse
    {
        $this->ensureNotInstalled();

        return response()->json([
            'requirements' => $this->getSystemRequirements(),
            'permissions' => $this->getPermissions(),
        ]);
    }

    public function testDatabase(Request $request): JsonResponse
    {
        $this->ensureNotInstalled();

        $request->validate([
            'db_driver' => 'required|in:mysql,pgsql,sqlite',
            'db_host' => 'required_unless:db_driver,sqlite',
            'db_port' => 'required_unless:db_driver,sqlite',
            'db_database' => 'required',
            'db_username' => 'required_unless:db_driver,sqlite',
            'db_password' => 'nullable',
        ]);

        $driver = $request->input('db_driver');
        $host = $request->input('db_host');
        $port = $request->input('db_port');
        $database = $request->input('db_database');
        $username = $request->input('db_username');
        $password = $request->input('db_password');

        try {
            if ($driver === 'sqlite') {
                if (!file_exists($database) && $database !== ':memory:') {
                    File::ensureDirectoryExists(dirname($database));
                    touch($database);
                }
                $dsn = "sqlite:{$database}";
                $pdo = new PDO($dsn);
            } else {
                $dsn = "{$driver}:host={$host};port={$port}";
                $pdo = new PDO($dsn, $username, $password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_TIMEOUT => 5,
                ]);

                // Create database if not exists
                if ($driver === 'mysql') {
                    $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$database}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Database connection established successfully!',
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Database connection failed: ' . $e->getMessage(),
            ], 422);
        }
    }

    public function process(Request $request): JsonResponse
    {
        $this->ensureNotInstalled();

        $request->validate([
            'app_name' => 'required|string|max:255',
            'app_url' => 'required|url',
            'app_env' => 'required|in:production,local',
            'app_debug' => 'required|boolean',
            'db_driver' => 'required|in:mysql,pgsql,sqlite',
            'db_host' => 'required_unless:db_driver,sqlite',
            'db_port' => 'required_unless:db_driver,sqlite',
            'db_database' => 'required',
            'db_username' => 'required_unless:db_driver,sqlite',
            'db_password' => 'nullable',
            'data_option' => 'required|in:blank,demo',
            'admin_name' => 'required|string|max:255',
            'admin_email' => 'required|email|max:255',
            'admin_password' => 'required|string|min:8',
        ]);

        try {
            // 1. Write .env configuration file securely
            $this->updateEnvFile([
                'APP_NAME' => '"' . str_replace('"', '\"', $request->input('app_name')) . '"',
                'APP_ENV' => $request->input('app_env'),
                'APP_DEBUG' => $request->input('app_debug') ? 'true' : 'false',
                'APP_URL' => $request->input('app_url'),
                'APP_INSTALLED' => 'true',
                'DB_CONNECTION' => $request->input('db_driver'),
                'DB_HOST' => $request->input('db_host', '127.0.0.1'),
                'DB_PORT' => $request->input('db_port', '3306'),
                'DB_DATABASE' => $request->input('db_database'),
                'DB_USERNAME' => $request->input('db_username', 'root'),
                'DB_PASSWORD' => $request->input('db_password', ''),
            ]);

            // Clear configuration cache so new DB settings apply immediately
            Artisan::call('config:clear');

            // Set DB connection dynamically in current runtime context
            config([
                'database.default' => $request->input('db_driver'),
                'database.connections.' . $request->input('db_driver') . '.host' => $request->input('db_host'),
                'database.connections.' . $request->input('db_driver') . '.port' => $request->input('db_port'),
                'database.connections.' . $request->input('db_driver') . '.database' => $request->input('db_database'),
                'database.connections.' . $request->input('db_driver') . '.username' => $request->input('db_username'),
                'database.connections.' . $request->input('db_driver') . '.password' => $request->input('db_password'),
            ]);
            DB::purge();

            // 2. Generate application key if empty
            if (empty(config('app.key'))) {
                Artisan::call('key:generate', ['--force' => true]);
            }

            // 3. Execute Migrations
            Artisan::call('migrate:fresh', ['--force' => true]);

            // 4. Seed Selected Application Mode
            $adminData = [
                'name' => $request->input('admin_name'),
                'email' => $request->input('admin_email'),
                'password' => $request->input('admin_password'),
                'company_name' => $request->input('app_name'),
            ];

            if ($request->input('data_option') === 'demo') {
                $seeder = new DemoSeeder($adminData);
                $seeder->run();
            } else {
                $seeder = new CoreSeeder($adminData);
                $seeder->run();
            }

            // 5. Create storage symlink
            try {
                Artisan::call('storage:link');
            } catch (Exception $e) {
                // Ignore if already linked
            }

            // 6. Create lockfiles
            File::ensureDirectoryExists(storage_path());
            File::put(storage_path('.installed'), now()->toIso8601String());
            File::put(base_path('.installed'), now()->toIso8601String());

            return response()->json([
                'success' => true,
                'message' => 'Portal installation completed successfully!',
                'redirect' => route('login'),
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Installation error: ' . $e->getMessage(),
            ], 500);
        }
    }

    private function getSystemRequirements(): array
    {
        $requirements = [
            'php_version' => [
                'name' => 'PHP Version (>= 8.2)',
                'supported' => version_compare(PHP_VERSION, '8.2.0', '>='),
                'current' => PHP_VERSION,
            ],
            'pdo' => [
                'name' => 'PDO Extension',
                'supported' => extension_loaded('pdo'),
                'current' => extension_loaded('pdo') ? 'Enabled' : 'Disabled',
            ],
            'mbstring' => [
                'name' => 'Mbstring Extension',
                'supported' => extension_loaded('mbstring'),
                'current' => extension_loaded('mbstring') ? 'Enabled' : 'Disabled',
            ],
            'openssl' => [
                'name' => 'OpenSSL Extension',
                'supported' => extension_loaded('openssl'),
                'current' => extension_loaded('openssl') ? 'Enabled' : 'Disabled',
            ],
            'tokenizer' => [
                'name' => 'Tokenizer Extension',
                'supported' => extension_loaded('tokenizer'),
                'current' => extension_loaded('tokenizer') ? 'Enabled' : 'Disabled',
            ],
            'xml' => [
                'name' => 'XML Extension',
                'supported' => extension_loaded('xml'),
                'current' => extension_loaded('xml') ? 'Enabled' : 'Disabled',
            ],
            'ctype' => [
                'name' => 'Ctype Extension',
                'supported' => extension_loaded('ctype'),
                'current' => extension_loaded('ctype') ? 'Enabled' : 'Disabled',
            ],
            'json' => [
                'name' => 'JSON Extension',
                'supported' => extension_loaded('json'),
                'current' => extension_loaded('json') ? 'Enabled' : 'Disabled',
            ],
            'fileinfo' => [
                'name' => 'Fileinfo Extension',
                'supported' => extension_loaded('fileinfo'),
                'current' => extension_loaded('fileinfo') ? 'Enabled' : 'Disabled',
            ],
            'bcmath' => [
                'name' => 'BCMath Extension',
                'supported' => extension_loaded('bcmath'),
                'current' => extension_loaded('bcmath') ? 'Enabled' : 'Disabled',
            ],
        ];

        return $requirements;
    }

    private function getPermissions(): array
    {
        return [
            'storage' => [
                'name' => 'storage/',
                'writable' => is_writable(storage_path()),
                'path' => storage_path(),
            ],
            'bootstrap_cache' => [
                'name' => 'bootstrap/cache/',
                'writable' => is_writable(base_path('bootstrap/cache')),
                'path' => base_path('bootstrap/cache'),
            ],
        ];
    }

    private function updateEnvFile(array $data): void
    {
        $envPath = base_path('.env');
        $examplePath = base_path('.env.example');

        if (!file_exists($envPath) && file_exists($examplePath)) {
            copy($examplePath, $envPath);
        }

        $envContent = file_exists($envPath) ? file_get_contents($envPath) : '';

        foreach ($data as $key => $value) {
            // Strip any newlines to prevent .env injection vulnerabilities
            $cleanValue = str_replace(["\r", "\n"], '', $value);
            $pattern = "/^{$key}=.*/m";
            if (preg_match($pattern, $envContent)) {
                $envContent = preg_replace($pattern, "{$key}={$cleanValue}", $envContent);
            } else {
                $envContent .= "\n{$key}={$cleanValue}";
            }
        }

        file_put_contents($envPath, trim($envContent) . "\n");
        @chmod($envPath, 0600);
    }
}
