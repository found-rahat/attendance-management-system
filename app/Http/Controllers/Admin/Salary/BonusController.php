<?php

namespace App\Http\Controllers\Admin\Salary;

use App\Http\Controllers\Controller;
use App\Models\Bonus;
use App\Models\BonusType;
use App\Models\Company;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class BonusController extends Controller
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

        return Inertia::render('Admin/Salary/Bonus', [
            'types' => BonusType::query()
                ->where('company_id', $company->id)
                ->orderByDesc('is_active')
                ->orderBy('name')
                ->get(),
            'bonuses' => Bonus::query()
                ->where('company_id', $company->id)
                ->with(['staff:id,name,email', 'type:id,name,amount_type'])
                ->latest()
                ->limit(75)
                ->get(),
            'staff' => User::query()
                ->where('company_id', $company->id)
                ->where('role', User::ROLE_STAFF)
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'today' => now()->format('Y-m'),
        ]);
    }

    public function storeType(Request $request)
    {
        $company = $this->company($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'amount_type' => ['required', 'in:fixed,percent'],
            'fixed_amount' => ['nullable', 'numeric', 'min:0'],
            'percentage' => ['nullable', 'numeric', 'min:0', 'max:999'],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        BonusType::create([
            'company_id' => $company->id,
            'name' => $data['name'],
            'amount_type' => $data['amount_type'],
            'fixed_amount' => $data['fixed_amount'] ?? 0,
            'percentage' => $data['percentage'] ?? 0,
            'description' => $data['description'] ?? null,
        ]);

        return back()->with('message', 'Bonus type added.');
    }

    public function updateType(Request $request, BonusType $type)
    {
        $company = $this->company($request);
        abort_unless($type->company_id === $company->id, 403);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'amount_type' => ['required', 'in:fixed,percent'],
            'fixed_amount' => ['nullable', 'numeric', 'min:0'],
            'percentage' => ['nullable', 'numeric', 'min:0', 'max:999'],
            'description' => ['nullable', 'string', 'max:255'],
            'is_active' => ['required', 'boolean'],
        ]);

        $type->update([
            'name' => $data['name'],
            'amount_type' => $data['amount_type'],
            'fixed_amount' => $data['fixed_amount'] ?? 0,
            'percentage' => $data['percentage'] ?? 0,
            'description' => $data['description'] ?? null,
            'is_active' => $data['is_active'],
        ]);

        return back()->with('message', 'Bonus type updated.');
    }

    public function destroyType(Request $request, BonusType $type)
    {
        $company = $this->company($request);
        abort_unless($type->company_id === $company->id, 403);

        if ($type->bonuses()->exists()) {
            abort(422, 'এই bonus type-এর সাথে bonus list আছে। আগে সেগুলো মুছুন।');
        }

        $type->delete();

        return back()->with('message', 'Bonus type removed.');
    }

    public function store(Request $request)
    {
        $company = $this->company($request);

        $data = $request->validate([
            'staff_id' => ['required', 'integer', Rule::exists('users', 'id')->where('company_id', $company->id)],
            'bonus_type_id' => ['required', 'integer', Rule::exists('bonus_types', 'id')->where('company_id', $company->id)],
            'month' => ['nullable', 'regex:/^\d{4}-\d{2}$/'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $type = BonusType::findOrFail($data['bonus_type_id']);
        $staff = User::findOrFail($data['staff_id']);
        abort_unless($staff->isStaff() && $staff->company_id === $company->id, 403);

        Bonus::create([
            'company_id' => $company->id,
            'staff_id' => $staff->id,
            'bonus_type_id' => $type->id,
            'amount' => $type->amountFor($staff->id, $data['month'] ?? now()->format('Y-m')),
            'month' => $data['month'],
            'note' => $data['note'] ?? null,
        ]);

        return back()->with('message', 'Bonus assigned.');
    }

    public function destroy(Request $request, Bonus $bonus)
    {
        $company = $this->company($request);
        abort_unless($bonus->company_id === $company->id, 403);

        $bonus->delete();

        return back()->with('message', 'Bonus record removed.');
    }
}
