<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\Designation;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class DesignationController extends Controller
{
    private function company(Request $request): Company
    {
        $company = $request->user()->company;

        abort_if($company === null, 403, 'No company assigned to this account.');

        return $company;
    }

    public function index(Request $request)
    {
        $company = $this->company($request);

        return Inertia::render('Admin/Designation', [
            'designations' => Designation::query()
                ->where('company_id', $company->id)
                ->withCount('users')
                ->orderByDesc('is_active')
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function store(Request $request)
    {
        $company = $this->company($request);

        $data = $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('designations', 'name')->where('company_id', $company->id),
            ],
        ]);

        Designation::create([
            'company_id' => $company->id,
            'name' => $data['name'],
        ]);

        return back()->with('message', 'Designation added.');
    }

    public function update(Request $request, Designation $designation)
    {
        $company = $this->company($request);
        abort_unless($designation->company_id === $company->id, 403);

        $data = $request->validate([
            'name' => [
                'required', 'string', 'max:255',
                Rule::unique('designations', 'name')
                    ->where('company_id', $company->id)
                    ->ignore($designation->id),
            ],
            'is_active' => ['required', 'boolean'],
        ]);

        $designation->update([
            'name' => $data['name'],
            'is_active' => $data['is_active'],
        ]);

        return back()->with('message', 'Designation updated.');
    }

    public function destroy(Request $request, Designation $designation)
    {
        $company = $this->company($request);
        abort_unless($designation->company_id === $company->id, 403);

        if ($designation->users()->exists()) {
            abort(422, 'এই designation-এ staff assigned আছে। আগে তাদের অন্য designation দিন।');
        }

        $designation->delete();

        return back()->with('message', 'Designation removed.');
    }
}
