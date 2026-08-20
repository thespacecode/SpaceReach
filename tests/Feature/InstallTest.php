<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class InstallTest extends TestCase
{
    use RefreshDatabase;

    protected function tearDown(): void
    {
        @unlink(storage_path('.installed'));
        @unlink(base_path('.installed'));
        parent::tearDown();
    }

    public function test_installer_page_is_accessible_when_uninstalled(): void
    {
        @unlink(storage_path('.installed'));
        @unlink(base_path('.installed'));

        $response = $this->get('/install');

        $response->assertStatus(200);
    }

    public function test_installer_check_endpoint_returns_json(): void
    {
        @unlink(storage_path('.installed'));
        @unlink(base_path('.installed'));

        $response = $this->getJson('/install/check');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'requirements',
                     'permissions',
                 ]);
    }

    public function test_installer_is_locked_when_already_installed(): void
    {
        File::ensureDirectoryExists(storage_path());
        File::put(storage_path('.installed'), now()->toIso8601String());

        $response = $this->get('/install');

        $response->assertStatus(302);
    }
}
