<?php
namespace App\Http\Controllers\Forms;
use App\Http\Controllers\Controller;
use App\Models\Form;
use App\Models\FormSubmission;
use App\Models\Contact;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class FormController extends Controller
{
    public function index() { return Inertia::render('Forms/Index', ['forms'=>Form::withCount('submissions')->latest()->paginate(\App\Models\PortalSetting::paginationSize())]); }
    public function create() { return Inertia::render('Forms/Form'); }
    public function store(Request $r) { $v=$r->validate(['title'=>'required|string|max:255','description'=>'nullable|string','fields'=>'required|array','settings'=>'nullable|array']); $v['slug']=Str::slug($v['title']).'-'.Str::random(6); $v['created_by']=auth()->id(); $v['status']='active'; Form::create($v); return redirect()->route('forms.index')->with('success','Form created.'); }
    public function show(Form $form) { return Inertia::render('Forms/Show', ['form'=>$form->load('integrations'), 'submissions'=>$form->submissions()->latest()->paginate(\App\Models\PortalSetting::paginationSize())]); }
    public function edit(Form $form) { return Inertia::render('Forms/Form', ['form'=>$form]); }
    public function update(Request $r, Form $form) { $v=$r->validate(['title'=>'required|string|max:255','description'=>'nullable|string','fields'=>'required|array','settings'=>'nullable|array','status'=>'nullable|in:active,inactive,archived']); $form->update($v); return redirect()->route('forms.index')->with('success','Form updated.'); }
    public function destroy(Form $form) { $form->delete(); return redirect()->route('forms.index')->with('success','Form deleted.'); }

    // Public form submission endpoint
    public function submit(Request $r, string $slug) {
        $form = Form::where('slug', $slug)->where('status', 'active')->firstOrFail();
        $data = $r->except('_token');
        $sub = FormSubmission::create(['form_id'=>$form->id,'data'=>$data,'ip_address'=>$r->ip(),'user_agent'=>$r->userAgent(),'referrer'=>$r->header('referer'),'submitted_at'=>now()]);
        // Auto-create contact if email field exists
        if(isset($data['email'])) {
            $contact = Contact::firstOrCreate(['email'=>$data['email']], ['first_name'=>$data['name']??$data['first_name']??'Unknown','last_name'=>$data['last_name']??'','source'=>'form','status'=>'lead']);
            $sub->update(['converted_contact_id'=>$contact->id]);
        }
        if($r->wantsJson()) return response()->json(['success'=>true,'message'=>$form->settings['success_message']??'Thank you for your submission!']);
        return back()->with('success', $form->settings['success_message']??'Thank you for your submission!');
    }

    // Embeddable form view
    public function embed(string $slug) { $form = Form::where('slug', $slug)->where('status', 'active')->firstOrFail(); return Inertia::render('Forms/Embed', ['form'=>$form]); }
}
