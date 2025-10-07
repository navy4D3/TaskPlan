<?php

namespace App\Controller;

use App\Entity\Project;
use App\Entity\Section;
use App\Entity\Task;
use App\Enum\SectionColor;
use App\Enum\SectionIcon;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ProjectController extends AbstractController
{
    #[Route('/project/{id}', name: 'app_project')]
    public function index($id, EntityManagerInterface $em): Response
    {
        $project = $em->getRepository(Project::class)->find($id);

        $tasks = $em->getRepository(Task::class)->findBy(['project' => $project]);

        // Récupérer les sections et les trier par position
        $sections = $project->getSections()->toArray(); // transforme la Collection en array
        usort($sections, function($a, $b) {
            return $a->getPosition() <=> $b->getPosition(); // ordre croissant
        });

        $tasksBySection = [];

        foreach ($project->getSections() as $section) {
            $tasksBySection[$section->getId()] = $em->getRepository(Task::class)->findBy(
                [
                    'project' => $project,
                    'section' => $section
                ],
                ['position' => 'ASC']
            );
        }

        return $this->render('project/project.html.twig', [
            'project' => $project,
            'sections' => $sections,
            'tasksBySection' => $tasksBySection,
            'colors' => SectionColor::cases(),
            'icons' => SectionIcon::cases(),
        ]);
    }

    #[Route('/add-project', name: 'add_project')]
    public function addProject(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || empty($data['title'])) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Titre manquant'
            ], 400);
        }

        $project = new Project();
        $project->setTitle($data['title']);
        $project->setUser($this->getUser()); // si le projet est lié à l’utilisateur connecté

        $defaultSections = [
            ['position'=> 0,'title' => 'À faire', 'color' => SectionColor::MallowMedium, 'icon' => SectionIcon::LIST],
            ['position'=> 1,'title' => 'En cours', 'color' => SectionColor::YellowSoft, 'icon' => SectionIcon::LOADER],
            ['position'=> 2,'title' => 'Terminé', 'color' => SectionColor::GreenSoft, 'icon' => SectionIcon::CHECK]
        ];
    
        foreach ($defaultSections as $sectionData) {
    
            $section = new Section();

            $section->setPosition($sectionData['position']);
            $section->setTitle($sectionData['title']);
            $section->setColor($sectionData['color']);
            $section->setIcon($sectionData['icon']);
            $section->setProject($project);

            $em->persist($section);
    
            $project->addSection($section);
            
        }
        
        $em->persist($project);
        $em->flush();

        return new JsonResponse([
            'success' => true,
            'project' => [
                'id' => $project->getId(),
                'title' => $project->getTitle()
            ]
        ]);
    }

    #[Route('/sections/reorder', name: 'sections_reorder')]
    public function reorderSections(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $order = $data['order'] ?? [];

        foreach ($order as $position => $sectionId) {
            $section = $em->getRepository(Section::class)->find($sectionId);
            if ($section) {
                $section->setPosition($position);
            }
        }

        $em->flush();

        return new JsonResponse(['success' => true]);
    }

    #[Route('/project/{id}/add-section', name: 'project_add_section')]
    public function addSection(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        $title = $data['title'] ?? null;
        $icon = $data['icon'] ?? null;
        $color = $data['color'] ?? null;

        if (!$title || !$icon || !$color || !$id) {
            return new JsonResponse(['error' => 'Paramètres manquants'], 400);
        }

        $project = $em->getRepository(Project::class)->find($id);
        if (!$project) {
            return new JsonResponse(['error' => 'Projet introuvable'], 404);
        }

        // Conversion en Enum
        try {
            $iconEnum = SectionIcon::from($icon);
            $colorEnum = SectionColor::from($color);
        } catch (\ValueError $e) {
            return new JsonResponse(['error' => 'Invalid enum value'], 400);
        }

        $section = new Section();
        $section->setTitle($title);
        $section->setIcon($iconEnum);
        $section->setColor($colorEnum);
        $section->setProject($project);

        $trashIcon = SectionIcon::from('trash');

        // position par défaut = fin

        $section->setPosition(count($project->getSections())+1);

        $em->persist($section);
        $em->flush();

        return new JsonResponse([
            'success' => true,
            'section' => [
                'id' => $section->getId(),
                'title' => $section->getTitle(),
                'icon' => [
                    'icon' => $section->getIcon()->icon(),
                    'svg' => $section->getIcon()->getSvg(),
                ],
                'color' => [
                    'hex' => $section->getColor()->hex(),
                    'textColor' => $section->getColor()->textColor(),
                ],
                'position' => $section->getPosition(),
                'trashIcon' => [
                    'svg' => $trashIcon->getSvg()
                ]
            ]
        ]);
    }

    #[Route('/delete-section/{id}', name: 'app_section_delete')]
    public function delete($id, EntityManagerInterface $em): JsonResponse
    {
        $section = $em->getRepository(Section::class)->find($id);

        if (!$section) {
            return new JsonResponse(['success' => false, 'message' => 'Section introuvable'], 404);
        }

        // Supprimer toutes les tâches liées
        foreach ($section->getTasks() as $task) {
            $em->remove($task);
        }

        // Supprimer la section
        $em->remove($section);
        $em->flush();

        return new JsonResponse(['success' => true, 'message' => 'Section supprimée avec ses tâches']);
    }



}
