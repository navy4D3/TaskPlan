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

    public function getItem(int $position): ?array
    {
        foreach ($this->items as $item) {
            if ($item['position'] === $position) {
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

    public function removeItem(int $position): self
    {
        $this->items = array_filter($this->items, fn($i) => $i['position'] !== $position);
        $this->items = array_values($this->items);

        // Recalculer les positions
        foreach ($this->items as $index => &$item) {
            $item['position'] = $index;
        }

        return $this;
    }

    public function setItemStatus(string $position, bool $isDone): self
    {
        $this->items[$position]['isDone'] = $isDone;
        // foreach ($this->items as &$item) {
        //     if ($item['position'] === $position) {
        //         $item['isDone'] = $isDone;
        //         break;
        //     }
        // }

        return $this;
    }

    /**
     * Réordonne les items selon un tableau de contenus
     */
    public function reorderItems(array $newOrder): self
    {
        $orderedItems = [];

        foreach ($newOrder as $newPosition => $oldPosition) {
            if (isset($this->items[$oldPosition])) {
                $item = $this->items[$oldPosition];
                $item['position'] = $newPosition; // mise à jour de la position
                $orderedItems[$newPosition] = $item;
            }
        }

        // On réindexe le tableau proprement
        ksort($orderedItems);
        $this->items = array_values($orderedItems);

        return $this;
    }

    /**
     * Retourne les items triés par position
     */
    
}
