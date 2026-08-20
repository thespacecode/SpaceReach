<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\File;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        File::ensureDirectoryExists(storage_path());
        File::put(storage_path('.installed'), now()->toIso8601String());
    }

    protected function tearDown(): void
    {
        @unlink(storage_path('.installed'));
        @unlink(base_path('.installed'));
        parent::tearDown();
    }

    /**
     * Test that root path redirects appropriately.
     */
    public function test_the_application_root_redirects(): void
    {
        $response = $this->get('/');

        $response->assertStatus(302);
    }

    /**
     * Test that login page returns a successful 200 response when installed.
     */
    public function test_login_page_returns_successful_response(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }
}
