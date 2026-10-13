<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * Single-row storage of the marketing site's scalar content.
 */
#[Fillable([
    'brand_name',
    'logo_dark',
    'logo_light',
    'favicon',
    'hero_title',
    'hero_subtitle',
    'contact_email',
    'contact_phone',
    'contact_address',
    'cta_heading',
    'cta_subtext',
    'footer_text',
])]
class SiteContent extends Model
{
    /**
     * Scalar columns of the editable site content.
     *
     * @var array<int, string>
     */
    public const COLUMNS = [
        'brand_name',
        'logo_dark',
        'logo_light',
        'favicon',
        'hero_title',
        'hero_subtitle',
        'contact_email',
        'contact_phone',
        'contact_address',
        'cta_heading',
        'cta_subtext',
        'footer_text',
    ];

    /**
     * Columns that hold an uploaded logo file rather than plain text.
     *
     * @var array<int, string>
     */
    public const LOGO_COLUMNS = ['logo_dark', 'logo_light', 'favicon'];

    /**
     * The single content row, created on first access.
     */
    public static function current(): self
    {
        return static::query()->orderBy('id')->first() ?? static::create([]);
    }

    /**
     * Effective site content, blank columns falling back to config defaults.
     *
     * @return array<string, string|null>
     */
    public static function allWithDefaults(): array
    {
        $row = static::query()->orderBy('id')->first();

        $values = $row ? $row->only(self::COLUMNS) : [];

        return array_merge(
            config('site.defaults', []),
            array_filter($values, fn ($value) => $value !== null),
        );
    }

    public static function get(string $field, ?string $default = null): ?string
    {
        $row = static::query()->orderBy('id')->first();

        return $row?->{$field} ?? $default;
    }

    /**
     * Full content payload for the public pages: scalar content plus the
     * relational features and FAQs.
     *
     * @return array<string, mixed>
     */
    public static function landing(): array
    {
        return array_merge(static::allWithDefaults(), [
            'features' => LandingFeature::query()
                ->ordered()
                ->get(['icon', 'title', 'text'])
                ->toArray(),
            'faqs' => LandingFaq::query()
                ->ordered()
                ->get(['question', 'answer'])
                ->map(fn (LandingFaq $faq) => [
                    'q' => $faq->question,
                    'a' => $faq->answer,
                ])
                ->all(),
        ]);
    }
}