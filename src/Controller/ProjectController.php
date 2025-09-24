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
            $tasksBySection[$section->getId()] = $em->getRepository(Task::class)->findBy([
                'project' => $project,
                'section' => $section
            ]);
        }

        return $this->render('project/project.html.twig', [
            'project' => $project,
            'sections' => $sections,
            'tasksBySection' => $tasksBySection,
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
            $section = $em->getRepository(Section::class)->findOneBy($sectionData);
    
            if (!$section) {
                $section = new Section();

                $section->setPosition($sectionData['position']);
                $section->setTitle($sectionData['title']);
                $section->setColor($sectionData['color']);
                $section->setIcon($sectionData['icon']);

                $em->persist($section);
            }
    
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
}
