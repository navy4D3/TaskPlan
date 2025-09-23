<?php

namespace App\Controller;

use App\Document\Checklist;
use App\Entity\User;
use App\Form\EditMailType;
use App\Form\EditPasswordType;
use App\Form\MyDataType;
use App\Service\FormService;
use Doctrine\ODM\MongoDB\DocumentManager;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

final class UserController extends AbstractController
{
    #[Route('/profil', name: 'profil')]
    public function index(Security $security, DocumentManager $documentManager): Response
    {
        $user = $security->getUser();
        $myDataForm = $this->createForm(MyDataType::class, $user);
        $editMailForm = $this->createForm(EditMailType::class, $user);
        $editPasswordForm = $this->createForm(EditPasswordType::class, $user);

        // $checklist = new Checklist($userId, $message, $isDone);
        // $documentManager->persist($checklist);
        // $documentManager->flush();

        return $this->render('user/profil.html.twig', [
            "myDataForm" => $myDataForm,
            "editMailForm" => $editMailForm,
            "editPasswordForm" => $editPasswordForm,
        ]);
    }

    #[Route('/user/edit-data', name: 'user_edit_data')]
    public function editData(Request $request, EntityManagerInterface $em): JsonResponse
    {
        
        
        $user = $this->getUser();

        if (!$user instanceof User) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ]);
        }

        $form = $this->createForm(MyDataType::class, $user);
        $form->handleRequest($request);
        $errors = $form->getErrors(true);
        $errorsArray = [];

        foreach ($errors as $error) {
            $errorsArray[] = $error->getMessage();
        }

        if ($form->isSubmitted() && $form->isValid()) {
            $user = $form->getData();

            $em->persist($user);
            $em->flush();

            return new JsonResponse([
                'status' => 'success',
                'message' => 'Données utilisateur modifiées',
                'user' => [
                    'nom' => $form->get('nom')->getData(),
                    'prenom' => $form->get('prenom')->getData(),
                ]
            ]);
        }

        return new JsonResponse([
            'status' => 'error',
            'message' => json_encode($errorsArray),
            'user' => $user
        ]);
    }

    #[Route('/user/edit-mail', name: 'user_edit_mail')]
    public function editMail(Request $request, EntityManagerInterface $em, FormService $formService): JsonResponse|Response
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], 403);
        }

        $form = $this->createForm(EditMailType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            if ($form->isValid()) {

                $em->persist($user);
                $em->flush();
    
                return new JsonResponse([
                    'status' => 'success',
                    'message' => 'Email modifié avec succès',
                ]);
            } else {
                $errors = $formService->convertFormErrorsToJson($form);

                return new JsonResponse([
                    'status' => 'error',
                    'errors' => $errors,
                ]);
            }
        }

        return new Response('Erreur inconnue');
        
    }


    #[Route('/user/edit-password', name: 'user_edit_password')]
    public function editPassword(
        Request $request, 
        EntityManagerInterface $em, 
        UserPasswordHasherInterface $passwordHasher,
        FormService $formService
    ): JsonResponse {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], 403);
        }

        $form = $this->createForm(EditPasswordType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted()) {
            if ($form->isValid()) {
                // Récupérer le nouveau mot de passe depuis le form
                $plainPassword = $form->get('password')->getData();

                // Encoder le mot de passe
                $hashedPassword = $passwordHasher->hashPassword($user, $plainPassword);
                $user->setPassword($hashedPassword);

                $em->persist($user);
                $em->flush();
    
                return new JsonResponse([
                    'status' => 'success',
                    'message' => 'Email modifié avec succès',
                ]);
            } else {
                $errors = $formService->convertFormErrorsToJson($form);

                return new JsonResponse([
                    'status' => 'error',
                    'errors' => $errors,
                ]);
            }
        }

        return new Response('Erreur inconnue');
    }

    #[Route('/delete-account', name: 'user_delete_account')]
    public function deleteAccount(EntityManagerInterface $em, Security $security): JsonResponse|Response
    {
        $user = $this->getUser();

        if (!$user instanceof User) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Utilisateur non authentifié'
            ], 403);
        }
    
        try {
            $em->remove($user);
            $em->flush();
    
            // Déconnexion manuelle de l'utilisateur après suppression
            $security->logout(false);
    
            return $this->redirectToRoute('home');
        } catch (\Exception $e) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Une erreur est survenue lors de la suppression du compte',
                'details' => $e->getMessage()
            ], 500);
        }


    }
        
}
