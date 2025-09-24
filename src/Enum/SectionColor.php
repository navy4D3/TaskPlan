<?php

namespace App\Enum;

enum SectionColor: string
{
    case MallowBlack = 'Mallow Black';
    case MallowMediumBlack = 'Mallow Medium Black';
    case MallowMediumClean = 'Mallow Medium Clean';
    case MallowMedium = 'Mallow Medium';
    case MallowMediumWhite = 'Mallow Medium White';
    case MallowWhite = 'Mallow White';
    case Transparent = 'Transparent';
    case RedSoft = 'Red Soft';
    case YellowSoft = 'Yellow Soft';
    case GreenSoft = 'Green Soft';

    public function label(): string
    {
        return match($this) {
            self::MallowBlack => 'Mallow Black',
            self::MallowMediumBlack => 'Mallow Medium Black',
            self::MallowMediumClean => 'Mallow Medium Clean',
            self::MallowMedium => 'Mallow Medium',
            self::MallowMediumWhite => 'Mallow Medium White',
            self::MallowWhite => 'Mallow White',
            self::Transparent => 'Transparent',
            self::RedSoft => 'Red Soft',
            self::YellowSoft => 'Yellow Soft',
            self::GreenSoft => 'Green Soft',
        };
    }

    public function hex(): string
    {
        return match($this) {
            self::MallowBlack => '#2E294E',
            self::MallowMediumBlack => '#5B30B7',
            self::MallowMediumClean => '#6A5FB4',
            self::MallowMedium => '#7371FC',
            self::MallowMediumWhite => '#D8DCFF',
            self::MallowWhite => '#F7F7FF',
            self::Transparent => '#F7F7FF00',
            self::RedSoft => '#FE5F55',
            self::YellowSoft => '#EDF060',
            self::GreenSoft => '#C3F73A',
        };
    }

    public function textColor(): string
    {
        return match($this) {
            // couleurs foncées -> texte blanc
            self::MallowBlack,
            self::MallowMediumBlack,
            self::MallowMediumClean,
            self::MallowMedium,
            self::RedSoft => SectionColor::MallowWhite->hex(),

            // couleurs claires -> texte violet moyen
            self::MallowMediumWhite,
            self::MallowWhite,
            self::Transparent,
            self::YellowSoft,
            self::GreenSoft => SectionColor::MallowMedium->hex(),
        };
    }
}
