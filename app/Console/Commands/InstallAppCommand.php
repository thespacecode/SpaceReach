<?php

namespace App\Console\Commands;

use Database\Seeders\CoreSeeder;
use Database\Seeders\DemoSeeder;
use Exception;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use PDO;

class InstallAppCommand extends Command
{
    protected $signature = 'app:install {--demo : Seed demo dataset} {--blank : Seed blank application}';
    protected $description = 'Interactive automated portal setup wizard for SpaceReach';

    public function handle()
    {
        $this->info('=====================================================');
        $this->info('       🚀 SpaceReach Automated Portal Installer      ');
        $this->info('=====================================================');
        $this->newLine();

        // 1. System Checks
        $this->components->info('Checking system requirements...');
        if (version_compare(PHP_VERSION, '8.2.0', '<')) {
            $this->error('PHP 8.2 or higher is required. Current version: ' . PHP_VERSION);
            return 1;
        }

        $extensions = ['pdo', 'mbstring', 'openssl', 'tokenizer', 'xml', 'ctype', 'json', 'fileinfo'];
        $missing = [];
        foreach ($extensions as $ext) {
            if (!extension_loaded($ext)) {
                $missing[] = $ext;
            }
        }
        if (!empty($missing)) {
            $this->error('Missing required PHP extensions: ' . implode(', ', $missing));
            return 1;
        }
        $this->info('✔ System requirements passed!');
        $this->newLine();

        // 2. Application Setup Prompts
        $appName = $this->ask('Application Name', config('app.name', 'SpaceReach'));
        $appUrl = $this->ask('Application URL', config('app.url', 'http://localhost:8000'));
        $appEnv = $this->choice('Application Environment', ['production', 'local'], 0);
        $appDebug = $this->confirm('Enable Debug Mode?', $appEnv === 'local');

        $this->newLine();
        $this->components->info('Database Configuration');

        $dbDriver = $this->choice('Database Driver', ['mysql', 'pgsql', 'sqlite'], 0);

        if ($dbDriver === 'sqlite') {
            $dbHost = '127.0.0.1';
            $dbPort = '3306';
            $dbDatabase = $this->ask('SQLite Database File Path', database_path('database.sqlite'));
            $dbUsername = '';
            $dbPassword = '';

            if (!file_exists($dbDatabase)) {
                File::ensureDirectoryExists(dirname($dbDatabase));
                touch($dbDatabase);
            }
        } else {
            $dbHost = $this->ask('Database Host', '127.0.0.1');
            $dbPort = $this->ask('Database Port', $dbDriver === 'mysql' ? '3306' : '5432');
            $dbDatabase = $this->ask('Database Name', 'spacereach');
            $dbUsername = $this->ask('Database Username', 'root');
            $dbPassword = $this->secret('Database Password (leave blank for none)') ?? '';
        }

        // Test DB Connection
        $this->components->task('Testing database connection...', function () use ($dbDriver, $dbHost, $dbPort, $dbDatabase, $dbUsername, $dbPassword) {
            try {
                if ($dbDriver === 'sqlite') {
                    new PDO("sqlite:{$dbDatabase}");
                } else {
                    $pdo = new PDO("{$dbDriver}:host={$dbHost};port={$dbPort}", $dbUsername, $dbPassword, [
                        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                        PDO::ATTR_TIMEOUT => 5,
                    ]);
                    if ($dbDriver === 'mysql') {
                        $pdo->exec("CREATE DATABASE IF NOT EXISTS `{$dbDatabase}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
                    }
                }
                return true;
            } catch (Exception $e) {
                $this->error('Failed to connect: ' . $e->getMessage());
                return false;
            }
        });

        $this->newLine();
        $this->components->info('Application Mode & Data Choice');

        if ($this->option('demo')) {
            $dataOption = 'demo';
        } elseif ($this->option('blank')) {
            $dataOption = 'blank';
        } else {
            $dataOption = $this->choice(
                'Choose installation mode',
                ['blank' => 'Blank Application (Clean Slate for Production)', 'demo' => 'Demo Dataset (Full Sample Data for Evaluation)'],
                'blank'
            );
        }

        $this->newLine();
        $this->components->info('Super Admin Account Setup');
        $adminName = $this->ask('Super Admin Name', 'Super Admin');
        $adminEmail = $this->ask('Super Admin Email', 'admin@spacereach.com');
        $adminPassword = $this->secret('Super Admin Password (min 8 chars)') ?? 'Admin@123456';

        if (strlen($adminPassword) < 8) {
            $this->error('Password must be at least 8 characters long.');
            return 1;
        }

        $this->newLine();
        $this->info('Starting installation process...');

        // 1. Update .env
        $this->components->task('Writing environment configuration (.env)', function () use ($appName, $appUrl, $appEnv, $appDebug, $dbDriver, $dbHost, $dbPort, $dbDatabase, $dbUsername, $dbPassword) {
            $this->updateEnvFile([
                'APP_NAME' => '"' . $appName . '"',
                'APP_ENV' => $appEnv,
                'APP_DEBUG' => $appDebug ? 'true' : 'false',
                'APP_URL' => $appUrl,
                'APP_INSTALLED' => 'true',
                'DB_CONNECTION' => $dbDriver,
                'DB_HOST' => $dbHost,
                'DB_PORT' => $dbPort,
                'DB_DATABASE' => $dbDatabase,
                'DB_USERNAME' => $dbUsername,
                'DB_PASSWORD' => $dbPassword,
            ]);
            return true;
        });

        // Set DB connection dynamically
        config([
            'database.default' => $dbDriver,
            'database.connections.' . $dbDriver . '.host' => $dbHost,
            'database.connections.' . $dbDriver . '.port' => $dbPort,
            'database.connections.' . $dbDriver . '.database' => $dbDatabase,
            'database.connections.' . $dbDriver . '.username' => $dbUsername,
            'database.connections.' . $dbDriver . '.password' => $dbPassword,
        ]);
        DB::purge();

        // 2. Key Generation
        $this->components->task('Generating application security key', function () {
            Artisan::call('key:generate', ['--force' => true]);
            return true;
        });

        // 3. Database Migration
        $this->components->task('Running database migrations', function () {
            Artisan::call('migrate:fresh', ['--force' => true]);
            return true;
        });

        // 4. Database Seeding
        $adminData = [
            'name' => $adminName,
            'email' => $adminEmail,
            'password' => $adminPassword,
            'company_name' => $appName,
        ];

        $this->components->task("Seeding database ({$dataOption} mode)", function () use ($dataOption, $adminData) {
            if ($dataOption === 'demo') {
                $seeder = new DemoSeeder($adminData);
                $seeder->run();
            } else {
                $seeder = new CoreSeeder($adminData);
                $seeder->run();
            }
            return true;
        });

        // 5. Storage Link & Lockfile
        $this->components->task('Finalizing installation & storage symlinks', function () {
            try {
                Artisan::call('storage:link');
            } catch (Exception $e) {}

            File::ensureDirectoryExists(storage_path());
            File::put(storage_path('.installed'), now()->toIso8601String());
            File::put(base_path('.installed'), now()->toIso8601String());
            return true;
        });

        $this->newLine();
        $this->info('=====================================================');
        $this->info(' 🎉 SpaceReach installation completed successfully! ');
        $this->info('=====================================================');
        $this->info(" Portal URL: {$appUrl}");
        $this->info(" Admin Email: {$adminEmail}");
        $this->info(' Password: (as specified)');
        $this->newLine();

        return 0;
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
            $pattern = "/^{$key}=.*/m";
            if (preg_match($pattern, $envContent)) {
                $envContent = preg_replace($pattern, "{$key}={$value}", $envContent);
            } else {
                $envContent .= "\n{$key}={$value}";
            }
        }

        file_put_contents($envPath, trim($envContent) . "\n");
    }
}
