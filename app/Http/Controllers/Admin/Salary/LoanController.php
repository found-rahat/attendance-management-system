<?php

namespace App\Http\Controllers\Admin\Salary;

use App\Http\Controllers\Controller;
use App\Models\Company;
use App\Models\LoanCategory;
use App\Models\StaffLoan;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LoanController extends Controller
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

        LoanCategory::advanceFor($company->id);

        $categoryFilter = $request->query('category');

        return Inertia::render('Admin/Salary/Loan', [
            'categories' => LoanCategory::query()
                ->where('company_id', $company->id)
                ->orderBy('name')
                ->get(),
            'loans' => StaffLoan::query()
                ->where('company_id', $company->id)
                ->with(['staff:id,name,email', 'category:id,name'])
                ->when($categoryFilter, fn ($q) => $q->where('loan_category_id', $categoryFilter))
                ->latest()
                ->limit(75)
                ->get(),
            'staff' => User::query()
                ->where('company_id', $company->id)
                ->where('role', User::ROLE_STAFF)
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'today' => now()->format('Y-m-d'),
        ]);
    }

    public function storeCategory(Request $request)
    {
        $company = $this->company($request);

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255', Rule::unique('loan_categories')->where('company_id', $company->id)],
            'description' => ['nullable', 'string', 'max:255'],
        ]);

        LoanCategory::create([
            'company_id' => $company->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
        ]);

        return back()->with('message', 'Loan category added.');
    }

    public function destroyCategory(Request $request, LoanCategory $category)
    {
        $company = $this->company($request);
        abort_unless($category->company_id === $company->id, 403);

        if ($category->loans()->exists()) {
            abort(422, 'এই category-র অধীনে loan আছে। আগে সেগুলো মুছুন।');
        }

        $category->delete();

        return back()->with('message', 'Loan category removed.');
    }

    public function store(Request $request)
    {
        $company = $this->company($request);

        $data = $request->validate([
            'staff_id' => ['required', 'integer', Rule::exists('users', 'id')->where('company_id', $company->id)],
            'loan_category_id' => ['required', 'integer', Rule::exists('loan_categories', 'id')->where('company_id', $company->id)],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'interest_rate' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'installment_amount' => ['nullable', 'numeric', 'min:1'],
            'total_installments' => ['nullable', 'integer', 'min:1'],
            'granted_at' => ['required', 'date'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        if (empty($data['installment_amount']) && empty($data['total_installments'])) {
            return back()
                ->withErrors(['installment_amount' => 'installment amount বা installment সংখ্যা যেকোনো একটা দিন।'])
                ->withInput();
        }

        $staff = User::findOrFail($data['staff_id']);
        abort_unless($staff->isStaff() && $staff->company_id === $company->id, 403);

        $amount = (float) $data['amount'];

        if (! empty($data['installment_amount'])) {
            $installment = (float) $data['installment_amount'];
            $total = (int) ceil($amount / $installment);
        } else {
            $total = (int) $data['total_installments'];
            $installment = round($amount / $total, 2);
        }

        StaffLoan::create([
            'company_id' => $company->id,
            'staff_id' => $staff->id,
            'loan_category_id' => $data['loan_category_id'],
            'amount' => $amount,
            'interest_rate' => $data['interest_rate'] ?? 0,
            'installment_amount' => $installment,
            'total_installments' => $total,
            'paid_installments' => 0,
            'remaining' => $amount,
            'granted_at' => $data['granted_at'],
            'status' => 'ongoing',
            'note' => $data['note'] ?? null,
        ]);

        return back()->with('message', 'Loan / advance added. Salary sheet generate করলে মাসিক kist auto কেটে যাবে.');
    }

    public function close(Request $request, StaffLoan $loan)
    {
        $company = $this->company($request);
        abort_unless($loan->company_id === $company->id, 403);

        $loan->update([
            'status' => 'closed',
            'remaining' => 0,
        ]);

        return back()->with('message', 'Loan marked as closed.');
    }

    public function destroy(Request $request, StaffLoan $loan)
    {
        $company = $this->company($request);
        abort_unless($loan->company_id === $company->id, 403);

        $loan->delete();

        return back()->with('message', 'Loan record removed.');
    }
}
