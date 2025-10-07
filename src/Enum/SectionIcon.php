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
    case TRASH = "trash";

    public function icon(): string
    {
        return match($this) {
            self::CHECK => 'bi:check-lg',
            self::LIST => 'bi:list-ul',
            self::PLUS => 'bi:plus-lg',
            self::LOADER => 'lucide:loader',
            self::EDIT => 'mage:edit',
            self::CROSS => 'bi:x-lg',
            self::TRASH => 'tabler:trash',
        };
    }

    public function label(): string
    {
        return $this->value;
    }

    public function getPack(): string
    {
        return explode(':', $this->icon())[0]; // ex: "bi"
    }

    public function getName(): string
    {
        return explode(':', $this->icon())[1]; // ex: "check-circle"
    }

    public function getSvg(): ?string
    {
        $path = __DIR__ . '/../../assets/icons/' . $this->getPack() . '/' . $this->getName() . '.svg';

        if (file_exists($path)) {
            return file_get_contents($path);
        }

        return null;
    }
}