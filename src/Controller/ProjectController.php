<?php

namespace App\Controller;

use App\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ProjectController extends AbstractController
{
    #[Route('/project', name: 'app_project')]
    public function index(): Response
    {
        return $this->render('project/index.html.twig', [
            'controller_name' => 'ProjectController',
        ]);
    }

    #[Route('/add-project', name: 'add_project', methods: ['POST'])]
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
