<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PortalSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingsController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/Settings', [
            'settings' => PortalSetting::pluck('value', 'key')->all(),
            'settingsData' => PortalSetting::all()->groupBy('group'),
        ]);
    }

    public function update(Request $r)
    {
        // Update authenticated user's profile info directly
        $user = auth()->user();
        if ($user) {
            if ($r->has('name') && !empty($r->input('name'))) {
                $user->name = $r->input('name');
            }
            if ($r->has('email') && !empty($r->input('email'))) {
                $user->email = $r->input('email');
            }
            $user->save();
        }

        // Store portal settings
        foreach ($r->except('_token', '_method') as $key => $val) {
            if (is_array($val)) {
                $val = json_encode($val);
            }
            PortalSetting::set($key, $val);
        }

        return back()->with('success', 'Profile and settings saved successfully.');
    }
}
