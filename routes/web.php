<?php

use App\Http\Controllers\Admin\AttendanceReportController;
use App\Http\Controllers\Admin\OfficeSettingsController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\SubscriptionController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\Staff\AttendanceController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\SuperAdmin\CompanyController;
use App\Http\Controllers\SuperAdmin\DashboardController;
use App\Http\Controllers\SuperAdmin\MessageController;
use App\Http\Controllers\SuperAdmin\PlanController;
use App\Http\Controllers\SuperAdmin\SiteController as SuperSiteController;
use App\Http\Controllers\SuperAdmin\SiteFaqController;
use App\Http\Controllers\SuperAdmin\SiteFeatureController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SiteController::class, 'home'])->name('home');
Route::get('/pricing', [SiteController::class, 'pricing'])->name('pricing');

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store'])
        ->middleware('throttle:10,1')
        ->name('login.store');

    Route::post('/contact', [ContactController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('contact.store');
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    // ----- Staff (GPS check in / out) -----
    Route::middleware(['role:staff', 'company.active'])->group(function () {
        Route::get('/attendance', [AttendanceController::class, 'index'])
            ->name('attendance.index');

        Route::get('/attendance/history', [AttendanceController::class, 'history'])
            ->name('attendance.history');

        Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn'])
            ->middleware('throttle:10,1')
            ->name('attendance.check-in');

        Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut'])
            ->middleware('throttle:10,1')
            ->name('attendance.check-out');
    });

    // ----- Company admin -----
    Route::middleware(['role:admin', 'company.active'])
        ->prefix('admin')
        ->name('admin.')
        ->group(function () {
            Route::get('/attendance-report', [AttendanceReportController::class, 'index'])
                ->name('attendance-report');

            Route::get('/attendance-report/map', [AttendanceReportController::class, 'map'])
                ->name('attendance-report.map');

            Route::get('/staff', [StaffController::class, 'index'])->name('staff.index');
            Route::post('/staff', [StaffController::class, 'store'])->name('staff.store');
            Route::delete('/staff/{staff}', [StaffController::class, 'destroy'])->name('staff.destroy');

            Route::get('/subscription', [SubscriptionController::class, 'index'])
                ->name('subscription');

            Route::get('/settings', [OfficeSettingsController::class, 'index'])->name('settings');
            Route::put('/settings', [OfficeSettingsController::class, 'update'])->name('settings.update');
        });

    // ----- Super admin (SaaS owner) -----
    Route::middleware('role:super_admin')
        ->prefix('super')
        ->name('super.')
        ->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

            Route::get('/companies', [CompanyController::class, 'index'])->name('companies.index');
            Route::post('/companies', [CompanyController::class, 'store'])->name('companies.store');
            Route::patch('/companies/{company}/toggle', [CompanyController::class, 'toggle'])->name('companies.toggle');
            Route::patch('/companies/{company}/subscription', [CompanyController::class, 'updateSubscription'])->name('companies.subscription');
            Route::delete('/companies/{company}', [CompanyController::class, 'destroy'])->name('companies.destroy');

            Route::get('/plans', [PlanController::class, 'index'])->name('plans.index');
            Route::post('/plans', [PlanController::class, 'store'])->name('plans.store');
            Route::put('/plans/{plan}', [PlanController::class, 'update'])->name('plans.update');
            Route::delete('/plans/{plan}', [PlanController::class, 'destroy'])->name('plans.destroy');

            Route::get('/site', [SuperSiteController::class, 'index'])->name('site');
            Route::put('/site', [SuperSiteController::class, 'update'])->name('site.update');

            Route::post('/site/features', [SiteFeatureController::class, 'store'])->name('site.features.store');
            Route::put('/site/features/{feature}', [SiteFeatureController::class, 'update'])->name('site.features.update');
            Route::delete('/site/features/{feature}', [SiteFeatureController::class, 'destroy'])->name('site.features.destroy');

            Route::post('/site/faqs', [SiteFaqController::class, 'store'])->name('site.faqs.store');
            Route::put('/site/faqs/{faq}', [SiteFaqController::class, 'update'])->name('site.faqs.update');
            Route::delete('/site/faqs/{faq}', [SiteFaqController::class, 'destroy'])->name('site.faqs.destroy');

            Route::get('/messages', [MessageController::class, 'index'])->name('messages.index');
            Route::patch('/messages/{message}/read', [MessageController::class, 'markRead'])->name('messages.read');
            Route::delete('/messages/{message}', [MessageController::class, 'destroy'])->name('messages.destroy');
        });
});