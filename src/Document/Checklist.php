<?php

namespace App\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as MongoDB;

#[MongoDB\Document(collection: "checklists")]
class Checklist
{
    #[MongoDB\Id]
    private ?string $id = null;

    #[MongoDB\Field(type: "string")]
    private string $taskId; // ID de la tâche correspondante (référence à MySQL)

    #[MongoDB\Field(type: "collection")]
    private array $items = []; // Les items de la checklist

    public function getId(): ?string
    {
        return $this->id;
    }

    public function getTaskId(): string
    {
        return $this->taskId;
    }

    public function setTaskId(string $taskId): self
    {
        $this->taskId = $taskId;
        return $this;
    }

    public function getItems(): array
    {
        usort($this->items, fn($a, $b) => $a['position'] <=> $b['position']);
        return $this->items;
    }

    public function setItems(array $items): self
    {
        $this->items = $items;
        return $this;
    }

    public function addItem(string $content): self
    {
        $this->items[] = [
            'position' => count($this->items),
            'content' => $content,
            'isDone' => false
        ];

        return $this;
    }

    public function getItem(string $content): ?array
    {
        foreach ($this->items as $item) {
            if ($item['content'] === $content) {
                return $item;
            }
        }

        return null;
    }

    public function setItem(int $position, string $content, ?bool $isDone = null): self
    {
        if (!isset($this->items[$position])) {
            throw new \InvalidArgumentException("L'item à la position {$position} n'existe pas.");
        }

        $this->items[$position]['content'] = $content;

        if ($isDone !== null) {
            $this->items[$position]['isDone'] = $isDone;
        }

        return $this;
    }

    public function removeItem(string $content): self
    {
        $this->items = array_filter($this->items, fn($i) => $i['content'] !== $content);
        $this->items = array_values($this->items);

        // Recalculer les positions
        foreach ($this->items as $index => &$item) {
            $item['position'] = $index;
        }

        return $this;
    }

    public function setItemStatus(string $content, bool $isDone): self
    {
        foreach ($this->items as &$item) {
            if ($item['content'] === $content) {
                $item['isDone'] = $isDone;
                break;
            }
        }

        return $this;
    }

    /**
     * Réordonne les items selon un tableau de contenus
     */
    public function reorderItems(array $newOrder): self
    {
        $orderedItems = [];
        foreach ($newOrder as $index => $content) {
            foreach ($this->items as $item) {
                if ($item['content'] === $content) {
                    $item['position'] = $index;
                    $orderedItems[] = $item;
                    break;
                }
            }
        }
        $this->items = $orderedItems;
        return $this;
    }

    /**
     * Retourne les items triés par position
     */
    
}
