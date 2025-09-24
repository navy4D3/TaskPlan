<?php

namespace App\Enum;

enum SectionIcon: string
{
    case CHECK = 'check';
    case LIST = 'list';
    case PLUS = 'plus';
    case LOADER = 'loader';
    case EDIT = "edit";
    case CROSS = "cross";

    public function icon(): string
    {
        return match($this) {
            self::CHECK => 'bi:check-lg',
            self::LIST => 'bi:list-ul',
            self::PLUS => 'bi:plus-lg',
            self::LOADER => 'lucide:loader',
            self::EDIT => 'mage:edit',
            self::CROSS => 'bi:x',
        };
    }

    public function label(): string
    {
        return $this->value;
    }
}