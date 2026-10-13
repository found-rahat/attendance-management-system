<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Default Website Content
    |--------------------------------------------------------------------------
    | These values are editable by the super admin from the dashboard. They are
    | used as defaults and overridden by the single `site_contents` row,
    | while `landing_features` and `landing_faqs` supply the curated lists.
    */
    'defaults' => [
        'brand_name' => '',
        'hero_title' => 'অফিসের উপস্থিতি, location-verified',
        'hero_subtitle' => 'Staff শুধু অফিসের ভেতরে থেকেই Check In / Check Out করতে পারবে। Real-time map, automated report ও multi-company support — সব একটাই system-এ।',
        'contact_email' => 'hello@attendly.app',
        'contact_phone' => '+880 1000-000000',
        'contact_address' => 'Dhaka, Bangladesh',
        'cta_heading' => 'আজই আপনার attendance digital করুন',
        'cta_subtext' => 'Login করে ডেমো account দিয়ে পুরো system ঘুরে দেখুন।',
        'footer_text' => 'GPS Staff Attendance System',

        'features' => [
            ['icon' => '📍', 'title' => 'GPS Geofence Check-in', 'text' => 'Check In / Check Out শুধু অফিসের নির্দিষ্ট radius-এর ভেতরে। বাইরে থেকে কোনো attendance নেওয়া হবে না।'],
            ['icon' => '🗺️', 'title' => 'Live Location Map', 'text' => 'প্রতিদিন কে কোথান থেকে attendance দিয়েছে তা interactive map-এ দেখুন — check-in ও check-out উভয় location সহ।'],
            ['icon' => '📄', 'title' => 'Smart Reports', 'text' => 'Date, staff ও status অনুযায়ী filter করে present, late ও override report এক ক্লিকেই বের করুন।'],
            ['icon' => '🏢', 'title' => 'Multi-Company (SaaS)', 'text' => 'একটি platform থেকে অনেক company চালান। প্রতিটি company-র নিজস্ব office, admin ও staff থাকবে।'],
            ['icon' => '👥', 'title' => 'Staff Management', 'text' => 'Admin নিজেই staff যোগ বা remove করতে পারবে — কোনো developer লাগবে না।'],
            ['icon' => '📱', 'title' => 'Mobile Friendly', 'text' => 'নিজের মোবাইল থেকে location দিয়েই attendance দিন। Design পুরোপুরি responsive।'],
        ],

        'faqs' => [
            ['q' => 'Plan পরিবর্তন করা যাবে?', 'a' => 'হ্যাঁ। Staff সংখ্যা বাড়লে বা কমলে যেকোনো সময় plan upgrade বা downgrade করা যাবে।'],
            ['q' => 'দাম কখনো বাড়বে কি?', 'a' => 'না। বর্তমান plan-এর দাম আপনার subscription period পর্যন্ত অপরিবর্তিত থাকবে।'],
            ['q' => 'Payment কীভাবে করব?', 'a' => 'আপাতত plan assign করা হয় manually। Payment gateway (bKash/Nagad/card) শীঘ্রই যুক্ত হবে।'],
            ['q' => 'Staff limit ছাড়িয়ে গেলে?', 'a' => 'Limit পূর্ণ হলে নতুন staff যোগ করা বন্ধ হবে — কোনো বাড়তি চার্জ নয়, plan upgrade করলেই চলবে।'],
        ],
    ],
];
