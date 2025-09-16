<?php
// src/Document/Notification.php
namespace App\Document;

use Doctrine\ODM\MongoDB\Mapping\Annotations as ODM;

#[ODM\Document]
class Checklist
{
    #[ODM\Id]
    private string $id;

    #[ODM\Field(type: 'string')]
    private string $taskId;

    #[ODM\Field(type: 'string')]
    private string $title;

    #[ODM\Field(type: 'bool')]
    private bool $isDone;

    public function __construct(string $userId, string $message, string $isDone)
    {
        $this->taskId = $userId;
        $this->title = $message;
        $this->isDone = $isDone;
    }

    // getters/setters...
}
