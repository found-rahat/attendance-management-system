<?php

use App\Http\Controllers\Admin\AttendanceReportController;
use App\Http\Controllers\Admin\AttendanceExportController;
use App\Http\Controllers\Admin\OfficeSettingsController;
use App\Http\Controllers\Admin\StaffController;
use App\Http\Controllers\Admin\SubscriptionController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\Staff\AttendanceController;
use App\Http\Controllers\Staff\DashboardController as StaffDashboardController;
use App\Http\Controllers\SiteController;
use App\Http\Controllers\ThemeController;
use App\Http\Controllers\SuperAdmin\CompanyController;use App\Http\Controllers\SuperAdmin\DashboardController;
use App\Http\Controllers\SuperAdmin\MessageController;
use App\Http\Controllers\SuperAdmin\PermissionController;
use App\Http\Controllers\SuperAdmin\PlanController;
use App\Http\Controllers\SuperAdmin\SiteController as SuperSiteController;
use App\Http\Controllers\SuperAdmin\SiteFaqController;
use App\Http\Controllers\SuperAdmin\SiteFeatureController;
use Illuminate\Support\Facades\Route;

Route::get('/', [SiteController::class, 'home'])->name('home');
Route::get('/pricing', [SiteController::class, 'pricing'])->name('pricing');

// Persist the selected colour theme in the session (resets on logout).
Route::post('/theme', [ThemeController::class, 'update'])->name('theme.update');

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
        Route::get('/dashboard', [StaffDashboardController::class, 'index'])
            ->middleware('permission:dashboard.view')
            ->name('staff.dashboard');

        Route::get('/attendance', [AttendanceController::class, 'index'])
            ->middleware('permission:attendance.checkin')
            ->name('attendance.index');

        Route::get('/attendance/history', [AttendanceController::class, 'history'])
            ->middleware('permission:attendance.history')
            ->name('attendance.history');

        Route::post('/attendance/check-in', [AttendanceController::class, 'checkIn'])
            ->middleware(['throttle:10,1', 'permission:attendance.checkin'])
            ->name('attendance.check-in');

        Route::post('/attendance/check-out', [AttendanceController::class, 'checkOut'])
            ->middleware(['throttle:10,1', 'permission:attendance.checkin'])
            ->name('attendance.check-out');
    });

    // ----- Company admin -----
    Route::middleware(['role:admin', 'company.active'])
        ->prefix('admin')
        ->name('admin.')
        ->group(function () {
            Route::get('/attendance-report', [AttendanceReportController::class, 'index'])
                ->middleware('permission:attendance.view')
                ->name('attendance-report');

            Route::get('/attendance-report/export', AttendanceExportController::class)
                ->middleware('permission:attendance.export')
                ->name('attendance-report.export');

            Route::get('/attendance-report/map', [AttendanceReportController::class, 'map'])
                ->middleware('permission:attendance.map')
                ->name('attendance-report.map');

            Route::put('/attendance/{attendance}', [AttendanceReportController::class, 'update'])
                ->middleware('permission:attendance.view')
                ->name('attendance.update');

            Route::get('/staff', [StaffController::class, 'index'])
                ->middleware('permission:staff.view')
                ->name('staff.index');
            Route::post('/staff', [StaffController::class, 'store'])
                ->middleware('permission:staff.create')
                ->name('staff.store');
            Route::delete('/staff/{staff}', [StaffController::class, 'destroy'])
                ->middleware('permission:staff.delete')
                ->name('staff.destroy');

            Route::get('/subscription', [SubscriptionController::class, 'index'])
                ->middleware('permission:subscription.view')
                ->name('subscription');

            Route::get('/settings', [OfficeSettingsController::class, 'index'])
                ->middleware('permission:office.settings')
                ->name('settings');
            Route::put('/settings', [OfficeSettingsController::class, 'update'])
                ->middleware('permission:office.settings')
                ->name('settings.update');
        });

    // ----- Super admin (SaaS owner) -----
    Route::middleware('role:super_admin')
        ->prefix('super')
        ->name('super.')
        ->group(function () {
            Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

            Route::get('/companies', [CompanyController::class, 'index'])
                ->middleware('permission:companies.view')
                ->name('companies.index');
            Route::post('/companies', [CompanyController::class, 'store'])
                ->middleware('permission:companies.create')
                ->name('companies.store');
            Route::patch('/companies/{company}/toggle', [CompanyController::class, 'toggle'])
                ->middleware('permission:companies.update')
                ->name('companies.toggle');
            Route::patch('/companies/{company}/subscription', [CompanyController::class, 'updateSubscription'])
                ->middleware('permission:companies.update')
                ->name('companies.subscription');
            Route::delete('/companies/{company}', [CompanyController::class, 'destroy'])
                ->middleware('permission:companies.delete')
                ->name('companies.destroy');

            Route::get('/plans', [PlanController::class, 'index'])
                ->middleware('permission:plans.view')
                ->name('plans.index');
            Route::post('/plans', [PlanController::class, 'store'])
                ->middleware('permission:plans.manage')
                ->name('plans.store');
            Route::put('/plans/{plan}', [PlanController::class, 'update'])
                ->middleware('permission:plans.manage')
                ->name('plans.update');
            Route::delete('/plans/{plan}', [PlanController::class, 'destroy'])
                ->middleware('permission:plans.manage')
                ->name('plans.destroy');

            Route::get('/permissions', [PermissionController::class, 'index'])
                ->middleware('permission:permissions.manage')
                ->name('permissions.index');
            Route::put('/permissions', [PermissionController::class, 'update'])
                ->middleware('permission:permissions.manage')
                ->name('permissions.update');

            Route::get('/site', [SuperSiteController::class, 'index'])
                ->middleware('permission:content.manage')
                ->name('site');
            Route::put('/site', [SuperSiteController::class, 'update'])
                ->middleware('permission:content.manage')
                ->name('site.update');
            Route::post('/site/logos', [SuperSiteController::class, 'updateLogos'])
                ->middleware('permission:content.manage')
                ->name('site.logos');

            Route::post('/site/features', [SiteFeatureController::class, 'store'])
                ->middleware('permission:content.manage')
                ->name('site.features.store');
            Route::put('/site/features/{feature}', [SiteFeatureController::class, 'update'])
                ->middleware('permission:content.manage')
                ->name('site.features.update');
            Route::delete('/site/features/{feature}', [SiteFeatureController::class, 'destroy'])
                ->middleware('permission:content.manage')
                ->name('site.features.destroy');

            Route::post('/site/faqs', [SiteFaqController::class, 'store'])
                ->middleware('permission:content.manage')
                ->name('site.faqs.store');
            Route::put('/site/faqs/{faq}', [SiteFaqController::class, 'update'])
                ->middleware('permission:content.manage')
                ->name('site.faqs.update');
            Route::delete('/site/faqs/{faq}', [SiteFaqController::class, 'destroy'])
                ->middleware('permission:content.manage')
                ->name('site.faqs.destroy');

            Route::get('/messages', [MessageController::class, 'index'])
                ->middleware('permission:messages.view')
                ->name('messages.index');
            Route::patch('/messages/{message}/read', [MessageController::class, 'markRead'])
                ->middleware('permission:messages.manage')
                ->name('messages.read');
            Route::delete('/messages/{message}', [MessageController::class, 'destroy'])
                ->middleware('permission:messages.manage')
                ->name('messages.destroy');
        });
});