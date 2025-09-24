<?php

namespace App\Controller;

use App\Entity\Project;
use App\Entity\Section;
use App\Entity\Task;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class TaskController extends AbstractController
{
    #[Route('/task', name: 'app_task')]
    public function index(): Response
    {
        return $this->render('task/index.html.twig', [
            'controller_name' => 'TaskController',
        ]);
    }

    #[Route('/add-task', name: 'add_task')]
    public function addTask(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!$data || empty($data['title'])) {
            return new JsonResponse([
                'success' => false,
                'message' => 'Données manquante'
            ], 400);
        }

        $task = new Task();
        $task->setTitle($data['title']);
        $task->setProject($em->getRepository(Project::class)->find($data['projectId']));

        $task->setSection($em->getRepository(Section::class)->find($data['sectionId']));
        $task->setIsDone(false);
        
        $em->persist($task);
        $em->flush();

        return new JsonResponse([
            'success' => true,
            'task' => [
                'id' => $task->getId(),
                'title' => $task->getTitle()
            ]
        ]);
    }
}
