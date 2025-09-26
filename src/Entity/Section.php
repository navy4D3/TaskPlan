<?php

namespace App\Entity;

use App\Enum\SectionColor;
use App\Enum\SectionIcon;
use App\Repository\SectionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: SectionRepository::class)]
class Section
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $title = null;

    #[ORM\Column(enumType: SectionIcon::class)]
    private ?SectionIcon $icon = null;

    #[ORM\Column(enumType: SectionColor::class)]
    private ?SectionColor $color = null;

    // /**
    //  * @var Collection<int, Project>
    //  */
    // #[ORM\ManyToOne(targetEntity: Project::class, inversedBy: 'tasks')]
    // private Collection $projects;
    #[ORM\ManyToOne(inversedBy: 'sections')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Project $project = null;

    /**
     * @var Collection<int, Task>
     */
    #[ORM\OneToMany(targetEntity: Task::class, mappedBy: 'section')]
    private Collection $tasks;

    #[ORM\Column]
    private ?int $position = null;

    public function __construct()
    {
        // $this->projects = new ArrayCollection();
        $this->tasks = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getIcon(): ?SectionIcon
    {
        return $this->icon;
    }

    public function setIcon(SectionIcon $icon): static
    {
        $this->icon = $icon;

        return $this;
    }

    public function getColor(): ?SectionColor
    {
        return $this->color;
    }

    public function setColor(SectionColor $color): static
    {
        $this->color = $color;

        return $this;
    }

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): static
    {
        $this->project = $project;

        return $this;
    }

    // /**
    //  * @return Collection<int, Project>
    //  */
    // public function getProjects(): Collection
    // {
    //     return $this->projects;
    // }

    // public function addProject(Project $project): static
    // {
    //     if (!$this->projects->contains($project)) {
    //         $this->projects->add($project);
    //         $project->addSection($this);
    //     }

    //     return $this;
    // }

    // public function removeProject(Project $project): static
    // {
    //     if ($this->projects->removeElement($project)) {
    //         $project->removeSection($this);
    //     }

    //     return $this;
    // }

    /**
     * @return Collection<int, Task>
     */
    public function getTasks(): Collection
    {
        return $this->tasks;
    }

    public function addTask(Task $task): static
    {
        if (!$this->tasks->contains($task)) {
            $this->tasks->add($task);
            $task->setSection($this);
        }

        return $this;
    }

    public function removeTask(Task $task): static
    {
        if ($this->tasks->removeElement($task)) {
            // set the owning side to null (unless already changed)
            if ($task->getSection() === $this) {
                $task->setSection(null);
            }
        }

        return $this;
    }

    public function getPosition(): ?int
    {
        return $this->position;
    }

    public function setPosition(int $position): static
    {
        $this->position = $position;

        return $this;
    }
}
