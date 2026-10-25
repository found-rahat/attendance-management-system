<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('designation')->nullable()->after('role');
        });

        Schema::create('staff_salaries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('basic_salary', 12, 2)->default(0);
            $table->decimal('house_rent', 12, 2)->default(0);
            $table->decimal('medical_allowance', 12, 2)->default(0);
            $table->decimal('transport_allowance', 12, 2)->default(0);
            $table->decimal('special_allowance', 12, 2)->default(0);
            $table->date('effective_from');
            $table->string('note')->nullable();
            $table->timestamps();

            $table->unique(['staff_id', 'effective_from']);
        });

        Schema::create('bonus_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->enum('amount_type', ['fixed', 'percent'])->default('fixed');
            $table->decimal('fixed_amount', 12, 2)->default(0);
            $table->decimal('percentage', 5, 2)->default(0);
            $table->string('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('bonuses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('bonus_type_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2)->default(0);
            $table->char('month', 7)->nullable();
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('salary_deductions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained('users')->cascadeOnDelete();
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('reason');
            $table->char('month', 7)->nullable();
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('provident_fund_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->decimal('employee_percent', 5, 2)->default(0);
            $table->decimal('employer_percent', 5, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('provident_funds', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('provident_fund_type_id')->constrained()->cascadeOnDelete();
            $table->date('enrolled_at');
            $table->timestamps();

            $table->unique('staff_id');
        });

        Schema::create('loan_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('description')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'name']);
        });

        Schema::create('staff_loans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('loan_category_id')->constrained()->cascadeOnDelete();
            $table->decimal('amount', 12, 2)->default(0);
            $table->decimal('interest_rate', 5, 2)->default(0);
            $table->decimal('installment_amount', 12, 2)->default(0);
            $table->unsignedInteger('total_installments')->default(0);
            $table->unsignedInteger('paid_installments')->default(0);
            $table->decimal('remaining', 12, 2)->default(0);
            $table->date('granted_at');
            $table->enum('status', ['ongoing', 'closed'])->default('ongoing');
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('staff_loan_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('staff_loan_id')->constrained()->cascadeOnDelete();
            $table->char('month', 7);
            $table->decimal('amount', 12, 2)->default(0);
            $table->timestamps();

            $table->unique(['staff_loan_id', 'month']);
        });

        Schema::create('staff_promotions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained('users')->cascadeOnDelete();
            $table->string('old_designation')->nullable();
            $table->string('new_designation')->nullable();
            $table->decimal('old_salary', 12, 2)->nullable();
            $table->decimal('new_salary', 12, 2)->nullable();
            $table->date('effective_from');
            $table->string('note')->nullable();
            $table->timestamps();
        });

        Schema::create('salary_sheets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->foreignId('staff_id')->constrained('users')->cascadeOnDelete();
            $table->char('month', 7);
            $table->decimal('basic', 12, 2)->default(0);
            $table->decimal('house_rent', 12, 2)->default(0);
            $table->decimal('medical', 12, 2)->default(0);
            $table->decimal('transport', 12, 2)->default(0);
            $table->decimal('special', 12, 2)->default(0);
            $table->decimal('bonus', 12, 2)->default(0);
            $table->decimal('pf_employee', 12, 2)->default(0);
            $table->decimal('pf_employer', 12, 2)->default(0);
            $table->decimal('loan_installment', 12, 2)->default(0);
            $table->decimal('manual_deduction', 12, 2)->default(0);
            $table->decimal('total_earning', 12, 2)->default(0);
            $table->decimal('total_deduction', 12, 2)->default(0);
            $table->decimal('net', 12, 2)->default(0);
            $table->enum('status', ['draft', 'approved', 'paid'])->default('draft');
            $table->date('paid_at')->nullable();
            $table->string('note')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'month', 'staff_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_sheets');
        Schema::dropIfExists('staff_promotions');
        Schema::dropIfExists('staff_loan_installments');
        Schema::dropIfExists('staff_loans');
        Schema::dropIfExists('loan_categories');
        Schema::dropIfExists('provident_funds');
        Schema::dropIfExists('provident_fund_types');
        Schema::dropIfExists('salary_deductions');
        Schema::dropIfExists('bonuses');
        Schema::dropIfExists('bonus_types');
        Schema::dropIfExists('staff_salaries');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('designation');
        });
    }
};
