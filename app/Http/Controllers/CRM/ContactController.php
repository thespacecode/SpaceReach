<?php

namespace App\Http\Controllers\CRM;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactController extends Controller
{
    public function index(Request $request)
    {
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDir = strtolower($request->input('sort_dir', 'desc')) === 'asc' ? 'asc' : 'desc';

        $allowedSorts = ['first_name', 'last_name', 'email', 'phone', 'company', 'job_title', 'status', 'source', 'city', 'country', 'created_at'];
        if (!in_array($sortBy, $allowedSorts)) {
            $sortBy = 'created_at';
        }

        $query = Contact::with(['assignedUser', 'creator'])
            ->when($request->search, fn($q, $s) => $q->where(function($q) use ($s) {
                $q->where('first_name', 'like', "%{$s}%")
                  ->orWhere('last_name', 'like', "%{$s}%")
                  ->orWhere('email', 'like', "%{$s}%")
                  ->orWhere('phone', 'like', "%{$s}%")
                  ->orWhere('company', 'like', "%{$s}%");
            }))
            ->when($request->status && $request->status !== 'all', fn($q) => $q->where('status', $request->status))
            ->when($request->source && $request->source !== 'all', fn($q) => $q->where('source', $request->source))
            ->when($request->assigned_to && $request->assigned_to !== 'all', fn($q) => $q->where('assigned_to', $request->assigned_to))
            ->orderBy($sortBy, $sortDir);

        return Inertia::render('CRM/Contacts/Index', [
            'contacts' => $query->paginate(\App\Models\PortalSetting::paginationSize())->withQueryString(),
            'filters' => $request->only(['search', 'status', 'source', 'assigned_to', 'sort_by', 'sort_dir']),
            'users' => User::where('status', 'active')->select('id', 'name')->get(),
        ]);
    }

    public function import(Request $request)
    {
        $request->validate([
            'contacts' => 'required|array|min:1',
            'contacts.*.first_name' => 'required|string|max:255',
            'contacts.*.last_name' => 'nullable|string|max:255',
            'contacts.*.email' => 'nullable|email|max:255',
            'contacts.*.phone' => 'nullable|string|max:50',
            'contacts.*.company' => 'nullable|string|max:255',
            'contacts.*.job_title' => 'nullable|string|max:255',
            'contacts.*.source' => 'nullable|string|max:50',
            'contacts.*.status' => 'nullable|string|max:50',
        ]);

        $imported = 0;
        foreach ($request->contacts as $data) {
            Contact::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'] ?? null,
                'email' => $data['email'] ?? null,
                'phone' => $data['phone'] ?? null,
                'company' => $data['company'] ?? null,
                'job_title' => $data['job_title'] ?? null,
                'source' => !empty($data['source']) ? $data['source'] : 'import',
                'status' => !empty($data['status']) ? $data['status'] : 'lead',
                'created_by' => auth()->id(),
            ]);
            $imported++;
        }

        return redirect()->route('crm.contacts.index')->with('success', "{$imported} contacts imported successfully.");
    }

    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:contacts,id',
        ]);

        Contact::whereIn('id', $request->ids)->delete();

        return redirect()->route('crm.contacts.index')->with('success', 'Selected contacts deleted successfully.');
    }

    public function create()
    {
        return Inertia::render('CRM/Contacts/Form', [
            'users' => User::where('status', 'active')->select('id', 'name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:50',
            'status' => 'nullable|in:active,inactive,lead,customer,lost',
            'assigned_to' => 'nullable|exists:users,id',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'tags' => 'nullable|array',
        ]);

        $validated['created_by'] = auth()->id();
        Contact::create($validated);

        return redirect()->route('crm.contacts.index')->with('success', 'Contact created successfully.');
    }

    public function show(Contact $contact)
    {
        $contact->load(['assignedUser', 'creator', 'notes.user', 'activities.user', 'deals.stage', 'quotes', 'invoices']);

        return Inertia::render('CRM/Contacts/Show', [
            'contact' => $contact,
        ]);
    }

    public function edit(Contact $contact)
    {
        return Inertia::render('CRM/Contacts/Form', [
            'contact' => $contact,
            'users' => User::where('status', 'active')->select('id', 'name')->get(),
        ]);
    }

    public function update(Request $request, Contact $contact)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'job_title' => 'nullable|string|max:255',
            'source' => 'nullable|string|max:50',
            'status' => 'nullable|in:active,inactive,lead,customer,lost',
            'assigned_to' => 'nullable|exists:users,id',
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'tags' => 'nullable|array',
        ]);

        $contact->update($validated);

        return redirect()->route('crm.contacts.index')->with('success', 'Contact updated successfully.');
    }

    public function destroy(Contact $contact)
    {
        $contact->delete();
        return redirect()->route('crm.contacts.index')->with('success', 'Contact deleted successfully.');
    }
}
