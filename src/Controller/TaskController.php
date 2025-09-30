<?php

namespace App\Controller;

use App\Document\Checklist;
use App\Entity\Project;
use App\Entity\Section;
use App\Entity\Task;
use Doctrine\ODM\MongoDB\DocumentManager;
use Doctrine\ORM\EntityManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class TaskController extends AbstractController
{
    #[Route('/task/get-data/{id}', name: 'task_get_data')]
    public function updateTask(string $id, Request $request, EntityManagerInterface $em, DocumentManager $dm): JsonResponse {

        $task = $em->getRepository(Task::class)->find($id);

        if (!$task) {
            return new JsonResponse(['error' => 'Tâche introuvable'], 404);
        }

        $checklist = $dm->getRepository(Checklist::class)->findOneBy(['taskId' => $id]);

        $checklistArray = $checklist ? [
            'id' => $checklist->getId(),
            'items' => $checklist->getItems(),
        ] : [];

        // completer pour recuperer la liste des checklists

        return new JsonResponse([
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'description' => $task->getDescription(),
            'checklist' => $checklistArray
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
        $currentProject = $em->getRepository(Project::class)->find($data['projectId']);

        $task->setTitle($data['title']);
        $task->setProject($currentProject);
        
        $task->setSection($em->getRepository(Section::class)->find($data['sectionId']));
        $task->setIsDone(false);
        $task->setPosition(count($currentProject->getTasks()));

        
        
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

    #[Route('/delete-task/{id}', name: 'delete_task', methods: ['POST'])]
    public function deleteTask(int $id, EntityManagerInterface $em): JsonResponse
    {
        $task = $em->getRepository(Task::class)->find($id);

        if (!$task) {
            return new JsonResponse(['error' => 'Tâche introuvable'], 404);
        }

        $em->remove($task);
        $em->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'Tâche supprimée avec succès',
            'id' => $id,
        ]);
    }

    #[Route('/task/{taskId}/update-description', name: 'update_task_description')]
    public function updateDescription(int $taskId, EntityManagerInterface $em, Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $newDescription = $data['description'] ?? [];

        $task = $em->getRepository(Task::class)->find($taskId);

        if (!$task) {
            return new JsonResponse(['error' => 'Tâche introuvable'], 404);
        }

        $task->setDescription($newDescription);

        $em->flush();

        return new JsonResponse([
            'success' => true,
            'message' => 'Description mise à jour',
        ]);
    }

    #[Route('/reorder-tasks', name: 'task_reorder', methods: ['POST'])]
    public function reorderTasks(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $order = $data['order'] ?? [];

        foreach ($order as $position => $taskId) {
            $task = $em->getRepository(Task::class)->find($taskId);

            if (!$task) {
                return new JsonResponse(
                    ['error' => 'Tâche introuvable dans reorder'],
                    JsonResponse::HTTP_NOT_FOUND
                );
            }
            
            $task->setPosition($position);
        }

        $em->flush();
        return new JsonResponse(['success' => true]);
    }


    #[Route('/task/{taskId}/checklist', name: 'get_checklist', methods: ['GET'])]
    public function getChecklist(string $taskId, DocumentManager $dm): JsonResponse
    {
        $checklists = $dm->getRepository(Checklist::class)->findBy(['taskId' => $taskId]);

        $result = array_map(fn(Checklist $c) => [
            'id' => $c->getId(),
            'items' => $c->getItems()
        ], $checklists);

        return new JsonResponse($result);
    }

    #[Route('/task/{taskId}/checklist/add/{text}', name: 'add_checklist')]
    public function addChecklist(string $taskId, string $text, DocumentManager $dm): JsonResponse
    {

        $checklist = $dm->getRepository(Checklist::class)->findOneBy(['taskId' => $taskId]);

        if (!$checklist) {
            $checklist = new Checklist();
            $checklist->setTaskId($taskId);
        }

        $checklist->addItem($text);
        $dm->persist($checklist);
        $dm->flush();
        
        

        // $result = array_map(fn(Checklist $c) => [
        //     'id' => $c->getId(),
        //     'items' => $c->getItems()
        // ], $checklists);

        return new JsonResponse([
            'status' => 'success',
            'message' => 'Ajout réussi',
            'items' => $checklist->getItems()
        ]);
    }

    #[Route('/task/{taskId}/checklist/reorder', name: 'checklist_reorder')]
    public function reorderChecklist(string $taskId, Request $request, EntityManagerInterface $em, DocumentManager $dm): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $order = $data['order'] ?? [];

        if (empty($order)) {
            return new JsonResponse(['error' => 'Aucun ordre fourni'], JsonResponse::HTTP_BAD_REQUEST);
        }
    
        // On récupère le document Checklist associé à la tâche
        $checklist = $dm->getRepository(Checklist::class)->findOneBy(['taskId' => $taskId]);
    
        if (!$checklist) {
            return new JsonResponse(['error' => 'Checklist introuvable'], JsonResponse::HTTP_NOT_FOUND);
        }
    
        // Réordonner les items avec la méthode du Document
        $checklist->reorderItems($order);
    
        $dm->flush();
        return new JsonResponse(['success' => true]);
    }

    #[Route('/task/{taskId}/checklist/update-item', name: 'checklist_update_item')]
    public function updateChecklistItem(string $taskId, Request $request, DocumentManager $dm): JsonResponse|Response
    {
        $data = json_decode($request->getContent(), true);
        $checklistPosition = intval($data['checklistPosition']) ?? null;
        $newContent = $data['content'] ?? null;
        // return new Response($newContent);
        // if (!$checklistPosition || !$newContent) {
        //     return new JsonResponse(['error' => 'Paramètres manquants'], 400);
        // }


        $checklist = $dm->getRepository(Checklist::class)->findOneBy(['taskId' => $taskId]);

        if (!$checklist || $checklist->getTaskId() !== $taskId) {
            return new JsonResponse(['error' => 'Checklist introuvable'], 404);
        }

        $checklist->setItem($checklistPosition, $newContent, $checklist->getItem($checklistPosition)['isDone']);
        $dm->flush();

        return new JsonResponse(['success' => true, 'content' => $newContent]);
    }

    #[Route('/task/{taskId}/checklist/remove-item', name: 'checklist_remove_item')]
    public function removeChecklistItem(string $taskId, Request $request, EntityManagerInterface $em, DocumentManager $dm): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $itemPosition = $data['itemPosition'] ?? null;

        if ($itemPosition === null) {
            return new JsonResponse(['success' => false, 'error' => 'Position manquante'], 400);
        }

        $task = $em->getRepository(Task::class)->find($taskId);

        if (!$task) {
            return new JsonResponse(['success' => false, 'error' => 'Tâche introuvable'], 404);
        }

        $checklist = $dm->getRepository(Checklist::class)->findOneBy(['taskId' => $taskId]);

        $checklist->removeItem($itemPosition);

        $dm->flush();

        return new JsonResponse(['success' => true, 'message' => 'Item supprimé']);
    }



    #[Route('/task/move', name: 'task_move', methods: ['POST'])]
    public function moveTask(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        if (!isset($data['newSectionId'], $data['order'])) {
            return new JsonResponse(['error' => 'Données invalides'], 400);
        }
    
        $section = $em->getRepository(Section::class)->find($data['newSectionId']);
        if (!$section) {
            return new JsonResponse(['error' => 'Section introuvable'], 404);
        }
    
        foreach ($data['order'] as $position => $taskId) {
            $task = $em->getRepository(Task::class)->find($taskId);
            if ($task) {
                $task->setPosition($position);
                $task->setSection($section); // important pour les déplacements inter-sections
            }
        }
    
        $em->flush();
    
        return new JsonResponse(['status' => 'ok']);
    }




}
