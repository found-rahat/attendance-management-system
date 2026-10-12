<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Office Geofence
    |--------------------------------------------------------------------------
    | Attendance is only accepted when the submitted coordinates fall inside
    | the circle defined by the office center and radius (in meters).
    */
    'office_name' => env('OFFICE_NAME', 'Main Office'),
    'latitude' => (float) env('OFFICE_LATITUDE', 23.7937),
    'longitude' => (float) env('OFFICE_LONGITUDE', 90.4066),
    'radius_meters' => (int) env('OFFICE_RADIUS_METERS', 100),
    'timezone' => env('ATTENDANCE_TIMEZONE', 'Asia/Dhaka'),

    /*
    |--------------------------------------------------------------------------
    | Attendance Rules
    |--------------------------------------------------------------------------
    | Check ins after this local time are marked as "late".
    | Maximum accepted GPS accuracy (in meters) from the client.
    */
    'late_after' => env('ATTENDANCE_LATE_AFTER', '09:15'),
    'max_accuracy_meters' => (int) env('ATTENDANCE_MAX_ACCURACY', 100),

    /*
    |--------------------------------------------------------------------------
    | Subscription
    |--------------------------------------------------------------------------
    | Fallback staff limit applied to companies without a subscription plan.
    */
    'default_staff_limit' => (int) env('ATTENDANCE_DEFAULT_STAFF_LIMIT', 5),
];
