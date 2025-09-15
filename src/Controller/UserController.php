<?php

namespace App\Controller;

use App\Form\MyDataType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class UserController extends AbstractController
{
    #[Route('/profil', name: 'profil')]
    public function index(Security $security): Response
    {
        $user = $security->getUser();
        $myDataForm = $this->createForm(MyDataType::class, $user);

        return $this->render('user/profil.html.twig', [
            "myDataForm" => $myDataForm
        ]);
    }
}
