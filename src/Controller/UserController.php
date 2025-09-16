<?php

namespace App\Controller;

use App\Document\Checklist;
use App\Form\MyDataType;
use Doctrine\ODM\MongoDB\DocumentManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class UserController extends AbstractController
{
    #[Route('/profil', name: 'profil')]
    public function index(Security $security, DocumentManager $documentManager): Response
    {
        $user = $security->getUser();
        $myDataForm = $this->createForm(MyDataType::class, $user);

        // $checklist = new Checklist($userId, $message, $isDone);
        // $documentManager->persist($checklist);
        // $documentManager->flush();

        return $this->render('user/profil.html.twig', [
            "myDataForm" => $myDataForm
        ]);
    }
}
