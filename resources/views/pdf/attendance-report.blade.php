@php
    /** @var \App\Models\Company $company */
    /** @var \Illuminate\Support\Collection<int, \App\Models\StaffAttendance> $rows */
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <title>Attendance Report</title>
    <style>
        * { box-sizing: border-box; }
        body {
            font-family: DejaVu Sans, sans-serif;
            font-size: 10px;
            color: #1f2937;
            margin: 0;
            padding: 24px;
        }
        h1 { font-size: 18px; margin: 0 0 2px; }
        .muted { color: #6b7280; }
        .header { border-bottom: 2px solid #7c3aed; padding-bottom: 10px; margin-bottom: 14px; }
        .meta { margin-top: 6px; font-size: 10px; color: #4b5563; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        th, td { border: 1px solid #e5e7eb; padding: 5px 6px; text-align: left; }
        th { background: #f3f0ff; color: #5b21b6; font-weight: bold; }
        tr:nth-child(even) td { background: #fafafa; }
        .badge { padding: 1px 6px; border-radius: 8px; font-size: 9px; }
        .present { background: #dcfce7; color: #166534; }
        .late { background: #fef3c7; color: #92400e; }
        .absent { background: #fee2e2; color: #991b1b; }
        .outside { color: #b45309; }
        .footer { margin-top: 12px; font-size: 9px; color: #9ca3af; text-align: center; }
        .summary { margin-top: 12px; }
        .summary span { display: inline-block; margin-right: 14px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Attendance Report</h1>
        <div class="muted">{{ $company->name }} — {{ $company->office_name }}</div>
        <div class="meta">
            Period: {{ $from }} to {{ $to }} &nbsp;·&nbsp;
            Total records: {{ $rows->count() }}
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width:22px">#</th>
                <th>Date</th>
                <th>Staff</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Distance</th>
                <th>Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($rows as $index => $row)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $row->date?->format('d M Y') }}</td>
                    <td>{{ $row->staff?->name ?? 'Deleted staff' }}</td>
                    <td>{{ $row->check_in_at?->setTimezone($company->timezone)->format('d M Y h:i A') ?? '—' }}</td>
                    <td>{{ $row->check_out_at?->setTimezone($company->timezone)->format('d M Y h:i A') ?? '—' }}</td>
                    <td>
                        {{ $row->check_in_distance !== null ? round($row->check_in_distance).'m' : '—' }}
                        @if ($row->check_in_outside)
                            <span class="outside">(outside)</span>
                        @endif
                    </td>
                    <td>
                        <span class="badge {{ $row->status }}">{{ ucfirst($row->status) }}</span>
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="7" style="text-align:center; padding:16px;">No attendance records found.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary">
        <span class="badge present">Present: {{ $rows->where('status', 'present')->count() }}</span>
        <span class="badge late">Late: {{ $rows->where('status', 'late')->count() }}</span>
        <span class="badge absent">Outside geofence: {{ $rows->where('check_in_outside', true)->count() }}</span>
    </div>

    <div class="footer">
        Generated at {{ $generatedAt->format('d M Y, h:i A') }} ({{ $company->timezone }})
    </div>
</body>
</html>